import { describe, expect, test } from 'bun:test';
import {
	recommendTasks,
	type RecommendationCandidate
} from '$lib/features/tasks/task-recommendation';

const today = '2026-09-09';

function candidate(overrides: Partial<RecommendationCandidate> = {}): RecommendationCandidate {
	return {
		id: 'task',
		title: 'Task',
		status: 'todo',
		priority: 'medium',
		dueDate: null,
		estimatedMinutes: null,
		projectId: 'p',
		projectStatus: 'active',
		projectPriority: 'medium',
		projectHealth: 'healthy',
		...overrides
	};
}

describe('recommendTasks', () => {
	test('ignores done and blocked tasks and tasks in projects that are not in flight', () => {
		const result = recommendTasks(
			[
				candidate({ id: 'done', status: 'done' }),
				candidate({ id: 'blocked', status: 'blocked' }),
				candidate({ id: 'paused', projectStatus: 'paused' }),
				candidate({ id: 'idea', projectStatus: 'idea' }),
				candidate({ id: 'ok' })
			],
			today
		);
		expect(result.map((r) => r.task.id)).toEqual(['ok']);
	});

	test('an overdue urgent task outranks an undated medium task', () => {
		const result = recommendTasks(
			[
				candidate({ id: 'calm' }),
				candidate({ id: 'hot', priority: 'urgent', dueDate: '2026-09-07' })
			],
			today
		);
		expect(result[0].task.id).toBe('hot');
		expect(result[0].reasons).toEqual(
			expect.arrayContaining(['Urgent priority', 'Overdue by 2 days'])
		);
	});

	test('explains due-soon and project-health signals', () => {
		const [rec] = recommendTasks(
			[candidate({ priority: 'high', dueDate: '2026-09-10', projectHealth: 'needs_attention' })],
			today
		);
		expect(rec.reasons).toEqual(
			expect.arrayContaining(['High priority', 'Due tomorrow', 'Project needs attention'])
		);
	});

	test('prefers work already in progress when everything else is equal', () => {
		const result = recommendTasks(
			[candidate({ id: 'todo' }), candidate({ id: 'wip', status: 'in_progress' })],
			today
		);
		expect(result[0].task.id).toBe('wip');
		expect(result[0].reasons).toContain('Already in progress');
	});

	test('flags quick wins', () => {
		const [rec] = recommendTasks([candidate({ estimatedMinutes: 20 })], today);
		expect(rec.reasons).toContain('Quick win (20 min)');
	});

	test('respects the limit and sorts by score descending', () => {
		const result = recommendTasks(
			[
				candidate({ id: 'low', priority: 'low' }),
				candidate({ id: 'urgent', priority: 'urgent' }),
				candidate({ id: 'high', priority: 'high' }),
				candidate({ id: 'medium' })
			],
			today,
			2
		);
		expect(result.map((r) => r.task.id)).toEqual(['urgent', 'high']);
		expect(result[0].score).toBeGreaterThan(result[1].score);
	});

	test('a healthy project with no signals still gets a reason', () => {
		const [rec] = recommendTasks([candidate()], today);
		expect(rec.reasons.length).toBeGreaterThan(0);
	});
});
