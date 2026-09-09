import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { ensureUser, findUserById } from '$lib/features/users/user.repository';
import { createSupabaseServerClient } from '$lib/server/auth/supabase';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event);

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, authUser: null };

		// getUser() validates the JWT with the auth server; the cookie alone is not trusted.
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error || !user) return { session: null, authUser: null };
		return { session, authUser: user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, authUser } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = null;

	const routeId = event.route.id ?? '';
	const isAppRoute = routeId.startsWith('/(app)');
	const isAuthPage = routeId.startsWith('/(auth)');

	if (!session || !authUser) {
		if (isAppRoute) redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
		return resolve(event);
	}

	if (isAuthPage) redirect(303, '/');

	event.locals.user =
		(await findUserById(authUser.id)) ??
		(await ensureUser({
			id: authUser.id,
			email: authUser.email ?? `${authUser.id}@unknown.local`,
			displayName: readDisplayName(authUser.user_metadata)
		}));

	return resolve(event);
};

function readDisplayName(metadata: Record<string, unknown> | undefined): string | null {
	const value = metadata?.display_name;
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export const handle = sequence(supabase, authGuard);
