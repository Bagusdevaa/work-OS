import { z } from 'zod';
import { PRIORITIES, PROJECT_STATUSES, PROJECT_TYPES } from '$lib/types/domain';
import {
	optionalDate,
	optionalText,
	optionalUuid,
	requiredEnum,
	requiredText,
	requiredUuid
} from '$lib/utils/schema-helpers';

export const projectSchema = z.object({
	name: requiredText(160),
	description: optionalText(4000),
	companyId: requiredUuid(),
	areaId: optionalUuid(),
	status: requiredEnum(PROJECT_STATUSES),
	type: requiredEnum(PROJECT_TYPES),
	priority: requiredEnum(PRIORITIES),
	startedAt: optionalDate(),
	dueDate: optionalDate(),
	why: optionalText(2000),
	goal: optionalText(2000),
	currentFocus: optionalText(1000),
	nextAction: optionalText(500)
});
export type ProjectInput = z.output<typeof projectSchema>;

export const projectStatusSchema = z.object({ status: requiredEnum(PROJECT_STATUSES) });

export const projectFocusSchema = z.object({
	currentFocus: optionalText(1000),
	nextAction: optionalText(500)
});
export type ProjectFocusInput = z.output<typeof projectFocusSchema>;

/** Status change addressed by id, for listings that act on many projects. */
export const projectStatusChangeSchema = z.object({
	projectId: requiredUuid(),
	status: requiredEnum(PROJECT_STATUSES)
});
