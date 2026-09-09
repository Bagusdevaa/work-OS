<script lang="ts">
	import Logo from './Logo.svelte';
	import NavLink from './NavLink.svelte';
	import { NAV_ITEMS } from './navigation';

	interface Props {
		/** Icon-only rail (tablet). */
		compact?: boolean;
		onNavigate?: () => void;
	}

	let { compact = false, onNavigate }: Props = $props();
</script>

<nav class="sidebar" class:sidebar--compact={compact} aria-label="Main navigation">
	<div class="sidebar__brand">
		<a href="/" class="sidebar__brand-link" aria-label="Work OS home" onclick={onNavigate}>
			<Logo {compact} />
		</a>
	</div>
	<ul class="sidebar__list">
		{#each NAV_ITEMS as item (item.href)}
			<li><NavLink {item} {compact} {onNavigate} /></li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
		padding: var(--space-4);
		gap: var(--space-6);
	}
	.sidebar__brand {
		display: flex;
		align-items: center;
		min-height: 48px;
		padding: 0 var(--space-2);
	}
	.sidebar__brand-link {
		display: inline-flex;
		text-decoration: none;
	}
	.sidebar__brand-link:hover {
		text-decoration: none;
	}
	.sidebar__list {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.sidebar--compact .sidebar__brand {
		justify-content: center;
		padding: 0;
	}
</style>
