import { describe, expect, test } from 'bun:test';
import { safeRedirectPath } from '$lib/utils/urls';

describe('safeRedirectPath', () => {
	test('allows a same-origin absolute path', () => {
		expect(safeRedirectPath('/projects/abc')).toBe('/projects/abc');
	});

	test('falls back for missing or empty values', () => {
		expect(safeRedirectPath(null)).toBe('/');
		expect(safeRedirectPath('')).toBe('/');
	});

	test('rejects protocol-relative and absolute URLs', () => {
		expect(safeRedirectPath('//evil.com')).toBe('/');
		expect(safeRedirectPath('https://evil.com')).toBe('/');
		expect(safeRedirectPath('javascript:alert(1)')).toBe('/');
	});

	test('rejects backslash tricks', () => {
		expect(safeRedirectPath('/\\evil.com')).toBe('/');
	});

	test('uses a custom fallback', () => {
		expect(safeRedirectPath(null, '/inbox')).toBe('/inbox');
	});
});
