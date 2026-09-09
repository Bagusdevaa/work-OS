import type { MilestoneStatus } from '$lib/types/domain';

export interface TaskCounts {
	total: number;
	done: number;
}

export interface MilestoneProgress extends TaskCounts {
	percent: number;
}

export function calculateMilestoneProgress(counts: TaskCounts): MilestoneProgress {
	const percent = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
	return { total: counts.total, done: counts.done, percent };
}

interface DueFields {
	dueDate: string | null;
	status: MilestoneStatus;
}

export function isMilestoneOverdue(milestone: DueFields, today: string): boolean {
	if (milestone.status === 'completed' || !milestone.dueDate) return false;
	return milestone.dueDate < today;
}

const STATUS_RANK: Record<MilestoneStatus, number> = { active: 0, planned: 1, completed: 2 };

interface Sortable {
	status: MilestoneStatus;
	dueDate: string | null;
	sortOrder: number;
}

/** Active first, then planned (soonest due first, undated last), completed last. */
export function sortMilestones<T extends Sortable>(milestones: T[]): T[] {
	return [...milestones].sort(
		(a, b) =>
			STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
			compareDueDates(a.dueDate, b.dueDate) ||
			a.sortOrder - b.sortOrder
	);
}

function compareDueDates(a: string | null, b: string | null): number {
	if (a === b) return 0;
	if (a === null) return 1;
	if (b === null) return -1;
	return a < b ? -1 : 1;
}
