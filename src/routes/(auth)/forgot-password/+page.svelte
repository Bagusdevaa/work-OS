<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Reset password · Work OS</title>
</svelte:head>

{#if form?.sent}
	<div class="intro">
		<h1>Check your email</h1>
		<p class="text-secondary">
			If an account exists for <strong>{form.email}</strong>, we sent a link to choose a new
			password. It expires in about an hour.
		</p>
	</div>
	<p class="switch text-small text-secondary"><a href="/login">Back to sign in</a></p>
{:else}
	<div class="intro">
		<h1>Reset your password</h1>
		<p class="text-secondary">We will email you a link to choose a new one.</p>
	</div>

	{#if form?.message}
		<Alert variant="danger">{form.message}</Alert>
	{:else if data.linkExpired}
		<Alert variant="warning">
			That reset link has expired or was already used. Request a new one below.
		</Alert>
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
		<Button type="submit" size="lg" loading={submitting}>Email me a reset link</Button>
	</form>

	<p class="switch text-small text-secondary">
		Remembered it? <a href="/login">Back to sign in</a>
	</p>
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
	.switch {
		text-align: center;
	}
</style>
