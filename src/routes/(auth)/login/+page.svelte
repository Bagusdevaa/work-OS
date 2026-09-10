<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
	let sendingLink = $state(false);
</script>

<svelte:head>
	<title>Sign in · Work OS</title>
</svelte:head>

{#if form?.magicLinkSent}
	<div class="intro">
		<h1>Check your email</h1>
		<p class="text-secondary">
			If an account exists for <strong>{form.email}</strong>, we sent a one-time sign-in link.
		</p>
	</div>
	<p class="switch text-small text-secondary"><a href="/login">Back to sign in</a></p>
{:else}
	<div class="intro">
		<h1>Welcome back</h1>
		<p class="text-secondary">Sign in to pick up where you left off.</p>
	</div>

	{#if form?.message}
		<Alert variant="danger">{form.message}</Alert>
	{:else if data.linkError}
		<Alert variant="warning"
			>That sign-in link is invalid or has expired. Please sign in again.</Alert
		>
	{/if}

	<form
		method="POST"
		action="?/password"
		class="form"
		use:enhance={({ submitter }) => {
			const magic = submitter?.hasAttribute('formnovalidate');
			if (magic) sendingLink = true;
			else submitting = true;
			return async ({ update }) => {
				sendingLink = false;
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
			error={form?.errors?.email ?? form?.magicErrors?.email}
		/>
		<Input
			label="Password"
			name="password"
			type="password"
			autocomplete="current-password"
			required
			error={form?.errors?.password}
		/>
		<div class="forgot">
			<a href="/forgot-password" class="text-small">Forgot your password?</a>
		</div>
		<Button type="submit" size="lg" loading={submitting}>Sign in</Button>

		<div class="divider"><span>or</span></div>

		<!-- formnovalidate lets the link request skip the required password field. -->
		<Button
			type="submit"
			formaction="?/magicLink"
			formnovalidate
			variant="secondary"
			size="lg"
			loading={sendingLink}
		>
			Email me a sign-in link
		</Button>
	</form>

	<p class="switch text-small text-secondary">
		New here? <a href="/signup">Create an account</a>
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
	.forgot {
		margin-top: calc(var(--space-2) * -1);
	}
	.divider {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}
	.switch {
		text-align: center;
	}
</style>
