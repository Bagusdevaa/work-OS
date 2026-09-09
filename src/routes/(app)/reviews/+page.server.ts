import type { PageServerLoad } from './$types';
import { listReviews } from '$lib/features/reviews/review.service';
import { requireUser } from '$lib/server/auth/session';
import { addDays, startOfWeek, todayISO } from '$lib/utils/dates';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const thisWeek = startOfWeek(todayISO());
	return {
		thisWeek,
		lastWeek: addDays(thisWeek, -7),
		reviews: await listReviews(user.id)
	};
};
