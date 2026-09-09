<script lang="ts">
	import type { CompanyAccent } from '$lib/types/domain';

	interface Props {
		accent?: CompanyAccent | string | null;
		size?: 'sm' | 'md' | 'lg';
		/** Text rendered inside (e.g. an initial). */
		label?: string;
	}

	let { accent, size = 'md', label }: Props = $props();
	const color = $derived(`var(--accent-${accent ?? 'blue'})`);
</script>

<span
	class="swatch swatch--{size}"
	class:swatch--labelled={!!label}
	style:--swatch-color={color}
	aria-hidden="true"
>
	{label ?? ''}
</span>

<style>
	.swatch {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		background: var(--swatch-color);
		color: var(--color-text-inverse);
		font-weight: var(--weight-semibold);
	}
	.swatch--sm {
		width: 10px;
		height: 10px;
	}
	.swatch--md {
		width: 14px;
		height: 14px;
	}
	.swatch--lg {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		font-size: var(--text-body-1);
	}
	.swatch--labelled.swatch--md {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
	}
</style>
