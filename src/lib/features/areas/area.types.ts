import type { areas } from '$lib/server/db/schema';

export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;
