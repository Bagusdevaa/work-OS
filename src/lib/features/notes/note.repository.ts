import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { notes } from '$lib/server/db/schema';
import type { NoteInput } from './note.schema';
import type { Note } from './note.types';

export function findNotesByProject(userId: string, projectId: string): Promise<Note[]> {
	return db
		.select()
		.from(notes)
		.where(and(eq(notes.userId, userId), eq(notes.projectId, projectId)))
		.orderBy(desc(notes.pinned), desc(notes.updatedAt));
}

export async function createNote(
	userId: string,
	projectId: string,
	input: NoteInput
): Promise<Note> {
	const [row] = await db
		.insert(notes)
		.values({ userId, projectId, title: input.title, content: input.content ?? '' })
		.returning();
	return row;
}

export async function deleteNote(userId: string, id: string): Promise<Note | null> {
	const [row] = await db
		.delete(notes)
		.where(and(eq(notes.id, id), eq(notes.userId, userId)))
		.returning();
	return row ?? null;
}
