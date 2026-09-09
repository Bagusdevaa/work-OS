import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { companySchema } from '$lib/features/companies/company.schema';
import { requireCompany, updateCompany } from '$lib/features/companies/company.service';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	return { company: await requireCompany(user.id, params.id) };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), companySchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		await updateCompany(user.id, params.id, parsed.data);
		redirect(303, `/companies/${params.id}`);
	}
};
