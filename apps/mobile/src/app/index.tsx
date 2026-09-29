import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Node } from '@/components/node';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useAuth } from '@/features/auth/auth-provider';
import { useBilling } from '@/features/billing/billing-provider';
import { nextStep } from '@/features/flow';
import { space, useTheme } from '@/theme';

// Wireframe 01 · Welcome. Node positions are the wireframe's, on a 390pt-wide frame.
const nodes = [
  { left: 170, top: 150, size: 48, depth: 'near' },
  { left: 92, top: 96, size: 22, depth: 'mid' },
  { left: 276, top: 210, size: 28, depth: 'near', opacity: 0.75, noGlow: true },
  { left: 112, top: 250, size: 14, depth: 'far', opacity: 0.5 },
] as const;

const dust = [
  { left: 300, top: 80, size: 6 },
  { left: 52, top: 190, size: 5 },
  { left: 240, top: 300, size: 4 },
];

export default function Welcome() {
  const { colors } = useTheme();
  const auth = useAuth();
  const billing = useBilling();

  // Signed-in users go straight to where they left off.
  if (auth.ready && auth.session) {
    if (!billing.ready) return <Screen />;
    const step = nextStep({
      signedIn: true,
      entitled: billing.entitled,
      onboarded: !!auth.profile?.onboarded_at,
    });
    return <Redirect href={step} />;
  }

  return (
    <Screen>
      <View style={styles.field}>
        <View style={styles.frame}>
          {nodes.map((n, i) => (
            <Node
              key={i}
              size={n.size}
              depth={'noGlow' in n ? 'mid' : n.depth}
              style={[
                { position: 'absolute', left: n.left, top: n.top },
                'opacity' in n && { opacity: n.opacity },
              ]}
            />
          ))}
          {dust.map((d, i) => (
            <View
              key={`d${i}`}
              style={{
                position: 'absolute',
                left: d.left,
                top: d.top,
                width: d.size,
                height: d.size,
                borderRadius: 999,
                backgroundColor: colors.faint,
                filter: 'blur(2px)',
              }}
            />
          ))}
        </View>
      </View>
      <View style={styles.bottom}>
        <Text variant="display" style={styles.headline}>
          Only the people you choose.
        </Text>
        <Text tone="dim">
          Retainer reads your social accounts and shows you posts from the people on your list. Ads,
          suggestions, strangers and trends never reach you.
        </Text>
        <Button
          label="Get started"
          kind="fill"
          block
          style={styles.cta}
          onPress={() => router.push('/why')}
        />
        <Button label="I have an account" kind="quiet" onPress={() => router.push('/sign-in')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, alignItems: 'center' },
  frame: { width: 390, height: 360 },
  bottom: { paddingHorizontal: space[5], paddingBottom: space[4], gap: space[4] },
  // Wireframe sets this headline at 40/44, a step below `display`.
  headline: { fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  cta: { marginTop: space[4] },
});
