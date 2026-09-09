<script lang="ts">
	import type { Company } from '$lib/features/companies/company.types';
	import type { Project } from '$lib/features/projects/project.types';
	import { serializeWorkContext, type WorkContext } from '../my-work.utils';

	interface Props {
		companies: Company[];
		projects: Pick<Project, 'id' | 'name' | 'companyId'>[];
		context: WorkContext;
		view: string | null;
	}

	let { companies, projects, context, view }: Props = $props();
	const value = $derived(serializeWorkContext(context));

	function submit(event: Event) {
		(event.currentTarget as HTMLSelectElement).form?.requestSubmit();
	}
</script>

<form method="GET" class="filter" aria-label="Filter work by context">
	{#if view}<input type="hidden" name="view" value={view} />{/if}
	<label class="filter__field">
		<span class="filter__label">Context</span>
		<select name="context" class="control control--select" {value} onchange={submit}>
			<option value="all">Everything</option>
			<option value="personal">Personal projects</option>
			{#if companies.length}
				<optgroup label="Companies">
					{#each companies as company (company.id)}
						<option value="company:{company.id}">{company.name}</option>
					{/each}
				</optgroup>
			{/if}
			{#if projects.length}
				<optgroup label="Projects">
					{#each projects as project (project.id)}
						<option value="project:{project.id}">{project.name}</option>
					{/each}
				</optgroup>
			{/if}
		</select>
	</label>
	<noscript><button type="submit" class="btn">Apply</button></noscript>
</form>

<style>
	.filter {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}
	.filter__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 260px;
	}
	.filter__label {
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
	}
	.filter .control {
		min-height: 38px;
	}
	@media (max-width: 767px) {
		.filter__field {
			flex: 1;
			min-width: 0;
		}
	}
</style>
