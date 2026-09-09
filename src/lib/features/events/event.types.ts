import type { events } from '$lib/server/db/schema';

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export interface EventWithContext extends Event {
	projectName: string | null;
}
