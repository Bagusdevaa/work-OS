import { error } from '@sveltejs/kit';
import { findMilestoneById } from '$lib/features/milestones/milestone.repository';
import { recordProjectActivity, requireProject } from '$lib/features/projects/project.service';
import type { FormErrors } from '$lib/server/forms';
import { TASK_STATUS_LABELS, type TaskStatus } from '$lib/types/domain';
import { todayISO } from '$lib/utils/dates';
import * as repo from './task.repository';
import type { QuickTaskInput, TaskInput } from './task.schema';
import type { Task, TaskWithContext } from './task.types';
import { moveWithinGroup, sortOrderPatches, sortTasks, type TaskSortMode } from './task.utils';

export async function listTasksForProject(
	userId: string,
	projectId: string,
	mode: TaskSortMode = 'smart'
): Promise<Task[]> {
	return sortTasks(await repo.findTasksByProject(userId, projectId), todayISO(), mode);
}

/**
 * Moves a task to `toIndex` among the open tasks sharing its milestone.
 * Deliberately not logged as project activity: reordering is not progress.
 */
export async function reorderTask(
	userId: string,
	projectId: string,
	taskId: string,
	toIndex: number
): Promise<void> {
	const project = await requireProject(userId, projectId);
	const all = await repo.findTasksByProject(userId, project.id);
	const open = sortTasks(
		all.filter((task) => task.status !== 'done'),
		todayISO(),
		'manual'
	);
	if (!open.some((task) => task.id === taskId)) error(404, 'Task not found');
	await repo.updateTaskOrder(userId, sortOrderPatches(moveWithinGroup(open, taskId, toIndex)));
}

export async function listTasks(
	userId: string,
	filter?: repo.TaskFilter
): Promise<TaskWithContext[]> {
	return sortTasks(await repo.findTasks(userId, filter), todayISO());
}

export async function requireTask(userId: string, id: string): Promise<TaskWithContext> {
	const task = await repo.findTaskById(userId, id);
	if (!task) error(404, 'Task not found');
	return task;
}

/** A milestone reference must belong to the task's project. */
export async function validateTaskRefs(
	userId: string,
	projectId: string,
	milestoneId: string | null
): Promise<FormErrors | null> {
	if (!milestoneId) return null;
	const milestone = await findMilestoneById(userId, milestoneId);
	if (!milestone || milestone.projectId !== projectId) {
		return { milestoneId: 'Choose a milestone from this project' };
	}
	return null;
}

function completionStamp(status: TaskStatus, current: Task | null): Date | null {
	if (status !== 'done') return null;
	return current?.completedAt ?? new Date();
}

export async function createTask(
	userId: string,
	projectId: string,
	input: QuickTaskInput | TaskInput
): Promise<Task> {
	const project = await requireProject(userId, projectId);
	const status: TaskStatus = 'status' in input ? input.status : 'todo';
	const task = await repo.createTask({
		...input,
		userId,
		projectId: project.id,
		status,
		completedAt: completionStamp(status, null)
	});
	await recordProjectActivity(userId, project.id, {
		entityType: 'task',
		entityId: task.id,
		action: 'created',
		summary: `Added task "${task.title}"`
	});
	return task;
}

export async function updateTask(userId: string, id: string, input: TaskInput): Promise<Task> {
	const current = await requireTask(userId, id);
	const task = await repo.updateTask(userId, id, {
		...input,
		completedAt: completionStamp(input.status, current)
	});
	if (!task) error(404, 'Task not found');
	await recordProjectActivity(userId, task.projectId, {
		entityType: 'task',
		entityId: task.id,
		action: current.status === task.status ? 'updated' : 'status_changed',
		summary: describeStatusChange(task, current.status)
	});
	return task;
}

export async function setTaskStatus(userId: string, id: string, status: TaskStatus): Promise<Task> {
	const current = await requireTask(userId, id);
	if (current.status === status) return current;
	const task = await repo.updateTask(userId, id, {
		status,
		completedAt: completionStamp(status, current)
	});
	if (!task) error(404, 'Task not found');
	await recordProjectActivity(userId, task.projectId, {
		entityType: 'task',
		entityId: task.id,
		action: status === 'done' ? 'completed' : 'status_changed',
		summary: describeStatusChange(task, current.status)
	});
	return task;
}

function describeStatusChange(task: Task, previous: TaskStatus): string {
	if (task.status === previous) return `Updated task "${task.title}"`;
	if (task.status === 'done') return `Completed task "${task.title}"`;
	if (previous === 'done') return `Reopened task "${task.title}"`;
	return `Moved task "${task.title}" to ${TASK_STATUS_LABELS[task.status]}`;
}

export async function deleteTask(userId: string, id: string): Promise<Task> {
	const task = await repo.deleteTask(userId, id);
	if (!task) error(404, 'Task not found');
	await recordProjectActivity(userId, task.projectId, {
		entityType: 'task',
		entityId: task.id,
		action: 'deleted',
		summary: `Removed task "${task.title}"`
	});
	return task;
}
