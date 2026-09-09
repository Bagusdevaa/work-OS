import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { resources } from '$lib/server/db/schema';
import type { ResourceInput } from './resource.schema';
import type { Resource } from './resource.types';

export function findResourcesByProject(userId: string, projectId: string): Promise<Resource[]> {
	return db
		.select()
		.from(resources)
		.where(and(eq(resources.userId, userId), eq(resources.projectId, projectId)))
		.orderBy(desc(resources.createdAt));
}

export async function createResource(
	userId: string,
	projectId: string,
	input: ResourceInput
): Promise<Resource> {
	const [row] = await db
		.insert(resources)
		.values({ ...input, userId, projectId })
		.returning();
	return row;
}

export async function deleteResource(userId: string, id: string): Promise<Resource | null> {
	const [row] = await db
		.delete(resources)
		.where(and(eq(resources.id, id), eq(resources.userId, userId)))
		.returning();
	return row ?? null;
}
