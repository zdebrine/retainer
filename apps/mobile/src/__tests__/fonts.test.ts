import { Platform } from 'react-native';

import { fontFamily } from '@/theme/fonts';

describe('fontFamily', () => {
  const original = Platform.OS;
  afterEach(() => {
    Platform.OS = original;
  });

  it('uses PostScript names on iOS', () => {
    Platform.OS = 'ios';
    expect(fontFamily('sans', 700)).toBe('Manrope-Bold');
    expect(fontFamily('mono', 500)).toBe('JetBrainsMono-Medium');
  });

  it('uses file names on Android and web', () => {
    Platform.OS = 'android';
    expect(fontFamily('sans', 600)).toBe('Manrope_600SemiBold');
    Platform.OS = 'web';
    expect(fontFamily('mono', 400)).toBe('JetBrainsMono_400Regular');
  });

  it('falls back to the nearest mono weight', () => {
    Platform.OS = 'android';
    expect(fontFamily('mono', 700)).toBe('JetBrainsMono_500Medium');
  });
});
