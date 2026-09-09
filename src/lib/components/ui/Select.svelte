<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import FieldWrapper from './FieldWrapper.svelte';

	export interface SelectOption {
		value: string;
		label: string;
	}

	interface Props extends HTMLSelectAttributes {
		label: string;
		name: string;
		id?: string;
		options: SelectOption[];
		/** Adds an empty first option with this label. */
		placeholder?: string;
		error?: string | null;
		hint?: string;
		value?: string;
	}

	let {
		label,
		name,
		id = name,
		options,
		placeholder,
		error = null,
		hint,
		value = $bindable(''),
		...rest
	}: Props = $props();
</script>

<FieldWrapper {id} {label} {error} {hint}>
	<select
		{id}
		{name}
		class="control control--select"
		class:control--invalid={!!error}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		{...rest}
	>
		{#if placeholder}
			<option value="">{placeholder}</option>
		{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</FieldWrapper>
