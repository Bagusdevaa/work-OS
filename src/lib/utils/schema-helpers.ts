import { z } from 'zod';

const REQUIRED = 'This field is required';

/** Treats missing and blank strings as `null` so optional form fields validate cleanly. */
function emptyToNull(value: unknown): unknown {
	if (value === undefined || value === null) return null;
	if (typeof value === 'string' && value.trim() === '') return null;
	return value;
}

/** Non-empty trimmed text with a maximum length. */
export function requiredText(max = 200) {
	return z
		.string({ error: REQUIRED })
		.trim()
		.min(1, REQUIRED)
		.max(max, `Must be ${max} characters or fewer`);
}

/** Trimmed text; blank input becomes `null`. */
export function optionalText(max = 5000) {
	return z.preprocess(
		emptyToNull,
		z.string().trim().max(max, `Must be ${max} characters or fewer`).nullable()
	);
}

/** ISO calendar date (YYYY-MM-DD); blank input becomes `null`. */
export function optionalDate() {
	return z.preprocess(emptyToNull, z.iso.date({ error: 'Enter a valid date' }).nullable());
}

/** Non-negative whole number; blank input becomes `null`. */
export function optionalInt(max = 1_000_000) {
	return z.preprocess(
		(value) => (emptyToNull(value) === null ? null : Number(value)),
		z
			.number({ error: 'Enter a whole number' })
			.int('Enter a whole number')
			.min(0, 'Must be zero or more')
			.max(max, `Must be ${max} or less`)
			.nullable()
	);
}

/** UUID reference; blank input becomes `null`. */
export function optionalUuid() {
	return z.preprocess(emptyToNull, z.uuid({ error: 'Invalid selection' }).nullable());
}

/** One of the listed values; blank input becomes `null`. */
export function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
	return z.preprocess(emptyToNull, z.enum(values, { error: 'Choose a valid option' }).nullable());
}

/** One of the listed values (required). */
export function requiredEnum<const T extends readonly [string, ...string[]]>(values: T) {
	return z.enum(values, { error: 'Choose an option' });
}

/** Required UUID reference. */
export function requiredUuid() {
	return z.uuid({ error: 'Choose an option' });
}
