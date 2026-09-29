import { palette, type ColorScheme } from '@retainer/shared';
import { createContext, useContext, type ReactNode } from 'react';

export type Colors = (typeof palette)[ColorScheme];

type Theme = { scheme: ColorScheme; colors: Colors };

const ThemeContext = createContext<Theme>({ scheme: 'dark', colors: palette.dark });

/**
 * Retainer is dark by default on every device. Light is an explicit choice (a Settings option,
 * M4) rather than following the OS, because the design system is built around the dark field.
 */
export function ThemeProvider({
  scheme = 'dark',
  children,
}: {
  scheme?: ColorScheme;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={{ scheme, colors: palette[scheme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
