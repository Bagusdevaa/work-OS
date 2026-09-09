import { parseISODate } from '$lib/utils/dates';

/** Local Date for an ISO date plus optional HH:MM time (midnight when absent). */
export function combineDateTime(date: string, time: string | null): Date {
	const result = parseISODate(date);
	if (time) {
		const [hours, minutes] = time.split(':').map(Number);
		result.setHours(hours, minutes, 0, 0);
	}
	return result;
}
