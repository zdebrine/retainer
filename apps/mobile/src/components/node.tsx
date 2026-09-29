import { View, type StyleProp, type ViewStyle } from 'react-native';

import { glow, radius, useTheme } from '@/theme';

type Depth = 'near' | 'mid' | 'far';

/** A graph node. Near nodes glow; mid and far fade (and blur on Android, where `filter: blur` is supported). */
export function Node({
  size,
  depth = 'near',
  style,
}: {
  size: number;
  depth?: Depth;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, scheme } = useTheme();
  const depthStyle: ViewStyle =
    depth === 'near'
      ? { boxShadow: scheme === 'light' ? glow.peopleLight : glow.people }
      : depth === 'mid'
        ? { opacity: 0.65, filter: 'blur(0.8px)' }
        : { opacity: 0.4, filter: 'blur(2px)' };
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: radius.node, backgroundColor: colors.people },
        depthStyle,
        style,
      ]}
    />
  );
}
