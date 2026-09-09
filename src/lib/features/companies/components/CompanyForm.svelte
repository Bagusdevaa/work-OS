<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { COMPANY_ACCENTS, COMPANY_ACCENT_LABELS } from '$lib/types/domain';

	interface Props {
		values?: FormValues;
		errors?: FormErrors;
		submitLabel: string;
		cancelHref: string;
	}

	let { values = {}, errors = {}, submitLabel, cancelHref }: Props = $props();
	let submitting = $state(false);

	const accentOptions = COMPANY_ACCENTS.map((value) => ({
		value,
		label: COMPANY_ACCENT_LABELS[value]
	}));
</script>

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
		name="name"
		required
		maxlength={120}
		value={values.name ?? ''}
		error={errors.name}
		placeholder="e.g. Constructland"
	/>
	<Textarea
		label="Description"
		name="description"
		rows={3}
		value={values.description ?? ''}
		error={errors.description}
		hint="What you do there, in a sentence or two."
	/>
	<Select
		label="Accent colour"
		name="accent"
		options={accentOptions}
		value={values.accent ?? 'blue'}
		error={errors.accent}
	/>
	<div class="form__actions">
		<Button href={cancelHref} variant="secondary">Cancel</Button>
		<Button type="submit" loading={submitting}>{submitLabel}</Button>
	</div>
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 560px;
	}
	.form__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		padding-top: var(--space-2);
	}
</style>
