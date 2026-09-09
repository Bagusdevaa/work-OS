<script lang="ts">
	import type { LucideIcon } from '@lucide/svelte';

	type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

	interface Props {
		label: string;
		value: number | string;
		hint?: string;
		icon?: LucideIcon;
		tone?: Tone;
		href?: string;
	}

	let { label, value, hint, icon: Icon, tone = 'neutral', href }: Props = $props();
</script>

{#snippet content()}
	<div class="stat__top">
		<span class="stat__label">{label}</span>
		{#if Icon}<span class="stat__icon stat__icon--{tone}"
				><Icon size={18} aria-hidden="true" /></span
			>{/if}
	</div>
	<span class="stat__value">{value}</span>
	{#if hint}<span class="stat__hint">{hint}</span>{/if}
{/snippet}

{#if href}
	<a {href} class="stat stat--link">{@render content()}</a>
{:else}
	<div class="stat">{@render content()}</div>
{/if}

<style>
	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		color: inherit;
		min-width: 0;
	}
	.stat--link:hover {
		text-decoration: none;
		border-color: var(--color-primary-300);
	}
	.stat__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.stat__label {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
		font-weight: var(--weight-medium);
	}
	.stat__icon {
		display: inline-flex;
		padding: var(--space-1);
		border-radius: var(--radius-sm);
	}
	.stat__icon--neutral {
		background: var(--color-neutral-bg);
		color: var(--color-neutral-text);
	}
	.stat__icon--primary {
		background: var(--color-primary-50);
		color: var(--color-primary-600);
	}
	.stat__icon--success {
		background: var(--color-success-bg);
		color: var(--color-success);
	}
	.stat__icon--warning {
		background: var(--color-warning-bg);
		color: var(--color-warning);
	}
	.stat__icon--danger {
		background: var(--color-danger-bg);
		color: var(--color-danger);
	}
	.stat__value {
		font-size: var(--text-h1);
		font-weight: var(--weight-semibold);
		line-height: 1.1;
		color: var(--color-text);
	}
	.stat__hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
