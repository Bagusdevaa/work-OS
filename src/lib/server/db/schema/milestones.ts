import { date, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { milestoneStatusEnum } from './enums';
import { projects } from './projects';
import { ownerId } from './users';

export const milestones = pgTable(
	'milestones',
	{
		id: id(),
		userId: ownerId(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		status: milestoneStatusEnum('status').notNull().default('planned'),
		dueDate: date('due_date', { mode: 'string' }),
		sortOrder: integer('sort_order').notNull().default(0),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		...timestamps
	},
	(t) => [
		index('milestones_user_id_idx').on(t.userId),
		index('milestones_project_id_idx').on(t.projectId),
		index('milestones_due_date_idx').on(t.dueDate)
	]
);
