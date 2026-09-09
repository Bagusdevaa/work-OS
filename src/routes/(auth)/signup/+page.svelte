<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Create account · Work OS</title>
</svelte:head>

{#if form?.confirmationSent}
	<div class="intro">
		<h1>Check your email</h1>
		<p class="text-secondary">
			We sent a confirmation link to <strong>{form.email}</strong>. Open it to activate your
			account.
		</p>
	</div>
	<p class="switch text-small text-secondary"><a href="/login">Back to sign in</a></p>
{:else}
	<div class="intro">
		<h1>Create your account</h1>
		<p class="text-secondary">One place for every company, project and task.</p>
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
			label="Name"
			name="displayName"
			autocomplete="name"
			value={form?.values?.displayName ?? ''}
			error={form?.errors?.displayName}
		/>
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
			autocomplete="new-password"
			required
			hint="At least 8 characters"
			error={form?.errors?.password}
		/>
		<Button type="submit" size="lg" loading={submitting}>Create account</Button>
	</form>

	<p class="switch text-small text-secondary">
		Already have an account? <a href="/login">Sign in</a>
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
