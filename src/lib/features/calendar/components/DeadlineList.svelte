<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Flag from '@lucide/svelte/icons/flag';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ListTodo from '@lucide/svelte/icons/list-todo';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { daysBetween, formatDate } from '$lib/utils/dates';
	import type { UpcomingItem } from '../calendar.utils';

	interface Props {
		items: UpcomingItem[];
		today: string;
	}

	let { items, today }: Props = $props();

	const icons = { task: ListTodo, milestone: Flag, project: FolderKanban, event: CalendarDays };

	function dayLabel(date: string): string {
		const diff = daysBetween(today, date);
		if (diff < 0) return `${-diff}d late`;
		if (diff === 0) return 'Today';
		if (diff === 1) return 'Tomorrow';
		return formatDate(date, 'short');
	}
</script>

{#if items.length === 0}
	<EmptyState
		size="sm"
		icon={CalendarDays}
		title="Nothing due soon"
		description="Deadlines for tasks, milestones, projects and events will appear here."
	/>
{:else}
	<ol class="deadlines">
		{#each items as item (`${item.kind}-${item.id}`)}
			{@const Icon = icons[item.kind]}
			<li>
				<a href={item.href} class="deadline" class:deadline--overdue={item.overdue}>
					<span class="deadline__date">{dayLabel(item.date)}</span>
					<span class="deadline__icon" aria-hidden="true"><Icon size={14} /></span>
					<span class="deadline__body">
						<span class="deadline__title">{item.title}</span>
						<span class="deadline__meta">
							{item.kind}{#if item.projectName}
								· {item.projectName}{/if}{#if item.time}
								· {item.time}{/if}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.deadlines {
		display: flex;
		flex-direction: column;
	}
	.deadline {
		display: grid;
		grid-template-columns: 64px 24px minmax(0, 1fr);
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border);
		color: inherit;
	}
	li:last-child .deadline {
		border-bottom: none;
	}
	.deadline:hover {
		text-decoration: none;
	}
	.deadline:hover .deadline__title {
		color: var(--color-primary-600);
	}
	.deadline__date {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}
	.deadline--overdue .deadline__date {
		color: var(--color-danger-text);
	}
	.deadline__icon {
		display: inline-flex;
		color: var(--color-text-muted);
	}
	.deadline__body {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.deadline__title {
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.deadline__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.deadline__kind {
		text-transform: capitalize;
	}
</style>
