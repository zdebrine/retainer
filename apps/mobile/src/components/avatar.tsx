import { initials } from '@retainer/shared';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { radius, useTheme } from '@/theme';

/**
 * A person's circle (wireframe screen 05): people-orange with initials when on the list, deep with
 * dim initials when not. A photo, when there is one, is shown only for people on the list.
 */
export function Avatar({
  name,
  uri,
  on,
  size = 36,
}: {
  name: string;
  uri?: string | null;
  on: boolean;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          backgroundColor: on ? colors.people : colors.deep,
          borderColor: on ? colors.people : colors.hairline,
        },
      ]}
    >
      {on && uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text variant="caption" weight={600} style={{ color: on ? colors.void : colors.dim }}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.node,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
