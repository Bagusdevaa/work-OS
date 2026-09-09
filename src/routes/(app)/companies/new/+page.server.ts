import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { companySchema } from '$lib/features/companies/company.schema';
import { createCompany } from '$lib/features/companies/company.service';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), companySchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		const company = await createCompany(user.id, parsed.data);
		redirect(303, `/companies/${company.id}`);
	}
};
