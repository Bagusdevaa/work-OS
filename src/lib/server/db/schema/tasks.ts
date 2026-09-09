import { date, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { priorityEnum, taskStatusEnum } from './enums';
import { milestones } from './milestones';
import { projects } from './projects';
import { ownerId } from './users';

export const tasks = pgTable(
	'tasks',
	{
		id: id(),
		userId: ownerId(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		milestoneId: uuid('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
		title: text('title').notNull(),
		description: text('description'),
		status: taskStatusEnum('status').notNull().default('todo'),
		priority: priorityEnum('priority').notNull().default('medium'),
		dueDate: date('due_date', { mode: 'string' }),
		estimatedMinutes: integer('estimated_minutes'),
		sortOrder: integer('sort_order').notNull().default(0),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		...timestamps
	},
	(t) => [
		index('tasks_user_id_idx').on(t.userId),
		index('tasks_project_id_idx').on(t.projectId),
		index('tasks_milestone_id_idx').on(t.milestoneId),
		index('tasks_status_idx').on(t.status),
		index('tasks_due_date_idx').on(t.dueDate)
	]
);
