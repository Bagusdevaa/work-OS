<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import { afterNavigate } from '$app/navigation';
	import type { AppUser } from '$lib/features/users/user.types';
	import Sidebar from './Sidebar.svelte';
	import TopBar from './TopBar.svelte';

	interface Props {
		user: AppUser;
		children: Snippet;
	}

	let { user, children }: Props = $props();
	let drawerOpen = $state(false);

	function closeDrawer() {
		drawerOpen = false;
	}

	afterNavigate(closeDrawer);

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && drawerOpen) closeDrawer();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="shell">
	<aside class="shell__sidebar shell__sidebar--full"><Sidebar /></aside>
	<aside class="shell__sidebar shell__sidebar--rail"><Sidebar compact /></aside>

	{#if drawerOpen}
		<div class="drawer" id="mobile-nav">
			<button
				type="button"
				class="drawer__backdrop"
				aria-label="Close navigation"
				onclick={closeDrawer}
			></button>
			<div class="drawer__panel">
				<button
					type="button"
					class="drawer__close"
					aria-label="Close navigation"
					onclick={closeDrawer}
				>
					<X size={20} aria-hidden="true" />
				</button>
				<Sidebar onNavigate={closeDrawer} />
			</div>
		</div>
	{/if}

	<div class="shell__main">
		<TopBar {user} onMenu={() => (drawerOpen = true)} />
		<main class="shell__content">
			<div class="shell__container">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<style>
	.shell {
		min-height: 100dvh;
		display: flex;
	}
	.shell__sidebar {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 20;
	}
	.shell__sidebar--full {
		width: var(--sidebar-width);
	}
	.shell__sidebar--rail {
		width: var(--sidebar-rail-width);
		display: none;
	}
	.shell__main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		margin-left: var(--sidebar-width);
	}
	.shell__content {
		flex: 1;
		padding: var(--space-8) var(--page-padding) var(--space-16);
	}
	.shell__container {
		max-width: var(--content-max-width);
		margin: 0 auto;
	}

	.drawer {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: flex;
	}
	.drawer__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgba(30, 42, 85, 0.4);
	}
	.drawer__panel {
		position: relative;
		width: min(300px, 85vw);
		height: 100%;
		box-shadow: var(--shadow-lg);
		animation: slide-in var(--duration-normal) var(--ease-standard);
	}
	.drawer__close {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
	}
	.drawer__close:hover {
		background: var(--color-surface-hover);
	}
	@keyframes slide-in {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@media (max-width: 1279px) {
		.shell__sidebar--full {
			display: none;
		}
		.shell__sidebar--rail {
			display: block;
		}
		.shell__main {
			margin-left: var(--sidebar-rail-width);
		}
		.shell__content {
			padding-top: var(--space-6);
		}
	}

	@media (max-width: 767px) {
		.shell__sidebar--rail {
			display: none;
		}
		.shell__main {
			margin-left: 0;
		}
		.shell__content {
			padding-top: var(--space-4);
			padding-bottom: var(--space-10);
		}
	}
</style>
