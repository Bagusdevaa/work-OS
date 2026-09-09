<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import type { ProjectWithHealth } from '../project.types';
	import HealthBadge from './HealthBadge.svelte';

	interface Props {
		projects: ProjectWithHealth[];
	}

	let { projects }: Props = $props();
</script>

<div class="attention">
	{#each projects as project (project.id)}
		<a href="/projects/{project.id}" class="item">
			<div class="item__main">
				<div class="item__head">
					<span class="item__name">{project.name}</span>
					<HealthBadge state={project.health.state} />
				</div>
				<span class="item__context">
					<Swatch accent={project.companyAccent} size="sm" />
					{project.companyName}
				</span>
				<p class="item__reasons">{project.health.reasons.join(' · ')}</p>
				{#if project.nextAction}
					<p class="item__next"><span>Next</span>{project.nextAction}</p>
				{/if}
			</div>
			<ChevronRight size={16} class="item__chevron" aria-hidden="true" />
		</a>
	{/each}
</div>

<style>
	.attention {
		display: flex;
		flex-direction: column;
	}
	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-2);
		border-bottom: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: inherit;
	}
	.item:last-child {
		border-bottom: none;
	}
	.item:hover {
		background: var(--color-surface-hover);
		text-decoration: none;
	}
	.item__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}
	.item__head {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.item__name {
		font-weight: var(--weight-semibold);
	}
	.item__context {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.item__reasons {
		font-size: var(--text-small);
		color: var(--color-warning-text);
	}
	.item__next {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
	.item__next span {
		display: inline-block;
		margin-right: var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-primary-600);
	}
	.item :global(.item__chevron) {
		flex-shrink: 0;
		color: var(--color-text-muted);
	}
</style>
