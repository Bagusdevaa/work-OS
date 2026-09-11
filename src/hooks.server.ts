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

/** Reachable while signed in: a recovery link signs the user in before they pick a password. */
const AUTH_ROUTES_ALLOWED_WITH_SESSION = new Set(['/(auth)/reset-password']);

const authGuard: Handle = async ({ event, resolve }) => {
	const started = performance.now();
	const { session, authUser } = await event.locals.safeGetSession();
	const afterAuth = performance.now();
	event.locals.session = session;
	event.locals.user = null;

	const routeId = event.route.id ?? '';
	const isAppRoute = routeId.startsWith('/(app)');
	const isAuthPage = routeId.startsWith('/(auth)');

	if (!session || !authUser) {
		if (isAppRoute) redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
		return withTimings(await resolve(event), afterAuth - started, 0, performance.now());
	}

	if (isAuthPage && !AUTH_ROUTES_ALLOWED_WITH_SESSION.has(routeId)) redirect(303, '/');

	event.locals.user =
		(await findUserById(authUser.id)) ??
		(await ensureUser({
			id: authUser.id,
			email: authUser.email ?? `${authUser.id}@unknown.local`,
			displayName: readDisplayName(authUser.user_metadata)
		}));
	const afterUser = performance.now();

	const response = await resolve(event);
	return withTimings(response, afterAuth - started, afterUser - afterAuth, afterUser);
};

/**
 * Reports where a request's time went, readable in the browser's network panel.
 * `auth` validates the session with Supabase, `user` loads the app user row, `load` is the
 * page's own queries and render — each a separate round trip worth telling apart.
 */
function withTimings(response: Response, auth: number, user: number, loadStart: number): Response {
	const load = performance.now() - loadStart;
	response.headers.set(
		'server-timing',
		`auth;dur=${auth.toFixed(0)}, user;dur=${user.toFixed(0)}, load;dur=${load.toFixed(0)}`
	);
	return response;
}

function readDisplayName(metadata: Record<string, unknown> | undefined): string | null {
	const value = metadata?.display_name;
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export const handle = sequence(supabase, authGuard);
