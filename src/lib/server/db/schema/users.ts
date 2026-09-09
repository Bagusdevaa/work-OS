import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './columns';

/** Application users. `id` mirrors the Supabase Auth user id. */
export const users = pgTable('users', {
	id: uuid('id').primaryKey(),
	email: text('email').notNull().unique(),
	displayName: text('display_name'),
	...timestamps
});

/** Owner column used by every user-scoped table. */
export const ownerId = () =>
	uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' });
