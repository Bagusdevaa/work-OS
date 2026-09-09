import { z } from 'zod';
import { MILESTONE_STATUSES } from '$lib/types/domain';
import {
	optionalDate,
	optionalText,
	requiredEnum,
	requiredText,
	requiredUuid
} from '$lib/utils/schema-helpers';

export const milestoneSchema = z.object({
	name: requiredText(160),
	description: optionalText(2000),
	dueDate: optionalDate()
});
export type MilestoneInput = z.output<typeof milestoneSchema>;

export const milestoneIdSchema = z.object({ milestoneId: requiredUuid() });

export const milestoneStatusSchema = z.object({
	milestoneId: requiredUuid(),
	status: requiredEnum(MILESTONE_STATUSES)
});
