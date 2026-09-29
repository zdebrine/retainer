import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { fontFamily, radius, space, type, useTheme } from '@/theme';

/** Single-line input: deep fill, hairline border, body type (wireframe screen 05's handle field). */
export function TextField({ style, mono, ...rest }: TextInputProps & { mono?: boolean }) {
  const { colors } = useTheme();
  const t = mono ? type.data : type.body;
  return (
    <TextInput
      placeholderTextColor={colors.dim}
      selectionColor={colors.people}
      {...rest}
      style={[
        styles.field,
        {
          backgroundColor: colors.deep,
          borderColor: colors.hairline,
          color: colors.ink,
          fontFamily: fontFamily(mono ? 'mono' : 'sans', 400),
          fontSize: mono ? 18 : t.fontSize,
          letterSpacing: mono ? 4 : 0,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  field: { height: 44, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: space[3] },
});
