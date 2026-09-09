import { describe, expect, test } from 'bun:test';
import { z } from 'zod';
import { parseForm } from '$lib/server/forms';

const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	age: z.coerce.number().int().min(0, 'Age must be positive')
});

function formData(entries: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) fd.set(key, value);
	return fd;
}

describe('parseForm', () => {
	test('returns parsed data when the input is valid', () => {
		const result = parseForm(formData({ name: 'Deva', age: '30' }), schema);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data).toEqual({ name: 'Deva', age: 30 });
	});

	test('returns field errors and echoes submitted values when invalid', () => {
		const result = parseForm(formData({ name: '', age: '-4' }), schema);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toEqual({ name: 'Name is required', age: 'Age must be positive' });
			expect(result.values).toEqual({ name: '', age: '-4' });
		}
	});

	test('keeps only the first error per field', () => {
		const strict = z.object({
			code: z
				.string()
				.min(3, 'Too short')
				.regex(/^[a-z]+$/, 'Lowercase')
		});
		const result = parseForm(formData({ code: 'A' }), strict);
		if (!result.ok) expect(result.errors.code).toBe('Too short');
	});
});
