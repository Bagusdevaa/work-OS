<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary';

	interface Props {
		tone?: Tone;
		size?: 'sm' | 'md';
		/** Shows a leading dot so state is not communicated by colour alone. */
		dot?: boolean;
		children: Snippet;
	}

	let { tone = 'neutral', size = 'md', dot = false, children }: Props = $props();
</script>

<span class="badge badge--{tone} badge--{size}">
	{#if dot}<span class="badge__dot" aria-hidden="true"></span>{/if}
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		line-height: 1.6;
		white-space: nowrap;
	}
	.badge--md {
		font-size: var(--text-small);
		padding: 2px var(--space-3);
	}
	.badge__dot {
		width: 6px;
		height: 6px;
		border-radius: var(--radius-full);
		background: currentColor;
	}
	.badge--neutral {
		background: var(--color-neutral-bg);
		color: var(--color-neutral-text);
	}
	.badge--info {
		background: var(--color-info-bg);
		color: var(--color-info-text);
	}
	.badge--success {
		background: var(--color-success-bg);
		color: var(--color-success-text);
	}
	.badge--warning {
		background: var(--color-warning-bg);
		color: var(--color-warning-text);
	}
	.badge--danger {
		background: var(--color-danger-bg);
		color: var(--color-danger-text);
	}
	.badge--primary {
		background: var(--color-primary-500);
		color: var(--color-text-inverse);
	}
</style>
