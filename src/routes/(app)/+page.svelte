<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';

	let { data } = $props();
	const firstName = $derived((data.user.displayName ?? data.user.email).split(/[\s@]/)[0]);
</script>

<svelte:head>
	<title>Dashboard · Work OS</title>
</svelte:head>

<PageHeader title="Good to see you, {firstName}" description="What matters right now." />

<EmptyState
	icon={Sparkles}
	title="Your command center is empty"
	description="Add a company and a project to start seeing what needs your attention."
>
	{#snippet action()}
		<Button href="/companies/new">Add your first company</Button>
	{/snippet}
</EmptyState>
