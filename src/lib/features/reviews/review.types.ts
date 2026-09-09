import type { weeklyReviews } from '$lib/server/db/schema';

export type WeeklyReview = typeof weeklyReviews.$inferSelect;
export type NewWeeklyReview = typeof weeklyReviews.$inferInsert;
