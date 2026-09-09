/**
 * Domain vocabulary shared by the database schema, Zod validation and the UI.
 * Keep these tuples as the single source of truth for enumerated values.
 */

export const PROJECT_STATUSES = [
	'idea',
	'planning',
	'active',
	'paused',
	'blocked',
	'completed',
	'archived'
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = ['work', 'personal', 'internal', 'client', 'experiment'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const MILESTONE_STATUSES = ['planned', 'active', 'completed'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const HEALTH_STATES = ['healthy', 'needs_attention', 'stalled'] as const;
export type HealthState = (typeof HEALTH_STATES)[number];

export const COMPANY_STATUSES = ['active', 'archived'] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const INBOX_KINDS = ['task', 'idea', 'note', 'link', 'reminder'] as const;
export type InboxKind = (typeof INBOX_KINDS)[number];

export const INBOX_STATUSES = ['open', 'processed', 'dismissed'] as const;
export type InboxStatus = (typeof INBOX_STATUSES)[number];

export const RESOURCE_KINDS = ['link', 'document', 'other'] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const ACTIVITY_ENTITY_TYPES = [
	'company',
	'area',
	'project',
	'milestone',
	'task',
	'note',
	'resource',
	'event',
	'inbox_item',
	'weekly_review'
] as const;
export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export const ACTIVITY_ACTIONS = [
	'created',
	'updated',
	'status_changed',
	'completed',
	'archived',
	'deleted'
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

/** Display labels for enumerated values. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
	idea: 'Idea',
	planning: 'Planning',
	active: 'Active',
	paused: 'Paused',
	blocked: 'Blocked',
	completed: 'Completed',
	archived: 'Archived'
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
	work: 'Work',
	personal: 'Personal',
	internal: 'Internal',
	client: 'Client',
	experiment: 'Experiment'
};

export const PRIORITY_LABELS: Record<Priority, string> = {
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	urgent: 'Urgent'
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
	todo: 'To do',
	in_progress: 'In progress',
	blocked: 'Blocked',
	done: 'Done'
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
	planned: 'Planned',
	active: 'Active',
	completed: 'Completed'
};

export const HEALTH_LABELS: Record<HealthState, string> = {
	healthy: 'Healthy',
	needs_attention: 'Needs attention',
	stalled: 'Stalled'
};

export const INBOX_KIND_LABELS: Record<InboxKind, string> = {
	task: 'Task',
	idea: 'Idea',
	note: 'Note',
	link: 'Link',
	reminder: 'Reminder'
};

/** Project statuses that count as "in flight" for health and recommendations. */
export const IN_FLIGHT_PROJECT_STATUSES: readonly ProjectStatus[] = [
	'planning',
	'active',
	'blocked'
];

/** Task statuses that still need work. */
export const OPEN_TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'blocked'];
