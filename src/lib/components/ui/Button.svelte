<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		/** Renders an anchor styled as a button. */
		href?: string;
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		href,
		loading = false,
		disabled = false,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const classes = $derived(`btn btn--${variant} btn--${size} ${className}`.trim());
</script>

{#if href}
	<a {href} class={classes} {...rest as unknown as HTMLAnchorAttributes}>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		class={classes}
		disabled={disabled || loading}
		aria-busy={loading || undefined}
		{...rest}
	>
		{#if loading}
			<LoaderCircle class="btn__spinner" size={16} aria-hidden="true" />
		{/if}
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-weight: var(--weight-medium);
		line-height: 1;
		white-space: nowrap;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			border-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}
	.btn:hover {
		text-decoration: none;
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn--sm {
		font-size: var(--text-small);
		padding: 0 var(--space-3);
		height: 32px;
	}
	.btn--md {
		font-size: var(--text-button-sm);
		padding: 0 var(--space-4);
		height: 40px;
	}
	.btn--lg {
		font-size: var(--text-button);
		padding: 0 var(--space-6);
		height: 48px;
	}

	.btn--primary {
		background: var(--color-primary-500);
		color: var(--color-text-inverse);
		box-shadow: var(--shadow-sm);
	}
	.btn--primary:hover:not(:disabled) {
		background: var(--color-primary-600);
	}

	.btn--secondary {
		background: var(--color-surface);
		color: var(--color-text);
		border-color: var(--color-border-strong);
	}
	.btn--secondary:hover:not(:disabled) {
		background: var(--color-surface-hover);
		border-color: var(--color-primary-300);
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text-secondary);
	}
	.btn--ghost:hover:not(:disabled) {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.btn--danger {
		background: var(--color-danger);
		color: var(--color-text-inverse);
	}
	.btn--danger:hover:not(:disabled) {
		background: var(--color-danger-text);
	}

	.btn :global(.btn__spinner) {
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
