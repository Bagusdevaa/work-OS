import type { milestones } from '$lib/server/db/schema';
import type { MilestoneProgress } from './milestone.utils';

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export interface MilestoneWithCounts extends Milestone {
	taskTotal: number;
	taskDone: number;
}

export interface MilestoneWithProgress extends Milestone {
	progress: MilestoneProgress;
}
