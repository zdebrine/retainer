// RevenueCat webhook → public.entitlements (spec §10, §11).
// RevenueCat sends the Authorization header configured in its dashboard; it must equal the
// REVENUECAT_WEBHOOK_AUTH secret. JWT verification is off for this function (supabase/config.toml).

import { createClient } from 'npm:@supabase/supabase-js@2';

import { decide, safeEqual, type RevenueCatEvent } from './entitlement.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: { persistSession: false },
  },
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (!expected || !safeEqual(req.headers.get('Authorization') ?? '', expected)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let event: RevenueCatEvent;
  try {
    event = ((await req.json()) as { event: RevenueCatEvent }).event;
    if (!event?.id || !event.type || !event.app_user_id) throw new Error('missing fields');
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Idempotency: RevenueCat retries until it gets a 200.
  const { error: seenError } = await supabase.from('revenuecat_events').insert({ id: event.id });
  if (seenError) {
    if (seenError.code === '23505') return Response.json({ ok: true, duplicate: true });
    console.error('revenuecat_events insert failed', seenError);
    return new Response('Storage error', { status: 500 });
  }

  const decision = decide(event);
  if (decision.kind === 'skip') return Response.json({ ok: true, skipped: decision.reason });

  const { error } = await supabase
    .from('entitlements')
    .upsert(decision.row, { onConflict: 'user_id' });
  if (error) {
    // Let RevenueCat retry: forget the event so the retry is not treated as a duplicate.
    await supabase.from('revenuecat_events').delete().eq('id', event.id);
    console.error('entitlements upsert failed', error);
    return new Response('Storage error', { status: 500 });
  }
  return Response.json({ ok: true, active: decision.row.active });
});
