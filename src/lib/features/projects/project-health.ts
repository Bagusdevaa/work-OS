import {
	IN_FLIGHT_PROJECT_STATUSES,
	type HealthState,
	type MilestoneStatus,
	type ProjectStatus,
	type TaskStatus
} from '$lib/types/domain';
import { daysBetween, daysSince, toISODate } from '$lib/utils/dates';

export interface HealthTaskInput {
	status: TaskStatus;
	dueDate: string | null;
}

export interface HealthMilestoneInput {
	status: MilestoneStatus;
	dueDate: string | null;
}

export interface HealthInput {
	status: ProjectStatus;
	lastActivityAt: Date;
	nextAction: string | null;
	dueDate: string | null;
	tasks: HealthTaskInput[];
	milestones: HealthMilestoneInput[];
}

export interface ProjectHealth {
	state: HealthState;
	/** Human-readable signals, in the order they were evaluated. */
	reasons: string[];
}

/** Thresholds in days. Exported so the UI can explain the rules. */
export const HEALTH_THRESHOLDS = {
	attentionInactivity: 7,
	stalledInactivity: 14,
	blockedStalled: 7,
	stalledOverdue: 14
} as const;

const RANK: Record<HealthState, number> = { healthy: 0, needs_attention: 1, stalled: 2 };

function plural(count: number, noun: string): string {
	return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/**
 * Deterministic project health. Every triggered signal is reported as a reason;
 * the worst signal decides the state.
 */
export function calculateProjectHealth(input: HealthInput, now: Date): ProjectHealth {
	if (!IN_FLIGHT_PROJECT_STATUSES.includes(input.status)) {
		return { state: 'healthy', reasons: ['Not in progress'] };
	}

	const today = toISODate(now);
	const signals: Array<{ state: HealthState; reason: string }> = [];
	const flag = (state: HealthState, reason: string) => signals.push({ state, reason });

	const inactiveDays = daysSince(input.lastActivityAt, now);
	if (inactiveDays >= HEALTH_THRESHOLDS.stalledInactivity) {
		flag('stalled', `No activity for ${inactiveDays} days`);
	} else if (inactiveDays >= HEALTH_THRESHOLDS.attentionInactivity) {
		flag('needs_attention', `No activity for ${inactiveDays} days`);
	}

	if (input.status === 'blocked') {
		if (inactiveDays >= HEALTH_THRESHOLDS.blockedStalled) {
			flag('stalled', `Blocked for ${inactiveDays} days without activity`);
		} else {
			flag('needs_attention', 'Project is blocked');
		}
	}

	const openTasks = input.tasks.filter((task) => task.status !== 'done');
	const overdue = openTasks.filter((task) => task.dueDate !== null && task.dueDate < today);
	if (overdue.length > 0) {
		const maxOverdueDays = Math.max(...overdue.map((task) => daysBetween(task.dueDate!, today)));
		if (maxOverdueDays >= HEALTH_THRESHOLDS.stalledOverdue) {
			flag('stalled', `A task is ${maxOverdueDays} days overdue`);
		}
		flag('needs_attention', plural(overdue.length, 'overdue task'));
	}

	const blocked = openTasks.filter((task) => task.status === 'blocked').length;
	if (blocked > 0) flag('needs_attention', plural(blocked, 'blocked task'));

	const overdueMilestones = input.milestones.filter(
		(m) => m.status !== 'completed' && m.dueDate !== null && m.dueDate < today
	).length;
	if (overdueMilestones > 0) {
		flag('needs_attention', plural(overdueMilestones, 'overdue milestone'));
	}

	if (input.dueDate !== null && input.dueDate < today) {
		flag('needs_attention', 'Project is past its due date');
	}

	if (input.status === 'active' && !input.nextAction && openTasks.length === 0) {
		flag('needs_attention', 'No next action defined');
	}

	if (signals.length === 0) {
		return {
			state: 'healthy',
			reasons: [
				inactiveDays === 0 ? 'Active today' : `Active ${plural(inactiveDays, 'day')} ago`,
				'Nothing overdue'
			]
		};
	}

	const state = signals.reduce<HealthState>(
		(worst, signal) => (RANK[signal.state] > RANK[worst] ? signal.state : worst),
		'healthy'
	);
	return { state, reasons: [...new Set(signals.map((s) => s.reason))] };
}
