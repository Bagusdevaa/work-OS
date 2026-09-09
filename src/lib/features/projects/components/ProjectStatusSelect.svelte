<script lang="ts">
	import { enhance } from '$app/forms';
	import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type ProjectStatus } from '$lib/types/domain';

	interface Props {
		status: ProjectStatus;
	}

	let { status }: Props = $props();
</script>

<form method="POST" action="?/setStatus" class="status-form" use:enhance>
	<label class="visually-hidden" for="project-status">Project status</label>
	<select
		id="project-status"
		name="status"
		class="control control--select status-form__select"
		value={status}
		onchange={(event) => event.currentTarget.form?.requestSubmit()}
	>
		{#each PROJECT_STATUSES as value (value)}
			<option {value}>{PROJECT_STATUS_LABELS[value]}</option>
		{/each}
	</select>
	<noscript><button type="submit" class="btn">Update</button></noscript>
</form>

<style>
	.status-form {
		display: inline-flex;
	}
	.status-form__select {
		width: auto;
		min-height: 40px;
		font-weight: var(--weight-medium);
	}
</style>
