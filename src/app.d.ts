import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { AppUser } from '$lib/features/users/user.types';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			/** Validates the session against the auth server (never trust the raw cookie). */
			safeGetSession(): Promise<{ session: Session | null; authUser: User | null }>;
			session: Session | null;
			/** The application user row for the authenticated user, if any. */
			user: AppUser | null;
			/** Milliseconds spent per phase, reported back as a Server-Timing header. */
			timings: Record<string, number>;
		}
		interface PageData {
			user?: AppUser | null;
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
