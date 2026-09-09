import {
	IN_FLIGHT_PROJECT_STATUSES,
	type HealthState,
	type Priority,
	type ProjectStatus,
	type TaskStatus
} from '$lib/types/domain';
import { daysBetween } from '$lib/utils/dates';
import { PRIORITY_RANK } from '$lib/features/projects/project.utils';

export interface RecommendationCandidate {
	id: string;
	title: string;
	status: TaskStatus;
	priority: Priority;
	dueDate: string | null;
	estimatedMinutes: number | null;
	projectId: string;
	projectStatus: ProjectStatus;
	projectPriority: Priority;
	projectHealth: HealthState;
}

export interface RecommendedTask<T> {
	task: T;
	score: number;
	/** Why this task is recommended, in plain language. */
	reasons: string[];
}

/** Scoring weights. Exported so the UI can explain the rules. */
export const RECOMMENDATION_WEIGHTS = {
	priority: { urgent: 40, high: 25, medium: 10, low: 0 } as Record<Priority, number>,
	overdue: 30,
	overduePerDay: 1,
	overdueDayCap: 10,
	dueToday: 25,
	dueTomorrow: 18,
	dueWithin3Days: 12,
	dueThisWeek: 6,
	projectNeedsAttention: 8,
	projectStalled: 12,
	inProgress: 8,
	projectPriority: { urgent: 6, high: 4, medium: 0, low: 0 } as Record<Priority, number>,
	quickWin: 3,
	quickWinMinutes: 30
} as const;

const PRIORITY_REASONS: Partial<Record<Priority, string>> = {
	urgent: 'Urgent priority',
	high: 'High priority'
};

function isEligible(task: RecommendationCandidate): boolean {
	if (task.status === 'done' || task.status === 'blocked') return false;
	return IN_FLIGHT_PROJECT_STATUSES.includes(task.projectStatus);
}

function scoreDueDate(dueDate: string, today: string): { score: number; reason: string } | null {
	const W = RECOMMENDATION_WEIGHTS;
	const days = daysBetween(today, dueDate);
	if (days < 0) {
		const overdueBy = -days;
		const extra = Math.min(overdueBy, W.overdueDayCap) * W.overduePerDay;
		return {
			score: W.overdue + extra,
			reason: `Overdue by ${overdueBy} day${overdueBy === 1 ? '' : 's'}`
		};
	}
	if (days === 0) return { score: W.dueToday, reason: 'Due today' };
	if (days === 1) return { score: W.dueTomorrow, reason: 'Due tomorrow' };
	if (days <= 3) return { score: W.dueWithin3Days, reason: `Due in ${days} days` };
	if (days <= 7) return { score: W.dueThisWeek, reason: 'Due this week' };
	return null;
}

export function scoreTask(
	task: RecommendationCandidate,
	today: string
): { score: number; reasons: string[] } {
	const W = RECOMMENDATION_WEIGHTS;
	let score = W.priority[task.priority];
	const reasons: string[] = [];

	const priorityReason = PRIORITY_REASONS[task.priority];
	if (priorityReason) reasons.push(priorityReason);

	if (task.dueDate) {
		const due = scoreDueDate(task.dueDate, today);
		if (due) {
			score += due.score;
			reasons.push(due.reason);
		}
	}

	if (task.projectHealth === 'stalled') {
		score += W.projectStalled;
		reasons.push('Project is stalled');
	} else if (task.projectHealth === 'needs_attention') {
		score += W.projectNeedsAttention;
		reasons.push('Project needs attention');
	}

	if (task.status === 'in_progress') {
		score += W.inProgress;
		reasons.push('Already in progress');
	}

	const projectBoost = W.projectPriority[task.projectPriority];
	if (projectBoost > 0) {
		score += projectBoost;
		reasons.push('High-priority project');
	}

	if (task.estimatedMinutes !== null && task.estimatedMinutes <= W.quickWinMinutes) {
		score += W.quickWin;
		reasons.push(`Quick win (${task.estimatedMinutes} min)`);
	}

	if (reasons.length === 0) reasons.push('Next open task in an active project');
	return { score, reasons };
}

/** Ranks eligible tasks by deterministic signals and explains each recommendation. */
export function recommendTasks<T extends RecommendationCandidate>(
	candidates: T[],
	today: string,
	limit = 5
): RecommendedTask<T>[] {
	return candidates
		.filter(isEligible)
		.map((task) => ({ task, ...scoreTask(task, today) }))
		.sort(
			(a, b) =>
				b.score - a.score ||
				compareDueDates(a.task.dueDate, b.task.dueDate) ||
				PRIORITY_RANK[a.task.priority] - PRIORITY_RANK[b.task.priority] ||
				a.task.title.localeCompare(b.task.title)
		)
		.slice(0, limit);
}

function compareDueDates(a: string | null, b: string | null): number {
	if (a === b) return 0;
	if (a === null) return 1;
	if (b === null) return -1;
	return a < b ? -1 : 1;
}
