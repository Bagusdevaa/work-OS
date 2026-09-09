import { describe, expect, test } from 'bun:test';
import { bucketTasks, bucketProjects } from '$lib/features/dashboard/dashboard.utils';

const today = '2026-09-09';

describe('bucketTasks', () => {
	const tasks = [
		{ id: 'overdue', status: 'todo' as const, priority: 'medium' as const, dueDate: '2026-09-01' },
		{
			id: 'today',
			status: 'in_progress' as const,
			priority: 'high' as const,
			dueDate: '2026-09-09'
		},
		{ id: 'week', status: 'todo' as const, priority: 'urgent' as const, dueDate: '2026-09-14' },
		{ id: 'later', status: 'todo' as const, priority: 'urgent' as const, dueDate: '2026-10-01' },
		{ id: 'blocked', status: 'blocked' as const, priority: 'low' as const, dueDate: null },
		{ id: 'done', status: 'done' as const, priority: 'urgent' as const, dueDate: '2026-09-01' }
	];

	test('splits open tasks into overdue, due today, due this week, blocked and urgent', () => {
		const buckets = bucketTasks(tasks, today);
		expect(buckets.overdue.map((t) => t.id)).toEqual(['overdue']);
		expect(buckets.dueToday.map((t) => t.id)).toEqual(['today']);
		expect(buckets.dueThisWeek.map((t) => t.id)).toEqual(['week']);
		expect(buckets.blocked.map((t) => t.id)).toEqual(['blocked']);
		expect(buckets.urgent.map((t) => t.id)).toEqual(['week', 'later']);
	});

	test('counts open tasks excluding done ones', () => {
		expect(bucketTasks(tasks, today).openCount).toBe(5);
	});
});

describe('bucketProjects', () => {
	const projects = [
		{ id: 'a', status: 'active' as const, health: { state: 'healthy' as const, reasons: [] } },
		{
			id: 'b',
			status: 'active' as const,
			health: { state: 'needs_attention' as const, reasons: [] }
		},
		{ id: 'c', status: 'blocked' as const, health: { state: 'stalled' as const, reasons: [] } },
		{ id: 'd', status: 'idea' as const, health: { state: 'healthy' as const, reasons: [] } },
		{ id: 'e', status: 'completed' as const, health: { state: 'healthy' as const, reasons: [] } }
	];

	test('separates in-flight projects by health', () => {
		const buckets = bucketProjects(projects);
		expect(buckets.inFlight.map((p) => p.id)).toEqual(['a', 'b', 'c']);
		expect(buckets.needsAttention.map((p) => p.id)).toEqual(['b']);
		expect(buckets.stalled.map((p) => p.id)).toEqual(['c']);
	});
});
