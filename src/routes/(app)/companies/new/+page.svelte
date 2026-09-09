<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CompanyForm from '$lib/features/companies/components/CompanyForm.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>New company · Work OS</title>
</svelte:head>

<PageHeader
	title="New company"
	description="Add a place you work so projects have a home."
	back={{ href: '/companies', label: 'Companies' }}
/>

<Card>
	<CompanyForm
		values={form?.values}
		errors={form?.errors}
		submitLabel="Create company"
		cancelHref="/companies"
	/>
</Card>
