import { describe, expect, test } from 'bun:test';
import {
	buildMonthGrid,
	groupByDate,
	monthLabel,
	shiftMonth
} from '$lib/features/calendar/calendar-grid';

describe('buildMonthGrid', () => {
	test('September 2026 starts on Tuesday, so the grid begins on Monday Aug 31', () => {
		const grid = buildMonthGrid('2026-09', '2026-09-09');
		expect(grid.weeks[0][0]).toEqual({ date: '2026-08-31', inMonth: false, isToday: false });
		expect(grid.weeks[0][1].date).toBe('2026-09-01');
	});

	test('produces full weeks of seven days and ends on a Sunday', () => {
		const grid = buildMonthGrid('2026-09', '2026-09-09');
		expect(grid.weeks.every((week) => week.length === 7)).toBe(true);
		const last = grid.weeks.at(-1)!.at(-1)!;
		expect(last.date).toBe('2026-10-04');
	});

	test('marks today and in-month days', () => {
		const grid = buildMonthGrid('2026-09', '2026-09-09');
		const today = grid.weeks.flat().find((d) => d.date === '2026-09-09');
		expect(today).toEqual({ date: '2026-09-09', inMonth: true, isToday: true });
	});

	test('exposes the visible range for data loading', () => {
		const grid = buildMonthGrid('2026-09', '2026-09-09');
		expect(grid.rangeStart).toBe('2026-08-31');
		expect(grid.rangeEnd).toBe('2026-10-04');
	});
});

describe('shiftMonth and monthLabel', () => {
	test('moves across year boundaries', () => {
		expect(shiftMonth('2026-12', 1)).toBe('2027-01');
		expect(shiftMonth('2026-01', -1)).toBe('2025-12');
	});

	test('labels a month for display', () => {
		expect(monthLabel('2026-09')).toBe('September 2026');
	});
});

describe('groupByDate', () => {
	test('indexes items by their date preserving order', () => {
		const grouped = groupByDate([
			{ id: 'a', date: '2026-09-09' },
			{ id: 'b', date: '2026-09-10' },
			{ id: 'c', date: '2026-09-09' }
		]);
		expect(grouped.get('2026-09-09')?.map((i) => i.id)).toEqual(['a', 'c']);
		expect(grouped.get('2026-09-10')?.map((i) => i.id)).toEqual(['b']);
		expect(grouped.get('2026-09-11')).toBeUndefined();
	});
});
