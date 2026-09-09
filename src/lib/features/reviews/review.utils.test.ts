import { describe, expect, test } from 'bun:test';
import {
	buildWeeklySummary,
	weekLabel,
	weekRange,
	type WeeklySummaryInput
} from '$lib/features/reviews/review.utils';

const weekStart = '2026-09-07';
const at = (day: number, hour = 10) => new Date(2026, 8, day, hour);

function input(overrides: Partial<WeeklySummaryInput> = {}): WeeklySummaryInput {
	return {
		tasks: [],
		milestones: [],
		projects: [],
		activityCount: 0,
		...overrides
	};
}

describe('weekRange', () => {
	test('covers Monday through Sunday with an exclusive end', () => {
		expect(weekRange(weekStart)).toEqual({
			start: '2026-09-07',
			end: '2026-09-13',
			nextStart: '2026-09-14'
		});
	});
});

describe('weekLabel', () => {
	test('describes the week by its dates', () => {
		expect(weekLabel(weekStart)).toBe('Sep 7 – Sep 13, 2026');
	});
});

describe('buildWeeklySummary', () => {
	test('counts tasks and milestones completed inside the week only', () => {
		const summary = buildWeeklySummary(
			input({
				tasks: [
					{
						id: 'a',
						title: 'A',
						status: 'done',
						completedAt: at(8),
						dueDate: null,
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'b',
						title: 'B',
						status: 'done',
						completedAt: at(14),
						dueDate: null,
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'c',
						title: 'C',
						status: 'done',
						completedAt: at(6),
						dueDate: null,
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'd',
						title: 'D',
						status: 'todo',
						completedAt: null,
						dueDate: null,
						projectId: 'p',
						projectName: 'P'
					}
				],
				milestones: [
					{
						id: 'm1',
						name: 'M1',
						status: 'completed',
						completedAt: at(10),
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'm2',
						name: 'M2',
						status: 'completed',
						completedAt: at(20),
						projectId: 'p',
						projectName: 'P'
					}
				]
			}),
			weekStart,
			'2026-09-20'
		);
		expect(summary.completedTasks.map((t) => t.id)).toEqual(['a']);
		expect(summary.completedMilestones.map((m) => m.id)).toEqual(['m1']);
	});

	test('lists open tasks overdue as of the end of the week', () => {
		const summary = buildWeeklySummary(
			input({
				tasks: [
					{
						id: 'late',
						title: 'Late',
						status: 'todo',
						completedAt: null,
						dueDate: '2026-09-10',
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'ok',
						title: 'Ok',
						status: 'todo',
						completedAt: null,
						dueDate: '2026-09-15',
						projectId: 'p',
						projectName: 'P'
					}
				]
			}),
			weekStart,
			'2026-09-20'
		);
		expect(summary.overdueTasks.map((t) => t.id)).toEqual(['late']);
	});

	test('while the week is in progress, only tasks due before today are overdue', () => {
		const summary = buildWeeklySummary(
			input({
				tasks: [
					{
						id: 'late',
						title: 'Late',
						status: 'todo',
						completedAt: null,
						dueDate: '2026-09-08',
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'soon',
						title: 'Soon',
						status: 'todo',
						completedAt: null,
						dueDate: '2026-09-10',
						projectId: 'p',
						projectName: 'P'
					}
				]
			}),
			weekStart,
			'2026-09-09'
		);
		expect(summary.overdueTasks.map((t) => t.id)).toEqual(['late']);
	});

	test('separates active and stalled projects and passes through activity count', () => {
		const summary = buildWeeklySummary(
			input({
				projects: [
					{ id: 'a', name: 'A', status: 'active', health: { state: 'healthy', reasons: [] } },
					{ id: 'b', name: 'B', status: 'blocked', health: { state: 'stalled', reasons: ['x'] } },
					{ id: 'c', name: 'C', status: 'idea', health: { state: 'healthy', reasons: [] } }
				],
				activityCount: 12
			}),
			weekStart,
			'2026-09-20'
		);
		expect(summary.activeProjects.map((p) => p.id)).toEqual(['a', 'b']);
		expect(summary.stalledProjects.map((p) => p.id)).toEqual(['b']);
		expect(summary.activityCount).toBe(12);
	});

	test('next week focus lists open tasks due next week, soonest first', () => {
		const summary = buildWeeklySummary(
			input({
				tasks: [
					{
						id: 'n2',
						title: 'N2',
						status: 'todo',
						completedAt: null,
						dueDate: '2026-09-18',
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'n1',
						title: 'N1',
						status: 'in_progress',
						completedAt: null,
						dueDate: '2026-09-15',
						projectId: 'p',
						projectName: 'P'
					},
					{
						id: 'far',
						title: 'Far',
						status: 'todo',
						completedAt: null,
						dueDate: '2026-10-01',
						projectId: 'p',
						projectName: 'P'
					}
				]
			}),
			weekStart,
			'2026-09-20'
		);
		expect(summary.nextWeekTasks.map((t) => t.id)).toEqual(['n1', 'n2']);
	});
});
