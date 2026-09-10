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

/** `smart` ranks by urgency; `manual` honours the order the user dragged tasks into. */
export type TaskSortMode = 'smart' | 'manual';

/**
 * Smart: open tasks first (overdue → dated soonest → undated), then by priority,
 * manual order and creation time. Manual: the user's order alone.
 * Done tasks trail in both modes.
 */
export function sortTasks<T extends Sortable>(
	tasks: T[],
	today: string,
	mode: TaskSortMode = 'smart'
): T[] {
	if (mode === 'manual') {
		return [...tasks].sort(
			(a, b) =>
				Number(a.status === 'done') - Number(b.status === 'done') ||
				a.sortOrder - b.sortOrder ||
				a.createdAt.getTime() - b.createdAt.getTime()
		);
	}
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

interface Groupable {
	id: string;
	milestoneId: string | null;
}

export interface SortOrderPatch {
	id: string;
	sortOrder: number;
}

/**
 * Moves one task to `toIndex` among the tasks sharing its milestone, leaving every
 * other group's positions untouched. Returns the full id list in its new order.
 */
export function moveWithinGroup<T extends Groupable>(
	items: T[],
	taskId: string,
	toIndex: number
): string[] {
	const ids = items.map((item) => item.id);
	const moved = items.find((item) => item.id === taskId);
	if (!moved) return ids;

	const positions: number[] = [];
	const groupIds: string[] = [];
	items.forEach((item, index) => {
		if (item.milestoneId === moved.milestoneId) {
			positions.push(index);
			groupIds.push(item.id);
		}
	});

	const from = groupIds.indexOf(taskId);
	const to = Math.min(Math.max(toIndex, 0), groupIds.length - 1);
	if (from === to) return ids;

	groupIds.splice(to, 0, ...groupIds.splice(from, 1));
	positions.forEach((position, index) => {
		ids[position] = groupIds[index];
	});
	return ids;
}

/** Numbers a list of ids from zero so the stored order matches what is displayed. */
export function sortOrderPatches(ids: string[]): SortOrderPatch[] {
	return ids.map((id, index) => ({ id, sortOrder: index }));
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
