import { z } from 'zod';
import { optionalText, requiredText, requiredUuid } from '$lib/utils/schema-helpers';

export const areaSchema = z.object({
	name: requiredText(80),
	description: optionalText(500)
});
export type AreaInput = z.output<typeof areaSchema>;

export const areaIdSchema = z.object({ areaId: requiredUuid() });
