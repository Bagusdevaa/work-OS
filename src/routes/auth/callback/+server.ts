import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safeRedirectPath } from '$lib/utils/urls';

const RESET_PATH = '/reset-password';

/** Completes email-confirmation, magic-link and recovery sign-ins (PKCE code exchange). */
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const isRecovery = url.searchParams.get('type') === 'recovery';
	const next = isRecovery ? RESET_PATH : safeRedirectPath(url.searchParams.get('next'));

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, next);
	}

	redirect(303, next === RESET_PATH ? '/forgot-password?error=link' : '/login?error=auth');
};
