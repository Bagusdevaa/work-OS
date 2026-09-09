import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { projects } from './projects';
import { ownerId } from './users';

export const notes = pgTable(
	'notes',
	{
		id: id(),
		userId: ownerId(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		content: text('content').notNull().default(''),
		pinned: boolean('pinned').notNull().default(false),
		...timestamps
	},
	(t) => [index('notes_user_id_idx').on(t.userId), index('notes_project_id_idx').on(t.projectId)]
);
