import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { newPasswordSchema } from '$lib/features/auth/auth.schema';
import { updatePassword } from '$lib/features/auth/auth.service';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = ({ locals }) => {
	// The recovery link signs the user in first; without that session there is nothing to update.
	if (!locals.session) redirect(303, '/forgot-password?error=link');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) redirect(303, '/forgot-password?error=link');

		const parsed = parseForm(await request.formData(), newPasswordSchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors });

		const result = await updatePassword(locals.supabase, parsed.data.password);
		if (!result.ok) return fail(400, { message: result.message });

		return { updated: true };
	}
};
