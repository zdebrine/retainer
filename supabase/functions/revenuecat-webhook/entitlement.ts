// Pure logic for the RevenueCat webhook: turns an event into an entitlements row.
// Kept free of Deno and Supabase APIs so it can be unit tested with `node --test`.

export const ENTITLEMENT = 'retainer';

/** The subset of RevenueCat's webhook event we use. */
export type RevenueCatEvent = {
  id: string;
  type: string;
  app_user_id: string;
  product_id?: string | null;
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
  event_timestamp_ms?: number | null;
  store?: string | null;
  environment?: string | null;
};

export type EntitlementRow = {
  user_id: string;
  entitlement: string;
  product_id: string | null;
  store: string | null;
  active: boolean;
  expires_at: string | null;
  last_event_type: string;
  last_event_id: string;
  last_event_at: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Events that say nothing about whether the subscription is active.
const IGNORED = new Set(['TEST', 'TRANSFER', 'SUBSCRIBER_ALIAS', 'SUBSCRIPTION_EXTENDED_FAILED']);

export type Decision = { kind: 'upsert'; row: EntitlementRow } | { kind: 'skip'; reason: string };

/**
 * Decides what an event means for the user's Retainer entitlement.
 * Active means the entitlement has not expired: a CANCELLATION keeps access until the period ends,
 * and an EXPIRATION ends it.
 */
export function decide(event: RevenueCatEvent, now: number = Date.now()): Decision {
  if (IGNORED.has(event.type)) return { kind: 'skip', reason: `ignored event type ${event.type}` };
  if (!UUID.test(event.app_user_id)) {
    // Anonymous RevenueCat IDs: the app always logs in with the Supabase user ID, so these are not ours.
    return { kind: 'skip', reason: 'app_user_id is not a Supabase user id' };
  }
  const ids = event.entitlement_ids ?? [];
  if (ids.length > 0 && !ids.includes(ENTITLEMENT)) {
    return { kind: 'skip', reason: 'event is for another entitlement' };
  }
  const expiresAt = event.expiration_at_ms ?? null;
  const active = event.type !== 'EXPIRATION' && (expiresAt === null || expiresAt > now);
  return {
    kind: 'upsert',
    row: {
      user_id: event.app_user_id.toLowerCase(),
      entitlement: ENTITLEMENT,
      product_id: event.product_id ?? null,
      store: event.store ?? null,
      active,
      expires_at: expiresAt === null ? null : new Date(expiresAt).toISOString(),
      last_event_type: event.type,
      last_event_id: event.id,
      last_event_at: event.event_timestamp_ms
        ? new Date(event.event_timestamp_ms).toISOString()
        : null,
    },
  };
}

/** Constant-time comparison for the shared Authorization header. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
