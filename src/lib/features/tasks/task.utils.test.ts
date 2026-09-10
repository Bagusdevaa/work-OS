import { describe, expect, test } from 'bun:test';
import {
	calculateTaskProgress,
	groupTasksByMilestone,
	isTaskOverdue,
	sortTasks
} from '$lib/features/tasks/task.utils';

const today = '2026-09-09';
const base = {
	priority: 'medium' as const,
	dueDate: null as string | null,
	sortOrder: 0,
	createdAt: new Date(2026, 8, 1)
};

describe('isTaskOverdue', () => {
	test('is overdue when due before today and not done', () => {
		expect(isTaskOverdue({ dueDate: '2026-09-08', status: 'todo' }, today)).toBe(true);
	});

	test('is not overdue when due today', () => {
		expect(isTaskOverdue({ dueDate: '2026-09-09', status: 'todo' }, today)).toBe(false);
	});

	test('done tasks are never overdue', () => {
		expect(isTaskOverdue({ dueDate: '2026-01-01', status: 'done' }, today)).toBe(false);
	});

	test('tasks without a due date are never overdue', () => {
		expect(isTaskOverdue({ dueDate: null, status: 'blocked' }, today)).toBe(false);
	});
});

describe('sortTasks', () => {
	test('open tasks come before done; overdue first, then by due date, then priority', () => {
		const sorted = sortTasks(
			[
				{ id: 'done', status: 'done' as const, ...base, priority: 'urgent' as const },
				{ id: 'later', status: 'todo' as const, ...base, dueDate: '2026-09-20' },
				{ id: 'undated-high', status: 'todo' as const, ...base, priority: 'high' as const },
				{ id: 'undated-low', status: 'todo' as const, ...base, priority: 'low' as const },
				{ id: 'overdue', status: 'in_progress' as const, ...base, dueDate: '2026-09-01' },
				{ id: 'today', status: 'blocked' as const, ...base, dueDate: '2026-09-09' }
			],
			today
		);
		expect(sorted.map((t) => t.id)).toEqual([
			'overdue',
			'today',
			'later',
			'undated-high',
			'undated-low',
			'done'
		]);
	});

	test('breaks remaining ties by sort order then creation time', () => {
		const sorted = sortTasks(
			[
				{ id: 'b', status: 'todo' as const, ...base, sortOrder: 1 },
				{ id: 'a', status: 'todo' as const, ...base, sortOrder: 0 },
				{ id: 'c', status: 'todo' as const, ...base, sortOrder: 1, createdAt: new Date(2026, 8, 2) }
			],
			today
		);
		expect(sorted.map((t) => t.id)).toEqual(['a', 'b', 'c']);
	});
});

describe('sortTasks in manual mode', () => {
	const urgentSoon = {
		id: 'urgent',
		status: 'todo' as const,
		...base,
		priority: 'urgent' as const,
		dueDate: '2026-09-01',
		sortOrder: 2
	};
	const dragged = { id: 'dragged', status: 'todo' as const, ...base, sortOrder: 0 };
	const middle = { id: 'middle', status: 'todo' as const, ...base, sortOrder: 1 };

	test('honours the stored order instead of urgency', () => {
		const sorted = sortTasks([urgentSoon, middle, dragged], today, 'manual');
		expect(sorted.map((t) => t.id)).toEqual(['dragged', 'middle', 'urgent']);
	});

	test('still pushes done tasks to the end', () => {
		const done = { id: 'done', status: 'done' as const, ...base, sortOrder: -1 };
		const sorted = sortTasks([done, middle, dragged], today, 'manual');
		expect(sorted.map((t) => t.id)).toEqual(['dragged', 'middle', 'done']);
	});

	test('breaks ties on creation time', () => {
		const older = {
			id: 'older',
			status: 'todo' as const,
			...base,
			createdAt: new Date(2026, 7, 1)
		};
		const newer = {
			id: 'newer',
			status: 'todo' as const,
			...base,
			createdAt: new Date(2026, 8, 5)
		};
		const sorted = sortTasks([newer, older], today, 'manual');
		expect(sorted.map((t) => t.id)).toEqual(['older', 'newer']);
	});

	test('defaults to smart ordering when no mode is given', () => {
		const sorted = sortTasks([dragged, urgentSoon], today);
		expect(sorted[0].id).toBe('urgent');
	});
});

describe('groupTasksByMilestone', () => {
	test('groups tasks under their milestone, keeping milestone order, unassigned last', () => {
		const milestones = [
			{ id: 'm1', name: 'First' },
			{ id: 'm2', name: 'Second' }
		];
		const tasks = [
			{ id: 't1', milestoneId: 'm2' },
			{ id: 't2', milestoneId: null },
			{ id: 't3', milestoneId: 'm1' },
			{ id: 't4', milestoneId: 'm2' }
		];
		const groups = groupTasksByMilestone(tasks, milestones);
		expect(groups.map((g) => [g.milestone?.name ?? null, g.tasks.map((t) => t.id)])).toEqual([
			['First', ['t3']],
			['Second', ['t1', 't4']],
			[null, ['t2']]
		]);
	});

	test('omits milestones with no tasks and the unassigned group when empty', () => {
		const groups = groupTasksByMilestone(
			[{ id: 't1', milestoneId: 'm1' }],
			[
				{ id: 'm1', name: 'Only' },
				{ id: 'm2', name: 'Empty' }
			]
		);
		expect(groups).toHaveLength(1);
	});
});

describe('calculateTaskProgress', () => {
	test('counts done tasks against the total', () => {
		expect(
			calculateTaskProgress([{ status: 'done' }, { status: 'todo' }, { status: 'in_progress' }])
		).toEqual({ total: 3, done: 1, percent: 33 });
	});
});
