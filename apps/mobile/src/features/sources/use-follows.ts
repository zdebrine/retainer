import {
  ConnectorError,
  getBlueskyFollows,
  getMastodonFollowing,
  type MastodonOwnAccount,
  type OwnAccount,
  type Page,
  type SourceAccount,
} from '@retainer/shared';
import { useEffect, useState } from 'react';

/** Loading stops here; anyone further down the list can still be added by handle. */
export const MAX_FOLLOWS = 2000;

type State = {
  accounts: SourceAccount[];
  loading: boolean;
  error: string | null;
  truncated: boolean;
};

/** Loads everyone the connected account follows, page by page. */
export function useFollows(
  platform: 'bluesky' | 'mastodon',
  own: OwnAccount | MastodonOwnAccount | null,
): State {
  const [state, setState] = useState<State>({
    accounts: [],
    loading: false,
    error: null,
    truncated: false,
  });
  const ownId = own?.externalId ?? null;

  useEffect(() => {
    if (!own) return;
    let cancelled = false;
    const fetchPage = (cursor: string | null): Promise<Page> =>
      platform === 'bluesky'
        ? getBlueskyFollows(own.externalId, cursor)
        : getMastodonFollowing(
            (own as MastodonOwnAccount).host,
            (own as MastodonOwnAccount).accountId,
            cursor,
          );

    (async () => {
      setState({ accounts: [], loading: true, error: null, truncated: false });
      const all: SourceAccount[] = [];
      let cursor: string | null = null;
      try {
        do {
          const page = await fetchPage(cursor);
          if (cancelled) return;
          all.push(...page.accounts);
          cursor = page.cursor;
          setState({ accounts: [...all], loading: !!cursor, error: null, truncated: false });
        } while (cursor && all.length < MAX_FOLLOWS);
        if (!cancelled)
          setState({ accounts: all, loading: false, error: null, truncated: !!cursor });
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof ConnectorError && e.kind === 'private'
            ? 'This account hides who it follows. Add people by handle instead.'
            : e instanceof ConnectorError
              ? e.message
              : 'Could not load who you follow.';
        setState({ accounts: all, loading: false, error: message, truncated: false });
      }
    })();
    return () => {
      cancelled = true;
    };
    // Reload only when the connected account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, ownId]);

  return state;
}
