import type { tasks } from '$lib/server/db/schema';
import type { Priority, ProjectStatus } from '$lib/types/domain';

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

/** Task joined with the project, company and milestone it belongs to. */
export interface TaskWithContext extends Task {
	projectName: string;
	projectStatus: ProjectStatus;
	projectPriority: Priority;
	projectType: string;
	companyId: string;
	companyName: string;
	companyAccent: string | null;
	milestoneName: string | null;
}
