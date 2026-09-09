import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { milestones, tasks } from '$lib/server/db/schema';
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
