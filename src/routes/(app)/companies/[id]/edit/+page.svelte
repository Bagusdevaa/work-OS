<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CompanyForm from '$lib/features/companies/components/CompanyForm.svelte';

	let { data, form } = $props();
	const values = $derived(
		form?.values ?? {
			name: data.company.name,
			description: data.company.description ?? '',
			accent: data.company.accent ?? 'blue'
		}
	);
</script>

<svelte:head>
	<title>Edit {data.company.name} · Work OS</title>
</svelte:head>

<PageHeader
	title="Edit company"
	back={{ href: `/companies/${data.company.id}`, label: data.company.name }}
/>

<Card>
	<CompanyForm
		{values}
		errors={form?.errors}
		submitLabel="Save changes"
		cancelHref="/companies/{data.company.id}"
	/>
</Card>
