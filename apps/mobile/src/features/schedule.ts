import type { WindowMode } from '@/features/auth/profile';

/** Briefing hours in the user's local time (spec §7). */
const HOURS: Record<Exclude<WindowMode, 'on_open'>, number[]> = { once: [18], twice: [6, 18] };

/** The next time a briefing opens after `now`, or null when briefings are on demand. */
export function nextBriefing(now: Date, mode: WindowMode): Date | null {
  if (mode === 'on_open') return null;
  for (const dayOffset of [0, 1]) {
    for (const hour of HOURS[mode]) {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      d.setHours(hour, 0, 0, 0);
      if (d > now) return d;
    }
  }
  return null;
}

/** "6:00 am", "6:00 pm". */
export function formatClock(d: Date): string {
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}

/** "8 hr 19 min" until `then`. */
export function formatUntil(now: Date, then: Date): string {
  const mins = Math.max(0, Math.round((then.getTime() - now.getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} hr ${m} min` : `${m} min`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** One calendar month after `from`, as "Oct 28" (the subscribe sheet's "Next charge"). */
export function nextMonthlyCharge(from: Date): string {
  const d = new Date(from);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
