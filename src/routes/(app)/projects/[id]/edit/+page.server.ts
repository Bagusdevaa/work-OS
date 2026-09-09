import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listAreas } from '$lib/features/areas/area.service';
import { listActiveCompanies } from '$lib/features/companies/company.service';
import { projectSchema } from '$lib/features/projects/project.schema';
import {
	requireProject,
	updateProject,
	validateProjectRefs
} from '$lib/features/projects/project.service';
import { requireUser } from '$lib/server/auth/session';
import { formDataToValues, parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const [project, companies, areas] = await Promise.all([
		requireProject(user.id, params.id),
		listActiveCompanies(user.id),
		listAreas(user.id)
	]);
	return { project, companies, areas };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const formData = await request.formData();
		const parsed = parseForm(formData, projectSchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		const refErrors = await validateProjectRefs(user.id, parsed.data);
		if (refErrors) return fail(400, { errors: refErrors, values: formDataToValues(formData) });

		await updateProject(user.id, params.id, parsed.data);
		redirect(303, `/projects/${params.id}`);
	}
};
