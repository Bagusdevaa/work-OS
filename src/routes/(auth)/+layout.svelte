<script lang="ts">
	import Logo from '$lib/components/layout/Logo.svelte';

	let { children } = $props();
</script>

<div class="auth">
	<main class="auth__card">
		<div class="auth__brand"><Logo /></div>
		{@render children()}
	</main>
	<p class="auth__footer text-muted text-small">Your personal command center for work.</p>
</div>

<style>
	.auth {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-6);
		padding: var(--space-6) var(--space-4);
	}
	.auth__card {
		width: 100%;
		max-width: 420px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.auth__brand {
		display: flex;
		justify-content: center;
	}
	@media (max-width: 767px) {
		.auth__card {
			padding: var(--space-6);
		}
	}
</style>
