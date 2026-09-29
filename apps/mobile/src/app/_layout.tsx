import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { ThemeProvider, useTheme } from '@/theme';
import { webFonts } from '@/theme/web-fonts';

SplashScreen.preventAutoHideAsync();

// Native builds embed the fonts at build time (expo-font plugin in app.json); only web loads them.
const runtimeFonts = Platform.OS === 'web' ? webFonts : {};

function RootStack() {
  const { colors, scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.void } }}
      />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(runtimeFonts);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
