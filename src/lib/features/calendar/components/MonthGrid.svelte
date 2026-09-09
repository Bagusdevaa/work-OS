<script lang="ts">
	import type { MonthGrid } from '../calendar-grid';
	import type { DeadlineItem } from '../calendar.utils';

	interface Props {
		grid: MonthGrid;
		itemsByDate: Map<string, DeadlineItem[]>;
	}

	let { grid, itemsByDate }: Props = $props();
	const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const MAX_CHIPS = 3;
</script>

<div class="grid" role="grid" aria-label="Month view">
	<div class="grid__head" role="row">
		{#each WEEKDAYS as day (day)}
			<div class="grid__weekday" role="columnheader">{day}</div>
		{/each}
	</div>
	{#each grid.weeks as week, w (w)}
		<div class="grid__row" role="row">
			{#each week as day (day.date)}
				{@const items = itemsByDate.get(day.date) ?? []}
				<div
					class="cell"
					class:cell--outside={!day.inMonth}
					class:cell--today={day.isToday}
					role="gridcell"
					aria-label="{day.date}, {items.length} items"
				>
					<span class="cell__day">{Number(day.date.slice(8, 10))}</span>
					<ul class="cell__items">
						{#each items.slice(0, MAX_CHIPS) as item (`${item.kind}-${item.id}`)}
							<li>
								<a href={item.href} class="chip chip--{item.kind}" title={item.title}>
									{#if item.time}<span class="chip__time">{item.time}</span>{/if}
									{item.title}
								</a>
							</li>
						{/each}
						{#if items.length > MAX_CHIPS}
							<li class="cell__more">+{items.length - MAX_CHIPS} more</li>
						{/if}
					</ul>
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-surface);
	}
	.grid__head,
	.grid__row {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}
	.grid__weekday {
		padding: var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
		text-align: center;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface-muted);
	}
	.cell {
		min-height: 104px;
		padding: var(--space-2);
		border-right: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}
	.cell:nth-child(7n) {
		border-right: none;
	}
	.grid__row:last-child .cell {
		border-bottom: none;
	}
	.cell--outside {
		background: var(--color-surface-muted);
	}
	.cell--outside .cell__day {
		color: var(--color-text-placeholder);
	}
	.cell__day {
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
	.cell--today .cell__day {
		background: var(--color-primary-500);
		color: var(--color-text-inverse);
	}
	.cell__items {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.chip {
		display: block;
		padding: 1px var(--space-2);
		border-radius: 4px;
		border-left: 3px solid;
		font-size: var(--text-xs);
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
	.cell__more {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		padding-left: var(--space-2);
	}
	@media (max-width: 1023px) {
		.cell {
			min-height: 80px;
		}
	}
	@media (max-width: 767px) {
		.grid {
			display: none;
		}
	}
</style>
