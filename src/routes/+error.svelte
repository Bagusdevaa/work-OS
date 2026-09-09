<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';

	const title = $derived(
		page.status === 404 ? 'Page not found' : page.error?.message || 'Something went wrong'
	);
</script>

<svelte:head>
	<title>{page.status} · Work OS</title>
</svelte:head>

<div class="error-page">
	<p class="error-page__code">{page.status}</p>
	<h1>{title}</h1>
	<p class="text-secondary">
		{#if page.status === 404}
			The page you are looking for does not exist or has moved.
		{:else}
			Please try again. If the problem persists, check the server logs.
		{/if}
	</p>
	<Button href="/" variant="secondary">Back to dashboard</Button>
</div>

<style>
	.error-page {
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: var(--space-3);
		padding: var(--space-8) var(--space-4);
	}
	.error-page__code {
		font-size: var(--text-small);
		font-weight: var(--weight-semibold);
		color: var(--color-primary-600);
		letter-spacing: 0.08em;
	}
</style>
