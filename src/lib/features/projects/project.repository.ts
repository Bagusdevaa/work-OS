import { and, asc, count, desc, eq, getTableColumns, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { areas, companies, projects } from '$lib/server/db/schema';
import type { ProjectStatus } from '$lib/types/domain';
import type { NewProject, Project, ProjectWithContext } from './project.types';

export interface ProjectFilter {
	companyId?: string;
	statuses?: readonly ProjectStatus[];
}

const contextColumns = {
	...getTableColumns(projects),
	companyName: companies.name,
	companyAccent: companies.accent,
	areaName: areas.name
};

function withContext() {
	return db
		.select(contextColumns)
		.from(projects)
		.innerJoin(companies, eq(projects.companyId, companies.id))
		.leftJoin(areas, eq(projects.areaId, areas.id));
}

export function findProjects(
	userId: string,
	filter: ProjectFilter = {}
): Promise<ProjectWithContext[]> {
	const conditions = [eq(projects.userId, userId)];
	if (filter.companyId) conditions.push(eq(projects.companyId, filter.companyId));
	if (filter.statuses?.length) conditions.push(inArray(projects.status, [...filter.statuses]));
	return withContext()
		.where(and(...conditions))
		.orderBy(desc(projects.lastActivityAt));
}

export async function countProjects(userId: string, filter: ProjectFilter = {}): Promise<number> {
	const conditions = [eq(projects.userId, userId)];
	if (filter.companyId) conditions.push(eq(projects.companyId, filter.companyId));
	if (filter.statuses?.length) conditions.push(inArray(projects.status, [...filter.statuses]));
	const [row] = await db
		.select({ total: count() })
		.from(projects)
		.where(and(...conditions));
	return row?.total ?? 0;
}

export async function findProjectById(
	userId: string,
	id: string
): Promise<ProjectWithContext | null> {
	const [row] = await withContext()
		.where(and(eq(projects.id, id), eq(projects.userId, userId)))
		.limit(1);
	return row ?? null;
}

export function findProjectsByCompany(userId: string, companyId: string): Promise<Project[]> {
	return db
		.select()
		.from(projects)
		.where(and(eq(projects.userId, userId), eq(projects.companyId, companyId)))
		.orderBy(asc(projects.status), desc(projects.lastActivityAt));
}

export async function createProject(input: NewProject): Promise<Project> {
	const [row] = await db.insert(projects).values(input).returning();
	return row;
}

export async function updateProject(
	userId: string,
	id: string,
	patch: Partial<NewProject>
): Promise<Project | null> {
	const [row] = await db
		.update(projects)
		.set(patch)
		.where(and(eq(projects.id, id), eq(projects.userId, userId)))
		.returning();
	return row ?? null;
}
