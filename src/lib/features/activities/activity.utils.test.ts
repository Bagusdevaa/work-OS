import { describe, expect, test } from 'bun:test';
import { activityHref } from '$lib/features/activities/activity.utils';

describe('activityHref', () => {
	test('links project entities to the project page', () => {
		expect(activityHref({ entityType: 'project', entityId: 'p1', projectId: 'p1' })).toBe(
			'/projects/p1'
		);
	});

	test('links tasks and milestones to their project page', () => {
		expect(activityHref({ entityType: 'task', entityId: 't1', projectId: 'p1' })).toBe(
			'/projects/p1'
		);
		expect(activityHref({ entityType: 'milestone', entityId: 'm1', projectId: 'p1' })).toBe(
			'/projects/p1'
		);
	});

	test('links company entities to the company page', () => {
		expect(activityHref({ entityType: 'company', entityId: 'c1', projectId: null })).toBe(
			'/companies/c1'
		);
	});

	test('returns null when there is nowhere sensible to go', () => {
		expect(activityHref({ entityType: 'inbox_item', entityId: 'i1', projectId: null })).toBeNull();
	});
});
