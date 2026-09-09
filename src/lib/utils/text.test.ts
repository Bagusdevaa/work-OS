import { describe, expect, test } from 'bun:test';
import { pluralize } from '$lib/utils/text';

describe('pluralize', () => {
	test('uses the singular for one', () => {
		expect(pluralize(1, 'project')).toBe('1 project');
	});

	test('adds an s otherwise', () => {
		expect(pluralize(0, 'task')).toBe('0 tasks');
		expect(pluralize(3, 'task')).toBe('3 tasks');
	});

	test('accepts an explicit plural form', () => {
		expect(pluralize(2, 'company', 'companies')).toBe('2 companies');
	});
});
