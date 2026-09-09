import { error } from '@sveltejs/kit';
import { recordProjectActivity } from '$lib/features/projects/project.service';
import * as repo from './note.repository';
import type { NoteInput } from './note.schema';
import type { Note } from './note.types';

export function listNotesForProject(userId: string, projectId: string) {
	return repo.findNotesByProject(userId, projectId);
}

export async function createNote(
	userId: string,
	projectId: string,
	input: NoteInput
): Promise<Note> {
	const note = await repo.createNote(userId, projectId, input);
	await recordProjectActivity(userId, projectId, {
		entityType: 'note',
		entityId: note.id,
		action: 'created',
		summary: `Added note "${note.title}"`
	});
	return note;
}

export async function deleteNote(userId: string, id: string): Promise<void> {
	const note = await repo.deleteNote(userId, id);
	if (!note) error(404, 'Note not found');
	await recordProjectActivity(userId, note.projectId, {
		entityType: 'note',
		entityId: note.id,
		action: 'deleted',
		summary: `Removed note "${note.title}"`
	});
}
