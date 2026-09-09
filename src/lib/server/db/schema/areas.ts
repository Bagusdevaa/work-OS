import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { companies } from './companies';
import { ownerId } from './users';

export const areas = pgTable(
	'areas',
	{
		id: id(),
		userId: ownerId(),
		companyId: uuid('company_id')
			.notNull()
			.references(() => companies.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		...timestamps
	},
	(t) => [index('areas_user_id_idx').on(t.userId), index('areas_company_id_idx').on(t.companyId)]
);
