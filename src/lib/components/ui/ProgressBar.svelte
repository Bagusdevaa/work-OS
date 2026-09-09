<script lang="ts">
	interface Props {
		percent: number;
		label: string;
		size?: 'sm' | 'md';
		tone?: 'primary' | 'success';
	}

	let { percent, label, size = 'sm', tone = 'primary' }: Props = $props();
	const clamped = $derived(Math.max(0, Math.min(100, percent)));
</script>

<div
	class="progress progress--{size}"
	role="progressbar"
	aria-label={label}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={clamped}
>
	<div class="progress__fill progress__fill--{tone}" style:width="{clamped}%"></div>
</div>

<style>
	.progress {
		width: 100%;
		background: var(--color-neutral-bg);
		border-radius: var(--radius-full);
		overflow: hidden;
	}
	.progress--sm {
		height: 6px;
	}
	.progress--md {
		height: 10px;
	}
	.progress__fill {
		height: 100%;
		border-radius: var(--radius-full);
		transition: width var(--duration-normal) var(--ease-standard);
	}
	.progress__fill--primary {
		background: var(--color-primary-500);
	}
	.progress__fill--success {
		background: var(--color-success);
	}
</style>
