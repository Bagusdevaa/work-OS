import { z } from 'zod';
import { optionalText, requiredText, requiredUuid } from '$lib/utils/schema-helpers';

export const noteSchema = z.object({
	title: requiredText(160),
	content: optionalText(20000)
});
export type NoteInput = z.output<typeof noteSchema>;

export const noteIdSchema = z.object({ noteId: requiredUuid() });
