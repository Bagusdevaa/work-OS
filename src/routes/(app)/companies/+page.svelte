<script lang="ts">
	import Building2 from '@lucide/svelte/icons/building-2';
	import Plus from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CompanyCard from '$lib/features/companies/components/CompanyCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Companies · Work OS</title>
</svelte:head>

<PageHeader title="Companies" description="Where your work happens.">
	{#snippet actions()}
		<Button href={data.includeArchived ? '/companies' : '/companies?archived=1'} variant="ghost">
			{data.includeArchived ? 'Hide archived' : 'Show archived'}
		</Button>
		<Button href="/companies/new">
			<Plus size={16} aria-hidden="true" />
			New company
		</Button>
	{/snippet}
</PageHeader>

{#if data.companies.length === 0}
	<EmptyState
		icon={Building2}
		title="No companies yet"
		description="A company is where your work happens. Add one to start organising projects."
	>
		{#snippet action()}
			<Button href="/companies/new">Add a company</Button>
		{/snippet}
	</EmptyState>
{:else}
	<div class="grid">
		{#each data.companies as company (company.id)}
			<CompanyCard {company} />
		{/each}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-4);
	}
</style>
