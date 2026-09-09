import { PRIORITY_RANK } from '$lib/features/projects/project.utils';
import type { Priority, TaskStatus } from '$lib/types/domain';

interface DueFields {
	dueDate: string | null;
	status: TaskStatus;
}

export function isTaskOverdue(task: DueFields, today: string): boolean {
	if (task.status === 'done' || !task.dueDate) return false;
	return task.dueDate < today;
}

interface Sortable extends DueFields {
	priority: Priority;
	sortOrder: number;
	createdAt: Date;
}

/**
 * Open tasks first (overdue → dated soonest → undated), then by priority,
 * manual order and creation time. Done tasks trail.
 */
export function sortTasks<T extends Sortable>(tasks: T[], today: string): T[] {
	return [...tasks].sort(
		(a, b) =>
			Number(a.status === 'done') - Number(b.status === 'done') ||
			Number(isTaskOverdue(b, today)) - Number(isTaskOverdue(a, today)) ||
			compareDueDates(a.dueDate, b.dueDate) ||
			PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
			a.sortOrder - b.sortOrder ||
			a.createdAt.getTime() - b.createdAt.getTime()
	);
}

function compareDueDates(a: string | null, b: string | null): number {
	if (a === b) return 0;
	if (a === null) return 1;
	if (b === null) return -1;
	return a < b ? -1 : 1;
}

export interface TaskGroup<T, M> {
	milestone: M | null;
	tasks: T[];
}

/** Groups tasks under their milestone (in milestone order); unassigned tasks go last. */
export function groupTasksByMilestone<
	T extends { milestoneId: string | null },
	M extends { id: string }
>(tasks: T[], milestones: M[]): TaskGroup<T, M>[] {
	const groups: TaskGroup<T, M>[] = [];
	for (const milestone of milestones) {
		const assigned = tasks.filter((task) => task.milestoneId === milestone.id);
		if (assigned.length) groups.push({ milestone, tasks: assigned });
	}
	const known = new Set(milestones.map((m) => m.id));
	const unassigned = tasks.filter((task) => !task.milestoneId || !known.has(task.milestoneId));
	if (unassigned.length) groups.push({ milestone: null, tasks: unassigned });
	return groups;
}

export interface TaskProgress {
	total: number;
	done: number;
	percent: number;
}

export function calculateTaskProgress(tasks: Array<{ status: TaskStatus }>): TaskProgress {
	const total = tasks.length;
	const done = tasks.filter((task) => task.status === 'done').length;
	return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
