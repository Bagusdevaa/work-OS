import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { weeklyReviews } from '$lib/server/db/schema';
import type { ReviewInput } from './review.schema';
import type { WeeklyReview } from './review.types';

export async function findReviewByWeek(
	userId: string,
	weekStart: string
): Promise<WeeklyReview | null> {
	const [row] = await db
		.select()
		.from(weeklyReviews)
		.where(and(eq(weeklyReviews.userId, userId), eq(weeklyReviews.weekStart, weekStart)))
		.limit(1);
	return row ?? null;
}

export function findReviews(userId: string, limit = 26): Promise<WeeklyReview[]> {
	return db
		.select()
		.from(weeklyReviews)
		.where(eq(weeklyReviews.userId, userId))
		.orderBy(desc(weeklyReviews.weekStart))
		.limit(limit);
}

export async function upsertReview(
	userId: string,
	weekStart: string,
	input: ReviewInput,
	summary: Record<string, unknown>
): Promise<WeeklyReview> {
	const [row] = await db
		.insert(weeklyReviews)
		.values({ userId, weekStart, ...input, summary })
		.onConflictDoUpdate({
			target: [weeklyReviews.userId, weeklyReviews.weekStart],
			set: { ...input, summary, updatedAt: new Date() }
		})
		.returning();
	return row;
}
