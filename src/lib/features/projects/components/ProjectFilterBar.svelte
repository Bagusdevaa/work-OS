<script lang="ts">
	import type { Company } from '$lib/features/companies/company.types';
	import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '$lib/types/domain';

	interface Props {
		companies: Company[];
		companyId: string;
		view: string;
	}

	let { companies, companyId, view }: Props = $props();

	function submit(event: Event) {
		(event.currentTarget as HTMLSelectElement).form?.requestSubmit();
	}
</script>

<form method="GET" class="filters" aria-label="Filter projects">
	<label class="filters__field">
		<span class="filters__label">Company</span>
		<select name="company" class="control control--select" value={companyId} onchange={submit}>
			<option value="">All companies</option>
			{#each companies as company (company.id)}
				<option value={company.id}>{company.name}</option>
			{/each}
		</select>
	</label>
	<label class="filters__field">
		<span class="filters__label">Show</span>
		<select name="view" class="control control--select" value={view} onchange={submit}>
			<option value="open">Open projects</option>
			<option value="all">Everything</option>
			<optgroup label="By status">
				{#each PROJECT_STATUSES as status (status)}
					<option value={status}>{PROJECT_STATUS_LABELS[status]}</option>
				{/each}
			</optgroup>
		</select>
	</label>
	<noscript><button type="submit" class="btn">Apply</button></noscript>
</form>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}
	.filters__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 200px;
	}
	.filters__label {
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
	}
	.filters .control {
		min-height: 38px;
	}
	@media (max-width: 767px) {
		.filters__field {
			flex: 1;
			min-width: 0;
		}
	}
</style>
