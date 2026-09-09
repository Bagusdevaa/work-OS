import { describe, expect, test } from 'bun:test';
import {
	optionalDate,
	optionalEnum,
	optionalInt,
	optionalText,
	optionalUuid,
	requiredText
} from '$lib/utils/schema-helpers';

describe('requiredText', () => {
	test('trims and accepts non-empty text', () => {
		expect(requiredText().parse('  hello ')).toBe('hello');
	});

	test('rejects empty or whitespace-only text with a friendly message', () => {
		const result = requiredText().safeParse('   ');
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues[0]?.message).toBe('This field is required');
	});

	test('rejects text longer than the maximum', () => {
		expect(requiredText(3).safeParse('abcd').success).toBe(false);
	});
});

describe('optionalText', () => {
	test('turns empty strings into null', () => {
		expect(optionalText().parse('')).toBeNull();
		expect(optionalText().parse('  ')).toBeNull();
	});

	test('treats a missing field as null', () => {
		expect(optionalText().parse(undefined)).toBeNull();
	});

	test('keeps trimmed text', () => {
		expect(optionalText().parse(' keep me ')).toBe('keep me');
	});
});

describe('optionalDate', () => {
	test('accepts an ISO date', () => {
		expect(optionalDate().parse('2026-09-09')).toBe('2026-09-09');
	});

	test('turns empty into null', () => {
		expect(optionalDate().parse('')).toBeNull();
	});

	test('rejects a malformed date', () => {
		expect(optionalDate().safeParse('09/09/2026').success).toBe(false);
	});
});

describe('optionalInt', () => {
	test('coerces numeric strings', () => {
		expect(optionalInt().parse('45')).toBe(45);
	});

	test('turns empty into null', () => {
		expect(optionalInt().parse('')).toBeNull();
	});

	test('rejects negative numbers', () => {
		expect(optionalInt().safeParse('-1').success).toBe(false);
	});
});

describe('optionalUuid', () => {
	test('accepts a uuid and turns empty into null', () => {
		const id = '6f1e2f2a-4c1b-4e3c-9a1d-0b7d8a9c1e2f';
		expect(optionalUuid().parse(id)).toBe(id);
		expect(optionalUuid().parse('')).toBeNull();
	});
});

describe('optionalEnum', () => {
	test('accepts a listed value and turns empty into null', () => {
		const schema = optionalEnum(['a', 'b'] as const);
		expect(schema.parse('a')).toBe('a');
		expect(schema.parse('')).toBeNull();
		expect(schema.safeParse('c').success).toBe(false);
	});
});
