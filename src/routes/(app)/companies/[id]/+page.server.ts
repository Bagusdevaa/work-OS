import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listRecentActivity } from '$lib/features/activities/activity.service';
import { areaIdSchema, areaSchema } from '$lib/features/areas/area.schema';
import { createArea, deleteArea, listAreasForCompany } from '$lib/features/areas/area.service';
import {
	getProjectStatusCounts,
	requireCompany,
	setCompanyStatus
} from '$lib/features/companies/company.service';
import { summarizeProjectStatuses } from '$lib/features/companies/company.utils';
import { findProjectsByCompany } from '$lib/features/projects/project.repository';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const company = await requireCompany(user.id, params.id);
	const [areas, projects, statusCounts, activity] = await Promise.all([
		listAreasForCompany(user.id, company.id),
		findProjectsByCompany(user.id, company.id),
		getProjectStatusCounts(user.id, company.id),
		listRecentActivity(user.id, { companyId: company.id, limit: 10 })
	]);
	return { company, areas, projects, stats: summarizeProjectStatuses(statusCounts), activity };
};

export const actions: Actions = {
	createArea: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), areaSchema);
		if (!parsed.ok) return fail(400, { areaErrors: parsed.errors, areaValues: parsed.values });
		await createArea(user.id, params.id, parsed.data);
		return { areaCreated: true };
	},

	deleteArea: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), areaIdSchema);
		if (!parsed.ok) return fail(400, { areaErrors: parsed.errors });
		await deleteArea(user.id, parsed.data.areaId);
		return { areaDeleted: true };
	},

	archive: async ({ locals, params }) => {
		const user = requireUser(locals);
		await setCompanyStatus(user.id, params.id, 'archived');
		redirect(303, '/companies');
	},

	restore: async ({ locals, params }) => {
		const user = requireUser(locals);
		await setCompanyStatus(user.id, params.id, 'active');
		return { restored: true };
	}
};
