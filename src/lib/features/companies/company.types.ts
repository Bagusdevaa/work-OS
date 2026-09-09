import type { companies } from '$lib/server/db/schema';
import type { ProjectStatus } from '$lib/types/domain';

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

/** Company row with aggregate counts for list views. */
export interface CompanySummary extends Company {
	inFlightProjects: number;
	totalProjects: number;
	areaCount: number;
}

export interface ProjectStatusCount {
	status: ProjectStatus;
	count: number;
}

export interface ProjectStatusSummary {
	total: number;
	inFlight: number;
	completed: number;
	other: number;
}
