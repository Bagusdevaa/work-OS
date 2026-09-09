<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LucideIcon } from '@lucide/svelte';

	interface Props {
		icon?: LucideIcon;
		title: string;
		description?: string;
		/** Usually a Button. */
		action?: Snippet;
		size?: 'sm' | 'md';
	}

	let { icon: Icon, title, description, action, size = 'md' }: Props = $props();
</script>

<div class="empty empty--{size}">
	{#if Icon}
		<div class="empty__icon" aria-hidden="true"><Icon size={size === 'sm' ? 20 : 26} /></div>
	{/if}
	<h3 class="empty__title">{title}</h3>
	{#if description}
		<p class="empty__description">{description}</p>
	{/if}
	{#if action}
		<div class="empty__action">{@render action()}</div>
	{/if}
</div>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-2);
		padding: var(--space-10) var(--space-6);
		border: 1px dashed var(--color-border-strong);
		border-radius: var(--radius-lg);
		background: var(--color-surface-muted);
	}
	.empty--sm {
		padding: var(--space-6) var(--space-4);
	}
	.empty__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		border-radius: var(--radius-full);
		background: var(--color-primary-50);
		color: var(--color-primary-600);
		margin-bottom: var(--space-2);
	}
	.empty--sm .empty__icon {
		width: 40px;
		height: 40px;
	}
	.empty__title {
		font-size: var(--text-body-1);
		font-weight: var(--weight-semibold);
	}
	.empty--sm .empty__title {
		font-size: var(--text-body-2);
	}
	.empty__description {
		color: var(--color-text-secondary);
		max-width: 44ch;
		font-size: var(--text-small);
	}
	.empty__action {
		margin-top: var(--space-3);
	}
</style>
