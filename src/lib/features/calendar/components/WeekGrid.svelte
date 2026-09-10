<script lang="ts">
	import type { WeekGrid } from '../calendar-grid';
	import type { DeadlineItem } from '../calendar.utils';

	interface Props {
		grid: WeekGrid;
		itemsByDate: Map<string, DeadlineItem[]>;
	}

	let { grid, itemsByDate }: Props = $props();
	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
</script>

<div class="week" role="grid" aria-label="Week view">
	<div class="week__row" role="row">
		{#each grid.days as day, index (day.date)}
			{@const items = itemsByDate.get(day.date) ?? []}
			<div
				class="day"
				class:day--today={day.isToday}
				role="gridcell"
				aria-label="{day.date}, {items.length} items"
			>
				<div class="day__head">
					<span class="day__name">{WEEKDAYS[index]}</span>
					<span class="day__number">{Number(day.date.slice(8, 10))}</span>
				</div>
				{#if items.length === 0}
					<p class="day__empty">—</p>
				{:else}
					<ul class="day__items">
						{#each items as item (`${item.kind}-${item.id}`)}
							<li>
								<a href={item.href} class="chip chip--{item.kind}" title={item.title}>
									{#if item.time}<span class="chip__time">{item.time}</span>{/if}
									{item.title}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.week {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface);
	}
	.week__row {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}
	.day {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-height: 220px;
		padding: var(--space-2);
		border-right: 1px solid var(--color-border);
		min-width: 0;
	}
	.day:last-child {
		border-right: none;
	}
	.day--today {
		background: var(--color-primary-50);
	}
	.day__head {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}
	.day__name {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}
	.day__number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
	}
	.day--today .day__number {
		background: var(--color-primary-500);
		color: var(--color-text-inverse);
	}
	.day__empty {
		font-size: var(--text-xs);
		color: var(--color-text-placeholder);
	}
	.day__items {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.chip {
		display: block;
		padding: 2px var(--space-2);
		border-radius: 4px;
		border-left: 3px solid;
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		color: var(--color-text);
		overflow-wrap: anywhere;
	}
	.chip:hover {
		text-decoration: none;
		filter: brightness(0.96);
	}
	.chip__time {
		margin-right: var(--space-1);
		color: var(--color-text-muted);
	}
	.chip--task {
		background: var(--color-info-bg);
		border-color: var(--color-info);
	}
	.chip--milestone {
		background: var(--color-warning-bg);
		border-color: var(--color-warning);
	}
	.chip--project {
		background: var(--color-neutral-bg);
		border-color: var(--color-neutral);
	}
	.chip--event {
		background: var(--color-success-bg);
		border-color: var(--color-success);
	}
	@media (max-width: 1023px) {
		.day {
			min-height: 170px;
		}
	}
	/* Seven columns cannot stay readable on a phone; the agenda below carries the week there. */
	@media (max-width: 767px) {
		.week {
			display: none;
		}
	}
</style>
