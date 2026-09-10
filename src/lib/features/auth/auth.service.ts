import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmailOnlyInput, LoginInput, SignupInput } from './auth.schema';

export type AuthResult = { ok: true } | { ok: false; message: string };
export type SignupResult = AuthResult & { needsConfirmation?: boolean };

const FRIENDLY_MESSAGES: Array<[pattern: RegExp, message: string]> = [
	[/invalid login credentials/i, 'Incorrect email or password.'],
	[/email not confirmed/i, 'Please confirm your email address before signing in.'],
	[/already registered/i, 'An account with this email already exists.'],
	[
		/should be different from the old password/i,
		'Your new password must be different from your current one.'
	],
	[
		/(token|link).*(expired|invalid)|expired.*(token|link)/i,
		'That link has expired or was already used. Request a new one.'
	],
	[/rate limit|too many requests/i, 'Too many attempts. Please wait a moment and try again.']
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

/** Emails a recovery link; the callback forwards the user to /reset-password. */
export async function sendPasswordReset(
	supabase: SupabaseClient,
	input: EmailOnlyInput,
	redirectTo: string
): Promise<AuthResult> {
	const { error } = await supabase.auth.resetPasswordForEmail(input.email, { redirectTo });
	return error ? { ok: false, message: friendlyAuthMessage(error.message) } : { ok: true };
}

/**
 * Supabase refuses a one-time link for an address with no account. Reporting that back
 * would tell an attacker which addresses are registered, so it is treated as success.
 */
export function isUnknownOtpRecipient(error: { code?: string; message: string }): boolean {
	return error.code === 'otp_disabled' || /signups not allowed for otp/i.test(error.message);
}

/** Emails a one-time sign-in link. Never creates an account for an unknown address. */
export async function sendMagicLink(
	supabase: SupabaseClient,
	input: EmailOnlyInput,
	emailRedirectTo: string
): Promise<AuthResult> {
	const { error } = await supabase.auth.signInWithOtp({
		email: input.email,
		options: { emailRedirectTo, shouldCreateUser: false }
	});
	if (!error || isUnknownOtpRecipient(error)) return { ok: true };
	return { ok: false, message: friendlyAuthMessage(error.message) };
}

/** Sets a new password for the session created by a recovery link. */
export async function updatePassword(
	supabase: SupabaseClient,
	password: string
): Promise<AuthResult> {
	const { error } = await supabase.auth.updateUser({ password });
	return error ? { ok: false, message: friendlyAuthMessage(error.message) } : { ok: true };
}
