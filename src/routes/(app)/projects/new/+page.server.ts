import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listAreas } from '$lib/features/areas/area.service';
import { listActiveCompanies } from '$lib/features/companies/company.service';
import { projectSchema } from '$lib/features/projects/project.schema';
import { createProject, validateProjectRefs } from '$lib/features/projects/project.service';
import { requireUser } from '$lib/server/auth/session';
import { formDataToValues, parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const [companies, areas] = await Promise.all([listActiveCompanies(user.id), listAreas(user.id)]);
	if (companies.length === 0) redirect(303, '/companies/new');
	return { companies, areas, presetCompanyId: url.searchParams.get('company') ?? '' };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireUser(locals);
		const formData = await request.formData();
		const parsed = parseForm(formData, projectSchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		const refErrors = await validateProjectRefs(user.id, parsed.data);
		if (refErrors) return fail(400, { errors: refErrors, values: formDataToValues(formData) });

		const project = await createProject(user.id, parsed.data);
		redirect(303, `/projects/${project.id}`);
	}
};
