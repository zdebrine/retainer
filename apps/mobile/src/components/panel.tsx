import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, space, useTheme } from '@/theme';

/** The only rectangle in the product: panel fill, 1px hairline, no shadow. */
export function Panel({ lit, style, ...rest }: ViewProps & { lit?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.panel,
        {
          backgroundColor: colors.panel,
          borderColor: lit ? 'rgba(255,255,255,0.35)' : colors.hairline,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: radius.panel, padding: space[5] },
});
