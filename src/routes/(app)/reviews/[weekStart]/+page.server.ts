import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { reviewSchema } from '$lib/features/reviews/review.schema';
import { getWeeklyReview, saveWeeklyReview } from '$lib/features/reviews/review.service';
import { requireUser } from '$lib/server/auth/session';
import { formDataToValues, parseForm } from '$lib/server/forms';
import { addDays, startOfWeek, todayISO } from '$lib/utils/dates';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function resolveWeekStart(param: string): string {
	if (!ISO_DATE.test(param)) error(404, 'Week not found');
	const monday = startOfWeek(param);
	if (monday !== param) redirect(303, `/reviews/${monday}`);
	return monday;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const weekStart = resolveWeekStart(params.weekStart);
	const { summary, review } = await getWeeklyReview(user.id, weekStart);
	return {
		weekStart,
		previousWeek: addDays(weekStart, -7),
		nextWeek: addDays(weekStart, 7),
		isCurrentWeek: weekStart === startOfWeek(todayISO()),
		summary,
		review
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const weekStart = resolveWeekStart(params.weekStart);
		const formData = await request.formData();
		const parsed = parseForm(formData, reviewSchema);
		if (!parsed.ok) return fail(400, { errors: parsed.errors, values: parsed.values });
		await saveWeeklyReview(user.id, weekStart, parsed.data);
		return { saved: true, values: formDataToValues(formData) };
	}
};
