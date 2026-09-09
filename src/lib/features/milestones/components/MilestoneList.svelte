<script lang="ts">
	import { enhance } from '$app/forms';
	import Check from '@lucide/svelte/icons/check';
	import Flag from '@lucide/svelte/icons/flag';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { describeDueDate, todayISO } from '$lib/utils/dates';
	import type { MilestoneWithProgress } from '../milestone.types';
	import { isMilestoneOverdue } from '../milestone.utils';

	interface Props {
		milestones: MilestoneWithProgress[];
		values?: FormValues;
		errors?: FormErrors;
		open?: boolean;
	}

	let { milestones, values = {}, errors = {}, open = false }: Props = $props();
	let adding = $state(false);
	let saving = $state(false);
	const today = todayISO();

	$effect(() => {
		if (open) adding = true;
	});
</script>

<div class="milestones">
	{#if milestones.length === 0 && !adding}
		<EmptyState
			size="sm"
			icon={Flag}
			title="No milestones yet"
			description="Milestones break the project into meaningful outcomes. Progress is calculated from their tasks."
		/>
	{/if}

	{#each milestones as milestone (milestone.id)}
		{@const done = milestone.status === 'completed'}
		{@const overdue = isMilestoneOverdue(milestone, today)}
		<div class="milestone" class:milestone--done={done}>
			<form method="POST" action="?/setMilestoneStatus" use:enhance>
				<input type="hidden" name="milestoneId" value={milestone.id} />
				<input type="hidden" name="status" value={done ? 'active' : 'completed'} />
				<button
					type="submit"
					class="milestone__toggle"
					class:milestone__toggle--done={done}
					aria-label={done ? `Reopen ${milestone.name}` : `Complete ${milestone.name}`}
					title={done ? 'Reopen' : 'Mark complete'}
				>
					{#if done}<Check size={14} aria-hidden="true" />{/if}
				</button>
			</form>
			<div class="milestone__body">
				<div class="milestone__head">
					<span class="milestone__name">{milestone.name}</span>
					{#if milestone.dueDate}
						<span class="milestone__due" class:milestone__due--overdue={overdue}>
							{done ? 'Completed' : describeDueDate(milestone.dueDate, today)}
						</span>
					{/if}
				</div>
				{#if milestone.description}
					<p class="milestone__description">{milestone.description}</p>
				{/if}
				<div class="milestone__progress">
					<ProgressBar
						percent={milestone.progress.percent}
						label="{milestone.name} progress"
						tone={done ? 'success' : 'primary'}
					/>
					<span class="milestone__count">
						{#if milestone.progress.total === 0}No tasks{:else}{milestone.progress.done}/{milestone
								.progress.total} tasks{/if}
					</span>
				</div>
			</div>
			<form
				method="POST"
				action="?/deleteMilestone"
				use:enhance
				onsubmit={(event) => {
					if (!confirm(`Remove milestone "${milestone.name}"? Its tasks will be kept.`)) {
						event.preventDefault();
					}
				}}
			>
				<input type="hidden" name="milestoneId" value={milestone.id} />
				<button type="submit" class="icon-button" aria-label="Remove milestone {milestone.name}">
					<Trash2 size={16} aria-hidden="true" />
				</button>
			</form>
		</div>
	{/each}

	{#if adding}
		<form
			method="POST"
			action="?/createMilestone"
			class="milestones__form"
			use:enhance={() => {
				saving = true;
				return async ({ update, result }) => {
					saving = false;
					if (result.type === 'success') adding = false;
					await update({ reset: true });
				};
			}}
		>
			<div class="milestones__row">
				<Input
					label="Milestone"
					name="name"
					required
					placeholder="e.g. Pipeline runs nightly"
					value={values.name ?? ''}
					error={errors.name}
				/>
				<Input
					label="Due date"
					name="dueDate"
					type="date"
					value={values.dueDate ?? ''}
					error={errors.dueDate}
				/>
			</div>
			<div class="milestones__actions">
				<Button variant="secondary" size="sm" onclick={() => (adding = false)}>Cancel</Button>
				<Button type="submit" size="sm" loading={saving}>Add milestone</Button>
			</div>
		</form>
	{:else}
		<div>
			<Button variant="secondary" size="sm" onclick={() => (adding = true)}>
				<Plus size={14} aria-hidden="true" />
				Add milestone
			</Button>
		</div>
	{/if}
</div>

<style>
	.milestones {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.milestone {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}
	.milestone__toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		margin-top: 2px;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text-inverse);
		padding: 0;
	}
	.milestone__toggle:hover {
		border-color: var(--color-primary-500);
	}
	.milestone__toggle--done {
		background: var(--color-success);
		border-color: var(--color-success);
	}
	.milestone__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
	}
	.milestone__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.milestone__name {
		font-weight: var(--weight-medium);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.milestone--done .milestone__name {
		color: var(--color-text-muted);
		text-decoration: line-through;
	}
	.milestone__due {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	.milestone__due--overdue {
		color: var(--color-danger-text);
		font-weight: var(--weight-medium);
	}
	.milestone__description {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
	.milestone__progress {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-top: var(--space-1);
	}
	.milestone__count {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	.milestones__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.milestones__row {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--space-3);
	}
	.milestones__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.milestones__row {
			grid-template-columns: 1fr;
		}
	}
</style>
