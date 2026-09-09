import { error } from '@sveltejs/kit';
import { logActivity } from '$lib/features/activities/activity.service';
import type { CompanyStatus } from '$lib/types/domain';
import * as repo from './company.repository';
import type { CompanyInput } from './company.schema';
import type { Company } from './company.types';

export function listCompanies(userId: string, includeArchived = false) {
	return repo.findCompanySummaries(userId, includeArchived);
}

export function listActiveCompanies(userId: string) {
	return repo.findCompanies(userId, 'active');
}

/** Loads a company or throws a 404. */
export async function requireCompany(userId: string, id: string): Promise<Company> {
	const company = await repo.findCompanyById(userId, id);
	if (!company) error(404, 'Company not found');
	return company;
}

export async function createCompany(userId: string, input: CompanyInput): Promise<Company> {
	const company = await repo.createCompany(userId, input);
	await logActivity(userId, {
		entityType: 'company',
		entityId: company.id,
		companyId: company.id,
		action: 'created',
		summary: `Added company "${company.name}"`
	});
	return company;
}

export async function updateCompany(
	userId: string,
	id: string,
	input: CompanyInput
): Promise<Company> {
	const company = await repo.updateCompany(userId, id, input);
	if (!company) error(404, 'Company not found');
	await logActivity(userId, {
		entityType: 'company',
		entityId: company.id,
		companyId: company.id,
		action: 'updated',
		summary: `Updated company "${company.name}"`
	});
	return company;
}

export async function setCompanyStatus(
	userId: string,
	id: string,
	status: CompanyStatus
): Promise<Company> {
	const company = await repo.updateCompany(userId, id, { status });
	if (!company) error(404, 'Company not found');
	await logActivity(userId, {
		entityType: 'company',
		entityId: company.id,
		companyId: company.id,
		action: status === 'archived' ? 'archived' : 'status_changed',
		summary:
			status === 'archived'
				? `Archived company "${company.name}"`
				: `Restored company "${company.name}"`
	});
	return company;
}

export function getProjectStatusCounts(userId: string, companyId: string) {
	return repo.countProjectsByStatus(userId, companyId);
}
