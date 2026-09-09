import { and, asc, eq, getTableColumns, gte, lt } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { events, projects } from '$lib/server/db/schema';
import type { Event, EventWithContext, NewEvent } from './event.types';

const contextColumns = { ...getTableColumns(events), projectName: projects.name };

/** Events starting in [from, to). */
export function findEventsBetween(
	userId: string,
	from: Date,
	to: Date
): Promise<EventWithContext[]> {
	return db
		.select(contextColumns)
		.from(events)
		.leftJoin(projects, eq(events.projectId, projects.id))
		.where(and(eq(events.userId, userId), gte(events.startsAt, from), lt(events.startsAt, to)))
		.orderBy(asc(events.startsAt));
}

export async function findEventById(userId: string, id: string): Promise<Event | null> {
	const [row] = await db
		.select()
		.from(events)
		.where(and(eq(events.id, id), eq(events.userId, userId)))
		.limit(1);
	return row ?? null;
}

export async function createEvent(input: NewEvent): Promise<Event> {
	const [row] = await db.insert(events).values(input).returning();
	return row;
}

export async function deleteEvent(userId: string, id: string): Promise<Event | null> {
	const [row] = await db
		.delete(events)
		.where(and(eq(events.id, id), eq(events.userId, userId)))
		.returning();
	return row ?? null;
}
