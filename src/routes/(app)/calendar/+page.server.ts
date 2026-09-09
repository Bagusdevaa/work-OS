import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { buildMonthGrid, currentMonth } from '$lib/features/calendar/calendar-grid';
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

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const today = todayISO();
	const requested = url.searchParams.get('month') ?? '';
	const month = MONTH_PATTERN.test(requested) ? requested : currentMonth(today);
	const grid = buildMonthGrid(month, today);

	const [tasks, milestones, projects, events] = await Promise.all([
		listTasks(user.id, {
			statuses: OPEN_TASK_STATUSES,
			projectStatuses: IN_FLIGHT_PROJECT_STATUSES,
			dueOnOrBefore: grid.rangeEnd
		}),
		findMilestoneDeadlines(user.id),
		findProjects(user.id, { statuses: IN_FLIGHT_PROJECT_STATUSES }),
		findEventsBetween(
			user.id,
			parseISODate(grid.rangeStart),
			parseISODate(addDays(grid.rangeEnd, 1))
		)
	]);

	const items = collectDeadlines({ tasks, milestones, projects, events }).filter(
		(item) => item.date >= grid.rangeStart && item.date <= grid.rangeEnd
	);

	return {
		today,
		month,
		grid,
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
