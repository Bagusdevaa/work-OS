import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listActiveCompanies } from '$lib/features/companies/company.service';
import {
	filterTasksByContext,
	parseWorkContext,
	sectionTasks,
	type WorkSectionKey
} from '$lib/features/my-work/my-work.utils';
import { findProjects } from '$lib/features/projects/project.repository';
import { taskStatusSchema } from '$lib/features/tasks/task.schema';
import { listTasks, setTaskStatus } from '$lib/features/tasks/task.service';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';
import { IN_FLIGHT_PROJECT_STATUSES, OPEN_TASK_STATUSES } from '$lib/types/domain';
import { todayISO } from '$lib/utils/dates';

const SECTION_KEYS: WorkSectionKey[] = ['overdue', 'today', 'week', 'blocked', 'next'];

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const context = parseWorkContext(url.searchParams.get('context'));
	const viewParam = url.searchParams.get('view');
	const view = SECTION_KEYS.find((key) => key === viewParam) ?? null;
	const today = todayISO();

	const [tasks, companies, projects] = await Promise.all([
		listTasks(user.id, {
			statuses: OPEN_TASK_STATUSES,
			projectStatuses: IN_FLIGHT_PROJECT_STATUSES
		}),
		listActiveCompanies(user.id),
		findProjects(user.id, { statuses: IN_FLIGHT_PROJECT_STATUSES })
	]);

	const scoped = filterTasksByContext(tasks, context);
	const sections = sectionTasks(scoped, today).filter((s) => !view || s.key === view);

	return {
		today,
		context,
		view,
		sections,
		totalOpen: scoped.length,
		companies,
		projects: projects.map(({ id, name, companyId }) => ({ id, name, companyId }))
	};
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
