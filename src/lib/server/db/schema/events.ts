import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { companies } from './companies';
import { projects } from './projects';
import { ownerId } from './users';

export const events = pgTable(
	'events',
	{
		id: id(),
		userId: ownerId(),
		projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
		companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
		title: text('title').notNull(),
		description: text('description'),
		startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
		endsAt: timestamp('ends_at', { withTimezone: true }),
		allDay: boolean('all_day').notNull().default(false),
		...timestamps
	},
	(t) => [
		index('events_user_id_starts_at_idx').on(t.userId, t.startsAt),
		index('events_project_id_idx').on(t.projectId)
	]
);
