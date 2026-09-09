import { and, desc, eq, getTableColumns } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { inboxItems, projects, tasks } from '$lib/server/db/schema';
import type { InboxStatus } from '$lib/types/domain';
import type { InboxItem, InboxItemWithLinks, NewInboxItem } from './inbox.types';

export function findInboxItems(
	userId: string,
	status: InboxStatus,
	limit = 100
): Promise<InboxItemWithLinks[]> {
	return db
		.select({
			...getTableColumns(inboxItems),
			convertedTaskTitle: tasks.title,
			convertedProjectName: projects.name
		})
		.from(inboxItems)
		.leftJoin(tasks, eq(inboxItems.convertedTaskId, tasks.id))
		.leftJoin(projects, eq(inboxItems.convertedProjectId, projects.id))
		.where(and(eq(inboxItems.userId, userId), eq(inboxItems.status, status)))
		.orderBy(desc(inboxItems.createdAt))
		.limit(limit);
}

export async function findInboxItemById(userId: string, id: string): Promise<InboxItem | null> {
	const [row] = await db
		.select()
		.from(inboxItems)
		.where(and(eq(inboxItems.id, id), eq(inboxItems.userId, userId)))
		.limit(1);
	return row ?? null;
}

export async function createInboxItem(input: NewInboxItem): Promise<InboxItem> {
	const [row] = await db.insert(inboxItems).values(input).returning();
	return row;
}

export async function updateInboxItem(
	userId: string,
	id: string,
	patch: Partial<NewInboxItem>
): Promise<InboxItem | null> {
	const [row] = await db
		.update(inboxItems)
		.set(patch)
		.where(and(eq(inboxItems.id, id), eq(inboxItems.userId, userId)))
		.returning();
	return row ?? null;
}

export async function countOpenInboxItems(userId: string): Promise<number> {
	return db.$count(inboxItems, and(eq(inboxItems.userId, userId), eq(inboxItems.status, 'open')));
}
