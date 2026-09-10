import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { projectStatusChangeSchema } from '$lib/features/projects/project.schema';
import { listArchivedProjects, setProjectStatus } from '$lib/features/projects/project.service';
import { groupProjectsByCompany } from '$lib/features/projects/project.utils';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const projects = await listArchivedProjects(user.id);
	return { groups: groupProjectsByCompany(projects), total: projects.length };
};

export const actions: Actions = {
	setStatus: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), projectStatusChangeSchema);
		if (!parsed.ok) return fail(400, { message: 'That project could not be updated.' });
		const project = await setProjectStatus(user.id, parsed.data.projectId, parsed.data.status);
		return { updated: project.name };
	}
};
