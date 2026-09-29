import { render, screen } from '@testing-library/react-native';

import Welcome from '@/app/index';
import { ThemeProvider } from '@/theme';

it('shows the welcome copy and a single call to action', async () => {
  await render(
    <ThemeProvider scheme="dark">
      <Welcome />
    </ThemeProvider>,
  );
  expect(screen.getByText('Only the people you choose.')).toBeOnTheScreen();
  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Get started' })).toBeOnTheScreen();
});
