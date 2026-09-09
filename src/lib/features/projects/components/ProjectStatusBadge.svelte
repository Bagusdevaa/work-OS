<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { PROJECT_STATUS_LABELS, type ProjectStatus } from '$lib/types/domain';

	interface Props {
		status: ProjectStatus;
		size?: 'sm' | 'md';
	}

	let { status, size = 'sm' }: Props = $props();

	const tones = {
		idea: 'neutral',
		planning: 'info',
		active: 'success',
		paused: 'neutral',
		blocked: 'danger',
		completed: 'primary',
		archived: 'neutral'
	} as const;
</script>

<Badge tone={tones[status]} {size} dot>{PROJECT_STATUS_LABELS[status]}</Badge>
