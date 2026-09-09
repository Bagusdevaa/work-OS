import { pgEnum } from 'drizzle-orm/pg-core';
import {
	COMPANY_STATUSES,
	INBOX_KINDS,
	INBOX_STATUSES,
	MILESTONE_STATUSES,
	PRIORITIES,
	PROJECT_STATUSES,
	PROJECT_TYPES,
	RESOURCE_KINDS,
	TASK_STATUSES
} from '$lib/types/domain';

export const companyStatusEnum = pgEnum('company_status', COMPANY_STATUSES);
export const projectStatusEnum = pgEnum('project_status', PROJECT_STATUSES);
export const projectTypeEnum = pgEnum('project_type', PROJECT_TYPES);
export const priorityEnum = pgEnum('priority', PRIORITIES);
export const milestoneStatusEnum = pgEnum('milestone_status', MILESTONE_STATUSES);
export const taskStatusEnum = pgEnum('task_status', TASK_STATUSES);
export const inboxKindEnum = pgEnum('inbox_kind', INBOX_KINDS);
export const inboxStatusEnum = pgEnum('inbox_status', INBOX_STATUSES);
export const resourceKindEnum = pgEnum('resource_kind', RESOURCE_KINDS);
