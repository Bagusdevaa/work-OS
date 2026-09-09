<script lang="ts">
	import { enhance } from '$app/forms';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/Button.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { INBOX_KINDS, INBOX_KIND_LABELS } from '$lib/types/domain';

	interface Props {
		values?: FormValues;
		errors?: FormErrors;
		autofocus?: boolean;
	}

	let { values = {}, errors = {}, autofocus = false }: Props = $props();
	let saving = $state(false);
	let textarea: HTMLTextAreaElement | undefined = $state();

	$effect(() => {
		if (autofocus) textarea?.focus();
	});

	function submitOnEnter(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
		}
	}
</script>

<form
	method="POST"
	action="?/capture"
	class="capture"
	use:enhance={() => {
		saving = true;
		return async ({ update, result }) => {
			saving = false;
			await update({ reset: result.type === 'success' });
			if (result.type === 'success') textarea?.focus();
		};
	}}
>
	<label class="visually-hidden" for="capture-content">What's on your mind?</label>
	<textarea
		id="capture-content"
		name="content"
		class="control control--textarea capture__input"
		class:control--invalid={!!errors.content}
		rows={2}
		maxlength={2000}
		placeholder="Capture a task, idea, link or reminder… (⌘/Ctrl + Enter to save)"
		required
		bind:this={textarea}
		onkeydown={submitOnEnter}
		aria-invalid={errors.content ? 'true' : undefined}
		aria-describedby={errors.content ? 'capture-error' : undefined}>{values.content ?? ''}</textarea
	>
	{#if errors.content}<p class="capture__error" id="capture-error">{errors.content}</p>{/if}
	<div class="capture__row">
		<label class="capture__kind">
			<span class="visually-hidden">Kind</span>
			<select name="kind" class="control control--select" value={values.kind ?? ''}>
				<option value="">Detect automatically</option>
				{#each INBOX_KINDS as kind (kind)}
					<option value={kind}>{INBOX_KIND_LABELS[kind]}</option>
				{/each}
			</select>
		</label>
		<Button type="submit" loading={saving}>
			<Plus size={16} aria-hidden="true" />
			Capture
		</Button>
	</div>
</form>

<style>
	.capture {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.capture__input {
		font-size: var(--text-body-1);
	}
	.capture__error {
		font-size: var(--text-small);
		color: var(--color-danger-text);
	}
	.capture__row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.capture__kind .control {
		min-height: 40px;
		width: auto;
	}
</style>
