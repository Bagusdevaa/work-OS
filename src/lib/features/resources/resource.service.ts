import { error } from '@sveltejs/kit';
import { recordProjectActivity } from '$lib/features/projects/project.service';
import * as repo from './resource.repository';
import type { ResourceInput } from './resource.schema';
import type { Resource } from './resource.types';

export function listResourcesForProject(userId: string, projectId: string) {
	return repo.findResourcesByProject(userId, projectId);
}

export async function createResource(
	userId: string,
	projectId: string,
	input: ResourceInput
): Promise<Resource> {
	const resource = await repo.createResource(userId, projectId, input);
	await recordProjectActivity(userId, projectId, {
		entityType: 'resource',
		entityId: resource.id,
		action: 'created',
		summary: `Added resource "${resource.title}"`
	});
	return resource;
}

export async function deleteResource(userId: string, id: string): Promise<void> {
	const resource = await repo.deleteResource(userId, id);
	if (!resource) error(404, 'Resource not found');
	await recordProjectActivity(userId, resource.projectId, {
		entityType: 'resource',
		entityId: resource.id,
		action: 'deleted',
		summary: `Removed resource "${resource.title}"`
	});
}
