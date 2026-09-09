<script lang="ts">
	import type { Snippet } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	type Variant = 'info' | 'success' | 'warning' | 'danger';

	interface Props {
		variant?: Variant;
		title?: string;
		children: Snippet;
	}

	let { variant = 'info', title, children }: Props = $props();

	const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert };
	const Icon = $derived(icons[variant]);
</script>

<div class="alert alert--{variant}" role={variant === 'danger' ? 'alert' : 'status'}>
	<Icon size={18} aria-hidden="true" />
	<div class="alert__body">
		{#if title}<strong class="alert__title">{title}</strong>{/if}
		<div>{@render children()}</div>
	</div>
</div>

<style>
	.alert {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		font-size: var(--text-small);
		line-height: var(--leading-normal);
	}
	.alert :global(svg) {
		flex-shrink: 0;
		margin-top: 1px;
	}
	.alert__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.alert__title {
		font-weight: var(--weight-semibold);
	}
	.alert--info {
		background: var(--color-info-bg);
		color: var(--color-info-text);
		border-color: var(--color-primary-100);
	}
	.alert--success {
		background: var(--color-success-bg);
		color: var(--color-success-text);
	}
	.alert--warning {
		background: var(--color-warning-bg);
		color: var(--color-warning-text);
	}
	.alert--danger {
		background: var(--color-danger-bg);
		color: var(--color-danger-text);
	}
</style>
