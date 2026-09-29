import { palette } from '@retainer/shared';
import { render, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { ThemeProvider } from '@/theme';

describe('Text', () => {
  it('renders micro as uppercase mono with tracking', async () => {
    await render(
      <ThemeProvider scheme="dark">
        <Text variant="micro">needs you</Text>
      </ThemeProvider>,
    );
    const style = StyleSheet.flatten(screen.getByText('needs you').props.style);
    expect(style).toMatchObject({
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.54,
      textTransform: 'uppercase',
      color: palette.dark.ink,
    });
    expect(style.fontFamily).toMatch(/JetBrainsMono/);
  });

  it('uses the light palette when the scheme is light', async () => {
    await render(
      <ThemeProvider scheme="light">
        <Text tone="dim">Why this</Text>
      </ThemeProvider>,
    );
    expect(StyleSheet.flatten(screen.getByText('Why this').props.style).color).toBe(
      palette.light.dim,
    );
  });
});

describe('Button', () => {
  it('fires onPress and exposes the button role', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider scheme="dark">
        <Button label="Read 6 posts" kind="fill" onPress={onPress} />
      </ThemeProvider>,
    );
    await userEvent.setup().press(screen.getByRole('button', { name: 'Read 6 posts' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider scheme="dark">
        <Button label="Continue" disabled onPress={onPress} />
      </ThemeProvider>,
    );
    await userEvent.setup().press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
