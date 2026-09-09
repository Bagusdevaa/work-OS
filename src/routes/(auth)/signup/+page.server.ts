import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { signupSchema } from '$lib/features/auth/auth.schema';
import { signUpWithPassword } from '$lib/features/auth/auth.service';
import { parseForm } from '$lib/server/forms';
import { omitKeys } from '$lib/utils/objects';

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const parsed = parseForm(await request.formData(), signupSchema);
		if (!parsed.ok) {
			return fail(400, { errors: parsed.errors, values: omitKeys(parsed.values, ['password']) });
		}

		const result = await signUpWithPassword(
			locals.supabase,
			parsed.data,
			`${url.origin}/auth/callback`
		);
		if (!result.ok) {
			const values = { email: parsed.data.email, displayName: parsed.data.displayName ?? '' };
			return fail(400, { message: result.message, values });
		}
		if (result.needsConfirmation) {
			return { confirmationSent: true, email: parsed.data.email };
		}

		redirect(303, '/');
	}
};
