import { describe, expect, test } from 'bun:test';
import { emailOnlySchema, newPasswordSchema } from './auth.schema';
import { friendlyAuthMessage, isUnknownOtpRecipient } from './auth.service';

describe('friendlyAuthMessage', () => {
	test('maps known Supabase errors to human wording', () => {
		expect(friendlyAuthMessage('Invalid login credentials')).toBe('Incorrect email or password.');
		expect(friendlyAuthMessage('Email not confirmed')).toBe(
			'Please confirm your email address before signing in.'
		);
		expect(friendlyAuthMessage('User already registered')).toBe(
			'An account with this email already exists.'
		);
	});

	test('explains a reused password on reset', () => {
		expect(friendlyAuthMessage('New password should be different from the old password')).toBe(
			'Your new password must be different from your current one.'
		);
	});

	test('explains an expired or already-used recovery link', () => {
		expect(friendlyAuthMessage('Token has expired or is invalid')).toBe(
			'That link has expired or was already used. Request a new one.'
		);
	});

	test('falls back to a generic message', () => {
		expect(friendlyAuthMessage('kaboom')).toBe('Something went wrong. Please try again.');
	});
});

describe('isUnknownOtpRecipient', () => {
	test('recognises the error Supabase returns for an address with no account', () => {
		expect(
			isUnknownOtpRecipient({ code: 'otp_disabled', message: 'Signups not allowed for otp' })
		).toBe(true);
	});

	test('recognises it from the message alone when no code is present', () => {
		expect(isUnknownOtpRecipient({ message: 'Signups not allowed for otp' })).toBe(true);
	});

	test('leaves real failures alone', () => {
		expect(
			isUnknownOtpRecipient({ code: 'over_email_send_rate_limit', message: 'rate limit' })
		).toBe(false);
		expect(isUnknownOtpRecipient({ message: 'Database error' })).toBe(false);
	});
});

describe('emailOnlySchema', () => {
	test('trims and accepts a valid address', () => {
		const parsed = emailOnlySchema.safeParse({ email: '  deva@example.com ' });
		expect(parsed.success).toBe(true);
		expect(parsed.success && parsed.data.email).toBe('deva@example.com');
	});

	test('rejects a blank or malformed address', () => {
		expect(emailOnlySchema.safeParse({ email: '   ' }).success).toBe(false);
		expect(emailOnlySchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
	});
});

describe('newPasswordSchema', () => {
	test('accepts a matching pair of at least 8 characters', () => {
		const parsed = newPasswordSchema.safeParse({
			password: 'longenough',
			confirmPassword: 'longenough'
		});
		expect(parsed.success).toBe(true);
	});

	test('rejects a mismatch and reports it on the confirmation field', () => {
		const parsed = newPasswordSchema.safeParse({
			password: 'longenough',
			confirmPassword: 'different'
		});
		expect(parsed.success).toBe(false);
		expect(parsed.success === false && parsed.error.issues[0].path).toEqual(['confirmPassword']);
	});

	test('rejects a password under 8 characters', () => {
		const parsed = newPasswordSchema.safeParse({ password: 'short', confirmPassword: 'short' });
		expect(parsed.success).toBe(false);
	});
});
