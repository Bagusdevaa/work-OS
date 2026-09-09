import type { z } from 'zod';

export type FormValues = Record<string, string>;
export type FormErrors = Record<string, string>;

export type ParseResult<T> =
	{ ok: true; data: T } | { ok: false; errors: FormErrors; values: FormValues };

/** Flattens FormData into a plain string map (files are ignored). */
export function formDataToValues(formData: FormData): FormValues {
	const values: FormValues = {};
	for (const [key, value] of formData.entries()) {
		if (typeof value === 'string') values[key] = value;
	}
	return values;
}

/**
 * Validates submitted form data against a Zod schema.
 * On failure returns one message per field (the first issue) plus the raw values
 * so the form can be re-rendered with what the user typed.
 */
export function parseForm<S extends z.ZodType>(
	formData: FormData,
	schema: S
): ParseResult<z.output<S>> {
	const values = formDataToValues(formData);
	const result = schema.safeParse(values);
	if (result.success) return { ok: true, data: result.data };

	const errors: FormErrors = {};
	for (const issue of result.error.issues) {
		const key = issue.path.map(String).join('.') || '_form';
		if (!(key in errors)) errors[key] = issue.message;
	}
	return { ok: false, errors, values };
}
