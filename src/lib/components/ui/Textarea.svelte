<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import FieldWrapper from './FieldWrapper.svelte';

	interface Props extends HTMLTextareaAttributes {
		label: string;
		name: string;
		id?: string;
		error?: string | null;
		hint?: string;
		value?: string;
	}

	let {
		label,
		name,
		id = name,
		error = null,
		hint,
		value = $bindable(''),
		rows = 3,
		...rest
	}: Props = $props();
</script>

<FieldWrapper {id} {label} {error} {hint}>
	<textarea
		{id}
		{name}
		{rows}
		class="control control--textarea"
		class:control--invalid={!!error}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		{...rest}></textarea>
</FieldWrapper>
