import { describe, expect, test } from 'bun:test';
import { moveWithinGroup, sortOrderPatches } from '$lib/features/tasks/task.utils';

/** id → milestone group. `null` stands for the "no milestone" group. */
const items = [
	{ id: 'a', milestoneId: 'm1' },
	{ id: 'b', milestoneId: 'm1' },
	{ id: 'c', milestoneId: 'm2' },
	{ id: 'd', milestoneId: 'm1' },
	{ id: 'e', milestoneId: null }
];

describe('moveWithinGroup', () => {
	test('moves a task down inside its own group, keeping other groups in place', () => {
		// group m1 is [a, b, d]; moving a to index 1 gives [b, a, d]
		expect(moveWithinGroup(items, 'a', 1)).toEqual(['b', 'a', 'c', 'd', 'e']);
	});

	test('moves a task up inside its own group', () => {
		// group m1 is [a, b, d]; moving d to index 0 gives [d, a, b]
		expect(moveWithinGroup(items, 'd', 0)).toEqual(['d', 'a', 'c', 'b', 'e']);
	});

	test('keeps positions belonging to other groups untouched', () => {
		// 'c' occupies index 2 and is the only member of m2, so nothing moves
		expect(moveWithinGroup(items, 'c', 0)).toEqual(['a', 'b', 'c', 'd', 'e']);
	});

	test('groups tasks without a milestone together', () => {
		const list = [
			{ id: 'x', milestoneId: null },
			{ id: 'y', milestoneId: 'm1' },
			{ id: 'z', milestoneId: null }
		];
		expect(moveWithinGroup(list, 'z', 0)).toEqual(['z', 'y', 'x']);
	});

	test('clamps an index past either end of the group', () => {
		expect(moveWithinGroup(items, 'a', 99)).toEqual(['b', 'd', 'c', 'a', 'e']);
		expect(moveWithinGroup(items, 'd', -5)).toEqual(['d', 'a', 'c', 'b', 'e']);
	});

	test('returns the original order when the task is unknown', () => {
		expect(moveWithinGroup(items, 'missing', 0)).toEqual(['a', 'b', 'c', 'd', 'e']);
	});

	test('returns the original order when the task is already at that index', () => {
		expect(moveWithinGroup(items, 'b', 1)).toEqual(['a', 'b', 'c', 'd', 'e']);
	});
});

describe('sortOrderPatches', () => {
	test('numbers the list from zero in its new order', () => {
		expect(sortOrderPatches(['b', 'a', 'c'])).toEqual([
			{ id: 'b', sortOrder: 0 },
			{ id: 'a', sortOrder: 1 },
			{ id: 'c', sortOrder: 2 }
		]);
	});

	test('handles an empty list', () => {
		expect(sortOrderPatches([])).toEqual([]);
	});
});
