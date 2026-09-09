import {
	IN_FLIGHT_PROJECT_STATUSES,
	type MilestoneStatus,
	type ProjectStatus,
	type TaskStatus
} from '$lib/types/domain';
import { addDays, toISODate } from '$lib/utils/dates';

export type DeadlineKind = 'task' | 'milestone' | 'project' | 'event';

export interface DeadlineItem {
	kind: DeadlineKind;
	id: string;
	title: string;
	/** ISO calendar date the item lands on. */
	date: string;
	/** Clock time for timed events, e.g. "14:00"; null for all-day items. */
	time: string | null;
	href: string;
	projectName: string | null;
}

export interface DeadlineSources {
	tasks: Array<{
		id: string;
		title: string;
		dueDate: string | null;
		status: TaskStatus;
		projectId: string;
		projectName: string;
	}>;
	milestones: Array<{
		id: string;
		name: string;
		dueDate: string | null;
		status: MilestoneStatus;
		projectId: string;
		projectName: string;
	}>;
	projects: Array<{ id: string; name: string; dueDate: string | null; status: ProjectStatus }>;
	events: Array<{
		id: string;
		title: string;
		startsAt: Date;
		allDay: boolean;
		projectId: string | null;
		projectName: string | null;
	}>;
}

function pad(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

/** Flattens every dated, still-relevant item into one chronological list. */
export function collectDeadlines(sources: DeadlineSources): DeadlineItem[] {
	const items: DeadlineItem[] = [];

	for (const task of sources.tasks) {
		if (task.status === 'done' || !task.dueDate) continue;
		items.push({
			kind: 'task',
			id: task.id,
			title: task.title,
			date: task.dueDate,
			time: null,
			href: `/tasks/${task.id}`,
			projectName: task.projectName
		});
	}

	for (const milestone of sources.milestones) {
		if (milestone.status === 'completed' || !milestone.dueDate) continue;
		items.push({
			kind: 'milestone',
			id: milestone.id,
			title: milestone.name,
			date: milestone.dueDate,
			time: null,
			href: `/projects/${milestone.projectId}`,
			projectName: milestone.projectName
		});
	}

	for (const project of sources.projects) {
		if (!IN_FLIGHT_PROJECT_STATUSES.includes(project.status) || !project.dueDate) continue;
		items.push({
			kind: 'project',
			id: project.id,
			title: project.name,
			date: project.dueDate,
			time: null,
			href: `/projects/${project.id}`,
			projectName: null
		});
	}

	for (const event of sources.events) {
		items.push({
			kind: 'event',
			id: event.id,
			title: event.title,
			date: toISODate(event.startsAt),
			time: event.allDay
				? null
				: `${pad(event.startsAt.getHours())}:${pad(event.startsAt.getMinutes())}`,
			href: '/calendar',
			projectName: event.projectName
		});
	}

	return items.sort(
		(a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '')
	);
}

export interface UpcomingItem extends DeadlineItem {
	overdue: boolean;
}

/** Items due from the past (overdue) through `days` days ahead, oldest first. */
export function upcomingDeadlines(
	items: DeadlineItem[],
	today: string,
	days: number
): UpcomingItem[] {
	const horizon = addDays(today, days);
	return items
		.filter((item) => item.date <= horizon)
		.map((item) => ({ ...item, overdue: item.date < today }));
}
