<script lang="ts">
	interface Props {
		compact?: boolean;
	}
	let { compact = false }: Props = $props();
</script>

<span class="logo" class:logo--compact={compact}>
	<span class="logo__mark" aria-hidden="true">W</span>
	{#if !compact}<span class="logo__text">Work OS</span>{/if}
</span>

<style>
	.logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-text);
		font-weight: var(--weight-semibold);
		font-size: var(--text-h3);
	}
	.logo__mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-sm);
		background: var(--gradient-primary);
		color: var(--color-text-inverse);
		font-size: var(--text-body-1);
		font-weight: var(--weight-semibold);
		letter-spacing: -0.02em;
	}
</style>
