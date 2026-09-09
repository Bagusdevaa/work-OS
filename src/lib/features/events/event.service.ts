import { error } from '@sveltejs/kit';
import { logActivity } from '$lib/features/activities/activity.service';
import { recordProjectActivity, requireProject } from '$lib/features/projects/project.service';
import { formatDate } from '$lib/utils/dates';
import * as repo from './event.repository';
import type { EventInput } from './event.schema';
import type { Event } from './event.types';
import { combineDateTime } from './event.utils';

export async function createEvent(userId: string, input: EventInput): Promise<Event> {
	const project = input.projectId ? await requireProject(userId, input.projectId) : null;
	const event = await repo.createEvent({
		userId,
		title: input.title,
		description: input.description,
		startsAt: combineDateTime(input.date, input.time),
		allDay: input.time === null,
		projectId: project?.id ?? null,
		companyId: project?.companyId ?? null
	});
	const summary = `Scheduled "${event.title}" for ${formatDate(input.date, 'short')}`;
	if (project) {
		await recordProjectActivity(userId, project.id, {
			entityType: 'event',
			entityId: event.id,
			action: 'created',
			summary
		});
	} else {
		await logActivity(userId, {
			entityType: 'event',
			entityId: event.id,
			action: 'created',
			summary
		});
	}
	return event;
}

export async function deleteEvent(userId: string, id: string): Promise<void> {
	const event = await repo.deleteEvent(userId, id);
	if (!event) error(404, 'Event not found');
	await logActivity(userId, {
		entityType: 'event',
		entityId: event.id,
		action: 'deleted',
		summary: `Removed event "${event.title}"`,
		projectId: event.projectId,
		companyId: event.companyId
	});
}
