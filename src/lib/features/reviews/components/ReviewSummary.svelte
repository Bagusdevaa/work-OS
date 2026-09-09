<script lang="ts">
	import Activity from '@lucide/svelte/icons/activity';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Flag from '@lucide/svelte/icons/flag';
	import Card from '$lib/components/ui/Card.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import HealthBadge from '$lib/features/projects/components/HealthBadge.svelte';
	import { formatDate } from '$lib/utils/dates';
	import { pluralize } from '$lib/utils/text';
	import type { WeeklySummary } from '../review.utils';

	interface Props {
		summary: WeeklySummary;
	}

	let { summary }: Props = $props();
	const attention = $derived([...summary.stalledProjects, ...summary.needsAttentionProjects]);
</script>

<div class="stats">
	<Stat
		label="Tasks done"
		value={summary.completedTasks.length}
		icon={CircleCheck}
		tone="success"
	/>
	<Stat
		label="Milestones done"
		value={summary.completedMilestones.length}
		icon={Flag}
		tone="primary"
	/>
	<Stat
		label="Overdue"
		value={summary.overdueTasks.length}
		icon={CircleAlert}
		tone={summary.overdueTasks.length ? 'danger' : 'neutral'}
	/>
	<Stat label="Activity" value={summary.activityCount} icon={Activity} hint="logged actions" />
</div>

<div class="grid">
	<Card>
		<Section title="Completed" meta={pluralize(summary.completedTasks.length, 'task')}>
			{#if summary.completedTasks.length === 0 && summary.completedMilestones.length === 0}
				<p class="muted">Nothing was completed this week.</p>
			{:else}
				<ul class="list">
					{#each summary.completedMilestones as m (m.id)}
						<li class="list__item">
							<Flag size={14} aria-hidden="true" />
							<a href="/projects/{m.projectId}">{m.name}</a>
							<span class="muted">milestone · {m.projectName}</span>
						</li>
					{/each}
					{#each summary.completedTasks as t (t.id)}
						<li class="list__item">
							<CircleCheck size={14} aria-hidden="true" />
							<a href="/tasks/{t.id}">{t.title}</a>
							<span class="muted">{t.projectName}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</Section>
	</Card>

	<Card>
		<Section title="Projects" meta="{summary.activeProjects.length} in flight">
			{#if summary.activeProjects.length === 0}
				<p class="muted">No projects in flight.</p>
			{:else}
				<ul class="list">
					{#each summary.activeProjects as p (p.id)}
						<li class="list__item">
							<HealthBadge state={p.health.state} reasons={p.health.reasons} />
							<a href="/projects/{p.id}">{p.name}</a>
						</li>
					{/each}
				</ul>
				{#if attention.length}
					<p class="attention">
						{pluralize(attention.length, 'project')}
						{attention.length === 1 ? 'needs' : 'need'} attention: {attention
							.map((p) => `${p.name} (${p.health.reasons[0] ?? p.health.state})`)
							.join('; ')}
					</p>
				{/if}
			{/if}
		</Section>
	</Card>

	<Card>
		<Section title="Overdue" meta={pluralize(summary.overdueTasks.length, 'task')}>
			{#if summary.overdueTasks.length === 0}
				<p class="muted">Nothing overdue. Nice.</p>
			{:else}
				<ul class="list">
					{#each summary.overdueTasks as t (t.id)}
						<li class="list__item">
							<CircleAlert size={14} aria-hidden="true" class="danger" />
							<a href="/tasks/{t.id}">{t.title}</a>
							<span class="muted">due {formatDate(t.dueDate!, 'short')} · {t.projectName}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</Section>
	</Card>

	<Card>
		<Section
			title="Next week"
			meta={pluralize(summary.nextWeekTasks.length, 'task due', 'tasks due')}
		>
			{#if summary.nextWeekTasks.length === 0}
				<p class="muted">No tasks are due next week yet.</p>
			{:else}
				<ul class="list">
					{#each summary.nextWeekTasks as t (t.id)}
						<li class="list__item">
							<span class="date">{formatDate(t.dueDate!, 'short')}</span>
							<a href="/tasks/{t.id}">{t.title}</a>
							<span class="muted">{t.projectName}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</Section>
	</Card>
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-6);
		align-items: start;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.list__item {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-size: var(--text-body-2);
	}
	.list__item a {
		color: var(--color-text);
		font-weight: var(--weight-medium);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.muted {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.date {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text-secondary);
		min-width: 48px;
	}
	.attention {
		margin-top: var(--space-3);
		font-size: var(--text-small);
		color: var(--color-warning-text);
	}
	.list__item :global(.danger) {
		color: var(--color-danger);
	}
	@media (max-width: 1279px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 1023px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
