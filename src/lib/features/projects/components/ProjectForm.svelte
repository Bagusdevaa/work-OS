<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { Area } from '$lib/features/areas/area.types';
	import type { Company } from '$lib/features/companies/company.types';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import {
		PRIORITIES,
		PRIORITY_LABELS,
		PROJECT_STATUSES,
		PROJECT_STATUS_LABELS,
		PROJECT_TYPES,
		PROJECT_TYPE_LABELS
	} from '$lib/types/domain';

	interface Props {
		companies: Company[];
		areas: Area[];
		values?: FormValues;
		errors?: FormErrors;
		submitLabel: string;
		cancelHref: string;
		/** Extra hidden fields to submit (e.g. the inbox item this project came from). */
		hidden?: Record<string, string>;
	}

	let {
		companies,
		areas,
		values = {},
		errors = {},
		submitLabel,
		cancelHref,
		hidden = {}
	}: Props = $props();
	let submitting = $state(false);
	// svelte-ignore state_referenced_locally
	let companyId = $state(values.companyId || companies[0]?.id || '');

	const companyOptions = $derived(companies.map((c) => ({ value: c.id, label: c.name })));
	const areaOptions = $derived(
		areas.filter((a) => a.companyId === companyId).map((a) => ({ value: a.id, label: a.name }))
	);
	const statusOptions = PROJECT_STATUSES.map((v) => ({
		value: v,
		label: PROJECT_STATUS_LABELS[v]
	}));
	const typeOptions = PROJECT_TYPES.map((v) => ({ value: v, label: PROJECT_TYPE_LABELS[v] }));
	const priorityOptions = PRIORITIES.map((v) => ({ value: v, label: PRIORITY_LABELS[v] }));
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
	{#each Object.entries(hidden) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}
	<fieldset class="form__group">
		<legend class="form__legend">Basics</legend>
		<Input
			label="Name"
			name="name"
			required
			maxlength={160}
			value={values.name ?? ''}
			error={errors.name}
			placeholder="e.g. Finalize scraping pipeline"
		/>
		<Textarea
			label="Description"
			name="description"
			rows={3}
			value={values.description ?? ''}
			error={errors.description}
		/>
		<div class="form__row">
			<Select
				label="Company"
				name="companyId"
				options={companyOptions}
				bind:value={companyId}
				error={errors.companyId}
				required
			/>
			<Select
				label="Area"
				name="areaId"
				options={areaOptions}
				placeholder={areaOptions.length ? 'No area' : 'No areas in this company'}
				value={values.areaId ?? ''}
				error={errors.areaId}
				disabled={areaOptions.length === 0}
			/>
		</div>
		<div class="form__row form__row--three">
			<Select
				label="Status"
				name="status"
				options={statusOptions}
				value={values.status ?? 'idea'}
				error={errors.status}
			/>
			<Select
				label="Type"
				name="type"
				options={typeOptions}
				value={values.type ?? 'work'}
				error={errors.type}
			/>
			<Select
				label="Priority"
				name="priority"
				options={priorityOptions}
				value={values.priority ?? 'medium'}
				error={errors.priority}
			/>
		</div>
	</fieldset>

	<fieldset class="form__group">
		<legend class="form__legend">Context</legend>
		<Textarea
			label="Why"
			name="why"
			rows={2}
			value={values.why ?? ''}
			error={errors.why}
			hint="Why does this project matter?"
		/>
		<Textarea
			label="Goal"
			name="goal"
			rows={2}
			value={values.goal ?? ''}
			error={errors.goal}
			hint="What does done look like?"
		/>
	</fieldset>

	<fieldset class="form__group">
		<legend class="form__legend">Focus</legend>
		<Input
			label="Current focus"
			name="currentFocus"
			maxlength={1000}
			value={values.currentFocus ?? ''}
			error={errors.currentFocus}
			placeholder="What are you working towards right now?"
		/>
		<Input
			label="Next action"
			name="nextAction"
			maxlength={500}
			value={values.nextAction ?? ''}
			error={errors.nextAction}
			placeholder="The single next concrete step"
		/>
	</fieldset>

	<fieldset class="form__group">
		<legend class="form__legend">Timeline</legend>
		<div class="form__row">
			<Input
				label="Started"
				name="startedAt"
				type="date"
				value={values.startedAt ?? ''}
				error={errors.startedAt}
			/>
			<Input
				label="Due date"
				name="dueDate"
				type="date"
				value={values.dueDate ?? ''}
				error={errors.dueDate}
			/>
		</div>
	</fieldset>

	<div class="form__actions">
		<Button href={cancelHref} variant="secondary">Cancel</Button>
		<Button type="submit" loading={submitting}>{submitLabel}</Button>
	</div>
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		max-width: 720px;
	}
	.form__group {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		border: none;
		min-width: 0;
	}
	.form__legend {
		font-size: var(--text-small);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-2);
	}
	.form__row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}
	.form__row--three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.form__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.form__row,
		.form__row--three {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
