<script lang="ts">
	import { enhance } from '$app/forms';
	import Check from '@lucide/svelte/icons/check';
	import Clock from '@lucide/svelte/icons/clock';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PriorityBadge from '$lib/components/shared/PriorityBadge.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import { TASK_STATUS_LABELS } from '$lib/types/domain';
	import { describeDueDate } from '$lib/utils/dates';
	import type { Task, TaskWithContext } from '../task.types';
	import { isTaskOverdue } from '../task.utils';

	interface Props {
		task: Task | TaskWithContext;
		today: string;
		/** Show project and company context (cross-project lists). */
		showProject?: boolean;
		/** Milestone name, when known. */
		milestoneName?: string | null;
	}

	let { task, today, showProject = false, milestoneName = null }: Props = $props();

	const done = $derived(task.status === 'done');
	const overdue = $derived(isTaskOverdue(task, today));
	const context = $derived('projectName' in task ? task : null);
	const milestone = $derived(milestoneName ?? context?.milestoneName ?? null);
</script>

<div class="task" class:task--done={done}>
	<form method="POST" action="?/setTaskStatus" use:enhance>
		<input type="hidden" name="taskId" value={task.id} />
		<input type="hidden" name="status" value={done ? 'todo' : 'done'} />
		<button
			type="submit"
			class="task__toggle"
			class:task__toggle--done={done}
			aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
			title={done ? 'Reopen' : 'Mark done'}
		>
			{#if done}<Check size={12} aria-hidden="true" />{/if}
		</button>
	</form>

	<div class="task__body">
		<a href="/tasks/{task.id}" class="task__title">{task.title}</a>
		<div class="task__meta">
			{#if showProject && context}
				<a href="/projects/{context.projectId}" class="task__project">
					<Swatch accent={context.companyAccent} size="sm" />
					{context.projectName}
				</a>
			{/if}
			{#if task.status === 'in_progress' || task.status === 'blocked'}
				<Badge tone={task.status === 'blocked' ? 'danger' : 'info'} size="sm" dot>
					{TASK_STATUS_LABELS[task.status]}
				</Badge>
			{/if}
			{#if task.priority !== 'medium'}
				<PriorityBadge priority={task.priority} />
			{/if}
			{#if task.dueDate && !done}
				<span class="task__due" class:task__due--overdue={overdue}>
					{describeDueDate(task.dueDate, today)}
				</span>
			{/if}
			{#if milestone}<span class="task__hint">{milestone}</span>{/if}
			{#if task.estimatedMinutes}
				<span class="task__hint task__estimate">
					<Clock size={12} aria-hidden="true" />
					{task.estimatedMinutes} min
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.task {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.task:last-child {
		border-bottom: none;
	}
	.task__toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		margin-top: 2px;
		padding: 0;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text-inverse);
		flex-shrink: 0;
	}
	.task__toggle:hover {
		border-color: var(--color-primary-500);
	}
	.task__toggle--done {
		background: var(--color-success);
		border-color: var(--color-success);
	}
	.task__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
		flex: 1;
	}
	.task__title {
		color: var(--color-text);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
	}
	.task--done .task__title {
		color: var(--color-text-muted);
		text-decoration: line-through;
	}
	.task__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.task__project {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-text-secondary);
		font-weight: var(--weight-medium);
	}
	.task__due {
		color: var(--color-text-secondary);
	}
	.task__due--overdue {
		color: var(--color-danger-text);
		font-weight: var(--weight-medium);
	}
	.task__estimate {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}
</style>
