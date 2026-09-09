import { describe, expect, test } from 'bun:test';
import { isNavActive } from '$lib/components/layout/navigation';

describe('isNavActive', () => {
	test('dashboard matches only the root path', () => {
		expect(isNavActive('/', { href: '/', exact: true })).toBe(true);
		expect(isNavActive('/projects', { href: '/', exact: true })).toBe(false);
	});

	test('section links match their own path and nested paths', () => {
		expect(isNavActive('/projects', { href: '/projects' })).toBe(true);
		expect(isNavActive('/projects/abc', { href: '/projects' })).toBe(true);
	});

	test('section links do not match unrelated prefixes', () => {
		expect(isNavActive('/projects-archive', { href: '/projects' })).toBe(false);
		expect(isNavActive('/inbox', { href: '/projects' })).toBe(false);
	});
});
