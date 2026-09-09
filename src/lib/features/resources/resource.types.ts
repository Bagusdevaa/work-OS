import type { resources } from '$lib/server/db/schema';

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
