import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { buildDashboard } from '$lib/features/dashboard/dashboard.service';
import { taskStatusSchema } from '$lib/features/tasks/task.schema';
import { setTaskStatus } from '$lib/features/tasks/task.service';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	return { dashboard: await buildDashboard(user.id) };
};

export const actions: Actions = {
	setTaskStatus: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), taskStatusSchema);
		if (!parsed.ok) return fail(400, { taskErrors: parsed.errors });
		await setTaskStatus(user.id, parsed.data.taskId, parsed.data.status);
		return { taskUpdated: true };
	}
};
