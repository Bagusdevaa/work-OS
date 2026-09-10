<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Choose a new password · Work OS</title>
</svelte:head>

{#if form?.updated}
	<div class="intro">
		<h1>Password updated</h1>
		<p class="text-secondary">Your new password is saved and you are signed in.</p>
	</div>
	<Button href="/" size="lg">Go to dashboard</Button>
{:else}
	<div class="intro">
		<h1>Choose a new password</h1>
		<p class="text-secondary">You are signed in from the reset link. Pick something new.</p>
	</div>

	{#if form?.message}
		<Alert variant="danger">{form.message}</Alert>
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
			label="New password"
			name="password"
			type="password"
			autocomplete="new-password"
			required
			hint="At least 8 characters"
			error={form?.errors?.password}
		/>
		<Input
			label="Confirm new password"
			name="confirmPassword"
			type="password"
			autocomplete="new-password"
			required
			error={form?.errors?.confirmPassword}
		/>
		<Button type="submit" size="lg" loading={submitting}>Save new password</Button>
	</form>
{/if}

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
</style>
