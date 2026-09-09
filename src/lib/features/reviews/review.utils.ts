import type { ProjectHealth } from '$lib/features/projects/project-health';
import {
	IN_FLIGHT_PROJECT_STATUSES,
	type MilestoneStatus,
	type ProjectStatus,
	type TaskStatus
} from '$lib/types/domain';
import { addDays, formatDate, toISODate } from '$lib/utils/dates';

export interface ReviewTask {
	id: string;
	title: string;
	status: TaskStatus;
	completedAt: Date | null;
	dueDate: string | null;
	projectId: string;
	projectName: string;
}

export interface ReviewMilestone {
	id: string;
	name: string;
	status: MilestoneStatus;
	completedAt: Date | null;
	projectId: string;
	projectName: string;
}

export interface ReviewProject {
	id: string;
	name: string;
	status: ProjectStatus;
	health: ProjectHealth;
}

export interface WeeklySummaryInput {
	tasks: ReviewTask[];
	milestones: ReviewMilestone[];
	projects: ReviewProject[];
	activityCount: number;
}

export interface WeekRange {
	start: string;
	/** Inclusive last day (Sunday). */
	end: string;
	/** Monday of the following week. */
	nextStart: string;
}

export interface WeeklySummary {
	weekStart: string;
	range: WeekRange;
	completedTasks: ReviewTask[];
	completedMilestones: ReviewMilestone[];
	activeProjects: ReviewProject[];
	stalledProjects: ReviewProject[];
	needsAttentionProjects: ReviewProject[];
	overdueTasks: ReviewTask[];
	nextWeekTasks: ReviewTask[];
	activityCount: number;
}

export function weekRange(weekStart: string): WeekRange {
	return { start: weekStart, end: addDays(weekStart, 6), nextStart: addDays(weekStart, 7) };
}

export function weekLabel(weekStart: string): string {
	const range = weekRange(weekStart);
	return `${formatDate(range.start, 'short')} – ${formatDate(range.end, 'short')}, ${range.end.slice(0, 4)}`;
}

function completedWithin(completedAt: Date | null, range: WeekRange): boolean {
	if (!completedAt) return false;
	const day = toISODate(completedAt);
	return day >= range.start && day <= range.end;
}

/**
 * Deterministic summary of a week, computed from tasks, milestones, projects and activity.
 * "Overdue" means open tasks due before the end of the week, or before today while the
 * week is still in progress.
 */
export function buildWeeklySummary(
	input: WeeklySummaryInput,
	weekStart: string,
	today: string
): WeeklySummary {
	const range = weekRange(weekStart);
	const overdueCutoff = today < range.nextStart ? today : range.nextStart;
	const nextRange = weekRange(range.nextStart);
	const openTasks = input.tasks.filter((task) => task.status !== 'done');
	const inFlight = input.projects.filter((p) => IN_FLIGHT_PROJECT_STATUSES.includes(p.status));

	return {
		weekStart,
		range,
		completedTasks: input.tasks.filter(
			(task) => task.status === 'done' && completedWithin(task.completedAt, range)
		),
		completedMilestones: input.milestones.filter(
			(m) => m.status === 'completed' && completedWithin(m.completedAt, range)
		),
		activeProjects: inFlight,
		stalledProjects: inFlight.filter((p) => p.health.state === 'stalled'),
		needsAttentionProjects: inFlight.filter((p) => p.health.state === 'needs_attention'),
		overdueTasks: openTasks.filter((t) => t.dueDate !== null && t.dueDate < overdueCutoff),
		nextWeekTasks: openTasks
			.filter(
				(t) => t.dueDate !== null && t.dueDate >= nextRange.start && t.dueDate <= nextRange.end
			)
			.sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)),
		activityCount: input.activityCount
	};
}
