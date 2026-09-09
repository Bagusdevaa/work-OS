import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * Creates a request-scoped Supabase client that reads and writes auth cookies.
 * Used only for authentication; application data goes through Drizzle.
 */
export function createSupabaseServerClient(event: RequestEvent) {
	if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
		throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
	}

	return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				for (const { name, value, options } of cookiesToSet) {
					event.cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});
}
