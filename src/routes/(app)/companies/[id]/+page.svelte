<script lang="ts">
	import { enhance } from '$app/forms';
	import Archive from '@lucide/svelte/icons/archive';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Layers from '@lucide/svelte/icons/layers';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Zap from '@lucide/svelte/icons/zap';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import ActivityList from '$lib/features/activities/components/ActivityList.svelte';
	import AreaList from '$lib/features/areas/components/AreaList.svelte';
	import { companyInitial } from '$lib/features/companies/company.utils';
	import ProjectRow from '$lib/features/projects/components/ProjectRow.svelte';

	let { data, form } = $props();
	const archived = $derived(data.company.status === 'archived');
</script>

<svelte:head>
	<title>{data.company.name} · Work OS</title>
</svelte:head>

<PageHeader
	title={data.company.name}
	description={data.company.description ?? undefined}
	back={{ href: '/companies', label: 'Companies' }}
>
	{#snippet eyebrow()}
		<Swatch accent={data.company.accent} label={companyInitial(data.company.name)} />
		{#if archived}<Badge tone="neutral">Archived</Badge>{/if}
	{/snippet}
	{#snippet actions()}
		<Button href="/companies/{data.company.id}/edit" variant="secondary">
			<Pencil size={16} aria-hidden="true" />
			Edit
		</Button>
		{#if archived}
			<form method="POST" action="?/restore" use:enhance>
				<Button type="submit" variant="secondary">Restore</Button>
			</form>
		{:else}
			<Button href="/projects/new?company={data.company.id}">
				<Plus size={16} aria-hidden="true" />
				New project
			</Button>
		{/if}
	{/snippet}
</PageHeader>

<div class="stats">
	<Stat label="In flight" value={data.stats.inFlight} icon={Zap} tone="primary" />
	<Stat label="Completed" value={data.stats.completed} icon={CircleCheck} tone="success" />
	<Stat label="All projects" value={data.stats.total} icon={FolderKanban} />
	<Stat label="Areas" value={data.areas.length} icon={Layers} />
</div>

<div class="layout">
	<div class="layout__main">
		<Card>
			<Section title="Projects" meta="{data.projects.length} total">
				{#if data.projects.length === 0}
					<EmptyState
						size="sm"
						icon={FolderKanban}
						title="No projects yet"
						description="Projects are the unit of meaningful work. Create the first one for this company."
					>
						{#snippet action()}
							<Button href="/projects/new?company={data.company.id}" size="sm">New project</Button>
						{/snippet}
					</EmptyState>
				{:else}
					<div class="project-list">
						{#each data.projects as project (project.id)}
							<ProjectRow {project} />
						{/each}
					</div>
				{/if}
			</Section>
		</Card>

		<Card>
			<Section title="Recent activity">
				<ActivityList
					activities={data.activity}
					emptyText="Activity in this company will show up here."
				/>
			</Section>
		</Card>
	</div>

	<div class="layout__side">
		<Card>
			<Section
				title="Areas"
				description="Optional responsibilities or domains inside this company."
			>
				<AreaList areas={data.areas} values={form?.areaValues} errors={form?.areaErrors} />
			</Section>
		</Card>

		{#if !archived}
			<Card padding="sm">
				<form
					method="POST"
					action="?/archive"
					class="danger-zone"
					use:enhance
					onsubmit={(event) => {
						if (!confirm(`Archive "${data.company.name}"? You can restore it later.`)) {
							event.preventDefault();
						}
					}}
				>
					<div>
						<p class="danger-zone__title">Archive company</p>
						<p class="danger-zone__hint">Hides it from lists. Projects are kept.</p>
					</div>
					<Button type="submit" variant="ghost" size="sm">
						<Archive size={16} aria-hidden="true" />
						Archive
					</Button>
				</form>
			</Card>
		{/if}
	</div>
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
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
	.project-list {
		display: flex;
		flex-direction: column;
	}
	.danger-zone {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.danger-zone__title {
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
	}
	.danger-zone__hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	@media (max-width: 1279px) {
		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 1023px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 767px) {
		.stats {
			gap: var(--space-3);
			margin-bottom: var(--space-6);
		}
	}
</style>
