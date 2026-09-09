import type { HealthState, Priority, ProjectStatus, TaskStatus } from '$lib/types/domain';
import { IN_FLIGHT_PROJECT_STATUSES } from '$lib/types/domain';
import { addDays } from '$lib/utils/dates';

interface TaskLike {
	status: TaskStatus;
	priority: Priority;
	dueDate: string | null;
}

export interface TaskBuckets<T> {
	overdue: T[];
	dueToday: T[];
	/** Due after today and within the next 7 days. */
	dueThisWeek: T[];
	blocked: T[];
	urgent: T[];
	openCount: number;
}

export function bucketTasks<T extends TaskLike>(tasks: T[], today: string): TaskBuckets<T> {
	const open = tasks.filter((task) => task.status !== 'done');
	const weekEnd = addDays(today, 7);
	return {
		overdue: open.filter((t) => t.dueDate !== null && t.dueDate < today),
		dueToday: open.filter((t) => t.dueDate === today),
		dueThisWeek: open.filter(
			(t) => t.dueDate !== null && t.dueDate > today && t.dueDate <= weekEnd
		),
		blocked: open.filter((t) => t.status === 'blocked'),
		urgent: open.filter((t) => t.priority === 'urgent'),
		openCount: open.length
	};
}

interface ProjectLike {
	status: ProjectStatus;
	health: { state: HealthState };
}

export interface ProjectBuckets<P> {
	inFlight: P[];
	needsAttention: P[];
	stalled: P[];
}

export function bucketProjects<P extends ProjectLike>(projects: P[]): ProjectBuckets<P> {
	const inFlight = projects.filter((p) => IN_FLIGHT_PROJECT_STATUSES.includes(p.status));
	return {
		inFlight,
		needsAttention: inFlight.filter((p) => p.health.state === 'needs_attention'),
		stalled: inFlight.filter((p) => p.health.state === 'stalled')
	};
}
