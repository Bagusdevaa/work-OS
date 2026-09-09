import { IN_FLIGHT_PROJECT_STATUSES } from '$lib/types/domain';
import type { ProjectStatusCount, ProjectStatusSummary } from './company.types';

export function summarizeProjectStatuses(rows: ProjectStatusCount[]): ProjectStatusSummary {
	const summary: ProjectStatusSummary = { total: 0, inFlight: 0, completed: 0, other: 0 };
	for (const row of rows) {
		summary.total += row.count;
		if (IN_FLIGHT_PROJECT_STATUSES.includes(row.status)) summary.inFlight += row.count;
		else if (row.status === 'completed') summary.completed += row.count;
		else summary.other += row.count;
	}
	return summary;
}

/** First letter of the company name, for avatars. */
export function companyInitial(name: string): string {
	return name.trim().charAt(0).toUpperCase() || '?';
}
