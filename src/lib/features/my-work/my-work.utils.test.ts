import { describe, expect, test } from 'bun:test';
import { filterTasksByContext, sectionTasks } from '$lib/features/my-work/my-work.utils';

const today = '2026-09-09';
const base = {
	priority: 'medium' as const,
	sortOrder: 0,
	createdAt: new Date(2026, 8, 1),
	projectType: 'work'
};

describe('sectionTasks', () => {
	const tasks = [
		{ id: 'overdue', status: 'todo' as const, dueDate: '2026-09-01', ...base },
		{ id: 'today', status: 'in_progress' as const, dueDate: '2026-09-09', ...base },
		{ id: 'week', status: 'todo' as const, dueDate: '2026-09-12', ...base },
		{ id: 'later', status: 'todo' as const, dueDate: '2026-10-01', ...base },
		{ id: 'undated', status: 'todo' as const, dueDate: null, ...base },
		{ id: 'blocked-overdue', status: 'blocked' as const, dueDate: '2026-09-01', ...base },
		{ id: 'done', status: 'done' as const, dueDate: '2026-09-09', ...base }
	];

	test('places every open task in exactly one section, in a fixed order', () => {
		const sections = sectionTasks(tasks, today);
		expect(sections.map((s) => [s.key, s.tasks.map((t) => t.id)])).toEqual([
			['overdue', ['overdue']],
			['today', ['today']],
			['week', ['week']],
			['blocked', ['blocked-overdue']],
			['next', ['later', 'undated']]
		]);
	});

	test('omits empty sections', () => {
		const sections = sectionTasks([tasks[4]], today);
		expect(sections.map((s) => s.key)).toEqual(['next']);
	});

	test('sorts within a section by urgency', () => {
		const sections = sectionTasks(
			[
				{ id: 'low', status: 'todo' as const, dueDate: null, ...base, priority: 'low' as const },
				{
					id: 'urgent',
					status: 'todo' as const,
					dueDate: null,
					...base,
					priority: 'urgent' as const
				}
			],
			today
		);
		expect(sections[0].tasks.map((t) => t.id)).toEqual(['urgent', 'low']);
	});
});

describe('filterTasksByContext', () => {
	const tasks = [
		{ id: 'a', companyId: 'c1', projectId: 'p1', projectType: 'work' },
		{ id: 'b', companyId: 'c2', projectId: 'p2', projectType: 'personal' },
		{ id: 'c', companyId: 'c1', projectId: 'p3', projectType: 'personal' }
	];

	test('returns everything for the "all" context', () => {
		expect(filterTasksByContext(tasks, { kind: 'all' })).toHaveLength(3);
	});

	test('filters by company and by project', () => {
		expect(filterTasksByContext(tasks, { kind: 'company', id: 'c1' }).map((t) => t.id)).toEqual([
			'a',
			'c'
		]);
		expect(filterTasksByContext(tasks, { kind: 'project', id: 'p2' }).map((t) => t.id)).toEqual([
			'b'
		]);
	});

	test('personal context keeps tasks in personal projects', () => {
		expect(filterTasksByContext(tasks, { kind: 'personal' }).map((t) => t.id)).toEqual(['b', 'c']);
	});
});
