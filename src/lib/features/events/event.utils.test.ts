import { describe, expect, test } from 'bun:test';
import { combineDateTime } from '$lib/features/events/event.utils';

describe('combineDateTime', () => {
	test('builds a local timestamp from a date and HH:MM', () => {
		expect(combineDateTime('2026-09-09', '14:30')).toEqual(new Date(2026, 8, 9, 14, 30));
	});

	test('uses local midnight for all-day events', () => {
		expect(combineDateTime('2026-09-09', null)).toEqual(new Date(2026, 8, 9, 0, 0));
	});
});
