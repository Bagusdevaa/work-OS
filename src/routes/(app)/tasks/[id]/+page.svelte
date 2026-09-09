<script lang="ts">
	import { enhance } from '$app/forms';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Swatch from '$lib/components/ui/Swatch.svelte';
	import TaskForm from '$lib/features/tasks/components/TaskForm.svelte';

	let { data, form } = $props();
	const t = $derived(data.task);
	const values = $derived(
		form?.values ?? {
			title: t.title,
			description: t.description ?? '',
			milestoneId: t.milestoneId ?? '',
			status: t.status,
			priority: t.priority,
			dueDate: t.dueDate ?? '',
			estimatedMinutes: t.estimatedMinutes?.toString() ?? ''
		}
	);
</script>

<svelte:head>
	<title>{t.title} · Work OS</title>
</svelte:head>

<PageHeader title={t.title} back={{ href: `/projects/${t.projectId}`, label: t.projectName }}>
	{#snippet eyebrow()}
		<span class="context">
			<Swatch accent={t.companyAccent} size="sm" />
			{t.companyName} · {t.projectName}
		</span>
	{/snippet}
	{#snippet actions()}
		<form
			method="POST"
			action="?/delete"
			use:enhance
			onsubmit={(event) => {
				if (!confirm(`Delete task "${t.title}"?`)) event.preventDefault();
			}}
		>
			<Button type="submit" variant="ghost">
				<Trash2 size={16} aria-hidden="true" />
				Delete
			</Button>
		</form>
	{/snippet}
</PageHeader>

<Card>
	<TaskForm
		milestones={data.milestones}
		{values}
		errors={form?.errors}
		submitLabel="Save task"
		cancelHref="/projects/{t.projectId}"
	/>
</Card>

<style>
	.context {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
</style>
