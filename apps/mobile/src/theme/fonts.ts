import { Platform } from 'react-native';

type Family = 'sans' | 'mono';
type Weight = 400 | 500 | 600 | 700;

// Font files are embedded by the expo-font config plugin (app.json) on iOS and
// Android, and loaded with useFonts on web. Android and web register each file
// under its file name; iOS registers it under the font's PostScript name.
const files = {
  sans: {
    400: ['Manrope_400Regular', 'Manrope-Regular'],
    500: ['Manrope_500Medium', 'Manrope-Medium'],
    600: ['Manrope_600SemiBold', 'Manrope-SemiBold'],
    700: ['Manrope_700Bold', 'Manrope-Bold'],
  },
  mono: {
    400: ['JetBrainsMono_400Regular', 'JetBrainsMono-Regular'],
    500: ['JetBrainsMono_500Medium', 'JetBrainsMono-Medium'],
  },
} as const;

/** Returns the platform font family for a family and weight (mono falls back to its nearest weight). */
export function fontFamily(family: Family, weight: Weight): string {
  const byWeight: Partial<Record<Weight, readonly [string, string]>> = files[family];
  const entry = byWeight[weight] ?? (weight >= 500 ? byWeight[500] : byWeight[400]);
  if (!entry) throw new Error(`No ${family} font for weight ${weight}`);
  return Platform.OS === 'ios' ? entry[1] : entry[0];
}
