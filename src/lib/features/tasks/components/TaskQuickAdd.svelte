<script lang="ts">
	import { enhance } from '$app/forms';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Milestone } from '$lib/features/milestones/milestone.types';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { PRIORITIES, PRIORITY_LABELS } from '$lib/types/domain';

	interface Props {
		milestones: Pick<Milestone, 'id' | 'name'>[];
		values?: FormValues;
		errors?: FormErrors;
	}

	let { milestones, values = {}, errors = {} }: Props = $props();
	let saving = $state(false);
</script>

<form
	method="POST"
	action="?/createTask"
	class="quick-add"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			saving = false;
			await update({ reset: true });
		};
	}}
>
	<div class="quick-add__main">
		<label class="visually-hidden" for="quick-task-title">Task title</label>
		<input
			id="quick-task-title"
			name="title"
			class="control"
			class:control--invalid={!!errors.title}
			placeholder="Add a task…"
			maxlength={200}
			required
			value={values.title ?? ''}
			aria-invalid={errors.title ? 'true' : undefined}
			aria-describedby={errors.title ? 'quick-task-error' : undefined}
		/>
		<Button type="submit" loading={saving}>
			<Plus size={16} aria-hidden="true" />
			Add
		</Button>
	</div>
	{#if errors.title}<p class="quick-add__error" id="quick-task-error">{errors.title}</p>{/if}
	<div class="quick-add__options">
		<label class="quick-add__option">
			<span>Milestone</span>
			<select name="milestoneId" class="control control--select" value={values.milestoneId ?? ''}>
				<option value="">None</option>
				{#each milestones as milestone (milestone.id)}
					<option value={milestone.id}>{milestone.name}</option>
				{/each}
			</select>
		</label>
		<label class="quick-add__option">
			<span>Priority</span>
			<select name="priority" class="control control--select" value={values.priority ?? 'medium'}>
				{#each PRIORITIES as priority (priority)}
					<option value={priority}>{PRIORITY_LABELS[priority]}</option>
				{/each}
			</select>
		</label>
		<label class="quick-add__option">
			<span>Due</span>
			<input name="dueDate" type="date" class="control" value={values.dueDate ?? ''} />
		</label>
	</div>
	{#if errors.milestoneId || errors.dueDate}
		<p class="quick-add__error">{errors.milestoneId ?? errors.dueDate}</p>
	{/if}
</form>

<style>
	.quick-add {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
	}
	.quick-add__main {
		display: flex;
		gap: var(--space-2);
	}
	.quick-add__main .control {
		flex: 1;
		min-height: 40px;
	}
	.quick-add__options {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: var(--space-2);
	}
	.quick-add__option {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-width: 0;
	}
	.quick-add__option .control {
		min-height: 34px;
		padding-top: 4px;
		padding-bottom: 4px;
		font-size: var(--text-small);
	}
	.quick-add__error {
		font-size: var(--text-small);
		color: var(--color-danger-text);
	}
	@media (max-width: 767px) {
		.quick-add__options {
			grid-template-columns: 1fr;
		}
	}
</style>
