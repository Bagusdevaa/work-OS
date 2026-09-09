import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listRecentActivity } from '$lib/features/activities/activity.service';
import { noteIdSchema, noteSchema } from '$lib/features/notes/note.schema';
import { createNote, deleteNote, listNotesForProject } from '$lib/features/notes/note.service';
import { projectFocusSchema, projectStatusSchema } from '$lib/features/projects/project.schema';
import {
	requireProject,
	setProjectStatus,
	updateProjectFocus
} from '$lib/features/projects/project.service';
import { resourceIdSchema, resourceSchema } from '$lib/features/resources/resource.schema';
import {
	createResource,
	deleteResource,
	listResourcesForProject
} from '$lib/features/resources/resource.service';
import { requireUser } from '$lib/server/auth/session';
import { parseForm } from '$lib/server/forms';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const project = await requireProject(user.id, params.id);
	const [notes, resources, activity] = await Promise.all([
		listNotesForProject(user.id, project.id),
		listResourcesForProject(user.id, project.id),
		listRecentActivity(user.id, { projectId: project.id, limit: 12 })
	]);
	return { project, notes, resources, activity };
};

export const actions: Actions = {
	setStatus: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), projectStatusSchema);
		if (!parsed.ok) return fail(400, { statusError: parsed.errors.status });
		await setProjectStatus(user.id, params.id, parsed.data.status);
		return { statusUpdated: true };
	},

	updateFocus: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), projectFocusSchema);
		if (!parsed.ok) return fail(400, { focusErrors: parsed.errors });
		await updateProjectFocus(user.id, params.id, parsed.data);
		return { focusUpdated: true };
	},

	createNote: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), noteSchema);
		if (!parsed.ok) return fail(400, { noteErrors: parsed.errors, noteValues: parsed.values });
		await createNote(user.id, params.id, parsed.data);
		return { noteCreated: true };
	},

	deleteNote: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), noteIdSchema);
		if (!parsed.ok) return fail(400, { noteErrors: parsed.errors });
		await deleteNote(user.id, parsed.data.noteId);
		return { noteDeleted: true };
	},

	createResource: async ({ request, locals, params }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), resourceSchema);
		if (!parsed.ok) {
			return fail(400, { resourceErrors: parsed.errors, resourceValues: parsed.values });
		}
		await createResource(user.id, params.id, parsed.data);
		return { resourceCreated: true };
	},

	deleteResource: async ({ request, locals }) => {
		const user = requireUser(locals);
		const parsed = parseForm(await request.formData(), resourceIdSchema);
		if (!parsed.ok) return fail(400, { resourceErrors: parsed.errors });
		await deleteResource(user.id, parsed.data.resourceId);
		return { resourceDeleted: true };
	}
};
