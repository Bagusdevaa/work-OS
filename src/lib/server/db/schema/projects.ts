import { date, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { areas } from './areas';
import { id, timestamps } from './columns';
import { companies } from './companies';
import { priorityEnum, projectStatusEnum, projectTypeEnum } from './enums';
import { ownerId } from './users';

export const projects = pgTable(
	'projects',
	{
		id: id(),
		userId: ownerId(),
		companyId: uuid('company_id')
			.notNull()
			.references(() => companies.id, { onDelete: 'cascade' }),
		areaId: uuid('area_id').references(() => areas.id, { onDelete: 'set null' }),
		name: text('name').notNull(),
		description: text('description'),
		status: projectStatusEnum('status').notNull().default('idea'),
		type: projectTypeEnum('type').notNull().default('work'),
		priority: priorityEnum('priority').notNull().default('medium'),
		startedAt: date('started_at', { mode: 'string' }),
		dueDate: date('due_date', { mode: 'string' }),
		lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull().defaultNow(),
		why: text('why'),
		goal: text('goal'),
		currentFocus: text('current_focus'),
		nextAction: text('next_action'),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		...timestamps
	},
	(t) => [
		index('projects_user_id_idx').on(t.userId),
		index('projects_company_id_idx').on(t.companyId),
		index('projects_area_id_idx').on(t.areaId),
		index('projects_status_idx').on(t.status),
		index('projects_due_date_idx').on(t.dueDate)
	]
);
