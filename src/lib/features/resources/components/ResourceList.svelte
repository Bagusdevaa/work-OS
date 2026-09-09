<script lang="ts">
	import { enhance } from '$app/forms';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import FileText from '@lucide/svelte/icons/file-text';
	import Link from '@lucide/svelte/icons/link';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { RESOURCE_KINDS } from '$lib/types/domain';
	import type { Resource } from '../resource.types';

	interface Props {
		resources: Resource[];
		values?: FormValues;
		errors?: FormErrors;
		open?: boolean;
	}

	let { resources, values = {}, errors = {}, open = false }: Props = $props();
	let adding = $state(false);
	let saving = $state(false);

	$effect(() => {
		if (open) adding = true;
	});

	const kindOptions = RESOURCE_KINDS.map((k) => ({
		value: k,
		label: k[0].toUpperCase() + k.slice(1)
	}));
</script>

<div class="resources">
	{#if resources.length === 0 && !adding}
		<p class="resources__empty">No resources yet. Keep links and documents close to the work.</p>
	{/if}

	{#each resources as resource (resource.id)}
		<div class="resource">
			<span class="resource__icon" aria-hidden="true">
				{#if resource.kind === 'document'}<FileText size={16} />{:else}<Link size={16} />{/if}
			</span>
			<div class="resource__body">
				{#if resource.url}
					<a class="resource__title" href={resource.url} target="_blank" rel="noopener noreferrer">
						{resource.title}
						<ExternalLink size={12} aria-hidden="true" />
					</a>
				{:else}
					<span class="resource__title">{resource.title}</span>
				{/if}
				{#if resource.description}
					<span class="resource__description">{resource.description}</span>
				{/if}
			</div>
			<form
				method="POST"
				action="?/deleteResource"
				use:enhance
				onsubmit={(event) => {
					if (!confirm(`Remove resource "${resource.title}"?`)) event.preventDefault();
				}}
			>
				<input type="hidden" name="resourceId" value={resource.id} />
				<button type="submit" class="icon-button" aria-label="Remove resource {resource.title}">
					<Trash2 size={16} aria-hidden="true" />
				</button>
			</form>
		</div>
	{/each}

	{#if adding}
		<form
			method="POST"
			action="?/createResource"
			class="resources__form"
			use:enhance={() => {
				saving = true;
				return async ({ update, result }) => {
					saving = false;
					if (result.type === 'success') adding = false;
					await update({ reset: true });
				};
			}}
		>
			<Input label="Title" name="title" required value={values.title ?? ''} error={errors.title} />
			<Input
				label="URL"
				name="url"
				type="url"
				placeholder="https://"
				value={values.url ?? ''}
				error={errors.url}
			/>
			<div class="resources__row">
				<Select
					label="Kind"
					name="kind"
					options={kindOptions}
					value={values.kind ?? 'link'}
					error={errors.kind}
				/>
				<Input
					label="Description"
					name="description"
					value={values.description ?? ''}
					error={errors.description}
				/>
			</div>
			<div class="resources__actions">
				<Button variant="secondary" size="sm" onclick={() => (adding = false)}>Cancel</Button>
				<Button type="submit" size="sm" loading={saving}>Save resource</Button>
			</div>
		</form>
	{:else}
		<Button variant="secondary" size="sm" onclick={() => (adding = true)}>
			<Plus size={14} aria-hidden="true" />
			Add resource
		</Button>
	{/if}
</div>

<style>
	.resources {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.resources__empty {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.resource {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}
	.resource__icon {
		display: inline-flex;
		padding: var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-primary-50);
		color: var(--color-primary-600);
		flex-shrink: 0;
	}
	.resource__body {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}
	.resource__title {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		overflow-wrap: anywhere;
	}
	.resource__description {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.resources__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.resources__row {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--space-3);
	}
	.resources__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
