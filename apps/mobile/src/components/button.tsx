import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/text';
import { radius, space, useTheme } from '@/theme';

type Kind = 'fill' | 'outline' | 'quiet';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  kind?: Kind;
  /** Full-width, 52px call to action used at the bottom of onboarding screens. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** At most one `fill` button per view (design rule). */
export function Button({ label, kind = 'outline', block, disabled, style, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const fg = kind === 'fill' ? colors.void : kind === 'quiet' ? colors.dim : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        block && styles.block,
        {
          backgroundColor: kind === 'fill' ? colors.ink : 'transparent',
          borderColor:
            kind === 'fill' ? colors.ink : kind === 'quiet' ? 'transparent' : colors.hairline,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text variant="ui" style={[{ color: fg }, block && styles.blockLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: space[4],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space[2],
  },
  block: { height: 52, borderRadius: radius.panel, paddingVertical: 0 },
  blockLabel: { fontSize: 15 },
});
