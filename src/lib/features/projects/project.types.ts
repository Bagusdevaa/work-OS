import type { projects } from '$lib/server/db/schema';

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
