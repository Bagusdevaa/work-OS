<script lang="ts">
	import PriorityBadge from '$lib/components/shared/PriorityBadge.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import { describeDueDate, describeTimeAgo, todayISO } from '$lib/utils/dates';
	import type { ProjectWithContext } from '../project.types';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';

	interface Props {
		project: ProjectWithContext;
	}

	let { project }: Props = $props();
	const today = todayISO();
</script>

<a href="/projects/{project.id}" class="project-card">
	<div class="project-card__context">
		<Swatch accent={project.companyAccent} size="sm" />
		<span class="project-card__company">{project.companyName}</span>
		{#if project.areaName}<span class="project-card__area">· {project.areaName}</span>{/if}
	</div>
	<h3 class="project-card__name">{project.name}</h3>
	<div class="project-card__badges">
		<ProjectStatusBadge status={project.status} />
		<PriorityBadge priority={project.priority} />
	</div>
	{#if project.nextAction}
		<p class="project-card__next">
			<span class="project-card__label">Next</span>{project.nextAction}
		</p>
	{:else if project.description}
		<p class="project-card__description">{project.description}</p>
	{/if}
	<p class="project-card__meta">
		<span>Active {describeTimeAgo(project.lastActivityAt).toLowerCase()}</span>
		{#if project.dueDate}<span>· {describeDueDate(project.dueDate, today)}</span>{/if}
	</p>
</a>

<style>
	.project-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		color: inherit;
		min-width: 0;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}
	.project-card:hover {
		text-decoration: none;
		border-color: var(--color-primary-300);
		box-shadow: var(--shadow-md);
	}
	.project-card__context {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-width: 0;
	}
	.project-card__company {
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
	}
	.project-card__name {
		font-size: var(--text-body-1);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-tight);
	}
	.project-card__badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.project-card__next,
	.project-card__description {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.project-card__label {
		display: inline-block;
		margin-right: var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary-600);
	}
	.project-card__meta {
		display: flex;
		gap: var(--space-1);
		margin-top: auto;
		padding-top: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
