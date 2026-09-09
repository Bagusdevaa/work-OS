/** ISO calendar date string in the form YYYY-MM-DD (local time). */
export type ISODate = string;

const DAY_MS = 86_400_000;

function pad(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

/** Parses an ISO date into a local-midnight Date. */
export function parseISODate(iso: ISODate): Date {
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day);
}

/** Formats a Date as a local ISO calendar date. */
export function toISODate(date: Date): ISODate {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's local ISO date. */
export function todayISO(now: Date = new Date()): ISODate {
	return toISODate(now);
}

export function addDays(iso: ISODate, days: number): ISODate {
	const d = parseISODate(iso);
	d.setDate(d.getDate() + days);
	return toISODate(d);
}

/** Calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
	const a = Date.UTC(...ymd(from));
	const b = Date.UTC(...ymd(to));
	return Math.round((b - a) / DAY_MS);
}

function ymd(iso: ISODate): [number, number, number] {
	const [y, m, d] = iso.split('-').map(Number);
	return [y, m - 1, d];
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
	const d = parseISODate(iso);
	const offset = (d.getDay() + 6) % 7; // Monday = 0
	return addDays(iso, -offset);
}

/** Whole days elapsed between two timestamps. */
export function daysSince(then: Date, now: Date): number {
	return Math.floor((now.getTime() - then.getTime()) / DAY_MS);
}

const longFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});
const shortFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function formatDate(iso: ISODate, style: 'long' | 'short' = 'long'): string {
	const formatter = style === 'long' ? longFormatter : shortFormatter;
	return formatter.format(parseISODate(iso));
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit'
});

export function formatDateTime(date: Date): string {
	return dateTimeFormatter.format(date);
}

/** Human description of a due date relative to `today`. */
export function describeDueDate(due: ISODate, today: ISODate): string {
	const diff = daysBetween(today, due);
	if (diff === 0) return 'Due today';
	if (diff === 1) return 'Due tomorrow';
	if (diff < 0) {
		const overdue = -diff;
		return `Overdue by ${overdue} ${overdue === 1 ? 'day' : 'days'}`;
	}
	if (diff <= 7) return `Due in ${diff} days`;
	return `Due ${formatDate(due, 'short')}`;
}

/** Human description of elapsed time since a timestamp, e.g. "3 days ago". */
export function describeTimeAgo(then: Date, now: Date = new Date()): string {
	const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
	return formatDate(toISODate(then), 'short');
}
