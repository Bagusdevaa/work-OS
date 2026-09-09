import { index, pgTable, text } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { companyStatusEnum } from './enums';
import { ownerId } from './users';

export const companies = pgTable(
	'companies',
	{
		id: id(),
		userId: ownerId(),
		name: text('name').notNull(),
		description: text('description'),
		accent: text('accent'),
		status: companyStatusEnum('status').notNull().default('active'),
		...timestamps
	},
	(t) => [index('companies_user_id_idx').on(t.userId)]
);
