import { logActivity } from '$lib/features/activities/activity.service';
import { countActivitiesBetween } from '$lib/features/activities/activity.repository';
import { findMilestonesCompletedBetween } from '$lib/features/milestones/milestone.repository';
import { listProjects } from '$lib/features/projects/project.service';
import { findTasksCompletedBetween } from '$lib/features/tasks/task.repository';
import { listTasks } from '$lib/features/tasks/task.service';
import { IN_FLIGHT_PROJECT_STATUSES, OPEN_TASK_STATUSES } from '$lib/types/domain';
import { parseISODate, todayISO } from '$lib/utils/dates';
import * as repo from './review.repository';
import type { ReviewInput } from './review.schema';
import type { WeeklyReview } from './review.types';
import { buildWeeklySummary, weekLabel, weekRange, type WeeklySummary } from './review.utils';

export async function computeWeeklySummary(
	userId: string,
	weekStart: string
): Promise<WeeklySummary> {
	const range = weekRange(weekStart);
	const from = parseISODate(range.start);
	const to = parseISODate(range.nextStart);

	const [completedTasks, openTasks, milestones, projects, activityCount] = await Promise.all([
		findTasksCompletedBetween(userId, from, to),
		listTasks(userId, {
			statuses: OPEN_TASK_STATUSES,
			projectStatuses: IN_FLIGHT_PROJECT_STATUSES
		}),
		findMilestonesCompletedBetween(userId, from, to),
		listProjects(userId),
		countActivitiesBetween(userId, from, to)
	]);

	return buildWeeklySummary(
		{ tasks: [...completedTasks, ...openTasks], milestones, projects, activityCount },
		weekStart,
		todayISO()
	);
}

export async function getWeeklyReview(userId: string, weekStart: string) {
	const [summary, review] = await Promise.all([
		computeWeeklySummary(userId, weekStart),
		repo.findReviewByWeek(userId, weekStart)
	]);
	return { summary, review };
}

export function listReviews(userId: string) {
	return repo.findReviews(userId);
}

/** Saves the reflection and a snapshot of the computed summary counts. */
export async function saveWeeklyReview(
	userId: string,
	weekStart: string,
	input: ReviewInput
): Promise<WeeklyReview> {
	const summary = await computeWeeklySummary(userId, weekStart);
	const snapshot = {
		completedTasks: summary.completedTasks.length,
		completedMilestones: summary.completedMilestones.length,
		activeProjects: summary.activeProjects.length,
		stalledProjects: summary.stalledProjects.length,
		overdueTasks: summary.overdueTasks.length,
		activityCount: summary.activityCount
	};
	const existing = await repo.findReviewByWeek(userId, weekStart);
	const review = await repo.upsertReview(userId, weekStart, input, snapshot);
	await logActivity(userId, {
		entityType: 'weekly_review',
		entityId: review.id,
		action: existing ? 'updated' : 'created',
		summary: `${existing ? 'Updated' : 'Completed'} weekly review for ${weekLabel(weekStart)}`
	});
	return review;
}
