<script lang="ts">
	import { enhance } from '$app/forms';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { FormErrors } from '$lib/server/forms';
	import { INBOX_KIND_LABELS, PRIORITIES, PRIORITY_LABELS } from '$lib/types/domain';
	import { describeTimeAgo } from '$lib/utils/dates';
	import type { InboxItemWithLinks } from '../inbox.types';

	interface ProjectOption {
		id: string;
		name: string;
		companyName: string;
	}

	interface Props {
		item: InboxItemWithLinks;
		projects: ProjectOption[];
		errors?: FormErrors;
		/** Which inline form to open initially (after a validation error). */
		openForm?: 'task' | 'note' | null;
	}

	let { item, projects, errors = {}, openForm = null }: Props = $props();
	let mode = $state<'task' | 'note' | null>(null);
	let busy = $state(false);

	$effect(() => {
		if (openForm) mode = openForm;
	});

	const kindTones = {
		task: 'info',
		idea: 'warning',
		note: 'neutral',
		link: 'primary',
		reminder: 'danger'
	} as const;
	const projectHref = $derived(
		`/projects/new?inbox=${item.id}&name=${encodeURIComponent(item.content.split('\n')[0].slice(0, 160))}`
	);

	const submit = () => {
		busy = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			busy = false;
			await update();
		};
	};
</script>

<article class="item">
	<div class="item__head">
		<Badge tone={kindTones[item.kind]} size="sm">{INBOX_KIND_LABELS[item.kind]}</Badge>
		<span class="item__time">{describeTimeAgo(item.createdAt)}</span>
	</div>
	<p class="item__content">
		{item.content}
		{#if item.url && item.url !== item.content}
			<a class="item__url" href={item.url} target="_blank" rel="noopener noreferrer">
				<ExternalLink size={12} aria-hidden="true" /> open link
			</a>
		{:else if item.url}
			<a class="item__url" href={item.url} target="_blank" rel="noopener noreferrer">
				<ExternalLink size={12} aria-hidden="true" /> open
			</a>
		{/if}
	</p>

	{#if mode === 'task'}
		<form method="POST" action="?/convertToTask" class="item__form" use:enhance={submit}>
			<input type="hidden" name="itemId" value={item.id} />
			<label class="item__field">
				<span>Project</span>
				<select name="projectId" class="control control--select" required>
					<option value="">Choose a project…</option>
					{#each projects as project (project.id)}
						<option value={project.id}>{project.name} · {project.companyName}</option>
					{/each}
				</select>
			</label>
			<label class="item__field item__field--narrow">
				<span>Priority</span>
				<select name="priority" class="control control--select" value="medium">
					{#each PRIORITIES as priority (priority)}
						<option value={priority}>{PRIORITY_LABELS[priority]}</option>
					{/each}
				</select>
			</label>
			<label class="item__field item__field--narrow">
				<span>Due</span>
				<input name="dueDate" type="date" class="control" />
			</label>
			{#if errors.projectId || errors.dueDate}
				<p class="item__error">{errors.projectId ?? errors.dueDate}</p>
			{/if}
			<div class="item__form-actions">
				<Button variant="secondary" size="sm" onclick={() => (mode = null)}>Cancel</Button>
				<Button type="submit" size="sm" loading={busy}>Create task</Button>
			</div>
		</form>
	{:else if mode === 'note'}
		<form method="POST" action="?/convertToNote" class="item__form" use:enhance={submit}>
			<input type="hidden" name="itemId" value={item.id} />
			<label class="item__field">
				<span>Project</span>
				<select name="projectId" class="control control--select" required>
					<option value="">Choose a project…</option>
					{#each projects as project (project.id)}
						<option value={project.id}>{project.name} · {project.companyName}</option>
					{/each}
				</select>
			</label>
			{#if errors.projectId}<p class="item__error">{errors.projectId}</p>{/if}
			<div class="item__form-actions">
				<Button variant="secondary" size="sm" onclick={() => (mode = null)}>Cancel</Button>
				<Button type="submit" size="sm" loading={busy}>Save note</Button>
			</div>
		</form>
	{:else}
		<div class="item__actions">
			<Button
				size="sm"
				variant="secondary"
				onclick={() => (mode = 'task')}
				disabled={!projects.length}
			>
				Make task
			</Button>
			<Button size="sm" variant="ghost" onclick={() => (mode = 'note')} disabled={!projects.length}>
				Save as note
			</Button>
			<Button size="sm" variant="ghost" href={projectHref}>
				Start project
				<ArrowRight size={14} aria-hidden="true" />
			</Button>
			<form method="POST" action="?/dismiss" class="item__dismiss" use:enhance={submit}>
				<input type="hidden" name="itemId" value={item.id} />
				<Button type="submit" size="sm" variant="ghost">Dismiss</Button>
			</form>
		</div>
	{/if}
</article>

<style>
	.item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--color-border);
	}
	.item:last-child {
		border-bottom: none;
	}
	.item__head {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.item__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.item__content {
		font-size: var(--text-body-1);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.item__url {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		margin-left: var(--space-2);
		font-size: var(--text-xs);
	}
	.item__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}
	.item__dismiss {
		margin-left: auto;
	}
	.item__form {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--color-surface-muted);
	}
	.item__field {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		min-width: 0;
	}
	.item__field .control {
		min-height: 36px;
		padding-top: 4px;
		padding-bottom: 4px;
		font-size: var(--text-small);
	}
	.item__error {
		grid-column: 1 / -1;
		font-size: var(--text-small);
		color: var(--color-danger-text);
	}
	.item__form-actions {
		grid-column: 1 / -1;
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.item__form {
			grid-template-columns: minmax(0, 1fr);
		}
		.item__dismiss {
			margin-left: 0;
		}
	}
</style>
