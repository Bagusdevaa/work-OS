<script lang="ts">
	import ArrowDownWideNarrow from '@lucide/svelte/icons/arrow-down-wide-narrow';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import type { TaskSortMode } from '../task.utils';

	interface Props {
		mode: TaskSortMode;
		/** Page path the links point back to. */
		base: string;
	}

	let { mode, base }: Props = $props();
</script>

<div class="sort" role="group" aria-label="Task order">
	<a
		href="{base}?sort=smart"
		class="sort__option"
		class:sort__option--active={mode === 'smart'}
		aria-current={mode === 'smart' ? 'true' : undefined}
		title="Overdue and urgent work first"
	>
		<ArrowDownWideNarrow size={13} aria-hidden="true" />
		Smart
	</a>
	<a
		href="{base}?sort=manual"
		class="sort__option"
		class:sort__option--active={mode === 'manual'}
		aria-current={mode === 'manual' ? 'true' : undefined}
		title="Your own order, drag to rearrange"
	>
		<GripVertical size={13} aria-hidden="true" />
		Manual
	</a>
</div>

<style>
	.sort {
		display: inline-flex;
		padding: 2px;
		gap: 2px;
		background: var(--color-surface-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}
	.sort__option {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: calc(var(--radius-sm) - 1px);
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}
	.sort__option:hover {
		color: var(--color-text);
	}
	.sort__option--active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
	}
</style>
