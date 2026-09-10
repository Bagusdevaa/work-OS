<script lang="ts">
	import { enhance } from '$app/forms';
	import Archive from '@lucide/svelte/icons/archive';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import ProjectStatusBadge from '$lib/features/projects/components/ProjectStatusBadge.svelte';
	import { formatDate, toISODate } from '$lib/utils/dates';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Archive · Work OS</title>
</svelte:head>

<PageHeader
	title="Archive"
	description="Projects you have finished or shelved. Restore one to bring it back to work."
>
	{#snippet actions()}
		<Button href="/projects" variant="secondary">
			<ArrowLeft size={16} aria-hidden="true" />
			All projects
		</Button>
	{/snippet}
</PageHeader>

{#if form?.message}
	<Alert variant="danger">{form.message}</Alert>
{:else if form?.updated}
	<Alert variant="success">“{form.updated}” was updated.</Alert>
{/if}

{#if data.total === 0}
	<Card>
		<EmptyState
			icon={Archive}
			title="Nothing archived yet"
			description="Completed and archived projects collect here so your project list stays focused."
		/>
	</Card>
{:else}
	<div class="groups">
		{#each data.groups as group (group.companyId)}
			<Card>
				<Section title={group.companyName} meta="{group.projects.length} archived">
					{#snippet actions()}
						<Swatch accent={group.projects[0].companyAccent} />
					{/snippet}
					<ul class="list">
						{#each group.projects as project (project.id)}
							<li class="item">
								<div class="item__main">
									<a href="/projects/{project.id}" class="item__name">{project.name}</a>
									<div class="item__meta">
										<ProjectStatusBadge status={project.status} />
										{#if project.completedAt}
											<span class="item__date">
												Completed {formatDate(toISODate(project.completedAt), 'short')}
											</span>
										{/if}
									</div>
								</div>
								<form method="POST" action="?/setStatus" class="item__actions" use:enhance>
									<input type="hidden" name="projectId" value={project.id} />
									{#if project.status === 'completed'}
										<Button type="submit" name="status" value="archived" variant="ghost" size="sm">
											Archive
										</Button>
									{/if}
									<Button type="submit" name="status" value="paused" variant="secondary" size="sm">
										Restore
									</Button>
								</form>
							</li>
						{/each}
					</ul>
				</Section>
			</Card>
		{/each}
	</div>
{/if}

<style>
	.groups {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.item:last-child {
		border-bottom: none;
	}
	.item__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}
	.item__name {
		color: var(--color-text);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
	}
	.item__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.item__actions {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
	}
	@media (max-width: 767px) {
		.item {
			flex-direction: column;
			align-items: stretch;
		}
		.item__actions {
			justify-content: flex-end;
		}
	}
</style>
