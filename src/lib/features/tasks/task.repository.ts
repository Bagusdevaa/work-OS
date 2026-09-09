import { and, asc, eq, getTableColumns, gte, inArray, isNotNull, lt, lte } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { companies, milestones, projects, tasks } from '$lib/server/db/schema';
import type { ProjectStatus, TaskStatus } from '$lib/types/domain';
import type { NewTask, Task, TaskWithContext } from './task.types';

export interface TaskFilter {
	projectId?: string;
	companyId?: string;
	statuses?: readonly TaskStatus[];
	projectStatuses?: readonly ProjectStatus[];
	/** Only tasks due on or before this ISO date. */
	dueOnOrBefore?: string;
}

const contextColumns = {
	...getTableColumns(tasks),
	projectName: projects.name,
	projectStatus: projects.status,
	projectPriority: projects.priority,
	projectType: projects.type,
	companyId: companies.id,
	companyName: companies.name,
	companyAccent: companies.accent,
	milestoneName: milestones.name
};

function withContext() {
	return db
		.select(contextColumns)
		.from(tasks)
		.innerJoin(projects, eq(tasks.projectId, projects.id))
		.innerJoin(companies, eq(projects.companyId, companies.id))
		.leftJoin(milestones, eq(tasks.milestoneId, milestones.id));
}

export function findTasks(userId: string, filter: TaskFilter = {}): Promise<TaskWithContext[]> {
	const conditions = [eq(tasks.userId, userId)];
	if (filter.projectId) conditions.push(eq(tasks.projectId, filter.projectId));
	if (filter.companyId) conditions.push(eq(projects.companyId, filter.companyId));
	if (filter.statuses?.length) conditions.push(inArray(tasks.status, [...filter.statuses]));
	if (filter.projectStatuses?.length) {
		conditions.push(inArray(projects.status, [...filter.projectStatuses]));
	}
	if (filter.dueOnOrBefore) {
		conditions.push(isNotNull(tasks.dueDate), lte(tasks.dueDate, filter.dueOnOrBefore));
	}
	return withContext()
		.where(and(...conditions))
		.orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
}

export async function findTaskById(userId: string, id: string): Promise<TaskWithContext | null> {
	const [row] = await withContext()
		.where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
		.limit(1);
	return row ?? null;
}

export function findTasksByProject(userId: string, projectId: string): Promise<Task[]> {
	return db
		.select()
		.from(tasks)
		.where(and(eq(tasks.userId, userId), eq(tasks.projectId, projectId)))
		.orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
}

export async function createTask(input: NewTask): Promise<Task> {
	const [row] = await db.insert(tasks).values(input).returning();
	return row;
}

export async function updateTask(
	userId: string,
	id: string,
	patch: Partial<NewTask>
): Promise<Task | null> {
	const [row] = await db
		.update(tasks)
		.set(patch)
		.where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
		.returning();
	return row ?? null;
}

export async function deleteTask(userId: string, id: string): Promise<Task | null> {
	const [row] = await db
		.delete(tasks)
		.where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
		.returning();
	return row ?? null;
}

export interface TaskSignal {
	projectId: string;
	status: TaskStatus;
	dueDate: string | null;
}

/** Minimal task facts for health calculation across many projects. */
export function findTaskSignals(userId: string, projectIds: string[]): Promise<TaskSignal[]> {
	if (projectIds.length === 0) return Promise.resolve([]);
	return db
		.select({ projectId: tasks.projectId, status: tasks.status, dueDate: tasks.dueDate })
		.from(tasks)
		.where(and(eq(tasks.userId, userId), inArray(tasks.projectId, projectIds)));
}

/** Tasks completed within [from, to), with project names — for reviews. */
export function findTasksCompletedBetween(
	userId: string,
	from: Date,
	to: Date
): Promise<TaskWithContext[]> {
	return withContext()
		.where(
			and(
				eq(tasks.userId, userId),
				eq(tasks.status, 'done'),
				gte(tasks.completedAt, from),
				lt(tasks.completedAt, to)
			)
		)
		.orderBy(asc(tasks.completedAt));
}
