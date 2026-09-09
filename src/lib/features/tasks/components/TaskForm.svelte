<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { Milestone } from '$lib/features/milestones/milestone.types';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import {
		PRIORITIES,
		PRIORITY_LABELS,
		TASK_STATUSES,
		TASK_STATUS_LABELS
	} from '$lib/types/domain';

	interface Props {
		milestones: Pick<Milestone, 'id' | 'name'>[];
		values?: FormValues;
		errors?: FormErrors;
		submitLabel: string;
		cancelHref: string;
	}

	let { milestones, values = {}, errors = {}, submitLabel, cancelHref }: Props = $props();
	let submitting = $state(false);

	const milestoneOptions = $derived(milestones.map((m) => ({ value: m.id, label: m.name })));
	const statusOptions = TASK_STATUSES.map((v) => ({ value: v, label: TASK_STATUS_LABELS[v] }));
	const priorityOptions = PRIORITIES.map((v) => ({ value: v, label: PRIORITY_LABELS[v] }));
</script>

<form
	method="POST"
	action="?/save"
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
		label="Title"
		name="title"
		required
		maxlength={200}
		value={values.title ?? ''}
		error={errors.title}
	/>
	<Textarea
		label="Description"
		name="description"
		rows={4}
		value={values.description ?? ''}
		error={errors.description}
	/>
	<div class="form__row">
		<Select
			label="Status"
			name="status"
			options={statusOptions}
			value={values.status ?? 'todo'}
			error={errors.status}
		/>
		<Select
			label="Priority"
			name="priority"
			options={priorityOptions}
			value={values.priority ?? 'medium'}
			error={errors.priority}
		/>
	</div>
	<div class="form__row">
		<Select
			label="Milestone"
			name="milestoneId"
			options={milestoneOptions}
			placeholder="No milestone"
			value={values.milestoneId ?? ''}
			error={errors.milestoneId}
		/>
		<Input
			label="Due date"
			name="dueDate"
			type="date"
			value={values.dueDate ?? ''}
			error={errors.dueDate}
		/>
	</div>
	<Input
		label="Estimated effort (minutes)"
		name="estimatedMinutes"
		type="number"
		inputmode="numeric"
		min={0}
		step={5}
		value={values.estimatedMinutes ?? ''}
		error={errors.estimatedMinutes}
		hint="Rough estimate; used to suggest quick wins."
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
		max-width: 640px;
	}
	.form__row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}
	.form__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.form__row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
