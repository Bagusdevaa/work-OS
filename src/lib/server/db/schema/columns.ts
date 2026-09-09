import { timestamp, uuid } from 'drizzle-orm/pg-core';

/** Standard primary key: generated UUID. */
export const id = () => uuid('id').primaryKey().defaultRandom();

/** Standard audit timestamps (timezone-aware). */
export const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
};
