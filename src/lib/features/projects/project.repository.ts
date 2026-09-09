import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { projects } from '$lib/server/db/schema';
import type { Project } from './project.types';

export function findProjectsByCompany(userId: string, companyId: string): Promise<Project[]> {
	return db
		.select()
		.from(projects)
		.where(and(eq(projects.userId, userId), eq(projects.companyId, companyId)))
		.orderBy(asc(projects.status), desc(projects.lastActivityAt));
}
