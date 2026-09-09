<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { FormErrors, FormValues } from '$lib/server/forms';
	import { formatDateTime } from '$lib/utils/dates';

	interface Props {
		values: FormValues;
		errors?: FormErrors;
		saved?: boolean;
		lastSavedAt?: Date | null;
	}

	let { values, errors = {}, saved = false, lastSavedAt = null }: Props = $props();
	let saving = $state(false);
</script>

<form
	method="POST"
	class="review-form"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			saving = false;
			await update({ reset: false });
		};
	}}
>
	<Textarea
		label="Wins"
		name="wins"
		rows={3}
		value={values.wins ?? ''}
		error={errors.wins}
		placeholder="What went well? What moved forward?"
	/>
	<Textarea
		label="Problems"
		name="problems"
		rows={3}
		value={values.problems ?? ''}
		error={errors.problems}
		placeholder="What got stuck, slipped or surprised you?"
	/>
	<Textarea
		label="Lessons"
		name="lessons"
		rows={3}
		value={values.lessons ?? ''}
		error={errors.lessons}
		placeholder="What would you do differently?"
	/>
	<Textarea
		label="Next week's priorities"
		name="nextWeekPriorities"
		rows={4}
		value={values.nextWeekPriorities ?? ''}
		error={errors.nextWeekPriorities}
		placeholder="The few things that matter most next week."
	/>
	<div class="review-form__footer">
		<span class="review-form__status" role="status">
			{#if saved}Saved.{:else if lastSavedAt}Last saved {formatDateTime(lastSavedAt)}{:else}Not
				saved yet{/if}
		</span>
		<Button type="submit" loading={saving}>Save review</Button>
	</div>
</form>

<style>
	.review-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.review-form__footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.review-form__status {
		font-size: var(--text-small);
		color: var(--color-text-muted);
	}
</style>
