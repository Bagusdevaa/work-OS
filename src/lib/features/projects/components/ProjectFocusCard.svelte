<script lang="ts">
	import { enhance } from '$app/forms';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Target from '@lucide/svelte/icons/target';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { FormErrors } from '$lib/server/forms';
	import type { Project } from '../project.types';

	interface Props {
		project: Project;
		errors?: FormErrors;
		/** Opens the editor immediately (e.g. after a validation error). */
		open?: boolean;
	}

	let { project, errors = {}, open = false }: Props = $props();
	let editing = $state(false);
	let saving = $state(false);

	$effect(() => {
		if (open) editing = true;
	});
</script>

<Card>
	<div class="focus">
		<div class="focus__header">
			<h2 class="focus__title"><Target size={18} aria-hidden="true" /> Focus</h2>
			{#if !editing}
				<Button variant="ghost" size="sm" onclick={() => (editing = true)}>
					<Pencil size={14} aria-hidden="true" />
					Edit
				</Button>
			{/if}
		</div>

		{#if editing}
			<form
				method="POST"
				action="?/updateFocus"
				class="focus__form"
				use:enhance={() => {
					saving = true;
					return async ({ update, result }) => {
						saving = false;
						if (result.type === 'success') editing = false;
						await update();
					};
				}}
			>
				<Input
					label="Current focus"
					name="currentFocus"
					value={project.currentFocus ?? ''}
					error={errors.currentFocus}
					placeholder="What are you working towards right now?"
				/>
				<Input
					label="Next action"
					name="nextAction"
					value={project.nextAction ?? ''}
					error={errors.nextAction}
					placeholder="The single next concrete step"
				/>
				<div class="focus__actions">
					<Button variant="secondary" size="sm" onclick={() => (editing = false)}>Cancel</Button>
					<Button type="submit" size="sm" loading={saving}>Save</Button>
				</div>
			</form>
		{:else}
			<dl class="focus__list">
				<div class="focus__item">
					<dt>Current focus</dt>
					<dd class:focus__empty={!project.currentFocus}>
						{project.currentFocus ?? 'Not set — what are you working towards?'}
					</dd>
				</div>
				<div class="focus__item focus__item--next">
					<dt>Next action</dt>
					<dd class:focus__empty={!project.nextAction}>
						{project.nextAction ?? 'Not set — define the next concrete step.'}
					</dd>
				</div>
			</dl>
		{/if}
	</div>
</Card>

<style>
	.focus {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.focus__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.focus__title {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-h3);
		font-weight: var(--weight-semibold);
	}
	.focus__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
	}
	.focus__item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.focus__item dt {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}
	.focus__item dd {
		margin: 0;
		font-size: var(--text-body-2);
	}
	.focus__item--next dd {
		font-weight: var(--weight-medium);
		color: var(--color-primary-700);
	}
	.focus__empty {
		color: var(--color-text-muted) !important;
		font-weight: var(--weight-regular) !important;
		font-style: italic;
	}
	.focus__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.focus__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
