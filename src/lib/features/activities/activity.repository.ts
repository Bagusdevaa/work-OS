import { and, desc, eq, gte, lt } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { activities } from '$lib/server/db/schema';
import type { Activity, NewActivity } from './activity.types';

export interface ActivityFilter {
	projectId?: string;
	companyId?: string;
	/** Inclusive lower bound. */
	from?: Date;
	/** Exclusive upper bound. */
	to?: Date;
	limit?: number;
}

export async function insertActivity(input: NewActivity): Promise<Activity> {
	const [row] = await db.insert(activities).values(input).returning();
	return row;
}

export async function findActivities(
	userId: string,
	filter: ActivityFilter = {}
): Promise<Activity[]> {
	const conditions = [eq(activities.userId, userId)];
	if (filter.projectId) conditions.push(eq(activities.projectId, filter.projectId));
	if (filter.companyId) conditions.push(eq(activities.companyId, filter.companyId));
	if (filter.from) conditions.push(gte(activities.createdAt, filter.from));
	if (filter.to) conditions.push(lt(activities.createdAt, filter.to));

	return db
		.select()
		.from(activities)
		.where(and(...conditions))
		.orderBy(desc(activities.createdAt))
		.limit(filter.limit ?? 20);
}
