import type { LucideIcon } from '@lucide/svelte';
import Building2 from '@lucide/svelte/icons/building-2';
import CalendarDays from '@lucide/svelte/icons/calendar-days';
import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
import FolderKanban from '@lucide/svelte/icons/folder-kanban';
import Inbox from '@lucide/svelte/icons/inbox';
import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import ListTodo from '@lucide/svelte/icons/list-todo';

export interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	/** Match the path exactly instead of by prefix. */
	exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
	{ label: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
	{ label: 'My Work', href: '/my-work', icon: ListTodo },
	{ label: 'Projects', href: '/projects', icon: FolderKanban },
	{ label: 'Companies', href: '/companies', icon: Building2 },
	{ label: 'Inbox', href: '/inbox', icon: Inbox },
	{ label: 'Calendar', href: '/calendar', icon: CalendarDays },
	{ label: 'Weekly Review', href: '/reviews', icon: ClipboardCheck }
];

export function isNavActive(pathname: string, item: Pick<NavItem, 'href' | 'exact'>): boolean {
	if (item.exact) return pathname === item.href;
	return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
