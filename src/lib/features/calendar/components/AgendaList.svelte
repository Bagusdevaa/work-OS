<script lang="ts">
	import { enhance } from '$app/forms';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { formatDate } from '$lib/utils/dates';
	import type { DeadlineItem } from '../calendar.utils';

	interface Props {
		/** Dates to list, in order (only those with items are rendered). */
		dates: string[];
		itemsByDate: Map<string, DeadlineItem[]>;
		today: string;
	}

	let { dates, itemsByDate, today }: Props = $props();
	const days = $derived(dates.filter((date) => (itemsByDate.get(date) ?? []).length > 0));
	const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
</script>

{#if days.length === 0}
	<EmptyState
		size="sm"
		icon={CalendarDays}
		title="Nothing scheduled this month"
		description="Task due dates, milestones, project deadlines and events will show up here."
	/>
{:else}
	<ol class="agenda">
		{#each days as date (date)}
			<li class="day" class:day--today={date === today} class:day--past={date < today}>
				<div class="day__date">
					<span class="day__weekday">
						{weekdayFormatter.format(new Date(`${date}T00:00:00`))}
					</span>
					<span class="day__label">{formatDate(date, 'short')}</span>
					{#if date === today}<span class="day__today">Today</span>{/if}
				</div>
				<ul class="day__items">
					{#each itemsByDate.get(date) ?? [] as item (`${item.kind}-${item.id}`)}
						<li class="entry">
							<span class="entry__dot entry__dot--{item.kind}" aria-hidden="true"></span>
							<a href={item.href} class="entry__title">{item.title}</a>
							<span class="entry__meta">
								<span class="entry__kind">{item.kind}</span>
								{#if item.projectName}<span> · {item.projectName}</span>{/if}
								{#if item.time}<span> · {item.time}</span>{/if}
							</span>
							{#if item.kind === 'event'}
								<form
									method="POST"
									action="?/deleteEvent"
									use:enhance
									onsubmit={(e) => {
										if (!confirm(`Remove event "${item.title}"?`)) e.preventDefault();
									}}
								>
									<input type="hidden" name="eventId" value={item.id} />
									<button type="submit" class="icon-button" aria-label="Remove event {item.title}">
										<Trash2 size={14} aria-hidden="true" />
									</button>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.agenda {
		display: flex;
		flex-direction: column;
	}
	.day {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr);
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.day:last-child {
		border-bottom: none;
	}
	.day--past {
		opacity: 0.7;
	}
	.day__date {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.day__weekday {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}
	.day__label {
		font-weight: var(--weight-semibold);
	}
	.day--today .day__label {
		color: var(--color-primary-600);
	}
	.day__today {
		font-size: var(--text-xs);
		color: var(--color-primary-600);
		font-weight: var(--weight-medium);
	}
	.day__items {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.entry {
		display: grid;
		grid-template-columns: 8px minmax(0, 1fr) auto auto;
		align-items: center;
		gap: var(--space-2);
	}
	.entry__dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
	}
	.entry__dot--task {
		background: var(--color-info);
	}
	.entry__dot--milestone {
		background: var(--color-warning);
	}
	.entry__dot--project {
		background: var(--color-neutral);
	}
	.entry__dot--event {
		background: var(--color-success);
	}
	.entry__title {
		color: var(--color-text);
		font-weight: var(--weight-medium);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.entry__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	.entry__kind {
		text-transform: capitalize;
	}
	@media (max-width: 767px) {
		.day {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-2);
		}
		.day__date {
			flex-direction: row;
			align-items: baseline;
			gap: var(--space-2);
		}
		.entry {
			grid-template-columns: 8px minmax(0, 1fr) auto;
		}
		.entry__meta {
			grid-column: 2 / -1;
			white-space: normal;
		}
	}
</style>
