import type { PageServerLoad } from './$types';
import { listActiveCompanies } from '$lib/features/companies/company.service';
import { listProjects } from '$lib/features/projects/project.service';
import { requireUser } from '$lib/server/auth/session';
import { PROJECT_STATUSES, type ProjectStatus } from '$lib/types/domain';

const OPEN_STATUSES: ProjectStatus[] = ['idea', 'planning', 'active', 'paused', 'blocked'];

function statusesForView(view: string): ProjectStatus[] | undefined {
	if (view === 'all') return undefined;
	if ((PROJECT_STATUSES as readonly string[]).includes(view)) return [view as ProjectStatus];
	return OPEN_STATUSES;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const companyId = url.searchParams.get('company') ?? '';
	const view = url.searchParams.get('view') ?? 'open';

	const [projects, companies] = await Promise.all([
		listProjects(user.id, {
			companyId: companyId || undefined,
			statuses: statusesForView(view)
		}),
		listActiveCompanies(user.id)
	]);

	return { projects, companies, companyId, view };
};
