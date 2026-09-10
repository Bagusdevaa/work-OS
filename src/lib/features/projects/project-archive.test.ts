import { describe, expect, test } from 'bun:test';
import { groupProjectsByCompany } from '$lib/features/projects/project.utils';

const project = (id: string, companyId: string, companyName: string, completedAt: Date | null) => ({
	id,
	companyId,
	companyName,
	completedAt
});

describe('groupProjectsByCompany', () => {
	test('groups projects under their company, companies in alphabetical order', () => {
		const groups = groupProjectsByCompany([
			project('p1', 'c2', 'Zenith', null),
			project('p2', 'c1', 'Acme', null),
			project('p3', 'c2', 'Zenith', null)
		]);
		expect(groups.map((g) => g.companyName)).toEqual(['Acme', 'Zenith']);
		expect(groups[1].projects.map((p) => p.id)).toEqual(['p1', 'p3']);
	});

	test('keeps the incoming project order inside a group', () => {
		const groups = groupProjectsByCompany([
			project('later', 'c1', 'Acme', new Date(2026, 1, 1)),
			project('earlier', 'c1', 'Acme', new Date(2025, 1, 1))
		]);
		expect(groups[0].projects.map((p) => p.id)).toEqual(['later', 'earlier']);
	});

	test('returns an empty list for no projects', () => {
		expect(groupProjectsByCompany([])).toEqual([]);
	});

	test('sorts company names case-insensitively', () => {
		const groups = groupProjectsByCompany([
			project('p1', 'c1', 'zenith', null),
			project('p2', 'c2', 'Acme', null)
		]);
		expect(groups.map((g) => g.companyName)).toEqual(['Acme', 'zenith']);
	});
});
