import { z } from 'zod';
import { PRIORITIES, TASK_STATUSES } from '$lib/types/domain';
import {
	optionalDate,
	optionalInt,
	optionalText,
	optionalUuid,
	requiredEnum,
	requiredText,
	requiredUuid
} from '$lib/utils/schema-helpers';

export const taskSchema = z.object({
	title: requiredText(200),
	description: optionalText(4000),
	milestoneId: optionalUuid(),
	status: requiredEnum(TASK_STATUSES),
	priority: requiredEnum(PRIORITIES),
	dueDate: optionalDate(),
	estimatedMinutes: optionalInt(6000)
});
export type TaskInput = z.output<typeof taskSchema>;

/** Inline "add task" form on the project page. */
export const quickTaskSchema = z.object({
	title: requiredText(200),
	milestoneId: optionalUuid(),
	priority: requiredEnum(PRIORITIES),
	dueDate: optionalDate()
});
export type QuickTaskInput = z.output<typeof quickTaskSchema>;

export const taskStatusSchema = z.object({
	taskId: requiredUuid(),
	status: requiredEnum(TASK_STATUSES)
});

export const taskIdSchema = z.object({ taskId: requiredUuid() });

/** Drag-and-drop / keyboard reordering: move a task to a position in its group. */
export const taskMoveSchema = z.object({
	taskId: requiredUuid(),
	toIndex: z.coerce.number({ error: 'Invalid position' }).int().min(0).max(999)
});
