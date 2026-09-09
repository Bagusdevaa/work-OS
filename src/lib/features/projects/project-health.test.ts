import { describe, expect, test } from 'bun:test';
import { calculateProjectHealth, type HealthInput } from '$lib/features/projects/project-health';

const now = new Date(2026, 8, 9, 12, 0);
const daysAgo = (n: number) => new Date(2026, 8, 9 - n, 12, 0);

function project(overrides: Partial<HealthInput> = {}): HealthInput {
	return {
		status: 'active',
		lastActivityAt: daysAgo(1),
		nextAction: 'Do the thing',
		dueDate: null,
		tasks: [{ status: 'todo', dueDate: null }],
		milestones: [],
		...overrides
	};
}

describe('calculateProjectHealth', () => {
	test('projects that are not in flight are healthy with an explanation', () => {
		const result = calculateProjectHealth(project({ status: 'idea' }), now);
		expect(result.state).toBe('healthy');
		expect(result.reasons).toEqual(['Not in progress']);
	});

	test('an active project with recent activity and nothing overdue is healthy', () => {
		const result = calculateProjectHealth(project(), now);
		expect(result.state).toBe('healthy');
		expect(result.reasons.length).toBeGreaterThan(0);
	});

	test('an overdue task needs attention', () => {
		const result = calculateProjectHealth(
			project({ tasks: [{ status: 'todo', dueDate: '2026-09-06' }] }),
			now
		);
		expect(result.state).toBe('needs_attention');
		expect(result.reasons).toContain('1 overdue task');
	});

	test('done tasks with past due dates do not count as overdue', () => {
		const result = calculateProjectHealth(
			project({ tasks: [{ status: 'done', dueDate: '2026-01-01' }] }),
			now
		);
		expect(result.state).toBe('healthy');
	});

	test('a week without activity needs attention', () => {
		const result = calculateProjectHealth(project({ lastActivityAt: daysAgo(8) }), now);
		expect(result.state).toBe('needs_attention');
		expect(result.reasons).toContain('No activity for 8 days');
	});

	test('two weeks without activity is stalled', () => {
		const result = calculateProjectHealth(project({ lastActivityAt: daysAgo(15) }), now);
		expect(result.state).toBe('stalled');
		expect(result.reasons).toContain('No activity for 15 days');
	});

	test('a blocked project needs attention even when recently active', () => {
		const result = calculateProjectHealth(project({ status: 'blocked' }), now);
		expect(result.state).toBe('needs_attention');
		expect(result.reasons).toContain('Project is blocked');
	});

	test('a blocked project with a week of silence is stalled', () => {
		const result = calculateProjectHealth(
			project({ status: 'blocked', lastActivityAt: daysAgo(7) }),
			now
		);
		expect(result.state).toBe('stalled');
		expect(result.reasons).toContain('Blocked for 7 days without activity');
	});

	test('a task overdue by two weeks stalls the project', () => {
		const result = calculateProjectHealth(
			project({ tasks: [{ status: 'in_progress', dueDate: '2026-08-20' }] }),
			now
		);
		expect(result.state).toBe('stalled');
		expect(result.reasons).toContain('A task is 20 days overdue');
	});

	test('an active project with no next action and no open tasks needs attention', () => {
		const result = calculateProjectHealth(
			project({ nextAction: null, tasks: [{ status: 'done', dueDate: null }] }),
			now
		);
		expect(result.state).toBe('needs_attention');
		expect(result.reasons).toContain('No next action defined');
	});

	test('a next action alone keeps an empty project healthy', () => {
		const result = calculateProjectHealth(project({ tasks: [] }), now);
		expect(result.state).toBe('healthy');
	});

	test('blocked tasks and overdue milestones need attention', () => {
		const result = calculateProjectHealth(
			project({
				tasks: [{ status: 'blocked', dueDate: null }],
				milestones: [{ status: 'active', dueDate: '2026-09-01' }]
			}),
			now
		);
		expect(result.state).toBe('needs_attention');
		expect(result.reasons).toContain('1 blocked task');
		expect(result.reasons).toContain('1 overdue milestone');
	});

	test('a project past its own due date needs attention', () => {
		const result = calculateProjectHealth(project({ dueDate: '2026-09-01' }), now);
		expect(result.state).toBe('needs_attention');
		expect(result.reasons).toContain('Project is past its due date');
	});

	test('lists every signal that applies, worst state wins', () => {
		const result = calculateProjectHealth(
			project({
				status: 'blocked',
				lastActivityAt: daysAgo(20),
				tasks: [
					{ status: 'todo', dueDate: '2026-09-01' },
					{ status: 'todo', dueDate: '2026-09-05' }
				]
			}),
			now
		);
		expect(result.state).toBe('stalled');
		expect(result.reasons).toEqual(
			expect.arrayContaining([
				'No activity for 20 days',
				'Blocked for 20 days without activity',
				'2 overdue tasks'
			])
		);
	});
});
