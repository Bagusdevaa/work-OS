<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ProjectForm from '$lib/features/projects/components/ProjectForm.svelte';

	let { data, form } = $props();
	const values = $derived(
		form?.values ?? { companyId: data.presetCompanyId, name: data.presetName }
	);
</script>

<svelte:head>
	<title>New project · Work OS</title>
</svelte:head>

<PageHeader
	title="New project"
	description="Give the work a name, a home and a reason."
	back={{ href: '/projects', label: 'Projects' }}
/>

<Card>
	<ProjectForm
		companies={data.companies}
		areas={data.areas}
		{values}
		errors={form?.errors}
		submitLabel="Create project"
		cancelHref="/projects"
		hidden={data.inboxItemId ? { inboxItemId: data.inboxItemId } : undefined}
	/>
</Card>
