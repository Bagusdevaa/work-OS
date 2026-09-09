import { describe, expect, test } from 'bun:test';
import {
	calculateMilestoneProgress,
	isMilestoneOverdue,
	sortMilestones
} from '$lib/features/milestones/milestone.utils';

describe('calculateMilestoneProgress', () => {
	test('is zero with no tasks', () => {
		expect(calculateMilestoneProgress({ total: 0, done: 0 })).toEqual({
			total: 0,
			done: 0,
			percent: 0
		});
	});

	test('reports the share of completed tasks', () => {
		expect(calculateMilestoneProgress({ total: 4, done: 2 }).percent).toBe(50);
	});

	test('is complete when every task is done', () => {
		expect(calculateMilestoneProgress({ total: 3, done: 3 }).percent).toBe(100);
	});

	test('rounds to a whole percent', () => {
		expect(calculateMilestoneProgress({ total: 3, done: 1 }).percent).toBe(33);
	});
});

describe('isMilestoneOverdue', () => {
	const today = '2026-09-09';

	test('is overdue when the due date has passed and it is not completed', () => {
		expect(isMilestoneOverdue({ dueDate: '2026-09-08', status: 'active' }, today)).toBe(true);
	});

	test('is not overdue on the due date itself', () => {
		expect(isMilestoneOverdue({ dueDate: '2026-09-09', status: 'active' }, today)).toBe(false);
	});

	test('completed milestones are never overdue', () => {
		expect(isMilestoneOverdue({ dueDate: '2026-01-01', status: 'completed' }, today)).toBe(false);
	});

	test('milestones without a due date are never overdue', () => {
		expect(isMilestoneOverdue({ dueDate: null, status: 'planned' }, today)).toBe(false);
	});
});

describe('sortMilestones', () => {
	test('puts active first, then planned by due date, completed last', () => {
		const sorted = sortMilestones([
			{ id: 'done', status: 'completed', dueDate: '2026-01-01', sortOrder: 0 },
			{ id: 'planned-late', status: 'planned', dueDate: '2026-12-01', sortOrder: 0 },
			{ id: 'planned-nodate', status: 'planned', dueDate: null, sortOrder: 0 },
			{ id: 'active', status: 'active', dueDate: null, sortOrder: 5 },
			{ id: 'planned-soon', status: 'planned', dueDate: '2026-10-01', sortOrder: 0 }
		]);
		expect(sorted.map((m) => m.id)).toEqual([
			'active',
			'planned-soon',
			'planned-late',
			'planned-nodate',
			'done'
		]);
	});
});
