import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	captureSchema,
	convertToNoteSchema,
	convertToTaskSchema,
	inboxItemIdSchema
} from '$lib/features/inbox/inbox.schema';
import {
	captureInboxItem,
	convertInboxItemToNote,
	convertInboxItemToTask,
	getInboxOverview,
	setInboxItemStatus
} from '$lib/features/inbox/inbox.service';
import { findProjects } from '$lib/features/projects/project.repository';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';
import { IN_FLIGHT_PROJECT_STATUSES } from '$lib/types/domain';

const TARGET_STATUSES = [...IN_FLIGHT_PROJECT_STATUSES, 'idea', 'paused'] as const;

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals);
	const [inbox, projects] = await Promise.all([
		getInboxOverview(user.id),
		findProjects(user.id, { statuses: TARGET_STATUSES })
	]);
	return {
		inbox,
		projects: projects.map(({ id, name, companyName }) => ({ id, name, companyName })),
		autofocus: url.searchParams.get('capture') === '1'
	};
};

export const actions: Actions = {
	capture: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), captureSchema);
		if (!parsed.ok)
			return fail(400, { captureErrors: parsed.errors, captureValues: parsed.values });
		await captureInboxItem(user.id, parsed.data);
		return { captured: true };
	},

	convertToTask: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), convertToTaskSchema);
		if (!parsed.ok) {
			return fail(400, {
				itemId: parsed.values.itemId,
				form: 'task' as const,
				itemErrors: parsed.errors
			});
		}
		await convertInboxItemToTask(user.id, parsed.data);
		return { converted: true };
	},

	convertToNote: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), convertToNoteSchema);
		if (!parsed.ok) {
			return fail(400, {
				itemId: parsed.values.itemId,
				form: 'note' as const,
				itemErrors: parsed.errors
			});
		}
		await convertInboxItemToNote(user.id, parsed.data.itemId, parsed.data.projectId);
		return { converted: true };
	},

	dismiss: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), inboxItemIdSchema);
		if (!parsed.ok) return fail(400, { itemErrors: parsed.errors });
		await setInboxItemStatus(user.id, parsed.data.itemId, 'dismissed');
		return { dismissed: true };
	},

	restore: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), inboxItemIdSchema);
		if (!parsed.ok) return fail(400, { itemErrors: parsed.errors });
		await setInboxItemStatus(user.id, parsed.data.itemId, 'open');
		return { restored: true };
	}
};
