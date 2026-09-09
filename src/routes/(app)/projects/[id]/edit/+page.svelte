<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ProjectForm from '$lib/features/projects/components/ProjectForm.svelte';

	let { data, form } = $props();
	const p = $derived(data.project);
	const values = $derived(
		form?.values ?? {
			name: p.name,
			description: p.description ?? '',
			companyId: p.companyId,
			areaId: p.areaId ?? '',
			status: p.status,
			type: p.type,
			priority: p.priority,
			startedAt: p.startedAt ?? '',
			dueDate: p.dueDate ?? '',
			why: p.why ?? '',
			goal: p.goal ?? '',
			currentFocus: p.currentFocus ?? '',
			nextAction: p.nextAction ?? ''
		}
	);
</script>

<svelte:head>
	<title>Edit {p.name} · Work OS</title>
</svelte:head>

<PageHeader title="Edit project" back={{ href: `/projects/${p.id}`, label: p.name }} />

<Card>
	<ProjectForm
		companies={data.companies}
		areas={data.areas}
		{values}
		errors={form?.errors}
		submitLabel="Save changes"
		cancelHref="/projects/{p.id}"
	/>
</Card>
