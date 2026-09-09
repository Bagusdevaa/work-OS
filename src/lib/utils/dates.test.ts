import { describe, expect, test } from 'bun:test';
import {
	addDays,
	daysBetween,
	daysSince,
	describeDueDate,
	formatDate,
	startOfWeek,
	toISODate
} from '$lib/utils/dates';

describe('toISODate', () => {
	test('formats a local date as YYYY-MM-DD', () => {
		expect(toISODate(new Date(2026, 8, 9, 15, 30))).toBe('2026-09-09');
	});

	test('zero-pads month and day', () => {
		expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
	});
});

describe('addDays', () => {
	test('adds days across a month boundary', () => {
		expect(addDays('2026-09-29', 3)).toBe('2026-10-02');
	});

	test('subtracts days with a negative count', () => {
		expect(addDays('2026-09-01', -1)).toBe('2026-08-31');
	});
});

describe('daysBetween', () => {
	test('returns the number of calendar days from one date to another', () => {
		expect(daysBetween('2026-09-01', '2026-09-09')).toBe(8);
	});

	test('is negative when the second date is earlier', () => {
		expect(daysBetween('2026-09-09', '2026-09-07')).toBe(-2);
	});
});

describe('startOfWeek', () => {
	test('returns the Monday of the week for a Wednesday', () => {
		expect(startOfWeek('2026-09-09')).toBe('2026-09-07');
	});

	test('returns the previous Monday for a Sunday', () => {
		expect(startOfWeek('2026-09-13')).toBe('2026-09-07');
	});

	test('returns the same day for a Monday', () => {
		expect(startOfWeek('2026-09-07')).toBe('2026-09-07');
	});
});

describe('daysSince', () => {
	test('counts whole days elapsed between two timestamps', () => {
		const then = new Date(2026, 8, 1, 12, 0);
		const now = new Date(2026, 8, 9, 9, 0);
		expect(daysSince(then, now)).toBe(7);
	});
});

describe('formatDate', () => {
	test('formats an ISO date for display', () => {
		expect(formatDate('2026-09-09')).toBe('Sep 9, 2026');
	});
});

describe('describeDueDate', () => {
	const today = '2026-09-09';

	test('says due today', () => {
		expect(describeDueDate('2026-09-09', today)).toBe('Due today');
	});

	test('says due tomorrow', () => {
		expect(describeDueDate('2026-09-10', today)).toBe('Due tomorrow');
	});

	test('says overdue by one day (singular)', () => {
		expect(describeDueDate('2026-09-08', today)).toBe('Overdue by 1 day');
	});

	test('says overdue by several days', () => {
		expect(describeDueDate('2026-09-04', today)).toBe('Overdue by 5 days');
	});

	test('says due in N days within a week', () => {
		expect(describeDueDate('2026-09-14', today)).toBe('Due in 5 days');
	});

	test('falls back to a formatted date beyond a week', () => {
		expect(describeDueDate('2026-09-30', today)).toBe('Due Sep 30');
	});
});
