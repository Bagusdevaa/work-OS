<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import ReviewForm from '$lib/features/reviews/components/ReviewForm.svelte';
	import ReviewSummary from '$lib/features/reviews/components/ReviewSummary.svelte';
	import { weekLabel } from '$lib/features/reviews/review.utils';

	let { data, form } = $props();
	const values = $derived(
		form?.values ?? {
			wins: data.review?.wins ?? '',
			problems: data.review?.problems ?? '',
			lessons: data.review?.lessons ?? '',
			nextWeekPriorities: data.review?.nextWeekPriorities ?? ''
		}
	);
</script>

<svelte:head>
	<title>Review {weekLabel(data.weekStart)} · Work OS</title>
</svelte:head>

<PageHeader
	title="Week of {weekLabel(data.weekStart)}"
	description="Summary computed from your tasks, milestones and projects. Add your reflection below."
	back={{ href: '/reviews', label: 'Weekly Review' }}
>
	{#snippet eyebrow()}
		{#if data.isCurrentWeek}<Badge tone="info">This week</Badge>{/if}
		{#if data.review}<Badge tone="success" dot>Reviewed</Badge>{/if}
	{/snippet}
	{#snippet actions()}
		<Button
			href="/reviews/{data.previousWeek}"
			variant="secondary"
			size="sm"
			aria-label="Previous week"
		>
			<ChevronLeft size={16} aria-hidden="true" />
		</Button>
		<Button href="/reviews/{data.nextWeek}" variant="secondary" size="sm" aria-label="Next week">
			<ChevronRight size={16} aria-hidden="true" />
		</Button>
	{/snippet}
</PageHeader>

<ReviewSummary summary={data.summary} />

<div class="reflection">
	<Card>
		<Section
			title="Reflection"
			description="Wins, problems, lessons and the priorities for next week."
		>
			<ReviewForm
				{values}
				errors={form?.errors}
				saved={!!form?.saved}
				lastSavedAt={data.review?.updatedAt ?? null}
			/>
		</Section>
	</Card>
</div>

<style>
	.reflection {
		margin-top: var(--space-6);
		max-width: 860px;
	}
</style>
