<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		/** Small text or count shown next to the title. */
		meta?: string;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, description, meta, actions, children }: Props = $props();
</script>

<section class="section">
	<header class="section__header">
		<div class="section__heading">
			<h2 class="section__title">{title}</h2>
			{#if meta}<span class="section__meta">{meta}</span>{/if}
		</div>
		{#if actions}<div class="section__actions">{@render actions()}</div>{/if}
	</header>
	{#if description}<p class="section__description">{description}</p>{/if}
	<div class="section__body">{@render children()}</div>
</section>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-width: 0;
	}
	.section__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.section__heading {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}
	.section__title {
		font-size: var(--text-h3);
		font-weight: var(--weight-semibold);
	}
	.section__meta {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.section__description {
		color: var(--color-text-secondary);
		font-size: var(--text-small);
		margin-top: calc(-1 * var(--space-2));
	}
	.section__actions {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
	}
	.section__body {
		min-width: 0;
	}
</style>
