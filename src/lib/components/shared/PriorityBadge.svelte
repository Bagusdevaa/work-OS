<script lang="ts">
	import Flag from '@lucide/svelte/icons/flag';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { PRIORITY_LABELS, type Priority } from '$lib/types/domain';

	interface Props {
		priority: Priority;
		size?: 'sm' | 'md';
	}

	let { priority, size = 'sm' }: Props = $props();

	const tones = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'danger' } as const;
</script>

<Badge tone={tones[priority]} {size}>
	<Flag size={12} aria-hidden="true" />
	{PRIORITY_LABELS[priority]}
</Badge>
