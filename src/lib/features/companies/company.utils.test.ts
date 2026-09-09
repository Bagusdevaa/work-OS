import { describe, expect, test } from 'bun:test';
import { summarizeProjectStatuses } from '$lib/features/companies/company.utils';

describe('summarizeProjectStatuses', () => {
	test('returns zeros when there are no projects', () => {
		expect(summarizeProjectStatuses([])).toEqual({ total: 0, inFlight: 0, completed: 0, other: 0 });
	});

	test('counts in-flight, completed and other statuses', () => {
		const rows = [
			{ status: 'active' as const, count: 2 },
			{ status: 'planning' as const, count: 1 },
			{ status: 'blocked' as const, count: 1 },
			{ status: 'completed' as const, count: 3 },
			{ status: 'idea' as const, count: 2 },
			{ status: 'archived' as const, count: 1 }
		];
		expect(summarizeProjectStatuses(rows)).toEqual({
			total: 10,
			inFlight: 4,
			completed: 3,
			other: 3
		});
	});
});
