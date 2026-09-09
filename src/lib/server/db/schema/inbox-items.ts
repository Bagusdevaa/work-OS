import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { inboxKindEnum, inboxStatusEnum } from './enums';
import { projects } from './projects';
import { tasks } from './tasks';
import { ownerId } from './users';

export const inboxItems = pgTable(
	'inbox_items',
	{
		id: id(),
		userId: ownerId(),
		content: text('content').notNull(),
		url: text('url'),
		kind: inboxKindEnum('kind').notNull().default('task'),
		status: inboxStatusEnum('status').notNull().default('open'),
		processedAt: timestamp('processed_at', { withTimezone: true }),
		convertedTaskId: uuid('converted_task_id').references(() => tasks.id, { onDelete: 'set null' }),
		convertedProjectId: uuid('converted_project_id').references(() => projects.id, {
			onDelete: 'set null'
		}),
		...timestamps
	},
	(t) => [index('inbox_items_user_id_status_idx').on(t.userId, t.status)]
);
