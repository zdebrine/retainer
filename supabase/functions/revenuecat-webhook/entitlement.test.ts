// Run with: node --test supabase/functions/revenuecat-webhook/entitlement.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decide, safeEqual, type RevenueCatEvent } from './entitlement.ts';

const NOW = Date.UTC(2026, 8, 29, 12);
const USER = '11111111-2222-3333-4444-555555555555';
const base: RevenueCatEvent = {
  id: 'evt_1',
  type: 'INITIAL_PURCHASE',
  app_user_id: USER,
  product_id: 'retainer_monthly_499',
  entitlement_ids: ['retainer'],
  expiration_at_ms: NOW + 30 * 86_400_000,
  event_timestamp_ms: NOW,
  store: 'APP_STORE',
};

test('initial purchase is active until expiry', () => {
  const d = decide(base, NOW);
  assert.equal(d.kind, 'upsert');
  if (d.kind !== 'upsert') return;
  assert.equal(d.row.active, true);
  assert.equal(d.row.user_id, USER);
  assert.equal(d.row.expires_at, new Date(base.expiration_at_ms!).toISOString());
});

test('cancellation keeps access until the period ends', () => {
  const d = decide({ ...base, type: 'CANCELLATION' }, NOW);
  assert.ok(d.kind === 'upsert' && d.row.active);
});

test('expiration ends access', () => {
  const d = decide({ ...base, type: 'EXPIRATION', expiration_at_ms: NOW - 1000 }, NOW);
  assert.ok(d.kind === 'upsert' && !d.row.active);
});

test('an event whose expiry has passed is inactive', () => {
  const d = decide({ ...base, type: 'RENEWAL', expiration_at_ms: NOW - 1 }, NOW);
  assert.ok(d.kind === 'upsert' && !d.row.active);
});

test('anonymous RevenueCat ids are skipped', () => {
  const d = decide({ ...base, app_user_id: '$RCAnonymousID:abc' }, NOW);
  assert.equal(d.kind, 'skip');
});

test('other entitlements and test events are skipped', () => {
  assert.equal(decide({ ...base, entitlement_ids: ['other'] }, NOW).kind, 'skip');
  assert.equal(decide({ ...base, type: 'TEST' }, NOW).kind, 'skip');
});

test('user ids are normalised to lower case', () => {
  const d = decide({ ...base, app_user_id: USER.toUpperCase() }, NOW);
  assert.ok(d.kind === 'upsert' && d.row.user_id === USER);
});

test('safeEqual', () => {
  assert.equal(safeEqual('Bearer abc', 'Bearer abc'), true);
  assert.equal(safeEqual('Bearer abc', 'Bearer abd'), false);
  assert.equal(safeEqual('short', 'longer'), false);
});
