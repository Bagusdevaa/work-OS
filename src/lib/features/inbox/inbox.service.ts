import { error } from '@sveltejs/kit';
import { logActivity } from '$lib/features/activities/activity.service';
import { createNote } from '$lib/features/notes/note.service';
import { createTask } from '$lib/features/tasks/task.service';
import * as repo from './inbox.repository';
import type { CaptureInput, ConvertToTaskInput } from './inbox.schema';
import type { InboxItem, InboxItemWithLinks } from './inbox.types';
import { captureTitle, classifyCapture } from './inbox.utils';

export interface InboxOverview {
	open: InboxItemWithLinks[];
	processed: InboxItemWithLinks[];
	dismissed: InboxItemWithLinks[];
}

export async function getInboxOverview(userId: string): Promise<InboxOverview> {
	const [open, processed, dismissed] = await Promise.all([
		repo.findInboxItems(userId, 'open'),
		repo.findInboxItems(userId, 'processed', 10),
		repo.findInboxItems(userId, 'dismissed', 20)
	]);
	return { open, processed, dismissed };
}

export async function captureInboxItem(userId: string, input: CaptureInput): Promise<InboxItem> {
	const classified = classifyCapture(input.content, input.kind);
	const item = await repo.createInboxItem({ userId, ...classified });
	await logActivity(userId, {
		entityType: 'inbox_item',
		entityId: item.id,
		action: 'created',
		summary: `Captured "${captureTitle(item.content, 60)}"`
	});
	return item;
}

async function requireOpenItem(userId: string, id: string): Promise<InboxItem> {
	const item = await repo.findInboxItemById(userId, id);
	if (!item) error(404, 'Inbox item not found');
	return item;
}

async function markProcessed(
	userId: string,
	id: string,
	links: { convertedTaskId?: string; convertedProjectId?: string }
): Promise<void> {
	await repo.updateInboxItem(userId, id, {
		status: 'processed',
		processedAt: new Date(),
		...links
	});
}

export async function convertInboxItemToTask(
	userId: string,
	input: ConvertToTaskInput
): Promise<void> {
	const item = await requireOpenItem(userId, input.itemId);
	const task = await createTask(userId, input.projectId, {
		title: captureTitle(item.content, 200),
		milestoneId: null,
		priority: input.priority,
		dueDate: input.dueDate
	});
	await markProcessed(userId, item.id, {
		convertedTaskId: task.id,
		convertedProjectId: task.projectId
	});
}

export async function convertInboxItemToNote(
	userId: string,
	itemId: string,
	projectId: string
): Promise<void> {
	const item = await requireOpenItem(userId, itemId);
	const body = item.url && item.content !== item.url ? item.content : (item.content ?? '');
	await createNote(userId, projectId, {
		title: captureTitle(item.content, 160),
		content: item.url ? `${body}\n\n${item.url}`.trim() : body
	});
	await markProcessed(userId, item.id, { convertedProjectId: projectId });
}

/** Called after a project was created from an inbox item (see /projects/new). */
export async function markInboxItemConvertedToProject(
	userId: string,
	itemId: string,
	projectId: string
): Promise<void> {
	const item = await repo.findInboxItemById(userId, itemId);
	if (item && item.status === 'open')
		await markProcessed(userId, item.id, { convertedProjectId: projectId });
}

export async function setInboxItemStatus(
	userId: string,
	id: string,
	status: 'open' | 'dismissed'
): Promise<void> {
	const item = await repo.updateInboxItem(userId, id, {
		status,
		processedAt: status === 'dismissed' ? new Date() : null
	});
	if (!item) error(404, 'Inbox item not found');
}

export function countOpenInboxItems(userId: string) {
	return repo.countOpenInboxItems(userId);
}
