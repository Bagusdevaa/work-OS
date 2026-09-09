import { z } from 'zod';
import { optionalText } from '$lib/utils/schema-helpers';

const email = z
	.string({ error: 'Email is required' })
	.trim()
	.min(1, 'Email is required')
	.pipe(z.email({ error: 'Enter a valid email address' }));

export const loginSchema = z.object({
	email,
	password: z.string({ error: 'Password is required' }).min(1, 'Password is required')
});
export type LoginInput = z.output<typeof loginSchema>;

export const signupSchema = z.object({
	email,
	password: z
		.string({ error: 'Password is required' })
		.min(8, 'Password must be at least 8 characters'),
	displayName: optionalText(80)
});
export type SignupInput = z.output<typeof signupSchema>;
