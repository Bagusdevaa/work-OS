import { and, asc, eq, getTableColumns, gte, inArray, isNotNull, lt, ne } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { milestones, projects, tasks } from '$lib/server/db/schema';
import { IN_FLIGHT_PROJECT_STATUSES, type MilestoneStatus } from '$lib/types/domain';
import type { Milestone, MilestoneWithCounts, NewMilestone } from './milestone.types';

const withCounts = {
	...getTableColumns(milestones),
	taskTotal: db.$count(tasks, eq(tasks.milestoneId, milestones.id)),
	taskDone: db.$count(tasks, and(eq(tasks.milestoneId, milestones.id), eq(tasks.status, 'done')))
};

export function findMilestonesByProject(
	userId: string,
	projectId: string
): Promise<MilestoneWithCounts[]> {
	return db
		.select(withCounts)
		.from(milestones)
		.where(and(eq(milestones.userId, userId), eq(milestones.projectId, projectId)))
		.orderBy(asc(milestones.sortOrder), asc(milestones.createdAt));
}

export async function findMilestoneById(userId: string, id: string): Promise<Milestone | null> {
	const [row] = await db
		.select()
		.from(milestones)
		.where(and(eq(milestones.id, id), eq(milestones.userId, userId)))
		.limit(1);
	return row ?? null;
}

export async function createMilestone(input: NewMilestone): Promise<Milestone> {
	const [row] = await db.insert(milestones).values(input).returning();
	return row;
}

export async function updateMilestone(
	userId: string,
	id: string,
	patch: Partial<NewMilestone>
): Promise<Milestone | null> {
	const [row] = await db
		.update(milestones)
		.set(patch)
		.where(and(eq(milestones.id, id), eq(milestones.userId, userId)))
		.returning();
	return row ?? null;
}

export async function deleteMilestone(userId: string, id: string): Promise<Milestone | null> {
	const [row] = await db
		.delete(milestones)
		.where(and(eq(milestones.id, id), eq(milestones.userId, userId)))
		.returning();
	return row ?? null;
}

export interface MilestoneSignal {
	projectId: string;
	status: MilestoneStatus;
	dueDate: string | null;
}

/** Minimal milestone facts for health calculation across many projects. */
export function findMilestoneSignals(
	userId: string,
	projectIds: string[]
): Promise<MilestoneSignal[]> {
	if (projectIds.length === 0) return Promise.resolve([]);
	return db
		.select({
			projectId: milestones.projectId,
			status: milestones.status,
			dueDate: milestones.dueDate
		})
		.from(milestones)
		.where(and(eq(milestones.userId, userId), inArray(milestones.projectId, projectIds)));
}

export interface MilestoneDeadline {
	id: string;
	name: string;
	dueDate: string | null;
	status: MilestoneStatus;
	projectId: string;
	projectName: string;
}

/** Open, dated milestones in projects that are in flight — for calendars and deadlines. */
export function findMilestoneDeadlines(userId: string): Promise<MilestoneDeadline[]> {
	return db
		.select({
			id: milestones.id,
			name: milestones.name,
			dueDate: milestones.dueDate,
			status: milestones.status,
			projectId: milestones.projectId,
			projectName: projects.name
		})
		.from(milestones)
		.innerJoin(projects, eq(milestones.projectId, projects.id))
		.where(
			and(
				eq(milestones.userId, userId),
				ne(milestones.status, 'completed'),
				isNotNull(milestones.dueDate),
				inArray(projects.status, [...IN_FLIGHT_PROJECT_STATUSES])
			)
		)
		.orderBy(asc(milestones.dueDate));
}

export interface CompletedMilestone {
	id: string;
	name: string;
	status: MilestoneStatus;
	completedAt: Date | null;
	projectId: string;
	projectName: string;
}

/** Milestones completed within [from, to) — for reviews. */
export function findMilestonesCompletedBetween(
	userId: string,
	from: Date,
	to: Date
): Promise<CompletedMilestone[]> {
	return db
		.select({
			id: milestones.id,
			name: milestones.name,
			status: milestones.status,
			completedAt: milestones.completedAt,
			projectId: milestones.projectId,
			projectName: projects.name
		})
		.from(milestones)
		.innerJoin(projects, eq(milestones.projectId, projects.id))
		.where(
			and(
				eq(milestones.userId, userId),
				eq(milestones.status, 'completed'),
				gte(milestones.completedAt, from),
				lt(milestones.completedAt, to)
			)
		)
		.orderBy(asc(milestones.completedAt));
}
