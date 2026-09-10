<script lang="ts">
	import Archive from '@lucide/svelte/icons/archive';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ProjectCard from '$lib/features/projects/components/ProjectCard.svelte';
	import ProjectFilterBar from '$lib/features/projects/components/ProjectFilterBar.svelte';

	let { data } = $props();
	const filtered = $derived(data.companyId !== '' || data.view !== 'open');
</script>

<svelte:head>
	<title>Projects · Work OS</title>
</svelte:head>

<PageHeader title="Projects" description="The meaningful units of work across all your companies.">
	{#snippet actions()}
		{#if data.archivedCount > 0}
			<Button href="/projects/archive" variant="secondary">
				<Archive size={16} aria-hidden="true" />
				Archived ({data.archivedCount})
			</Button>
		{/if}
		<Button href="/projects/new" disabled={data.companies.length === 0}>
			<Plus size={16} aria-hidden="true" />
			New project
		</Button>
	{/snippet}
</PageHeader>

{#if data.companies.length === 0}
	<EmptyState
		icon={FolderKanban}
		title="Add a company first"
		description="Projects live inside companies. Create one and you can start adding projects."
	>
		{#snippet action()}
			<Button href="/companies/new">Add a company</Button>
		{/snippet}
	</EmptyState>
{:else}
	<ProjectFilterBar companies={data.companies} companyId={data.companyId} view={data.view} />

	{#if data.projects.length === 0}
		<EmptyState
			icon={FolderKanban}
			title={filtered ? 'No projects match these filters' : 'No projects yet'}
			description={filtered
				? 'Try a different company or view.'
				: 'Create your first project to start tracking milestones and tasks.'}
		>
			{#snippet action()}
				{#if filtered}
					<Button href="/projects" variant="secondary">Clear filters</Button>
				{:else}
					<Button href="/projects/new">New project</Button>
				{/if}
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid">
			{#each data.projects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{/if}
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-4);
	}
</style>
