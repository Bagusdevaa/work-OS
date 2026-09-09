import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { id } from './columns';
import { companies } from './companies';
import { projects } from './projects';
import { ownerId } from './users';

/** Append-only log of meaningful user actions, used for activity feeds and reviews. */
export const activities = pgTable(
	'activities',
	{
		id: id(),
		userId: ownerId(),
		projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
		companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
		entityType: text('entity_type').notNull(),
		entityId: uuid('entity_id').notNull(),
		action: text('action').notNull(),
		summary: text('summary').notNull(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('activities_user_id_created_at_idx').on(t.userId, t.createdAt),
		index('activities_project_id_created_at_idx').on(t.projectId, t.createdAt)
	]
);
