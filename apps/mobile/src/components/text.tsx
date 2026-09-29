import type { ColorToken, TypeVariant } from '@retainer/shared';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { fontFamily, type, useTheme } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: ColorToken;
};

/** Text in one of the eight design-system styles. `micro` is the only uppercase style. */
export function Text({ variant = 'body', tone = 'ink', style, children, ...rest }: TextProps) {
  const { colors } = useTheme();
  const t = type[variant];
  const weight = t.fontWeight as 400 | 500 | 600 | 700;
  return (
    <RNText
      {...rest}
      style={[
        {
          color: colors[tone],
          fontFamily: fontFamily(t.family, weight),
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          textTransform: 'uppercase' in t ? 'uppercase' : 'none',
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
