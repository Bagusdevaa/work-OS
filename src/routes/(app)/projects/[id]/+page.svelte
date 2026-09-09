<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import PriorityBadge from '$lib/components/shared/PriorityBadge.svelte';
	import ActivityList from '$lib/features/activities/components/ActivityList.svelte';
	import MilestoneList from '$lib/features/milestones/components/MilestoneList.svelte';
	import NoteList from '$lib/features/notes/components/NoteList.svelte';
	import ProjectFocusCard from '$lib/features/projects/components/ProjectFocusCard.svelte';
	import ProjectStatusBadge from '$lib/features/projects/components/ProjectStatusBadge.svelte';
	import ProjectStatusSelect from '$lib/features/projects/components/ProjectStatusSelect.svelte';
	import ResourceList from '$lib/features/resources/components/ResourceList.svelte';
	import { PROJECT_TYPE_LABELS } from '$lib/types/domain';
	import { describeDueDate, describeTimeAgo, formatDate, todayISO } from '$lib/utils/dates';

	let { data, form } = $props();
	const project = $derived(data.project);
	const today = todayISO();
	const milestonesDone = $derived(data.milestones.filter((m) => m.status === 'completed').length);
</script>

<svelte:head>
	<title>{project.name} · Work OS</title>
</svelte:head>

<PageHeader
	title={project.name}
	description={project.description ?? undefined}
	back={{ href: '/projects', label: 'Projects' }}
>
	{#snippet eyebrow()}
		<a href="/companies/{project.companyId}" class="context">
			<Swatch accent={project.companyAccent} size="sm" />
			{project.companyName}
		</a>
		{#if project.areaName}<span class="context context--muted">· {project.areaName}</span>{/if}
	{/snippet}
	{#snippet actions()}
		<ProjectStatusSelect status={project.status} />
		<Button href="/projects/{project.id}/edit" variant="secondary">
			<Pencil size={16} aria-hidden="true" />
			Edit
		</Button>
	{/snippet}
</PageHeader>

<div class="meta">
	<ProjectStatusBadge status={project.status} size="md" />
	<PriorityBadge priority={project.priority} size="md" />
	<Badge tone="neutral">{PROJECT_TYPE_LABELS[project.type]}</Badge>
	<span class="meta__text">
		{#if project.startedAt}Started {formatDate(project.startedAt)} ·{/if}
		{#if project.dueDate}{describeDueDate(project.dueDate, today)} ·{/if}
		Last activity {describeTimeAgo(project.lastActivityAt).toLowerCase()}
	</span>
</div>

{#if form?.statusError}
	<p class="form-error" role="alert">{form.statusError}</p>
{/if}

<div class="layout">
	<div class="layout__main">
		<ProjectFocusCard {project} errors={form?.focusErrors} open={!!form?.focusErrors} />

		<Card>
			<Section
				title="Milestones"
				meta={data.milestones.length
					? `${milestonesDone}/${data.milestones.length} completed`
					: undefined}
			>
				<MilestoneList
					milestones={data.milestones}
					values={form?.milestoneValues}
					errors={form?.milestoneErrors}
					open={!!form?.milestoneErrors}
				/>
			</Section>
		</Card>

		<Card>
			<Section title="Recent activity">
				<ActivityList
					activities={data.activity}
					emptyText="Work on this project will show up here."
				/>
			</Section>
		</Card>
	</div>

	<div class="layout__side">
		{#if project.why || project.goal}
			<Card>
				<dl class="context-list">
					{#if project.why}
						<div>
							<dt>Why</dt>
							<dd>{project.why}</dd>
						</div>
					{/if}
					{#if project.goal}
						<div>
							<dt>Goal</dt>
							<dd>{project.goal}</dd>
						</div>
					{/if}
				</dl>
			</Card>
		{/if}

		<Card>
			<Section title="Notes" meta={data.notes.length ? String(data.notes.length) : undefined}>
				<NoteList
					notes={data.notes}
					values={form?.noteValues}
					errors={form?.noteErrors}
					open={!!form?.noteErrors}
				/>
			</Section>
		</Card>

		<Card>
			<Section
				title="Resources"
				meta={data.resources.length ? String(data.resources.length) : undefined}
			>
				<ResourceList
					resources={data.resources}
					values={form?.resourceValues}
					errors={form?.resourceErrors}
					open={!!form?.resourceErrors}
				/>
			</Section>
		</Card>
	</div>
</div>

<style>
	.context {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
	}
	.context--muted {
		color: var(--color-text-muted);
		font-weight: var(--weight-regular);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-top: calc(-1 * var(--space-4));
		margin-bottom: var(--space-8);
	}
	.meta__text {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.form-error {
		color: var(--color-danger-text);
		font-size: var(--text-small);
		margin-bottom: var(--space-4);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
		gap: var(--space-6);
		align-items: start;
	}
	.layout__main,
	.layout__side {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		min-width: 0;
	}
	.context-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin: 0;
	}
	.context-list dt {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		margin-bottom: 2px;
	}
	.context-list dd {
		margin: 0;
		font-size: var(--text-body-2);
		color: var(--color-text-secondary);
		white-space: pre-wrap;
	}
	@media (max-width: 1023px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 767px) {
		.meta {
			margin-top: calc(-1 * var(--space-2));
			margin-bottom: var(--space-6);
		}
	}
</style>
