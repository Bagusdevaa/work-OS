<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import { groupByDate, monthLabel, shiftMonth } from '$lib/features/calendar/calendar-grid';
	import AgendaList from '$lib/features/calendar/components/AgendaList.svelte';
	import MonthGrid from '$lib/features/calendar/components/MonthGrid.svelte';
	import EventForm from '$lib/features/events/components/EventForm.svelte';
	import { pluralize } from '$lib/utils/text';

	let { data, form } = $props();
	const itemsByDate = $derived(groupByDate(data.items));
	const monthDates = $derived(
		data.grid.weeks
			.flat()
			.filter((d) => d.inMonth)
			.map((d) => d.date)
	);
	const inMonthCount = $derived(data.items.filter((i) => i.date.startsWith(data.month)).length);
</script>

<svelte:head>
	<title>Calendar · Work OS</title>
</svelte:head>

<PageHeader
	title="Calendar"
	description="Deadlines and events across every project. {pluralize(
		inMonthCount,
		'item'
	)} this month."
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

<div class="month-nav">
	<Button
		href="/calendar?month={shiftMonth(data.month, -1)}"
		variant="secondary"
		size="sm"
		aria-label="Previous month"
	>
		<ChevronLeft size={16} aria-hidden="true" />
	</Button>
	<h2 class="month-nav__label">{monthLabel(data.month)}</h2>
	<Button
		href="/calendar?month={shiftMonth(data.month, 1)}"
		variant="secondary"
		size="sm"
		aria-label="Next month"
	>
		<ChevronRight size={16} aria-hidden="true" />
	</Button>
	<Button href="/calendar" variant="ghost" size="sm">Today</Button>
	<ul class="legend" aria-label="Legend">
		<li><span class="legend__dot legend__dot--task"></span>Task</li>
		<li><span class="legend__dot legend__dot--milestone"></span>Milestone</li>
		<li><span class="legend__dot legend__dot--project"></span>Project</li>
		<li><span class="legend__dot legend__dot--event"></span>Event</li>
	</ul>
</div>

<div class="calendar">
	<MonthGrid grid={data.grid} {itemsByDate} />
	<Card>
		<Section title="Agenda" meta={monthLabel(data.month)}>
			<AgendaList dates={monthDates} {itemsByDate} today={data.today} />
		</Section>
	</Card>
</div>

<style>
	.month-nav {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.month-nav__label {
		font-size: var(--text-h3);
		font-weight: var(--weight-semibold);
		min-width: 170px;
		text-align: center;
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
