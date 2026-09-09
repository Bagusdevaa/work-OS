import { isTaskOverdue, sortTasks } from '$lib/features/tasks/task.utils';
import type { Priority, TaskStatus } from '$lib/types/domain';
import { addDays } from '$lib/utils/dates';

export type WorkContext =
	| { kind: 'all' }
	| { kind: 'personal' }
	| { kind: 'company'; id: string }
	| { kind: 'project'; id: string };

interface ContextFields {
	companyId: string;
	projectId: string;
	projectType: string;
}

export function filterTasksByContext<T extends ContextFields>(
	tasks: T[],
	context: WorkContext
): T[] {
	switch (context.kind) {
		case 'all':
			return tasks;
		case 'personal':
			return tasks.filter((task) => task.projectType === 'personal');
		case 'company':
			return tasks.filter((task) => task.companyId === context.id);
		case 'project':
			return tasks.filter((task) => task.projectId === context.id);
	}
}

/** Parses `context=company:<id>` / `project:<id>` / `personal` / anything else → all. */
export function parseWorkContext(value: string | null): WorkContext {
	if (value === 'personal') return { kind: 'personal' };
	const [kind, id] = (value ?? '').split(':');
	if ((kind === 'company' || kind === 'project') && id) return { kind, id };
	return { kind: 'all' };
}

export function serializeWorkContext(context: WorkContext): string {
	return 'id' in context ? `${context.kind}:${context.id}` : context.kind;
}

export type WorkSectionKey = 'overdue' | 'today' | 'week' | 'blocked' | 'next';

export interface WorkSection<T> {
	key: WorkSectionKey;
	title: string;
	description: string;
	tasks: T[];
}

const SECTION_META: Record<WorkSectionKey, { title: string; description: string }> = {
	overdue: { title: 'Overdue', description: 'Past due and still open.' },
	today: { title: 'Due today', description: 'Commitments for today.' },
	week: { title: 'This week', description: 'Due in the next 7 days.' },
	blocked: { title: 'Blocked', description: 'Waiting on something. Unblock or reschedule.' },
	next: { title: 'Next up', description: 'Everything else, most important first.' }
};

interface Sectionable {
	status: TaskStatus;
	priority: Priority;
	dueDate: string | null;
	sortOrder: number;
	createdAt: Date;
}

function sectionFor(task: Sectionable, today: string, weekEnd: string): WorkSectionKey {
	if (task.status === 'blocked') return 'blocked';
	if (isTaskOverdue(task, today)) return 'overdue';
	if (task.dueDate === today) return 'today';
	if (task.dueDate !== null && task.dueDate <= weekEnd) return 'week';
	return 'next';
}

/** Splits open tasks into mutually exclusive, ordered sections; empty sections are omitted. */
export function sectionTasks<T extends Sectionable>(tasks: T[], today: string): WorkSection<T>[] {
	const weekEnd = addDays(today, 7);
	const buckets: Record<WorkSectionKey, T[]> = {
		overdue: [],
		today: [],
		week: [],
		blocked: [],
		next: []
	};
	for (const task of sortTasks(tasks, today)) {
		if (task.status === 'done') continue;
		buckets[sectionFor(task, today, weekEnd)].push(task);
	}
	return (Object.keys(SECTION_META) as WorkSectionKey[])
		.filter((key) => buckets[key].length > 0)
		.map((key) => ({ key, ...SECTION_META[key], tasks: buckets[key] }));
}
