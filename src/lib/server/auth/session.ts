import { redirect } from '@sveltejs/kit';
import type { AppUser } from '$lib/features/users/user.types';

/** Returns the authenticated app user or redirects to the login page. */
export function requireUser(locals: App.Locals): AppUser {
	if (!locals.user) redirect(303, '/login');
	return locals.user;
}
