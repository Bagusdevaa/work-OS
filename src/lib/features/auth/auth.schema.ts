import { z } from 'zod';
import { optionalText } from '$lib/utils/schema-helpers';

const email = z
	.string({ error: 'Email is required' })
	.trim()
	.min(1, 'Email is required')
	.pipe(z.email({ error: 'Enter a valid email address' }));

const newPassword = z
	.string({ error: 'Password is required' })
	.min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
	email,
	password: z.string({ error: 'Password is required' }).min(1, 'Password is required')
});
export type LoginInput = z.output<typeof loginSchema>;

export const signupSchema = z.object({
	email,
	password: newPassword,
	displayName: optionalText(80)
});
export type SignupInput = z.output<typeof signupSchema>;

/** Forgot-password and magic-link requests: an address is all we need. */
export const emailOnlySchema = z.object({ email });
export type EmailOnlyInput = z.output<typeof emailOnlySchema>;

export const newPasswordSchema = z
	.object({ password: newPassword, confirmPassword: z.string({ error: 'Please confirm' }) })
	.refine((value) => value.password === value.confirmPassword, {
		error: 'Passwords do not match',
		path: ['confirmPassword']
	});
export type NewPasswordInput = z.output<typeof newPasswordSchema>;
