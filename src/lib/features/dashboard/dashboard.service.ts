import { listRecentActivity } from '$lib/features/activities/activity.service';
import type { Activity } from '$lib/features/activities/activity.types';
import {
	collectDeadlines,
	upcomingDeadlines,
	type UpcomingItem
} from '$lib/features/calendar/calendar.utils';
import { listActiveCompanies } from '$lib/features/companies/company.service';
import { findEventsBetween } from '$lib/features/events/event.repository';
import { findMilestoneDeadlines } from '$lib/features/milestones/milestone.repository';
import { listProjects } from '$lib/features/projects/project.service';
import type { ProjectWithHealth } from '$lib/features/projects/project.types';
import { recommendTasks, type RecommendedTask } from '$lib/features/tasks/task-recommendation';
import { listTasks } from '$lib/features/tasks/task.service';
import type { TaskWithContext } from '$lib/features/tasks/task.types';
import {
	IN_FLIGHT_PROJECT_STATUSES,
	OPEN_TASK_STATUSES,
	type HealthState
} from '$lib/types/domain';
import { addDays, parseISODate, toISODate } from '$lib/utils/dates';
import {
	bucketProjects,
	bucketTasks,
	type ProjectBuckets,
	type TaskBuckets
} from './dashboard.utils';

export type DashboardTask = TaskWithContext & { projectHealth: HealthState };

export interface Dashboard {
	today: string;
	hasCompanies: boolean;
	hasProjects: boolean;
	recommendations: RecommendedTask<DashboardTask>[];
	tasks: TaskBuckets<DashboardTask>;
	projects: ProjectBuckets<ProjectWithHealth>;
	upcoming: UpcomingItem[];
	activity: Activity[];
}

const UPCOMING_DAYS = 7;

/** Everything the dashboard needs, computed from deterministic signals. */
export async function buildDashboard(userId: string, now = new Date()): Promise<Dashboard> {
	const today = toISODate(now);
	const rangeStart = parseISODate(today);
	const rangeEnd = parseISODate(addDays(today, UPCOMING_DAYS + 1));

	const [companies, projects, openTasks, milestones, events, activity] = await Promise.all([
		listActiveCompanies(userId),
		listProjects(userId),
		listTasks(userId, {
			statuses: OPEN_TASK_STATUSES,
			projectStatuses: IN_FLIGHT_PROJECT_STATUSES
		}),
		findMilestoneDeadlines(userId),
		findEventsBetween(userId, rangeStart, rangeEnd),
		listRecentActivity(userId, { limit: 8 })
	]);

	const healthByProject = new Map(projects.map((p) => [p.id, p.health.state]));
	const tasks: DashboardTask[] = openTasks.map((task) => ({
		...task,
		projectHealth: healthByProject.get(task.projectId) ?? 'healthy'
	}));

	const deadlines = collectDeadlines({ tasks, milestones, projects, events });

	return {
		today,
		hasCompanies: companies.length > 0,
		hasProjects: projects.length > 0,
		recommendations: recommendTasks(tasks, today, 5),
		tasks: bucketTasks(tasks, today),
		projects: bucketProjects(projects),
		upcoming: upcomingDeadlines(deadlines, today, UPCOMING_DAYS).filter((item) => !item.overdue),
		activity
	};
}
