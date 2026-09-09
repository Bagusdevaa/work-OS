import type { PageServerLoad } from './$types';
import { listCompanies } from '$lib/features/companies/company.service';
import { requireUser } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const includeArchived = url.searchParams.get('archived') === '1';
	return { companies: await listCompanies(user.id, includeArchived), includeArchived };
};
