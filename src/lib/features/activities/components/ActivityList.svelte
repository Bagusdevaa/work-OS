<script lang="ts">
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { describeTimeAgo } from '$lib/utils/dates';
	import { activityHref } from '../activity.utils';
	import type { Activity } from '../activity.types';

	interface Props {
		activities: Activity[];
		emptyText?: string;
	}

	let { activities, emptyText = 'No activity yet.' }: Props = $props();
</script>

{#if activities.length === 0}
	<EmptyState size="sm" icon={ActivityIcon} title="Nothing here yet" description={emptyText} />
{:else}
	<ol class="activity">
		{#each activities as activity (activity.id)}
			{@const href = activityHref(activity)}
			<li class="activity__item">
				<span class="activity__dot" aria-hidden="true"></span>
				<div class="activity__body">
					{#if href}
						<a class="activity__summary" {href}>{activity.summary}</a>
					{:else}
						<span class="activity__summary">{activity.summary}</span>
					{/if}
					<time class="activity__time" datetime={activity.createdAt.toISOString()}>
						{describeTimeAgo(activity.createdAt)}
					</time>
				</div>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.activity {
		display: flex;
		flex-direction: column;
	}
	.activity__item {
		position: relative;
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.activity__item:last-child {
		border-bottom: none;
	}
	.activity__dot {
		flex-shrink: 0;
		width: 8px;
		height: 8px;
		margin-top: 7px;
		border-radius: var(--radius-full);
		background: var(--color-primary-300);
	}
	.activity__body {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.activity__summary {
		color: var(--color-text);
		font-size: var(--text-body-2);
		overflow-wrap: anywhere;
	}
	.activity__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
