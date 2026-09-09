import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoginInput, SignupInput } from './auth.schema';

export type AuthResult = { ok: true } | { ok: false; message: string };
export type SignupResult = AuthResult & { needsConfirmation?: boolean };

const FRIENDLY_MESSAGES: Array<[pattern: RegExp, message: string]> = [
	[/invalid login credentials/i, 'Incorrect email or password.'],
	[/email not confirmed/i, 'Please confirm your email address before signing in.'],
	[/already registered/i, 'An account with this email already exists.'],
	[/rate limit/i, 'Too many attempts. Please wait a moment and try again.']
];

export function friendlyAuthMessage(raw: string): string {
	const match = FRIENDLY_MESSAGES.find(([pattern]) => pattern.test(raw));
	return match ? match[1] : 'Something went wrong. Please try again.';
}

export async function signInWithPassword(
	supabase: SupabaseClient,
	input: LoginInput
): Promise<AuthResult> {
	const { error } = await supabase.auth.signInWithPassword(input);
	return error ? { ok: false, message: friendlyAuthMessage(error.message) } : { ok: true };
}

export async function signUpWithPassword(
	supabase: SupabaseClient,
	input: SignupInput,
	emailRedirectTo: string
): Promise<SignupResult> {
	const { data, error } = await supabase.auth.signUp({
		email: input.email,
		password: input.password,
		options: { emailRedirectTo, data: { display_name: input.displayName ?? undefined } }
	});
	if (error) return { ok: false, message: friendlyAuthMessage(error.message) };
	return { ok: true, needsConfirmation: data.session === null };
}
