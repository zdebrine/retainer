import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { radius, space, useTheme } from '@/theme';

/** Onboarding page: scrolling content above a fixed footer holding the call to action. */
export function OnboardingScreen({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Screen>
  );
}

/** Eyebrow in `micro`, a headline, and an optional dim paragraph. */
export function StepHeader({
  eyebrow,
  title,
  body,
  large,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: string;
  /** 32/38 headline used on the intro screens; steps use `title` (24/30). */
  large?: boolean;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? (
        <Text variant="micro" tone="dim">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        variant="title"
        weight={large ? 700 : undefined}
        style={large && styles.large}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {body ? <Text tone="dim">{body}</Text> : null}
    </View>
  );
}

/** A two-line row separated by a hairline: title in ink, caption in dim. */
export function InfoRow({ title, caption }: { title: string; caption: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, { borderTopColor: colors.hairline }]}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text variant="caption" tone="dim">
        {caption}
      </Text>
    </View>
  );
}

/** Key/value row used on the subscribe sheet: key in dim, value in mono. */
export function ValueRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.valueRow, { borderTopColor: colors.hairline }]}>
      <Text variant="caption" tone="dim">
        {label}
      </Text>
      <Text variant={mono ? 'data' : 'caption'} style={styles.valueRight}>
        {value}
      </Text>
    </View>
  );
}

type Card = { label: string; items: string[] };

/**
 * Side-by-side cards. The emphasised card is `panel` with an ink border and ink text; the other is
 * `deep` with dim text. With `none`, the left card is `panel` with a hairline border (screen 06).
 */
export function ComparePair({
  left,
  right,
  emphasis = 'left',
}: {
  left: Card;
  right: Card;
  emphasis?: 'left' | 'right' | 'none';
}) {
  const { colors } = useTheme();
  const card = (c: Card, side: 'left' | 'right') => {
    const strong = emphasis === side;
    const lifted = strong || (emphasis === 'none' && side === 'left');
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: lifted ? colors.panel : colors.deep,
            borderColor: strong ? colors.ink : colors.hairline,
          },
        ]}
      >
        <Text variant="micro" tone={lifted ? 'ink' : 'dim'}>
          {c.label}
        </Text>
        {c.items.map((t) => (
          <Text key={t} variant="caption" tone={lifted ? 'ink' : 'dim'}>
            {t}
          </Text>
        ))}
      </View>
    );
  };
  return (
    <View style={styles.pair}>
      {card(left, 'left')}
      {card(right, 'right')}
    </View>
  );
}

/** Text with a 1px ink rule on the left and a `micro` source line beneath. */
export function RuleQuote({ text, source }: { text: string; source: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.quote, { borderLeftColor: colors.ink }]}>
      <Text>{text}</Text>
      <Text variant="micro" tone="dim">
        {source}
      </Text>
    </View>
  );
}

export function Toggle({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.ink : colors.deep,
          borderColor: value ? colors.ink : colors.hairline,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.knob,
          { left: value ? 24 : 3, backgroundColor: value ? colors.void : colors.dim },
        ]}
      />
    </Pressable>
  );
}

export function Radio({ selected }: { selected: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.ring, { borderColor: selected ? colors.ink : colors.hairline }]}>
      <View style={[styles.dot, { backgroundColor: selected ? colors.ink : 'transparent' }]} />
    </View>
  );
}

/** A selectable card with a radio on the right (screen 06b). */
export function ChoiceCard({
  selected,
  onPress,
  children,
  accessibilityLabel,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  accessibilityLabel: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          borderColor: selected ? colors.ink : colors.hairline,
          backgroundColor: selected ? colors.panel : 'transparent',
        },
      ]}
    >
      <View style={styles.flex}>{children}</View>
      <Radio selected={selected} />
    </Pressable>
  );
}

/** Row with a radio on the right, separated by a hairline (screen 07). */
export function RadioRow({
  title,
  caption,
  selected,
  onPress,
}: {
  title: string;
  caption: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.radioRow, { borderTopColor: colors.hairline }]}
    >
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text variant="data" tone="dim" style={styles.small}>
          {caption}
        </Text>
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}

/** Four-way segmented control in mono (screen 07). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.segmented, { backgroundColor: colors.deep, borderColor: colors.hairline }]}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, { backgroundColor: on ? colors.ink : 'transparent' }]}
          >
            <Text variant="data" style={{ color: on ? colors.void : colors.dim }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stack({
  gap = 4,
  style,
  children,
}: {
  gap?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return <View style={[{ gap: space[gap] }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[5],
    gap: space[5],
  },
  footer: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
    paddingBottom: space[4],
    gap: space[2],
  },
  header: { gap: space[2] },
  large: { fontSize: 32, lineHeight: 38, letterSpacing: -0.96 },
  infoRow: { gap: 2, paddingVertical: space[3], borderTopWidth: 1 },
  rowTitle: { lineHeight: 20 },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[4],
    paddingVertical: space[3],
    borderTopWidth: 1,
  },
  valueRight: { textAlign: 'right', flexShrink: 1 },
  pair: { flexDirection: 'row', gap: space[2] },
  card: { flex: 1, borderWidth: 1, borderRadius: radius.panel, padding: 14, gap: space[2] },
  quote: { borderLeftWidth: 1, paddingLeft: space[4], paddingVertical: 2, gap: space[2] },
  track: { width: 48, height: 28, borderRadius: radius.node, borderWidth: 1 },
  knob: { position: 'absolute', top: 3, width: 20, height: 20, borderRadius: radius.node },
  ring: {
    width: 22,
    height: 22,
    borderRadius: radius.node,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: radius.node },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderWidth: 1,
    borderRadius: radius.panel,
    paddingVertical: 14,
    paddingHorizontal: space[4],
  },
  flex: { flex: 1, gap: 2 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderTopWidth: 1,
  },
  small: { fontSize: 12, lineHeight: 16 },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.panel,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
