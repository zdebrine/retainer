import type { Platform, SourceAccount } from './types';

/** A person on the user's list: one or more accounts that belong to the same human (spec §9). */
export type PersonDraft = {
  key: string;
  displayName: string;
  accounts: SourceAccount[];
};

export function accountKey(a: Pick<SourceAccount, 'platform' | 'externalId'>): string {
  return `${a.platform}:${a.externalId}`;
}

/** Lower-case, accents and emoji stripped, single spaces: "Dana Okafor 🌊" → "dana okafor". */
export function normaliseName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N} ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Suggests people by grouping accounts with the same normalised display name on different
 * platforms. Feeds and channels are never merged with people automatically; the user can
 * separate any suggestion on the review screen.
 */
export function suggestPeople(accounts: SourceAccount[]): PersonDraft[] {
  const people: PersonDraft[] = [];
  const byName = new Map<string, PersonDraft>();
  const mergeable: Platform[] = ['bluesky', 'mastodon'];
  for (const a of accounts) {
    const name = normaliseName(a.displayName);
    const existing =
      mergeable.includes(a.platform) && name.length >= 3 ? byName.get(name) : undefined;
    if (existing && !existing.accounts.some((x) => x.platform === a.platform)) {
      existing.accounts.push(a);
      continue;
    }
    const person: PersonDraft = { key: accountKey(a), displayName: a.displayName, accounts: [a] };
    people.push(person);
    if (mergeable.includes(a.platform) && name.length >= 3 && !byName.has(name))
      byName.set(name, person);
  }
  return people;
}

/** Splits a grouped person back into one person per account. */
export function separate(people: PersonDraft[], key: string): PersonDraft[] {
  return people.flatMap((p) =>
    p.key === key && p.accounts.length > 1
      ? p.accounts.map((a) => ({ key: accountKey(a), displayName: a.displayName, accounts: [a] }))
      : [p],
  );
}

/** "DO" for "Dana Okafor", "M" for "Mom". */
export function initials(name: string): string {
  const words = name
    .replace(/^@/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '?';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
