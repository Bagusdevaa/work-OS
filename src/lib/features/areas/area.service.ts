import { error } from '@sveltejs/kit';
import { logActivity } from '$lib/features/activities/activity.service';
import { requireCompany } from '$lib/features/companies/company.service';
import * as repo from './area.repository';
import type { AreaInput } from './area.schema';
import type { Area } from './area.types';

export function listAreasForCompany(userId: string, companyId: string) {
	return repo.findAreasByCompany(userId, companyId);
}

export function listAreas(userId: string) {
	return repo.findAreas(userId);
}

export async function createArea(
	userId: string,
	companyId: string,
	input: AreaInput
): Promise<Area> {
	const company = await requireCompany(userId, companyId);
	const area = await repo.createArea(userId, company.id, input);
	await logActivity(userId, {
		entityType: 'area',
		entityId: area.id,
		companyId: company.id,
		action: 'created',
		summary: `Added area "${area.name}" to ${company.name}`
	});
	return area;
}

export async function deleteArea(userId: string, id: string): Promise<void> {
	const area = await repo.deleteArea(userId, id);
	if (!area) error(404, 'Area not found');
	await logActivity(userId, {
		entityType: 'area',
		entityId: area.id,
		companyId: area.companyId,
		action: 'deleted',
		summary: `Removed area "${area.name}"`
	});
}
