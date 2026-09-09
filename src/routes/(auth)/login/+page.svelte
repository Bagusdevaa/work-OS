<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Sign in · Work OS</title>
</svelte:head>

<div class="intro">
	<h1>Welcome back</h1>
	<p class="text-secondary">Sign in to pick up where you left off.</p>
</div>

{#if form?.message}
	<Alert variant="danger">{form.message}</Alert>
{:else if data.linkError}
	<Alert variant="warning">That sign-in link is invalid or has expired. Please sign in again.</Alert
	>
{/if}

<form
	method="POST"
	class="form"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			submitting = false;
			await update();
		};
	}}
>
	<Input
		label="Email"
		name="email"
		type="email"
		autocomplete="email"
		required
		value={form?.values?.email ?? ''}
		error={form?.errors?.email}
	/>
	<Input
		label="Password"
		name="password"
		type="password"
		autocomplete="current-password"
		required
		error={form?.errors?.password}
	/>
	<Button type="submit" size="lg" loading={submitting}>Sign in</Button>
</form>

<p class="switch text-small text-secondary">
	New here? <a href="/signup">Create an account</a>
</p>

<style>
	.intro {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.switch {
		text-align: center;
	}
</style>
