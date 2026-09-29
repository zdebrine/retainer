import {
  accountKey,
  suggestPeople,
  type MastodonOwnAccount,
  type OwnAccount,
  type PersonDraft,
  type SourceAccount,
} from '@retainer/shared';
import { create } from 'zustand';

/** Choices on screens 04, 05 and the people review, saved when the review is confirmed. */
type SourcesState = {
  bluesky: OwnAccount | null;
  mastodon: MastodonOwnAccount | null;
  /** Feeds, channels and accounts added by handle; chosen by default. */
  added: SourceAccount[];
  /** Chosen accounts by accountKey. */
  selected: Record<string, SourceAccount>;
  people: PersonDraft[];

  setBluesky: (a: OwnAccount | null) => void;
  setMastodon: (a: MastodonOwnAccount | null) => void;
  add: (a: SourceAccount) => void;
  remove: (a: SourceAccount) => void;
  toggle: (a: SourceAccount) => void;
  /** Builds the suggested people from the chosen accounts. */
  groupSelected: () => void;
  setPeople: (p: PersonDraft[]) => void;
};

export const useSources = create<SourcesState>((set, get) => ({
  bluesky: null,
  mastodon: null,
  added: [],
  selected: {},
  people: [],

  setBluesky: (bluesky) =>
    set((s) => ({ bluesky, selected: bluesky ? s.selected : dropPlatform(s.selected, 'bluesky') })),
  setMastodon: (mastodon) =>
    set((s) => ({
      mastodon,
      selected: mastodon ? s.selected : dropPlatform(s.selected, 'mastodon'),
    })),
  add: (a) =>
    set((s) =>
      s.added.some((x) => accountKey(x) === accountKey(a))
        ? { selected: { ...s.selected, [accountKey(a)]: a } }
        : { added: [...s.added, a], selected: { ...s.selected, [accountKey(a)]: a } },
    ),
  remove: (a) =>
    set((s) => {
      const selected = { ...s.selected };
      delete selected[accountKey(a)];
      return { added: s.added.filter((x) => accountKey(x) !== accountKey(a)), selected };
    }),
  toggle: (a) =>
    set((s) => {
      const k = accountKey(a);
      const selected = { ...s.selected };
      if (selected[k]) delete selected[k];
      else selected[k] = a;
      return { selected };
    }),
  groupSelected: () => set({ people: suggestPeople(Object.values(get().selected)) }),
  setPeople: (people) => set({ people }),
}));

function dropPlatform(
  selected: Record<string, SourceAccount>,
  platform: SourceAccount['platform'],
) {
  return Object.fromEntries(Object.entries(selected).filter(([, a]) => a.platform !== platform));
}
