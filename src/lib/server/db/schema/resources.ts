import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { resourceKindEnum } from './enums';
import { projects } from './projects';
import { ownerId } from './users';

export const resources = pgTable(
	'resources',
	{
		id: id(),
		userId: ownerId(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		url: text('url'),
		kind: resourceKindEnum('kind').notNull().default('link'),
		description: text('description'),
		...timestamps
	},
	(t) => [
		index('resources_user_id_idx').on(t.userId),
		index('resources_project_id_idx').on(t.projectId)
	]
);
