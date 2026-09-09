<script lang="ts">
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import { weekLabel } from '$lib/features/reviews/review.utils';
	import { describeTimeAgo } from '$lib/utils/dates';

	let { data } = $props();
	const current = $derived(data.reviews.find((r) => r.weekStart === data.thisWeek));
	const snapshot = (summary: Record<string, unknown> | null, key: string) =>
		typeof summary?.[key] === 'number' ? (summary[key] as number) : 0;
</script>

<svelte:head>
	<title>Weekly Review · Work OS</title>
</svelte:head>

<PageHeader
	title="Weekly Review"
	description="Look back at what happened, then decide what matters next week."
>
	{#snippet actions()}
		<Button href="/reviews/{data.lastWeek}" variant="secondary">Review last week</Button>
		<Button href="/reviews/{data.thisWeek}">
			{current ? 'Continue this week' : 'Start this week'}
		</Button>
	{/snippet}
</PageHeader>

<Card>
	<Section title="Past reviews">
		{#if data.reviews.length === 0}
			<EmptyState
				size="sm"
				icon={ClipboardCheck}
				title="No reviews yet"
				description="Your first review takes ten minutes: the summary is prepared for you, you add the reflection."
			>
				{#snippet action()}
					<Button href="/reviews/{data.thisWeek}" size="sm">Start this week's review</Button>
				{/snippet}
			</EmptyState>
		{:else}
			<ul class="reviews">
				{#each data.reviews as review (review.id)}
					<li>
						<a href="/reviews/{review.weekStart}" class="review">
							<span class="review__week">{weekLabel(review.weekStart)}</span>
							<span class="review__stats">
								{snapshot(review.summary, 'completedTasks')} tasks · {snapshot(
									review.summary,
									'completedMilestones'
								)} milestones · {snapshot(review.summary, 'overdueTasks')} overdue
							</span>
							<span class="review__time">Updated {describeTimeAgo(review.updatedAt)}</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</Section>
</Card>

<style>
	.reviews {
		display: flex;
		flex-direction: column;
	}
	.review {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-3) var(--space-2);
		border-bottom: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: inherit;
	}
	li:last-child .review {
		border-bottom: none;
	}
	.review:hover {
		background: var(--color-surface-hover);
		text-decoration: none;
	}
	.review__week {
		font-weight: var(--weight-semibold);
	}
	.review__stats,
	.review__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	@media (max-width: 767px) {
		.review {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-1);
		}
	}
</style>
