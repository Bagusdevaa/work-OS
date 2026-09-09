import type { ActivityAction, ActivityEntityType } from '$lib/types/domain';
import { findActivities, insertActivity, type ActivityFilter } from './activity.repository';
import type { Activity } from './activity.types';

export interface LogActivityInput {
	entityType: ActivityEntityType;
	entityId: string;
	action: ActivityAction;
	summary: string;
	projectId?: string | null;
	companyId?: string | null;
	metadata?: Record<string, unknown>;
}

/** Records a meaningful user action for feeds and reviews. Never throws to the caller's flow. */
export async function logActivity(userId: string, input: LogActivityInput): Promise<void> {
	await insertActivity({
		userId,
		entityType: input.entityType,
		entityId: input.entityId,
		action: input.action,
		summary: input.summary,
		projectId: input.projectId ?? null,
		companyId: input.companyId ?? null,
		metadata: input.metadata ?? null
	});
}

export function listRecentActivity(userId: string, filter?: ActivityFilter): Promise<Activity[]> {
	return findActivities(userId, filter);
}
