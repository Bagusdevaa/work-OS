<script lang="ts">
	import { enhance } from '$app/forms';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Section from '$lib/components/ui/Section.svelte';
	import CaptureForm from '$lib/features/inbox/components/CaptureForm.svelte';
	import InboxItemCard from '$lib/features/inbox/components/InboxItemCard.svelte';
	import { describeTimeAgo } from '$lib/utils/dates';
	import { pluralize } from '$lib/utils/text';

	let { data, form } = $props();
	const open = $derived(data.inbox.open);
</script>

<svelte:head>
	<title>Inbox · Work OS</title>
</svelte:head>

<PageHeader
	title="Inbox"
	description="Capture now, decide later. Process items into tasks, notes or projects when you have a moment."
/>

<div class="layout">
	<Card>
		<CaptureForm
			values={form?.captureValues}
			errors={form?.captureErrors}
			autofocus={data.autofocus}
		/>
	</Card>

	<Card>
		<Section title="To process" meta={open.length ? pluralize(open.length, 'item') : undefined}>
			{#if open.length === 0}
				<EmptyState
					size="sm"
					icon={Inbox}
					title="Inbox zero"
					description="Nothing waiting. Capture anything above and it will land here."
				/>
			{:else}
				<div class="items">
					{#each open as item (item.id)}
						<InboxItemCard
							{item}
							projects={data.projects}
							errors={form?.itemId === item.id ? form?.itemErrors : undefined}
							openForm={form?.itemId === item.id ? (form?.form ?? null) : null}
						/>
					{/each}
				</div>
			{/if}
		</Section>
	</Card>

	{#if data.inbox.processed.length > 0 || data.inbox.dismissed.length > 0}
		<details class="history">
			<summary class="history__summary">
				Recently processed ({data.inbox.processed.length}) · Dismissed ({data.inbox.dismissed
					.length})
			</summary>
			<Card>
				<ul class="history__list">
					{#each data.inbox.processed as item (item.id)}
						<li class="history__item">
							<span class="history__content">{item.content}</span>
							<span class="history__meta">
								{#if item.convertedTaskTitle && item.convertedProjectId}
									→ task in <a href="/projects/{item.convertedProjectId}"
										>{item.convertedProjectName}</a
									>
								{:else if item.convertedProjectId}
									→ <a href="/projects/{item.convertedProjectId}">{item.convertedProjectName}</a>
								{:else}
									processed
								{/if}
								· {describeTimeAgo(item.processedAt ?? item.updatedAt)}
							</span>
						</li>
					{/each}
					{#each data.inbox.dismissed as item (item.id)}
						<li class="history__item history__item--dismissed">
							<span class="history__content">{item.content}</span>
							<form method="POST" action="?/restore" use:enhance>
								<input type="hidden" name="itemId" value={item.id} />
								<Button type="submit" size="sm" variant="ghost">Restore</Button>
							</form>
						</li>
					{/each}
				</ul>
			</Card>
		</details>
	{/if}
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 860px;
	}
	.items {
		display: flex;
		flex-direction: column;
	}
	.history__summary {
		cursor: pointer;
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-3);
	}
	.history__list {
		display: flex;
		flex-direction: column;
	}
	.history__item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border);
		font-size: var(--text-small);
	}
	.history__item:last-child {
		border-bottom: none;
	}
	.history__content {
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}
	.history__item--dismissed .history__content {
		color: var(--color-text-muted);
		text-decoration: line-through;
	}
	.history__meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		white-space: nowrap;
	}
</style>
