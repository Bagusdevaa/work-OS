import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { emailOnlySchema } from '$lib/features/auth/auth.schema';
import { sendPasswordReset } from '$lib/features/auth/auth.service';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = ({ url }) => ({
	linkExpired: url.searchParams.get('error') === 'link'
});

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const parsed = parseForm(await request.formData(), emailOnlySchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });

		const result = await sendPasswordReset(
			locals.supabase,
			parsed.data,
			`${url.origin}/auth/callback?type=recovery`
		);
		if (!result.ok) {
			return fail(400, { message: result.message, values: { email: parsed.data.email } });
		}

		// Always report success: revealing which addresses exist would leak accounts.
		return { sent: true, email: parsed.data.email };
	}
};
