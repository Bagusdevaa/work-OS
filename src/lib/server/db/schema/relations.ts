import { relations } from 'drizzle-orm';
import { activities } from './activities';
import { areas } from './areas';
import { companies } from './companies';
import { events } from './events';
import { milestones } from './milestones';
import { notes } from './notes';
import { projects } from './projects';
import { resources } from './resources';
import { tasks } from './tasks';

export const companiesRelations = relations(companies, ({ many }) => ({
	areas: many(areas),
	projects: many(projects)
}));

export const areasRelations = relations(areas, ({ one, many }) => ({
	company: one(companies, { fields: [areas.companyId], references: [companies.id] }),
	projects: many(projects)
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	company: one(companies, { fields: [projects.companyId], references: [companies.id] }),
	area: one(areas, { fields: [projects.areaId], references: [areas.id] }),
	milestones: many(milestones),
	tasks: many(tasks),
	notes: many(notes),
	resources: many(resources),
	events: many(events),
	activities: many(activities)
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
	project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
	tasks: many(tasks)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
	project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
	milestone: one(milestones, { fields: [tasks.milestoneId], references: [milestones.id] })
}));

export const notesRelations = relations(notes, ({ one }) => ({
	project: one(projects, { fields: [notes.projectId], references: [projects.id] })
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
	project: one(projects, { fields: [resources.projectId], references: [projects.id] })
}));

export const eventsRelations = relations(events, ({ one }) => ({
	project: one(projects, { fields: [events.projectId], references: [projects.id] }),
	company: one(companies, { fields: [events.companyId], references: [companies.id] })
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
	project: one(projects, { fields: [activities.projectId], references: [projects.id] }),
	company: one(companies, { fields: [activities.companyId], references: [companies.id] })
}));
