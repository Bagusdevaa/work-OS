<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { padding = 'md', class: className = '', children, ...rest }: Props = $props();
</script>

<div class="card card--{padding} {className}" {...rest}>
	{@render children()}
</div>

<style>
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		min-width: 0;
	}
	.card--sm {
		padding: var(--space-4);
	}
	.card--md {
		padding: var(--space-6);
	}
	.card--lg {
		padding: var(--space-8);
	}
	@media (max-width: 767px) {
		.card--md,
		.card--lg {
			padding: var(--space-4);
		}
	}
</style>
