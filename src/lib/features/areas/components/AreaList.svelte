<script lang="ts">
	import { enhance } from '$app/forms';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import type { Area } from '../area.types';

	interface Props {
		areas: Area[];
		values?: FormValues;
		errors?: FormErrors;
	}

	let { areas, values = {}, errors = {} }: Props = $props();
	let adding = $state(false);
</script>

<div class="areas">
	{#if areas.length === 0}
		<p class="areas__empty">No areas yet. Areas are optional groupings like "Product" or "Data".</p>
	{:else}
		<ul class="areas__list">
			{#each areas as area (area.id)}
				<li class="areas__item">
					<div class="areas__text">
						<span class="areas__name">{area.name}</span>
						{#if area.description}<span class="areas__description">{area.description}</span>{/if}
					</div>
					<form
						method="POST"
						action="?/deleteArea"
						use:enhance
						onsubmit={(event) => {
							if (!confirm(`Remove area "${area.name}"? Projects in it will be kept.`)) {
								event.preventDefault();
							}
						}}
					>
						<input type="hidden" name="areaId" value={area.id} />
						<button type="submit" class="areas__delete" aria-label="Remove area {area.name}">
							<Trash2 size={16} aria-hidden="true" />
						</button>
					</form>
				</li>
			{/each}
		</ul>
	{/if}

	<form
		method="POST"
		action="?/createArea"
		class="areas__form"
		use:enhance={() => {
			adding = true;
			return async ({ update }) => {
				adding = false;
				await update({ reset: true });
			};
		}}
	>
		<Input
			label="New area"
			name="name"
			placeholder="e.g. Data Engineering"
			maxlength={80}
			value={values.name ?? ''}
			error={errors.name}
		/>
		<Button type="submit" variant="secondary" size="md" loading={adding}>Add area</Button>
	</form>
</div>

<style>
	.areas {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.areas__empty {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.areas__list {
		display: flex;
		flex-direction: column;
	}
	.areas__item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.areas__item:last-child {
		border-bottom: none;
	}
	.areas__text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.areas__name {
		font-weight: var(--weight-medium);
	}
	.areas__description {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.areas__delete {
		display: inline-flex;
		padding: var(--space-2);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
	}
	.areas__delete:hover {
		background: var(--color-danger-bg);
		color: var(--color-danger-text);
	}
	.areas__form {
		display: flex;
		align-items: flex-end;
		gap: var(--space-2);
	}
	.areas__form :global(.field) {
		flex: 1;
	}
</style>
