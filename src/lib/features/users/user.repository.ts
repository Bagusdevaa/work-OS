import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { users } from '$lib/server/db/schema';
import type { AppUser, NewAppUser } from './user.types';

export async function findUserById(id: string): Promise<AppUser | null> {
	const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return row ?? null;
}

/** Inserts the user if missing; returns the stored row either way. */
export async function ensureUser(input: NewAppUser): Promise<AppUser> {
	const [row] = await db
		.insert(users)
		.values(input)
		.onConflictDoUpdate({ target: users.id, set: { email: input.email } })
		.returning();
	return row;
}
