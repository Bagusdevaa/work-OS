import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listMilestonesForProject } from '$lib/features/milestones/milestone.service';
import { taskSchema } from '$lib/features/tasks/task.schema';
import {
	deleteTask,
	requireTask,
	updateTask,
	validateTaskRefs
} from '$lib/features/tasks/task.service';
import { requireUser } from '$lib/server/auth/session';
import { formDataToValues, parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const task = await requireTask(user.id, params.id);
	const milestones = await listMilestonesForProject(user.id, task.projectId);
	return { task, milestones };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const formData = await request.formData();
		const parsed = parseForm(formData, taskSchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		const task = await requireTask(user.id, params.id);
		const refErrors = await validateTaskRefs(user.id, task.projectId, parsed.data.milestoneId);
		if (refErrors) return fail(400, { errors: refErrors, values: formDataToValues(formData) });

		await updateTask(user.id, params.id, parsed.data);
		redirect(303, `/projects/${task.projectId}`);
	},

	delete: async ({ locals, params }) => {
		const user = requireUser(locals);
		const task = await deleteTask(user.id, params.id);
		redirect(303, `/projects/${task.projectId}`);
	}
};
