import type { activities } from '$lib/server/db/schema';

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
