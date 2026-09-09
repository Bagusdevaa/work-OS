import { describe, expect, test } from 'bun:test';
import { sortProjectsForList, statusTransitionPatch } from '$lib/features/projects/project.utils';

const now = new Date(2026, 8, 9, 10, 0);

describe('statusTransitionPatch', () => {
	test('moving to active sets the started date when missing', () => {
		const patch = statusTransitionPatch(
			{ status: 'planning', startedAt: null, completedAt: null },
			'active',
			now
		);
		expect(patch).toEqual({ status: 'active', startedAt: '2026-09-09', completedAt: null });
	});

	test('moving to active keeps an existing started date', () => {
		const patch = statusTransitionPatch(
			{ status: 'paused', startedAt: '2026-08-01', completedAt: null },
			'active',
			now
		);
		expect(patch.startedAt).toBe('2026-08-01');
	});

	test('completing stamps completedAt', () => {
		const patch = statusTransitionPatch(
			{ status: 'active', startedAt: '2026-08-01', completedAt: null },
			'completed',
			now
		);
		expect(patch.completedAt).toEqual(now);
	});

	test('reopening a completed project clears completedAt', () => {
		const patch = statusTransitionPatch(
			{ status: 'completed', startedAt: '2026-08-01', completedAt: now },
			'active',
			now
		);
		expect(patch.completedAt).toBeNull();
	});

	test('moving to idea does not touch started date', () => {
		const patch = statusTransitionPatch(
			{ status: 'planning', startedAt: null, completedAt: null },
			'idea',
			now
		);
		expect(patch.startedAt).toBeNull();
	});
});

describe('sortProjectsForList', () => {
	const base = { lastActivityAt: now, priority: 'medium' as const };
	const projects = [
		{ id: 'done', status: 'completed' as const, ...base },
		{ id: 'idea', status: 'idea' as const, ...base },
		{ id: 'active-low', status: 'active' as const, ...base, priority: 'low' as const },
		{ id: 'blocked', status: 'blocked' as const, ...base },
		{ id: 'active-urgent', status: 'active' as const, ...base, priority: 'urgent' as const },
		{ id: 'archived', status: 'archived' as const, ...base },
		{ id: 'paused', status: 'paused' as const, ...base },
		{ id: 'planning', status: 'planning' as const, ...base }
	];

	test('orders in-flight work first, then by priority', () => {
		expect(sortProjectsForList(projects).map((p) => p.id)).toEqual([
			'active-urgent',
			'active-low',
			'blocked',
			'planning',
			'idea',
			'paused',
			'done',
			'archived'
		]);
	});

	test('breaks ties by most recent activity', () => {
		const older = new Date(2026, 7, 1);
		const sorted = sortProjectsForList([
			{ id: 'old', status: 'active' as const, priority: 'high' as const, lastActivityAt: older },
			{ id: 'new', status: 'active' as const, priority: 'high' as const, lastActivityAt: now }
		]);
		expect(sorted.map((p) => p.id)).toEqual(['new', 'old']);
	});

	test('does not mutate the input array', () => {
		const input = [...projects];
		sortProjectsForList(input);
		expect(input.map((p) => p.id)).toEqual(projects.map((p) => p.id));
	});
});
