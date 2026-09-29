import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { Button } from '@/components/button';
import { Node } from '@/components/node';
import { ValueRow } from '@/components/onboarding';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useAuth } from '@/features/auth/auth-provider';
import { useBilling } from '@/features/billing/billing-provider';
import {
  getMonthlyPackage,
  purchase,
  purchasesConfigured,
  restore,
  type PurchaseResult,
} from '@/features/billing/purchases';
import { nextStep } from '@/features/flow';
import { nextMonthlyCharge } from '@/features/schedule';
import { radius, space, useTheme } from '@/theme';

const FALLBACK_PRICE = '$4.99';

// Wireframe 03 · Subscribe. No trial (spec §11).
export default function Subscribe() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { entitled, refresh, setDevEntitled } = useBilling();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const price = pkg?.product.priceString ?? FALLBACK_PRICE;
  const configured = purchasesConfigured();

  useEffect(() => {
    getMonthlyPackage().then(setPkg, () => setPkg(null));
    refresh();
  }, [refresh]);

  // Already subscribed (for example after a restore on a new phone): move on.
  useEffect(() => {
    if (entitled)
      router.replace(
        nextStep({ signedIn: true, entitled: true, onboarded: !!profile?.onboarded_at }),
      );
  }, [entitled, profile?.onboarded_at]);

  async function handle(fn: () => Promise<PurchaseResult>, inactiveMessage: string) {
    setBusy(true);
    setMessage(null);
    const r = await fn();
    setBusy(false);
    if (r.ok) {
      if (r.active) await refresh();
      else setMessage(inactiveMessage);
    } else if (!r.cancelled) {
      setMessage(r.message);
    }
  }

  return (
    <Screen>
      <View style={styles.behind}>
        <Text variant="title" weight={700} style={styles.dimHeadline}>
          Why Retainer costs {FALLBACK_PRICE} a month
        </Text>
      </View>
      <View style={[styles.sheet, { backgroundColor: colors.panel, borderColor: colors.hairline }]}>
        <View style={[styles.grabber, { backgroundColor: colors.hairline }]} />
        <View style={styles.product}>
          <Node size={48} />
          <View style={styles.flex}>
            <Text variant="ui" weight={600} style={styles.productName}>
              Retainer
            </Text>
            <Text variant="caption" tone="dim">
              Monthly subscription
            </Text>
          </View>
          <Text variant="data-lg" style={styles.price}>
            {price}
          </Text>
        </View>

        <View>
          <ValueRow label="Billed" value="Monthly" />
          <ValueRow label="First charge" value={`Today · ${price}`} />
          <ValueRow label="Next charge" value={`${nextMonthlyCharge(new Date())} · ${price}`} />
          <ValueRow label="Cancel" value="Any time, in your app store settings" mono={false} />
          <ValueRow label="Includes" value="Third-party AI to read posts" mono={false} />
        </View>

        <View style={styles.actions}>
          <Button
            label={`Subscribe for ${price} a month`}
            kind="fill"
            block
            disabled={busy || !pkg}
            onPress={() =>
              pkg && handle(() => purchase(pkg), 'The purchase went through but is not active yet.')
            }
          />
          <Text variant="caption" tone="dim" style={styles.center}>
            Paid through your phone&apos;s app store. Renews monthly until you cancel.
          </Text>
          <Button
            label="Restore a purchase"
            kind="quiet"
            disabled={busy || !configured}
            onPress={() => handle(restore, 'No active Retainer subscription was found.')}
          />
          {!configured ? (
            <Text variant="caption" tone="dim" style={styles.center}>
              Purchases are not set up in this build.
            </Text>
          ) : null}
          {__DEV__ && !configured ? (
            <Button label="Skip for now (development only)" kind="quiet" onPress={setDevEntitled} />
          ) : null}
          {message ? (
            <Text
              variant="caption"
              tone="dim"
              style={styles.center}
              accessibilityLiveRegion="polite"
            >
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  behind: { flex: 1, paddingHorizontal: space[5], paddingTop: space[7], opacity: 0.3 },
  dimHeadline: { fontSize: 32, lineHeight: 38, letterSpacing: -0.96 },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[4],
    gap: space[5],
  },
  grabber: { width: 36, height: 4, borderRadius: radius.node, alignSelf: 'center' },
  product: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  flex: { flex: 1, gap: 2 },
  productName: { fontSize: 17, lineHeight: 22 },
  price: { fontSize: 24, lineHeight: 30 },
  actions: { gap: space[2] },
  center: { textAlign: 'center' },
});
