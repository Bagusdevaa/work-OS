<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		label: string;
		error?: string | null;
		hint?: string;
		children: Snippet;
	}

	let { id, label, error = null, hint, children }: Props = $props();
</script>

<div class="field">
	<label class="field__label" for={id}>{label}</label>
	{@render children()}
	{#if error}
		<p class="field__error" id="{id}-error">{error}</p>
	{:else if hint}
		<p class="field__hint" id="{id}-hint">{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.field__label {
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
	}
	.field__error {
		font-size: var(--text-small);
		color: var(--color-danger-text);
	}
	.field__hint {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
</style>
