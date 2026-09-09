import { and, asc, count, eq, getTableColumns, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { areas, companies, projects } from '$lib/server/db/schema';
import { IN_FLIGHT_PROJECT_STATUSES, type CompanyStatus } from '$lib/types/domain';
import type { Company, CompanySummary, ProjectStatusCount } from './company.types';
import type { CompanyInput } from './company.schema';

export async function findCompanySummaries(
	userId: string,
	includeArchived = false
): Promise<CompanySummary[]> {
	const conditions = [eq(companies.userId, userId)];
	if (!includeArchived) conditions.push(eq(companies.status, 'active'));

	return db
		.select({
			...getTableColumns(companies),
			inFlightProjects: db.$count(
				projects,
				and(
					eq(projects.companyId, companies.id),
					inArray(projects.status, [...IN_FLIGHT_PROJECT_STATUSES])
				)
			),
			totalProjects: db.$count(projects, eq(projects.companyId, companies.id)),
			areaCount: db.$count(areas, eq(areas.companyId, companies.id))
		})
		.from(companies)
		.where(and(...conditions))
		.orderBy(asc(companies.status), asc(companies.name));
}

export async function findCompanies(userId: string, status?: CompanyStatus): Promise<Company[]> {
	const conditions = [eq(companies.userId, userId)];
	if (status) conditions.push(eq(companies.status, status));
	return db
		.select()
		.from(companies)
		.where(and(...conditions))
		.orderBy(asc(companies.name));
}

export async function findCompanyById(userId: string, id: string): Promise<Company | null> {
	const [row] = await db
		.select()
		.from(companies)
		.where(and(eq(companies.id, id), eq(companies.userId, userId)))
		.limit(1);
	return row ?? null;
}

export async function createCompany(userId: string, input: CompanyInput): Promise<Company> {
	const [row] = await db
		.insert(companies)
		.values({ ...input, userId })
		.returning();
	return row;
}

export async function updateCompany(
	userId: string,
	id: string,
	input: Partial<CompanyInput> & { status?: CompanyStatus }
): Promise<Company | null> {
	const [row] = await db
		.update(companies)
		.set(input)
		.where(and(eq(companies.id, id), eq(companies.userId, userId)))
		.returning();
	return row ?? null;
}

export async function countProjectsByStatus(
	userId: string,
	companyId: string
): Promise<ProjectStatusCount[]> {
	return db
		.select({ status: projects.status, count: count() })
		.from(projects)
		.where(and(eq(projects.userId, userId), eq(projects.companyId, companyId)))
		.groupBy(projects.status);
}
