import { addDays, parseISODate, startOfWeek, toISODate } from '$lib/utils/dates';

/** Month key in the form YYYY-MM. */
export type MonthKey = string;

export interface GridDay {
	date: string;
	inMonth: boolean;
	isToday: boolean;
}

export interface MonthGrid {
	month: MonthKey;
	weeks: GridDay[][];
	/** First visible day (a Monday). */
	rangeStart: string;
	/** Last visible day (a Sunday). */
	rangeEnd: string;
}

export function currentMonth(today: string): MonthKey {
	return today.slice(0, 7);
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
	const [year, monthIndex] = month.split('-').map(Number);
	const shifted = new Date(year, monthIndex - 1 + delta, 1);
	return toISODate(shifted).slice(0, 7);
}

const labelFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export function monthLabel(month: MonthKey): string {
	return labelFormatter.format(parseISODate(`${month}-01`));
}

/** A Monday-first grid covering every week that touches the month. */
export function buildMonthGrid(month: MonthKey, today: string): MonthGrid {
	const first = `${month}-01`;
	const lastOfMonth = toISODate(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0));
	const rangeStart = startOfWeek(first);
	const rangeEnd = addDays(startOfWeek(lastOfMonth), 6);

	const weeks: GridDay[][] = [];
	let cursor = rangeStart;
	while (cursor <= rangeEnd) {
		const week: GridDay[] = [];
		for (let i = 0; i < 7; i++) {
			week.push({ date: cursor, inMonth: cursor.startsWith(month), isToday: cursor === today });
			cursor = addDays(cursor, 1);
		}
		weeks.push(week);
	}
	return { month, weeks, rangeStart, rangeEnd };
}

export function groupByDate<T extends { date: string }>(items: T[]): Map<string, T[]> {
	const grouped = new Map<string, T[]>();
	for (const item of items) {
		const list = grouped.get(item.date);
		if (list) list.push(item);
		else grouped.set(item.date, [item]);
	}
	return grouped;
}
