import { describe, expect, test } from 'bun:test';
import {
	buildWeekGrid,
	currentWeek,
	shiftWeek,
	weekLabel
} from '$lib/features/calendar/calendar-grid';

describe('buildWeekGrid', () => {
	test('runs Monday to Sunday from the given week start', () => {
		const grid = buildWeekGrid('2026-09-07', '2026-09-09');
		expect(grid.days).toHaveLength(7);
		expect(grid.days[0].date).toBe('2026-09-07');
		expect(grid.days[6].date).toBe('2026-09-13');
	});

	test('normalises a mid-week date to that week Monday', () => {
		const grid = buildWeekGrid('2026-09-09', '2026-09-09');
		expect(grid.weekStart).toBe('2026-09-07');
		expect(grid.days[0].date).toBe('2026-09-07');
	});

	test('marks today', () => {
		const grid = buildWeekGrid('2026-09-07', '2026-09-09');
		expect(grid.days.filter((day) => day.isToday).map((day) => day.date)).toEqual(['2026-09-09']);
	});

	test('every day of the visible week counts as in range', () => {
		const grid = buildWeekGrid('2026-09-07', '2026-09-09');
		expect(grid.days.every((day) => day.inMonth)).toBe(true);
	});

	test('exposes the range for data loading', () => {
		const grid = buildWeekGrid('2026-09-07', '2026-09-09');
		expect(grid.rangeStart).toBe('2026-09-07');
		expect(grid.rangeEnd).toBe('2026-09-13');
	});

	test('crosses a month boundary without gaps', () => {
		const grid = buildWeekGrid('2026-09-28', '2026-09-09');
		expect(grid.days.map((day) => day.date)).toEqual([
			'2026-09-28',
			'2026-09-29',
			'2026-09-30',
			'2026-10-01',
			'2026-10-02',
			'2026-10-03',
			'2026-10-04'
		]);
	});
});

describe('shiftWeek', () => {
	test('moves whole weeks forward and back', () => {
		expect(shiftWeek('2026-09-07', 1)).toBe('2026-09-14');
		expect(shiftWeek('2026-09-07', -1)).toBe('2026-08-31');
	});

	test('crosses a year boundary', () => {
		expect(shiftWeek('2026-12-28', 1)).toBe('2027-01-04');
	});
});

describe('weekLabel', () => {
	test('collapses a week inside one month', () => {
		expect(weekLabel('2026-09-07')).toBe('Sep 7 – 13, 2026');
	});

	test('names both months when the week straddles them', () => {
		expect(weekLabel('2026-09-28')).toBe('Sep 28 – Oct 4, 2026');
	});

	test('names both years when the week straddles them', () => {
		expect(weekLabel('2026-12-28')).toBe('Dec 28, 2026 – Jan 3, 2027');
	});
});

describe('currentWeek', () => {
	test('returns the Monday of the week containing today', () => {
		expect(currentWeek('2026-09-09')).toBe('2026-09-07');
		expect(currentWeek('2026-09-07')).toBe('2026-09-07');
		expect(currentWeek('2026-09-13')).toBe('2026-09-07');
	});
});
