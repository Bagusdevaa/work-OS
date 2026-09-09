<script lang="ts">
	import { enhance } from '$app/forms';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';

	interface Props {
		projects: Array<{ id: string; name: string }>;
		defaultDate: string;
		values?: FormValues;
		errors?: FormErrors;
		open?: boolean;
	}

	let { projects, defaultDate, values = {}, errors = {}, open = false }: Props = $props();
	let adding = $state(false);
	let saving = $state(false);

	$effect(() => {
		if (open) adding = true;
	});

	const projectOptions = $derived(projects.map((p) => ({ value: p.id, label: p.name })));
</script>

{#if adding}
	<form
		method="POST"
		action="?/createEvent"
		class="event-form"
		use:enhance={() => {
			saving = true;
			return async ({ update, result }) => {
				saving = false;
				if (result.type === 'success') adding = false;
				await update({ reset: true });
			};
		}}
	>
		<Input
			label="Title"
			name="title"
			required
			maxlength={160}
			value={values.title ?? ''}
			error={errors.title}
			placeholder="e.g. Board meeting"
		/>
		<div class="event-form__row">
			<Input
				label="Date"
				name="date"
				type="date"
				required
				value={values.date ?? defaultDate}
				error={errors.date}
			/>
			<Input
				label="Time"
				name="time"
				type="time"
				value={values.time ?? ''}
				error={errors.time}
				hint="Leave empty for all day"
			/>
		</div>
		<Select
			label="Project"
			name="projectId"
			options={projectOptions}
			placeholder="Not linked to a project"
			value={values.projectId ?? ''}
			error={errors.projectId}
		/>
		<Input
			label="Description"
			name="description"
			value={values.description ?? ''}
			error={errors.description}
		/>
		<div class="event-form__actions">
			<Button variant="secondary" size="sm" onclick={() => (adding = false)}>Cancel</Button>
			<Button type="submit" size="sm" loading={saving}>Add event</Button>
		</div>
	</form>
{:else}
	<Button variant="secondary" onclick={() => (adding = true)}>
		<Plus size={16} aria-hidden="true" />
		Add event
	</Button>
{/if}

<style>
	.event-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(100%, 520px);
	}
	.event-form__row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}
	.event-form__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.event-form__row {
			grid-template-columns: 1fr;
		}
	}
</style>
