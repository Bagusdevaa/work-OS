import { z } from 'zod';
import { INBOX_KINDS, PRIORITIES } from '$lib/types/domain';
import {
	optionalDate,
	optionalEnum,
	requiredEnum,
	requiredText,
	requiredUuid
} from '$lib/utils/schema-helpers';

export const captureSchema = z.object({
	content: requiredText(2000),
	kind: optionalEnum(INBOX_KINDS)
});
export type CaptureInput = z.output<typeof captureSchema>;

export const inboxItemIdSchema = z.object({ itemId: requiredUuid() });

export const convertToTaskSchema = z.object({
	itemId: requiredUuid(),
	projectId: requiredUuid(),
	priority: requiredEnum(PRIORITIES),
	dueDate: optionalDate()
});
export type ConvertToTaskInput = z.output<typeof convertToTaskSchema>;

export const convertToNoteSchema = z.object({
	itemId: requiredUuid(),
	projectId: requiredUuid()
});
