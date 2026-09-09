<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import FieldWrapper from './FieldWrapper.svelte';

	interface Props extends HTMLInputAttributes {
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
		...rest
	}: Props = $props();
</script>

<FieldWrapper {id} {label} {error} {hint}>
	<input
		{id}
		{name}
		class="control"
		class:control--invalid={!!error}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		{...rest}
	/>
</FieldWrapper>
