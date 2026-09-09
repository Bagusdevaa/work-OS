<script lang="ts">
	import { enhance } from '$app/forms';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { describeTimeAgo } from '$lib/utils/dates';
	import type { Note } from '../note.types';

	interface Props {
		notes: Note[];
		values?: FormValues;
		errors?: FormErrors;
		open?: boolean;
	}

	let { notes, values = {}, errors = {}, open = false }: Props = $props();
	let adding = $state(false);
	let saving = $state(false);

	$effect(() => {
		if (open) adding = true;
	});
</script>

<div class="notes">
	{#if notes.length === 0 && !adding}
		<p class="notes__empty">No notes yet. Capture decisions, context or ideas for this project.</p>
	{/if}

	{#each notes as note (note.id)}
		<article class="note">
			<div class="note__header">
				<h3 class="note__title">{note.title}</h3>
				<form
					method="POST"
					action="?/deleteNote"
					use:enhance
					onsubmit={(event) => {
						if (!confirm(`Delete note "${note.title}"?`)) event.preventDefault();
					}}
				>
					<input type="hidden" name="noteId" value={note.id} />
					<button type="submit" class="icon-button" aria-label="Delete note {note.title}">
						<Trash2 size={16} aria-hidden="true" />
					</button>
				</form>
			</div>
			{#if note.content}<p class="note__content">{note.content}</p>{/if}
			<p class="note__time">{describeTimeAgo(note.updatedAt)}</p>
		</article>
	{/each}

	{#if adding}
		<form
			method="POST"
			action="?/createNote"
			class="notes__form"
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
			<Textarea
				label="Content"
				name="content"
				rows={4}
				value={values.content ?? ''}
				error={errors.content}
			/>
			<div class="notes__actions">
				<Button variant="secondary" size="sm" onclick={() => (adding = false)}>Cancel</Button>
				<Button type="submit" size="sm" loading={saving}>Save note</Button>
			</div>
		</form>
	{:else}
		<Button variant="secondary" size="sm" onclick={() => (adding = true)}>
			<Plus size={14} aria-hidden="true" />
			Add note
		</Button>
	{/if}
</div>

<style>
	.notes {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.notes__empty {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
	.note {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}
	.note__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.note__title {
		font-size: var(--text-body-2);
		font-weight: var(--weight-semibold);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.note__content {
		font-size: var(--text-small);
		color: var(--color-text-secondary);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.note__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.notes__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.notes__actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
</style>
