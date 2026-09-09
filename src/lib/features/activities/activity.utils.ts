import type { ActivityEntityType } from '$lib/types/domain';

interface LinkableActivity {
	entityType: ActivityEntityType | string;
	entityId: string;
	projectId: string | null;
}

/** Where an activity row should link to, or null when there is no natural target. */
export function activityHref(activity: LinkableActivity): string | null {
	switch (activity.entityType) {
		case 'company':
			return `/companies/${activity.entityId}`;
		case 'area':
			return null;
		case 'project':
			return `/projects/${activity.entityId}`;
		case 'weekly_review':
			return `/reviews/${activity.entityId}`;
		default:
			return activity.projectId ? `/projects/${activity.projectId}` : null;
	}
}
