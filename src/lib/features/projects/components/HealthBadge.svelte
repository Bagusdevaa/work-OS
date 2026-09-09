<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { HEALTH_LABELS, type HealthState } from '$lib/types/domain';

	interface Props {
		state: HealthState;
		size?: 'sm' | 'md';
		/** Shown as a native tooltip; keeps the reasoning one hover away. */
		reasons?: string[];
	}

	let { state, size = 'sm', reasons }: Props = $props();

	const tones = { healthy: 'success', needs_attention: 'warning', stalled: 'danger' } as const;
</script>

<span title={reasons?.join(' · ')}>
	<Badge tone={tones[state]} {size} dot>{HEALTH_LABELS[state]}</Badge>
</span>
