import { z } from 'zod';
import { RESOURCE_KINDS } from '$lib/types/domain';
import { optionalText, requiredEnum, requiredText, requiredUuid } from '$lib/utils/schema-helpers';

export const resourceSchema = z.object({
	title: requiredText(160),
	url: z.preprocess(
		(value) => (typeof value === 'string' && value.trim() === '' ? null : value),
		z.url({ error: 'Enter a valid URL (including https://)' }).max(2000).nullable()
	),
	kind: requiredEnum(RESOURCE_KINDS),
	description: optionalText(500)
});
export type ResourceInput = z.output<typeof resourceSchema>;

export const resourceIdSchema = z.object({ resourceId: requiredUuid() });
