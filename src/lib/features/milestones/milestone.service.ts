import { error } from '@sveltejs/kit';
import { recordProjectActivity, requireProject } from '$lib/features/projects/project.service';
import type { MilestoneStatus } from '$lib/types/domain';
import * as repo from './milestone.repository';
import type { MilestoneInput } from './milestone.schema';
import type { Milestone, MilestoneWithProgress } from './milestone.types';
import { calculateMilestoneProgress, sortMilestones } from './milestone.utils';

export async function listMilestonesForProject(
	userId: string,
	projectId: string
): Promise<MilestoneWithProgress[]> {
	const rows = await repo.findMilestonesByProject(userId, projectId);
	return sortMilestones(
		rows.map(({ taskTotal, taskDone, ...milestone }) => ({
			...milestone,
			progress: calculateMilestoneProgress({ total: taskTotal, done: taskDone })
		}))
	);
}

export async function createMilestone(
	userId: string,
	projectId: string,
	input: MilestoneInput
): Promise<Milestone> {
	const project = await requireProject(userId, projectId);
	const milestone = await repo.createMilestone({ ...input, userId, projectId: project.id });
	await recordProjectActivity(userId, project.id, {
		entityType: 'milestone',
		entityId: milestone.id,
		action: 'created',
		summary: `Added milestone "${milestone.name}"`
	});
	return milestone;
}

export async function setMilestoneStatus(
	userId: string,
	id: string,
	status: MilestoneStatus
): Promise<Milestone> {
	const milestone = await repo.updateMilestone(userId, id, {
		status,
		completedAt: status === 'completed' ? new Date() : null
	});
	if (!milestone) error(404, 'Milestone not found');
	await recordProjectActivity(userId, milestone.projectId, {
		entityType: 'milestone',
		entityId: milestone.id,
		action: status === 'completed' ? 'completed' : 'status_changed',
		summary:
			status === 'completed'
				? `Completed milestone "${milestone.name}"`
				: `Reopened milestone "${milestone.name}"`
	});
	return milestone;
}

export async function deleteMilestone(userId: string, id: string): Promise<void> {
	const milestone = await repo.deleteMilestone(userId, id);
	if (!milestone) error(404, 'Milestone not found');
	await recordProjectActivity(userId, milestone.projectId, {
		entityType: 'milestone',
		entityId: milestone.id,
		action: 'deleted',
		summary: `Removed milestone "${milestone.name}"`
	});
}
