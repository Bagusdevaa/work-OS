<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import type { CompanySummary } from '../company.types';
	import { companyInitial } from '../company.utils';

	interface Props {
		company: CompanySummary;
	}

	let { company }: Props = $props();
</script>

<a href="/companies/{company.id}" class="company-card">
	<div class="company-card__head">
		<Swatch accent={company.accent} size="lg" label={companyInitial(company.name)} />
		<div class="company-card__title">
			<span class="company-card__name">{company.name}</span>
			{#if company.status === 'archived'}
				<Badge tone="neutral" size="sm">Archived</Badge>
			{/if}
		</div>
	</div>
	{#if company.description}
		<p class="company-card__description">{company.description}</p>
	{/if}
	<p class="company-card__meta">
		{company.inFlightProjects} in flight · {company.totalProjects}
		{company.totalProjects === 1 ? 'project' : 'projects'} · {company.areaCount}
		{company.areaCount === 1 ? 'area' : 'areas'}
	</p>
</a>

<style>
	.company-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		color: inherit;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}
	.company-card:hover {
		text-decoration: none;
		border-color: var(--color-primary-300);
		box-shadow: var(--shadow-md);
	}
	.company-card__head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.company-card__title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}
	.company-card__name {
		font-size: var(--text-body-1);
		font-weight: var(--weight-semibold);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.company-card__description {
		color: var(--color-text-secondary);
		font-size: var(--text-small);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.company-card__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
