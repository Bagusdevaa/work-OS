import type { projects } from '$lib/server/db/schema';

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

/** Project row joined with the company and area it belongs to. */
export interface ProjectWithContext extends Project {
	companyName: string;
	companyAccent: string | null;
	areaName: string | null;
}
