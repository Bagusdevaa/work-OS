<script lang="ts">
	import { enhance } from '$app/forms';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';

	interface Props {
		taskId: string;
		title: string;
		/** Position within the milestone group, zero-based. */
		index: number;
		/** Number of tasks in the group. */
		total: number;
		onDragStart: (event: DragEvent) => void;
		onDragEnd: () => void;
	}

	let { taskId, title, index, total, onDragStart, onDragEnd }: Props = $props();
</script>

<form method="POST" action="?/moveTask" class="reorder" use:enhance>
	<input type="hidden" name="taskId" value={taskId} />
	<button
		type="button"
		class="reorder__grip"
		draggable="true"
		ondragstart={onDragStart}
		ondragend={onDragEnd}
		aria-label="Drag to reorder {title}"
		title="Drag to reorder"
	>
		<GripVertical size={14} aria-hidden="true" />
	</button>
	<span class="reorder__steps">
		<button
			type="submit"
			name="toIndex"
			value={index - 1}
			class="reorder__step"
			disabled={index === 0}
			aria-label="Move {title} up"
		>
			<ChevronUp size={13} aria-hidden="true" />
		</button>
		<button
			type="submit"
			name="toIndex"
			value={index + 1}
			class="reorder__step"
			disabled={index >= total - 1}
			aria-label="Move {title} down"
		>
			<ChevronDown size={13} aria-hidden="true" />
		</button>
	</span>
</form>

<style>
	.reorder {
		display: flex;
		align-items: center;
		gap: 2px;
		padding-top: var(--space-3);
		flex-shrink: 0;
	}
	.reorder__grip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 22px;
		padding: 0;
		border: none;
		background: none;
		color: var(--color-text-muted);
		cursor: grab;
		border-radius: var(--radius-sm);
	}
	.reorder__grip:active {
		cursor: grabbing;
	}
	.reorder__grip:hover {
		background: var(--color-surface-hover);
		color: var(--color-text-secondary);
	}
	.reorder__steps {
		display: flex;
		flex-direction: column;
	}
	.reorder__step {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 14px;
		padding: 0;
		border: none;
		background: none;
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		/* Kept out of the way until wanted: revealed on hover or keyboard focus. */
		opacity: 0;
	}
	.reorder__step:disabled {
		color: var(--color-border-strong);
	}
	.reorder__step:not(:disabled):hover {
		background: var(--color-surface-hover);
		color: var(--color-text-secondary);
	}
	.reorder:hover .reorder__step,
	.reorder__step:focus-visible {
		opacity: 1;
	}
	/* Touch and keyboard users get no hover, so keep the buttons permanently visible. */
	@media (hover: none) {
		.reorder__step {
			opacity: 1;
		}
		.reorder__grip {
			display: none;
		}
	}
</style>
