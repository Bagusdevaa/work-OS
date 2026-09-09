import { z } from 'zod';
import { optionalText, optionalUuid, requiredText, requiredUuid } from '$lib/utils/schema-helpers';

export const eventSchema = z.object({
	title: requiredText(160),
	description: optionalText(1000),
	date: z.iso.date({ error: 'Enter a valid date' }),
	time: z.preprocess(
		(value) => (typeof value === 'string' && value.trim() === '' ? null : value),
		z
			.string()
			.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a time like 14:30')
			.nullable()
	),
	projectId: optionalUuid()
});
export type EventInput = z.output<typeof eventSchema>;

export const eventIdSchema = z.object({ eventId: requiredUuid() });
