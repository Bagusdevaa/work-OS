<script lang="ts">
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import WorkContextFilter from '$lib/features/my-work/components/WorkContextFilter.svelte';
	import { serializeWorkContext } from '$lib/features/my-work/my-work.utils';
	import TaskRow from '$lib/features/tasks/components/TaskRow.svelte';
	import { pluralize } from '$lib/utils/text';

	let { data } = $props();
	const contextParam = $derived(serializeWorkContext(data.context));
	const allHref = $derived(
		contextParam === 'all' ? '/my-work' : `/my-work?context=${contextParam}`
	);
	const tones = {
		overdue: 'danger',
		today: 'primary',
		week: 'neutral',
		blocked: 'warning',
		next: 'neutral'
	} as const;
</script>

<svelte:head>
	<title>My Work · Work OS</title>
</svelte:head>

<PageHeader
	title="My Work"
	description={data.totalOpen
		? `${pluralize(data.totalOpen, 'open task')} across your active projects.`
		: 'Open tasks across every company and project, grouped by urgency.'}
>
	{#snippet actions()}
		{#if data.view}
			<Button href={allHref} variant="secondary">Show all sections</Button>
		{/if}
	{/snippet}
</PageHeader>

<WorkContextFilter
	companies={data.companies}
	projects={data.projects}
	context={data.context}
	view={data.view}
/>

{#if data.sections.length === 0}
	<EmptyState
		icon={ListTodo}
		title={data.view ? 'Nothing here' : 'No open tasks'}
		description={data.view
			? 'There is nothing in this section right now.'
			: 'Add tasks to an active project and they will be organised here by urgency.'}
	>
		{#snippet action()}
			{#if data.view}
				<Button href={allHref} variant="secondary">Show all sections</Button>
			{:else}
				<Button href="/projects">Go to projects</Button>
			{/if}
		{/snippet}
	</EmptyState>
{:else}
	<div class="sections">
		{#each data.sections as section (section.key)}
			<Card>
				<Section
					title={section.title}
					meta={pluralize(section.tasks.length, 'task')}
					description={section.description}
				>
					<div class="section-list section-list--{tones[section.key]}">
						{#each section.tasks as task (task.id)}
							<TaskRow {task} today={data.today} showProject />
						{/each}
					</div>
				</Section>
			</Card>
		{/each}
	</div>
{/if}

<style>
	.sections {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 960px;
	}
	.section-list {
		display: flex;
		flex-direction: column;
		border-left: 3px solid transparent;
		padding-left: var(--space-3);
	}
	.section-list--danger {
		border-left-color: var(--color-danger);
	}
	.section-list--primary {
		border-left-color: var(--color-primary-500);
	}
	.section-list--warning {
		border-left-color: var(--color-warning);
	}
	.section-list--neutral {
		border-left-color: var(--color-border-strong);
	}
</style>
