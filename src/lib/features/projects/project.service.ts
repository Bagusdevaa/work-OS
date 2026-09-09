import { error } from '@sveltejs/kit';
import { logActivity, type LogActivityInput } from '$lib/features/activities/activity.service';
import { findAreaById } from '$lib/features/areas/area.repository';
import { findCompanyById } from '$lib/features/companies/company.repository';
import type { FormErrors } from '$lib/server/forms';
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '$lib/types/domain';
import * as repo from './project.repository';
import type { ProjectFocusInput, ProjectInput } from './project.schema';
import type { Project, ProjectWithContext } from './project.types';
import { sortProjectsForList, statusTransitionPatch } from './project.utils';

export async function listProjects(userId: string, filter?: repo.ProjectFilter) {
	return sortProjectsForList(await repo.findProjects(userId, filter));
}

export async function requireProject(userId: string, id: string): Promise<ProjectWithContext> {
	const project = await repo.findProjectById(userId, id);
	if (!project) error(404, 'Project not found');
	return project;
}

/** Checks that the referenced company and area exist and belong together. */
export async function validateProjectRefs(
	userId: string,
	input: Pick<ProjectInput, 'companyId' | 'areaId'>
): Promise<FormErrors | null> {
	const company = await findCompanyById(userId, input.companyId);
	if (!company) return { companyId: 'Choose a company' };
	if (input.areaId) {
		const area = await findAreaById(userId, input.areaId);
		if (!area || area.companyId !== company.id) {
			return { areaId: 'Choose an area that belongs to the selected company' };
		}
	}
	return null;
}

export async function createProject(userId: string, input: ProjectInput): Promise<Project> {
	const stamps = statusTransitionPatch(
		{ status: 'idea', startedAt: input.startedAt, completedAt: null },
		input.status,
		new Date()
	);
	const project = await repo.createProject({ ...input, ...stamps, userId });
	await logActivity(userId, {
		entityType: 'project',
		entityId: project.id,
		projectId: project.id,
		companyId: project.companyId,
		action: 'created',
		summary: `Created project "${project.name}"`
	});
	return project;
}

export async function updateProject(
	userId: string,
	id: string,
	input: ProjectInput
): Promise<Project> {
	const current = await requireProject(userId, id);
	const stamps = statusTransitionPatch(
		{ ...current, startedAt: input.startedAt ?? current.startedAt },
		input.status,
		new Date()
	);
	const project = await repo.updateProject(userId, id, {
		...input,
		...stamps,
		lastActivityAt: new Date()
	});
	if (!project) error(404, 'Project not found');
	await logActivity(userId, {
		entityType: 'project',
		entityId: project.id,
		projectId: project.id,
		companyId: project.companyId,
		action: current.status === project.status ? 'updated' : 'status_changed',
		summary:
			current.status === project.status
				? `Updated project "${project.name}"`
				: `Moved "${project.name}" to ${PROJECT_STATUS_LABELS[project.status]}`
	});
	return project;
}

export async function setProjectStatus(
	userId: string,
	id: string,
	status: ProjectStatus
): Promise<Project> {
	const current = await requireProject(userId, id);
	if (current.status === status) return current;
	const patch = statusTransitionPatch(current, status, new Date());
	const project = await repo.updateProject(userId, id, { ...patch, lastActivityAt: new Date() });
	if (!project) error(404, 'Project not found');
	await logActivity(userId, {
		entityType: 'project',
		entityId: project.id,
		projectId: project.id,
		companyId: project.companyId,
		action: status === 'completed' ? 'completed' : 'status_changed',
		summary: `Moved "${project.name}" to ${PROJECT_STATUS_LABELS[status]}`
	});
	return project;
}

export async function updateProjectFocus(
	userId: string,
	id: string,
	input: ProjectFocusInput
): Promise<Project> {
	const project = await repo.updateProject(userId, id, { ...input, lastActivityAt: new Date() });
	if (!project) error(404, 'Project not found');
	await logActivity(userId, {
		entityType: 'project',
		entityId: project.id,
		projectId: project.id,
		companyId: project.companyId,
		action: 'updated',
		summary: input.nextAction
			? `Set next action for "${project.name}": ${input.nextAction}`
			: `Updated focus for "${project.name}"`
	});
	return project;
}

/**
 * Logs an activity that belongs to a project and bumps the project's last-activity timestamp.
 * Used by milestones, tasks, notes and resources.
 */
export async function recordProjectActivity(
	userId: string,
	projectId: string,
	input: Omit<LogActivityInput, 'projectId' | 'companyId'>
): Promise<void> {
	const project = await repo.updateProject(userId, projectId, { lastActivityAt: new Date() });
	if (!project) error(404, 'Project not found');
	await logActivity(userId, { ...input, projectId: project.id, companyId: project.companyId });
}
