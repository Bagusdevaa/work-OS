<script lang="ts">
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Plus from '@lucide/svelte/icons/plus';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Zap from '@lucide/svelte/icons/zap';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import ActivityList from '$lib/features/activities/components/ActivityList.svelte';
	import DeadlineList from '$lib/features/calendar/components/DeadlineList.svelte';
	import ProjectAttentionList from '$lib/features/projects/components/ProjectAttentionList.svelte';
	import ProjectRow from '$lib/features/projects/components/ProjectRow.svelte';
	import RecommendationList from '$lib/features/tasks/components/RecommendationList.svelte';
	import { formatDate } from '$lib/utils/dates';
	import { pluralize } from '$lib/utils/text';

	let { data } = $props();
	const d = $derived(data.dashboard);
	const firstName = $derived((data.user.displayName ?? data.user.email).split(/[\s@]/)[0]);
	const attention = $derived([...d.projects.stalled, ...d.projects.needsAttention]);
	const healthyActive = $derived(d.projects.inFlight.filter((p) => p.health.state === 'healthy'));
	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
</script>

<svelte:head>
	<title>Dashboard · Work OS</title>
</svelte:head>

<PageHeader title="{greeting}, {firstName}" description={formatDate(d.today)}>
	{#snippet actions()}
		<Button href="/inbox?capture=1" variant="secondary">
			<Plus size={16} aria-hidden="true" />
			Capture
		</Button>
		{#if d.hasCompanies}
			<Button href="/projects/new">New project</Button>
		{/if}
	{/snippet}
</PageHeader>

{#if !d.hasCompanies}
	<EmptyState
		icon={Sparkles}
		title="Your command center is empty"
		description="Add a company and a project to start seeing what needs your attention."
	>
		{#snippet action()}
			<Button href="/companies/new">Add your first company</Button>
		{/snippet}
	</EmptyState>
{:else if !d.hasProjects}
	<EmptyState
		icon={FolderKanban}
		title="No projects yet"
		description="Projects are where the work lives. Create one and the dashboard will start prioritising for you."
	>
		{#snippet action()}
			<Button href="/projects/new">Create a project</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="stats">
		<Stat
			label="Overdue"
			value={d.tasks.overdue.length}
			icon={CircleAlert}
			tone={d.tasks.overdue.length ? 'danger' : 'neutral'}
			href="/my-work?view=overdue"
		/>
		<Stat
			label="Due today"
			value={d.tasks.dueToday.length}
			icon={CalendarClock}
			tone={d.tasks.dueToday.length ? 'primary' : 'neutral'}
			href="/my-work?view=today"
		/>
		<Stat
			label="Needs attention"
			value={attention.length}
			icon={TriangleAlert}
			tone={attention.length ? 'warning' : 'neutral'}
			hint={d.projects.stalled.length ? `${d.projects.stalled.length} stalled` : undefined}
			href="/projects"
		/>
		<Stat
			label="In flight"
			value={d.projects.inFlight.length}
			icon={Zap}
			tone="success"
			hint={pluralize(d.tasks.openCount, 'open task')}
			href="/projects"
		/>
	</div>

	<div class="layout">
		<div class="layout__main">
			<Card>
				<Section title="Focus now" description="What to work on next, and why.">
					<RecommendationList recommendations={d.recommendations} today={d.today} />
				</Section>
			</Card>

			{#if attention.length > 0}
				<Card>
					<Section title="Needs attention" meta={pluralize(attention.length, 'project')}>
						<ProjectAttentionList projects={attention} />
					</Section>
				</Card>
			{/if}

			<Card>
				<Section title="Active projects" meta="{d.projects.inFlight.length} in flight">
					{#if d.projects.inFlight.length === 0}
						<EmptyState
							size="sm"
							icon={FolderKanban}
							title="Nothing in flight"
							description="Move a project to Planning or Active to see it here."
						/>
					{:else}
						<div class="list">
							{#each healthyActive.length ? healthyActive : d.projects.inFlight as project (project.id)}
								<ProjectRow {project} />
							{/each}
						</div>
					{/if}
				</Section>
			</Card>
		</div>

		<div class="layout__side">
			<Card>
				<Section title="Upcoming" description="Next 7 days">
					<DeadlineList items={d.upcoming} today={d.today} />
				</Section>
			</Card>
			<Card>
				<Section title="Recent activity">
					<ActivityList activities={d.activity} />
				</Section>
			</Card>
		</div>
	</div>
{/if}

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(300px, 2fr);
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
	.list {
		display: flex;
		flex-direction: column;
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
