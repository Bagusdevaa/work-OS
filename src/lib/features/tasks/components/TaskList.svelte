<script lang="ts">
	import { enhance } from '$app/forms';
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { Milestone } from '$lib/features/milestones/milestone.types';
	import type { Task } from '../task.types';
	import { groupTasksByMilestone } from '../task.utils';
	import TaskReorderControls from './TaskReorderControls.svelte';
	import TaskRow from './TaskRow.svelte';

	interface Props {
		tasks: Task[];
		milestones: Pick<Milestone, 'id' | 'name'>[];
		today: string;
		/** Manual order is the only order worth dragging, so controls appear only then. */
		reorderable?: boolean;
	}

	let { tasks, milestones, today, reorderable = false }: Props = $props();

	const open = $derived(tasks.filter((t) => t.status !== 'done'));
	const done = $derived(tasks.filter((t) => t.status === 'done'));
	const groups = $derived(groupTasksByMilestone(open, milestones));
	const nameOf = $derived(new Map(milestones.map((m) => [m.id, m.name])));

	let moveForm = $state<HTMLFormElement | null>(null);
	let movedId = $state('');
	let movedTo = $state('');
	let draggingId = $state('');
	let draggingGroup = $state<string | null>(null);
	let dropTargetId = $state('');

	function startDrag(event: DragEvent, task: Task) {
		draggingId = task.id;
		draggingGroup = task.milestoneId;
		event.dataTransfer?.setData('text/plain', task.id);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function endDrag() {
		draggingId = '';
		draggingGroup = null;
		dropTargetId = '';
	}

	/** Only tasks in the dragged task's own milestone group are valid targets. */
	function canDropOn(task: Task): boolean {
		return (
			reorderable &&
			draggingId !== '' &&
			draggingId !== task.id &&
			draggingGroup === task.milestoneId
		);
	}

	function dragOver(event: DragEvent, task: Task) {
		if (!canDropOn(task)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		dropTargetId = task.id;
	}

	function drop(event: DragEvent, task: Task, index: number) {
		if (!canDropOn(task)) return;
		event.preventDefault();
		movedId = draggingId;
		movedTo = String(index);
		endDrag();
		moveForm?.requestSubmit();
	}
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
			<ul class="tasks__items">
				{#each group.tasks as task, index (task.id)}
					<li
						class="tasks__item"
						class:tasks__item--dragging={draggingId === task.id}
						class:tasks__item--target={dropTargetId === task.id}
						ondragover={(event) => dragOver(event, task)}
						ondragleave={() => (dropTargetId = dropTargetId === task.id ? '' : dropTargetId)}
						ondrop={(event) => drop(event, task, index)}
					>
						{#if reorderable}
							<TaskReorderControls
								taskId={task.id}
								title={task.title}
								{index}
								total={group.tasks.length}
								onDragStart={(event) => startDrag(event, task)}
								onDragEnd={endDrag}
							/>
						{/if}
						<TaskRow {task} {today} />
					</li>
				{/each}
			</ul>
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

	{#if reorderable}
		<form method="POST" action="?/moveTask" class="tasks__move" bind:this={moveForm} use:enhance>
			<input type="hidden" name="taskId" value={movedId} />
			<input type="hidden" name="toIndex" value={movedTo} />
		</form>
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
	.tasks__items {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.tasks__item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-1);
		border-radius: var(--radius-sm);
		min-width: 0;
	}
	.tasks__item > :global(.task) {
		flex: 1;
		min-width: 0;
	}
	.tasks__item--dragging {
		opacity: 0.5;
	}
	.tasks__item--target {
		box-shadow: inset 0 2px 0 var(--color-primary-500);
	}
	.tasks__done-summary {
		cursor: pointer;
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
		padding: var(--space-2) 0;
	}
	.tasks__move {
		display: none;
	}
</style>
