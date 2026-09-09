import type { inboxItems } from '$lib/server/db/schema';

export type InboxItem = typeof inboxItems.$inferSelect;
export type NewInboxItem = typeof inboxItems.$inferInsert;

export interface InboxItemWithLinks extends InboxItem {
	convertedTaskTitle: string | null;
	convertedProjectName: string | null;
}
