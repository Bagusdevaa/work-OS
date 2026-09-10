import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { emailOnlySchema, loginSchema } from '$lib/features/auth/auth.schema';
import { sendMagicLink, signInWithPassword } from '$lib/features/auth/auth.service';
import { parseForm } from '$lib/server/forms';
import { omitKeys } from '$lib/utils/objects';
import { safeRedirectPath } from '$lib/utils/urls';

export const load: PageServerLoad = ({ url }) => ({
	linkError: url.searchParams.get('error') === 'auth'
});

export const actions: Actions = {
	password: async ({ request, locals, url }) => {
		const parsed = parseForm(await request.formData(), loginSchema);
		if (!parsed.ok) {
			return fail(400, { errors: parsed.errors, values: omitKeys(parsed.values, ['password']) });
		}

		const result = await signInWithPassword(locals.supabase, parsed.data);
		if (!result.ok) {
			return fail(400, { message: result.message, values: { email: parsed.data.email } });
		}

		redirect(303, safeRedirectPath(url.searchParams.get('next')));
	},

	magicLink: async ({ request, locals, url }) => {
		const parsed = parseForm(await request.formData(), emailOnlySchema);
		if (!parsed.ok) {
			const values = omitKeys(parsed.values, ['password']);
			return fail(400, { magicErrors: parsed.errors, values });
		}

		const next = safeRedirectPath(url.searchParams.get('next'));
		const result = await sendMagicLink(
			locals.supabase,
			parsed.data,
			`${url.origin}/auth/callback?next=${encodeURIComponent(next)}`
		);
		if (!result.ok) {
			return fail(400, { message: result.message, values: { email: parsed.data.email } });
		}

		// Always report success: revealing which addresses exist would leak accounts.
		return { magicLinkSent: true, email: parsed.data.email };
	}
};
