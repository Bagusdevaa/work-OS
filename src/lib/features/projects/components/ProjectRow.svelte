<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { describeTimeAgo } from '$lib/utils/dates';
	import type { ProjectHealth } from '../project-health';
	import type { Project } from '../project.types';
	import HealthBadge from './HealthBadge.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';

	interface Props {
		project: Project & { health?: ProjectHealth };
	}

	let { project }: Props = $props();
	const inFlight = $derived(['planning', 'active', 'blocked'].includes(project.status));
</script>

<a href="/projects/{project.id}" class="row">
	<div class="row__main">
		<span class="row__name">{project.name}</span>
		{#if project.nextAction}
			<span class="row__next">Next: {project.nextAction}</span>
		{/if}
	</div>
	<div class="row__meta">
		{#if project.health && inFlight}
			<HealthBadge state={project.health.state} reasons={project.health.reasons} />
		{/if}
		<ProjectStatusBadge status={project.status} />
		<span class="row__time">{describeTimeAgo(project.lastActivityAt)}</span>
		<ChevronRight size={16} class="row__chevron" aria-hidden="true" />
	</div>
</a>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-2);
		border-bottom: 1px solid var(--color-border);
		color: inherit;
		border-radius: var(--radius-sm);
	}
	.row:last-child {
		border-bottom: none;
	}
	.row:hover {
		background: var(--color-surface-hover);
		text-decoration: none;
	}
	.row__main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.row__name {
		font-weight: var(--weight-medium);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row__next {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row__meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
		color: var(--color-text-muted);
	}
	.row__time {
		font-size: var(--text-xs);
	}
	@media (max-width: 767px) {
		.row__time {
			display: none;
		}
	}
</style>
