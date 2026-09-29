import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import Accounts from '@/app/accounts';
import Connect from '@/app/connect';
import People from '@/app/people';
import { useSources } from '@/features/sources/store';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/theme';

jest.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } } }),
}));

jest.mock('@retainer/shared', () => {
  const actual = jest.requireActual('@retainer/shared');
  const acct = (id: string, name: string) => ({
    platform: 'bluesky',
    externalId: id,
    handle: `@${id}.bsky.social`,
    displayName: name,
    avatarUrl: null,
    feedUrl: null,
  });
  return {
    ...actual,
    getBlueskyFollows: jest.fn().mockResolvedValue({
      accounts: [
        acct('dana', 'Dana Okafor'),
        acct('theo', 'Theo Lindqvist'),
        acct('sam', 'Sam Ortiz'),
      ],
      cursor: null,
    }),
  };
});

const wrap = (ui: ReactNode) => <ThemeProvider scheme="dark">{ui}</ThemeProvider>;
const me = {
  platform: 'bluesky' as const,
  externalId: 'did:plc:alex',
  handle: '@alex.bsky.social',
  displayName: 'Alex',
  avatarUrl: null,
  feedUrl: null,
  followsCount: 3,
};

beforeEach(() => {
  jest.clearAllMocks();
  useSources.setState({ bluesky: null, mastodon: null, added: [], selected: {}, people: [] });
});

describe('Connect', () => {
  it('needs at least one platform, then shows who it reads as', async () => {
    const { rerender } = await render(wrap(<Connect />));
    expect(screen.getByRole('button', { name: 'Connect at least one' })).toBeDisabled();
    useSources.setState({ bluesky: me });
    await rerender(wrap(<Connect />));
    expect(screen.getByText('Reading as @alex.bsky.social')).toBeOnTheScreen();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue with 1 connected' }));
    expect(router.push).toHaveBeenCalledWith('/accounts');
  });

  it('opens the handle screen when a platform is switched on', async () => {
    await render(wrap(<Connect />));
    await userEvent.setup().press(screen.getByRole('switch', { name: 'Connect Mastodon' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/connect/[platform]',
      params: { platform: 'mastodon' },
    });
  });
});

describe('Accounts', () => {
  it('lists who you follow and continues with the chosen ones grouped into people', async () => {
    useSources.setState({ bluesky: me });
    const user = userEvent.setup();
    await render(wrap(<Accounts />));
    expect(await screen.findByText('Dana Okafor')).toBeOnTheScreen();
    expect(screen.getByText('0 of 3 on')).toBeOnTheScreen();
    await user.press(screen.getByRole('switch', { name: 'Dana Okafor on your list' }));
    await user.press(screen.getByRole('switch', { name: 'Theo Lindqvist on your list' }));
    expect(screen.getByText('2 of 3 on')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continue with 2 accounts' }));
    expect(router.push).toHaveBeenCalledWith('/people');
    expect(useSources.getState().people.map((p) => p.displayName)).toEqual([
      'Dana Okafor',
      'Theo Lindqvist',
    ]);
  });

  it('filters by search', async () => {
    useSources.setState({ bluesky: me });
    await render(wrap(<Accounts />));
    await screen.findByText('Sam Ortiz');
    await userEvent.setup().type(screen.getByLabelText('Search or add by handle'), 'ortiz');
    expect(screen.queryByText('Dana Okafor')).toBeNull();
    expect(screen.getByText('Sam Ortiz')).toBeOnTheScreen();
  });
});

describe('People', () => {
  const a = (platform: 'bluesky' | 'mastodon', id: string) => ({
    platform,
    externalId: id,
    handle: `@${id}`,
    displayName: 'Dana Okafor',
    avatarUrl: null,
    feedUrl: null,
  });

  it('separates a grouped person and saves the list', async () => {
    jest.mocked(supabase).rpc = jest.fn().mockResolvedValue({ data: 2, error: null }) as never;
    useSources.setState({
      people: [
        {
          key: 'bluesky:b1',
          displayName: 'Dana Okafor',
          accounts: [a('bluesky', 'b1'), a('mastodon', 'm1')],
        },
      ],
    });
    const user = userEvent.setup();
    await render(wrap(<People />));
    expect(screen.getByText('Bluesky · Mastodon')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Separate' }));
    await user.press(screen.getByRole('button', { name: 'Continue with 2 people' }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/ai'));
    expect(supabase.rpc).toHaveBeenCalledWith('replace_people', {
      people: [
        {
          display_name: 'Dana Okafor',
          accounts: [expect.objectContaining({ platform: 'bluesky', external_id: 'b1' })],
        },
        {
          display_name: 'Dana Okafor',
          accounts: [expect.objectContaining({ platform: 'mastodon', external_id: 'm1' })],
        },
      ],
    });
  });
});
