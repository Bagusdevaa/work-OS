import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { areas } from '$lib/server/db/schema';
import type { AreaInput } from './area.schema';
import type { Area } from './area.types';

export function findAreasByCompany(userId: string, companyId: string): Promise<Area[]> {
	return db
		.select()
		.from(areas)
		.where(and(eq(areas.userId, userId), eq(areas.companyId, companyId)))
		.orderBy(asc(areas.name));
}

export function findAreas(userId: string): Promise<Area[]> {
	return db.select().from(areas).where(eq(areas.userId, userId)).orderBy(asc(areas.name));
}

export async function findAreaById(userId: string, id: string): Promise<Area | null> {
	const [row] = await db
		.select()
		.from(areas)
		.where(and(eq(areas.id, id), eq(areas.userId, userId)))
		.limit(1);
	return row ?? null;
}

export async function createArea(
	userId: string,
	companyId: string,
	input: AreaInput
): Promise<Area> {
	const [row] = await db
		.insert(areas)
		.values({ ...input, userId, companyId })
		.returning();
	return row;
}

export async function deleteArea(userId: string, id: string): Promise<Area | null> {
	const [row] = await db
		.delete(areas)
		.where(and(eq(areas.id, id), eq(areas.userId, userId)))
		.returning();
	return row ?? null;
}
