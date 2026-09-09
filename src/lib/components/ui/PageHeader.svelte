<script lang="ts">
	import type { Snippet } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	interface Props {
		title: string;
		description?: string;
		/** Optional "back" link shown above the title. */
		back?: { href: string; label: string };
		eyebrow?: Snippet;
		actions?: Snippet;
	}

	let { title, description, back, eyebrow, actions }: Props = $props();
</script>

<div class="page-header">
	<div class="page-header__text">
		{#if back}
			<a href={back.href} class="page-header__back">
				<ArrowLeft size={16} aria-hidden="true" />
				{back.label}
			</a>
		{/if}
		{#if eyebrow}
			<div class="page-header__eyebrow">{@render eyebrow()}</div>
		{/if}
		<h1>{title}</h1>
		{#if description}
			<p class="page-header__description">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="page-header__actions">{@render actions()}</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}
	.page-header__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}
	.page-header__back {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.page-header__eyebrow {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}
	.page-header__description {
		color: var(--color-text-secondary);
		max-width: 64ch;
	}
	.page-header__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		flex-shrink: 0;
	}
	@media (max-width: 767px) {
		.page-header {
			flex-direction: column;
			margin-bottom: var(--space-6);
		}
		.page-header__actions {
			width: 100%;
		}
	}
</style>
