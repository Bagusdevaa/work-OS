<script lang="ts">
	import { page } from '$app/state';
	import { isNavActive, type NavItem } from './navigation';

	interface Props {
		item: NavItem;
		compact?: boolean;
		onNavigate?: () => void;
	}

	let { item, compact = false, onNavigate }: Props = $props();
	const active = $derived(isNavActive(page.url.pathname, item));
</script>

<a
	href={item.href}
	class="nav-link"
	class:nav-link--active={active}
	class:nav-link--compact={compact}
	aria-current={active ? 'page' : undefined}
	title={compact ? item.label : undefined}
	onclick={onNavigate}
>
	<item.icon size={20} aria-hidden="true" />
	<span class="nav-link__label">{item.label}</span>
</a>

<style>
	.nav-link {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-weight: var(--weight-medium);
		font-size: var(--text-body-2);
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			color var(--duration-fast) var(--ease-standard);
	}
	.nav-link:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
		text-decoration: none;
	}
	.nav-link--active {
		background: var(--color-primary-50);
		color: var(--color-primary-600);
	}
	.nav-link--active::before {
		content: '';
		position: absolute;
		left: calc(-1 * var(--space-4));
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 60%;
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		background: var(--color-primary-500);
	}
	.nav-link--compact {
		justify-content: center;
		padding: var(--space-3);
	}
	.nav-link--compact .nav-link__label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}
</style>
