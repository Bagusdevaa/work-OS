<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import type { RecommendedTask } from '../task-recommendation';
	import type { TaskWithContext } from '../task.types';
	import TaskRow from './TaskRow.svelte';

	interface Props {
		recommendations: RecommendedTask<TaskWithContext>[];
		today: string;
	}

	let { recommendations, today }: Props = $props();
</script>

{#if recommendations.length === 0}
	<EmptyState
		size="sm"
		icon={Sparkles}
		title="Nothing to recommend yet"
		description="Add tasks to an active project and the next best action will show up here."
	/>
{:else}
	<ol class="recs">
		{#each recommendations as rec, index (rec.task.id)}
			<li class="rec" class:rec--top={index === 0}>
				<span class="rec__rank" aria-hidden="true">{index + 1}</span>
				<div class="rec__body">
					<TaskRow task={rec.task} {today} showProject />
					<ul class="rec__reasons" aria-label="Why this task">
						{#each rec.reasons as reason (reason)}
							<li class="rec__reason">{reason}</li>
						{/each}
					</ul>
				</div>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.recs {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.rec {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		border: 1px solid transparent;
	}
	.rec--top {
		background: var(--color-primary-50);
		border-color: var(--color-primary-100);
	}
	.rec__rank {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		margin-top: var(--space-3);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		border: 1px solid var(--color-border-strong);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}
	.rec--top .rec__rank {
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
		color: var(--color-text-inverse);
	}
	.rec__body {
		flex: 1;
		min-width: 0;
	}
	.rec__body :global(.task) {
		border-bottom: none;
		padding-bottom: var(--space-1);
	}
	.rec__reasons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-2);
		padding-left: 32px;
		padding-bottom: var(--space-2);
	}
	.rec__reason {
		font-size: var(--text-xs);
		color: var(--color-primary-700);
	}
	.rec__reason + .rec__reason::before {
		content: '·';
		margin-right: var(--space-2);
		color: var(--color-text-muted);
	}
</style>
