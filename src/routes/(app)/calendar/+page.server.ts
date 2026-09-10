import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	buildMonthGrid,
	buildWeekGrid,
	currentMonth,
	currentWeek
} from '$lib/features/calendar/calendar-grid';
import { collectDeadlines } from '$lib/features/calendar/calendar.utils';
import { findEventsBetween } from '$lib/features/events/event.repository';
import { eventIdSchema, eventSchema } from '$lib/features/events/event.schema';
import { createEvent, deleteEvent } from '$lib/features/events/event.service';
import { findMilestoneDeadlines } from '$lib/features/milestones/milestone.repository';
import { findProjects } from '$lib/features/projects/project.repository';
import { listTasks } from '$lib/features/tasks/task.service';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';
import { IN_FLIGHT_PROJECT_STATUSES, OPEN_TASK_STATUSES } from '$lib/types/domain';
import { addDays, parseISODate, todayISO } from '$lib/utils/dates';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const today = todayISO();

	const view = url.searchParams.get('view') === 'week' ? 'week' : 'month';
	const requestedMonth = url.searchParams.get('month') ?? '';
	const requestedWeek = url.searchParams.get('week') ?? '';
	const month = MONTH_PATTERN.test(requestedMonth) ? requestedMonth : currentMonth(today);
	const week = DATE_PATTERN.test(requestedWeek) ? requestedWeek : currentWeek(today);

	const monthGrid = view === 'month' ? buildMonthGrid(month, today) : null;
	const weekGrid = view === 'week' ? buildWeekGrid(week, today) : null;
	const range = monthGrid ?? weekGrid!;
	// Only the days the view actually presents; the month grid pads with neighbouring days.
	const visibleDates = monthGrid
		? monthGrid.weeks
				.flat()
				.filter((day) => day.inMonth)
				.map((day) => day.date)
		: weekGrid!.days.map((day) => day.date);

	const [tasks, milestones, projects, events] = await Promise.all([
		listTasks(user.id, {
			statuses: OPEN_TASK_STATUSES,
			projectStatuses: IN_FLIGHT_PROJECT_STATUSES,
			dueOnOrBefore: range.rangeEnd
		}),
		findMilestoneDeadlines(user.id),
		findProjects(user.id, { statuses: IN_FLIGHT_PROJECT_STATUSES }),
		findEventsBetween(
			user.id,
			parseISODate(range.rangeStart),
			parseISODate(addDays(range.rangeEnd, 1))
		)
	]);

	const items = collectDeadlines({ tasks, milestones, projects, events }).filter(
		(item) => item.date >= range.rangeStart && item.date <= range.rangeEnd
	);

	return {
		today,
		view,
		// Each toggle target keeps the reader near the dates they were just looking at.
		month: weekGrid ? weekGrid.weekStart.slice(0, 7) : month,
		week: weekGrid?.weekStart ?? currentWeek(month === currentMonth(today) ? today : `${month}-01`),
		monthGrid,
		weekGrid,
		visibleDates,
		items,
		projects: projects.map(({ id, name }) => ({ id, name }))
	};
};

export const actions: Actions = {
	createEvent: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), eventSchema);
		if (!parsed.ok) return fail(400, { eventErrors: parsed.errors, eventValues: parsed.values });
		await createEvent(user.id, parsed.data);
		return { eventCreated: true };
	},

	deleteEvent: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), eventIdSchema);
		if (!parsed.ok) return fail(400, { eventErrors: parsed.errors });
		await deleteEvent(user.id, parsed.data.eventId);
		return { eventDeleted: true };
	}
};
