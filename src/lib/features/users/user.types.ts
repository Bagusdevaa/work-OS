import type { users } from '$lib/server/db/schema';

export type AppUser = typeof users.$inferSelect;
export type NewAppUser = typeof users.$inferInsert;
