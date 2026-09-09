<script lang="ts">
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { Milestone } from '$lib/features/milestones/milestone.types';
	import type { Task } from '../task.types';
	import { groupTasksByMilestone } from '../task.utils';
	import TaskRow from './TaskRow.svelte';

	interface Props {
		tasks: Task[];
		milestones: Pick<Milestone, 'id' | 'name'>[];
		today: string;
	}

	let { tasks, milestones, today }: Props = $props();

	const open = $derived(tasks.filter((t) => t.status !== 'done'));
	const done = $derived(tasks.filter((t) => t.status === 'done'));
	const groups = $derived(groupTasksByMilestone(open, milestones));
	const nameOf = $derived(new Map(milestones.map((m) => [m.id, m.name])));
</script>

<div class="tasks">
	{#if tasks.length === 0}
		<EmptyState
			size="sm"
			icon={ListTodo}
			title="No tasks yet"
			description="Add the concrete steps that move this project forward."
		/>
	{:else if open.length === 0}
		<p class="tasks__all-done">Everything is done. Add the next step or complete the project.</p>
	{/if}

	{#each groups as group (group.milestone?.id ?? 'none')}
		<div class="tasks__group">
			{#if groups.length > 1 || group.milestone}
				<h3 class="tasks__group-title">{group.milestone?.name ?? 'No milestone'}</h3>
			{/if}
			{#each group.tasks as task (task.id)}
				<TaskRow {task} {today} />
			{/each}
		</div>
	{/each}

	{#if done.length > 0}
		<details class="tasks__done">
			<summary class="tasks__done-summary">Completed ({done.length})</summary>
			{#each done as task (task.id)}
				<TaskRow
					{task}
					{today}
					milestoneName={task.milestoneId ? nameOf.get(task.milestoneId) : null}
				/>
			{/each}
		</details>
	{/if}
</div>

<style>
	.tasks {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.tasks__all-done {
		font-size: var(--text-small);
		color: var(--color-success-text);
	}
	.tasks__group {
		display: flex;
		flex-direction: column;
	}
	.tasks__group-title {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}
	.tasks__done-summary {
		cursor: pointer;
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
		padding: var(--space-2) 0;
	}
</style>
