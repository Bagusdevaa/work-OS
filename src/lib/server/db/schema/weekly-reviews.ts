import { date, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { id, timestamps } from './columns';
import { ownerId } from './users';

export const weeklyReviews = pgTable(
	'weekly_reviews',
	{
		id: id(),
		userId: ownerId(),
		weekStart: date('week_start', { mode: 'string' }).notNull(),
		wins: text('wins'),
		problems: text('problems'),
		lessons: text('lessons'),
		nextWeekPriorities: text('next_week_priorities'),
		summary: jsonb('summary').$type<Record<string, unknown>>(),
		...timestamps
	},
	(t) => [uniqueIndex('weekly_reviews_user_week_idx').on(t.userId, t.weekStart)]
);
