import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

/** Full-bleed `void` background with safe-area padding. */
export function Screen({ style, children, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: colors.void }]}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View {...rest} style={[styles.fill, style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
