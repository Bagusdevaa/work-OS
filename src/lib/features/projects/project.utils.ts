import type { Priority, ProjectStatus } from '$lib/types/domain';
import { toISODate } from '$lib/utils/dates';

interface StatusFields {
	status: ProjectStatus;
	startedAt: string | null;
	completedAt: Date | null;
}

export interface StatusPatch {
	status: ProjectStatus;
	startedAt: string | null;
	completedAt: Date | null;
}

/** Derives the date side effects of a status change (start and completion stamps). */
export function statusTransitionPatch(
	project: StatusFields,
	next: ProjectStatus,
	now: Date
): StatusPatch {
	const startedAt = next === 'active' && !project.startedAt ? toISODate(now) : project.startedAt;
	const completedAt = next === 'completed' ? (project.completedAt ?? now) : null;
	return { status: next, startedAt, completedAt };
}

/** Lower rank sorts first. In-flight work leads, archived trails. */
const STATUS_RANK: Record<ProjectStatus, number> = {
	active: 0,
	blocked: 1,
	planning: 2,
	idea: 3,
	paused: 4,
	completed: 5,
	archived: 6
};

export const PRIORITY_RANK: Record<Priority, number> = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3
};

interface Sortable {
	status: ProjectStatus;
	priority: Priority;
	lastActivityAt: Date;
}

export function sortProjectsForList<T extends Sortable>(projects: T[]): T[] {
	return [...projects].sort(
		(a, b) =>
			STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
			PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
			b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
	);
}

interface CompanyGrouped {
	companyId: string;
	companyName: string;
}

export interface CompanyProjectGroup<T> {
	companyId: string;
	companyName: string;
	projects: T[];
}

/** Groups projects under their company for archive-style listings, companies A→Z. */
export function groupProjectsByCompany<T extends CompanyGrouped>(
	projects: T[]
): CompanyProjectGroup<T>[] {
	const groups = new Map<string, CompanyProjectGroup<T>>();
	for (const project of projects) {
		const group = groups.get(project.companyId);
		if (group) group.projects.push(project);
		else {
			groups.set(project.companyId, {
				companyId: project.companyId,
				companyName: project.companyName,
				projects: [project]
			});
		}
	}
	return [...groups.values()].sort((a, b) =>
		a.companyName.localeCompare(b.companyName, undefined, { sensitivity: 'base' })
	);
}
