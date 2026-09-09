import { describe, expect, test } from 'bun:test';
import { collectDeadlines, upcomingDeadlines } from '$lib/features/calendar/calendar.utils';

const today = '2026-09-09';

const input = {
	tasks: [
		{
			id: 't1',
			title: 'Task soon',
			dueDate: '2026-09-10',
			status: 'todo' as const,
			projectId: 'p1',
			projectName: 'P1'
		},
		{
			id: 't2',
			title: 'Task done',
			dueDate: '2026-09-10',
			status: 'done' as const,
			projectId: 'p1',
			projectName: 'P1'
		},
		{
			id: 't3',
			title: 'Task undated',
			dueDate: null,
			status: 'todo' as const,
			projectId: 'p1',
			projectName: 'P1'
		}
	],
	milestones: [
		{
			id: 'm1',
			name: 'Milestone',
			dueDate: '2026-09-12',
			status: 'active' as const,
			projectId: 'p1',
			projectName: 'P1'
		}
	],
	projects: [
		{ id: 'p1', name: 'P1', dueDate: '2026-09-30', status: 'active' as const },
		{ id: 'p2', name: 'Archived', dueDate: '2026-09-11', status: 'archived' as const }
	],
	events: [
		{
			id: 'e1',
			title: 'Board meeting',
			startsAt: new Date(2026, 8, 9, 14, 0),
			allDay: false,
			projectId: null,
			projectName: null
		}
	]
};

describe('collectDeadlines', () => {
	test('merges open tasks, open milestones, in-flight projects and events, sorted by date', () => {
		const items = collectDeadlines(input);
		expect(items.map((i) => [i.kind, i.id, i.date])).toEqual([
			['event', 'e1', '2026-09-09'],
			['task', 't1', '2026-09-10'],
			['milestone', 'm1', '2026-09-12'],
			['project', 'p1', '2026-09-30']
		]);
	});

	test('gives each item a link and a project label', () => {
		const [event, task] = collectDeadlines(input);
		expect(task.href).toBe('/tasks/t1');
		expect(task.projectName).toBe('P1');
		expect(event.href).toBe('/calendar');
	});
});

describe('upcomingDeadlines', () => {
	test('keeps items from today through the horizon, flagging overdue separately', () => {
		const items = upcomingDeadlines(
			collectDeadlines({
				...input,
				tasks: [
					...input.tasks,
					{
						id: 'late',
						title: 'Late',
						dueDate: '2026-09-01',
						status: 'todo' as const,
						projectId: 'p1',
						projectName: 'P1'
					}
				]
			}),
			today,
			7
		);
		expect(items.map((i) => i.id)).toEqual(['late', 'e1', 't1', 'm1']);
		expect(items.find((i) => i.id === 'late')?.overdue).toBe(true);
		expect(items.find((i) => i.id === 't1')?.overdue).toBe(false);
	});
});
