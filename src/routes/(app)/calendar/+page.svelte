<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import {
		groupByDate,
		monthLabel,
		shiftMonth,
		shiftWeek,
		weekLabel
	} from '$lib/features/calendar/calendar-grid';
	import AgendaList from '$lib/features/calendar/components/AgendaList.svelte';
	import MonthGrid from '$lib/features/calendar/components/MonthGrid.svelte';
	import WeekGrid from '$lib/features/calendar/components/WeekGrid.svelte';
	import EventForm from '$lib/features/events/components/EventForm.svelte';
	import { pluralize } from '$lib/utils/text';

	let { data, form } = $props();

	const itemsByDate = $derived(groupByDate(data.items));
	const isWeek = $derived(data.view === 'week');
	const label = $derived(isWeek ? weekLabel(data.week) : monthLabel(data.month));
	const visible = $derived(new Set(data.visibleDates));
	const visibleCount = $derived(data.items.filter((item) => visible.has(item.date)).length);

	const previousHref = $derived(
		isWeek
			? `/calendar?view=week&week=${shiftWeek(data.week, -1)}`
			: `/calendar?month=${shiftMonth(data.month, -1)}`
	);
	const nextHref = $derived(
		isWeek
			? `/calendar?view=week&week=${shiftWeek(data.week, 1)}`
			: `/calendar?month=${shiftMonth(data.month, 1)}`
	);
	const todayHref = $derived(isWeek ? '/calendar?view=week' : '/calendar');
</script>

<svelte:head>
	<title>Calendar · Work OS</title>
</svelte:head>

<PageHeader
	title="Calendar"
	description="Deadlines and events across every project. {pluralize(
		visibleCount,
		'item'
	)} this {isWeek ? 'week' : 'month'}."
>
	{#snippet actions()}
		<EventForm
			projects={data.projects}
			defaultDate={data.today}
			values={form?.eventValues}
			errors={form?.eventErrors}
			open={!!form?.eventErrors}
		/>
	{/snippet}
</PageHeader>

<div class="nav">
	<Button
		href={previousHref}
		variant="secondary"
		size="sm"
		aria-label={isWeek ? 'Previous week' : 'Previous month'}
	>
		<ChevronLeft size={16} aria-hidden="true" />
	</Button>
	<h2 class="nav__label">{label}</h2>
	<Button
		href={nextHref}
		variant="secondary"
		size="sm"
		aria-label={isWeek ? 'Next week' : 'Next month'}
	>
		<ChevronRight size={16} aria-hidden="true" />
	</Button>
	<Button href={todayHref} variant="ghost" size="sm">Today</Button>

	<div class="views" role="group" aria-label="Calendar view">
		<a
			href="/calendar?month={data.month}"
			class="views__option"
			class:views__option--active={!isWeek}
			aria-current={!isWeek ? 'true' : undefined}
		>
			Month
		</a>
		<a
			href="/calendar?view=week&week={data.week}"
			class="views__option"
			class:views__option--active={isWeek}
			aria-current={isWeek ? 'true' : undefined}
		>
			Week
		</a>
	</div>

	<ul class="legend" aria-label="Legend">
		<li><span class="legend__dot legend__dot--task"></span>Task</li>
		<li><span class="legend__dot legend__dot--milestone"></span>Milestone</li>
		<li><span class="legend__dot legend__dot--project"></span>Project</li>
		<li><span class="legend__dot legend__dot--event"></span>Event</li>
	</ul>
</div>

<div class="calendar">
	{#if data.weekGrid}
		<WeekGrid grid={data.weekGrid} {itemsByDate} />
	{:else if data.monthGrid}
		<MonthGrid grid={data.monthGrid} {itemsByDate} />
	{/if}
	<Card>
		<Section title="Agenda" meta={label}>
			<AgendaList dates={data.visibleDates} {itemsByDate} today={data.today} />
		</Section>
	</Card>
</div>

<style>
	.nav {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.nav__label {
		font-size: var(--text-h3);
		font-weight: var(--weight-semibold);
		min-width: 170px;
		text-align: center;
	}
	.views {
		display: inline-flex;
		padding: 2px;
		gap: 2px;
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}
	.views__option {
		padding: var(--space-1) var(--space-3);
		border-radius: calc(var(--radius-sm) - 1px);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
	}
	.views__option:hover {
		color: var(--color-text);
	}
	.views__option--active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-left: auto;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.legend li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
	}
	.legend__dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
	}
	.legend__dot--task {
		background: var(--color-info);
	}
	.legend__dot--milestone {
		background: var(--color-warning);
	}
	.legend__dot--project {
		background: var(--color-neutral);
	}
	.legend__dot--event {
		background: var(--color-success);
	}
	.calendar {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	@media (max-width: 767px) {
		.legend {
			margin-left: 0;
			width: 100%;
		}
	}
</style>
