<script lang="ts">
	import LogOut from '@lucide/svelte/icons/log-out';
	import Menu from '@lucide/svelte/icons/menu';
	import Plus from '@lucide/svelte/icons/plus';
	import type { AppUser } from '$lib/features/users/user.types';
	import Button from '$lib/components/ui/Button.svelte';
	import Logo from './Logo.svelte';

	interface Props {
		user: AppUser;
		onMenu: () => void;
	}

	let { user, onMenu }: Props = $props();

	const name = $derived(user.displayName ?? user.email);
	const initials = $derived(
		name
			.split(/[\s@._-]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<header class="topbar">
	<button
		type="button"
		class="topbar__menu"
		aria-label="Open navigation"
		aria-controls="mobile-nav"
		onclick={onMenu}
	>
		<Menu size={22} aria-hidden="true" />
	</button>
	<div class="topbar__brand"><Logo /></div>
	<div class="topbar__spacer"></div>
	<Button href="/inbox?capture=1" variant="secondary" size="sm">
		<Plus size={16} aria-hidden="true" />
		<span class="topbar__capture-label">Capture</span>
	</Button>
	<div class="topbar__user">
		<span class="topbar__avatar" aria-hidden="true">{initials}</span>
		<span class="topbar__name">{name}</span>
		<form method="POST" action="/auth/signout">
			<button type="submit" class="topbar__signout" aria-label="Sign out" title="Sign out">
				<LogOut size={18} aria-hidden="true" />
			</button>
		</form>
	</div>
</header>

<style>
	.topbar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		height: var(--topbar-height);
		padding: 0 var(--page-padding);
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}
	.topbar__menu {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text);
	}
	.topbar__menu:hover {
		background: var(--color-surface-hover);
	}
	.topbar__brand {
		display: none;
	}
	.topbar__spacer {
		flex: 1;
	}
	.topbar__user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-left: var(--space-3);
		border-left: 1px solid var(--color-border);
	}
	.topbar__avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: var(--radius-full);
		background: var(--color-primary-50);
		color: var(--color-primary-600);
		font-size: var(--text-small);
		font-weight: var(--weight-semibold);
	}
	.topbar__name {
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		color: var(--color-text-secondary);
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.topbar__signout {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
	}
	.topbar__signout:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	@media (max-width: 767px) {
		.topbar__menu {
			display: inline-flex;
		}
		.topbar__brand {
			display: flex;
		}
		.topbar__name,
		.topbar__capture-label {
			display: none;
		}
		.topbar__user {
			padding-left: var(--space-2);
		}
	}
</style>
