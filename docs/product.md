# Personal Work OS — Product Specification

## Product Vision

Personal Work OS is a personal command center for managing work across multiple companies and projects.

The system should make it easy to answer:

> What should I work on right now?

It should reduce context switching and provide a clear view of important work.

---

# Core Hierarchy

Company
→ Area
→ Project
→ Milestone
→ Task

Supporting entities:

- Notes
- Resources
- Activities
- Events
- Inbox Items
- Weekly Reviews

---

# Main Navigation

## Dashboard

Purpose:

Give the user a high-level understanding of what requires attention.

Should include:

- current focus
- important tasks
- overdue tasks
- active projects
- projects needing attention
- stalled projects
- upcoming deadlines
- recent activity
- quick actions

The dashboard should prioritize information rather than simply displaying everything.

---

# Companies

A company represents where the user works.

Users can:

- create company
- edit company
- archive company
- view company overview
- view company projects
- view company areas
- view company activity

A company may contain multiple projects.

---

# Areas

Areas represent responsibilities or domains inside a company.

Examples:

- Data Engineering
- Product
- Analytics
- Operations
- Marketing

Areas are optional.

Projects can exist without an area.

---

# Projects

Projects are the primary unit of meaningful work.

Project fields:

- name
- description
- company
- area
- status
- type
- priority
- started date
- last activity
- why
- goal
- current focus
- next action

Project statuses:

- Idea
- Planning
- Active
- Paused
- Blocked
- Completed
- Archived

Project types may initially include:

- Work
- Personal
- Internal
- Client
- Experiment

Keep the type system simple and extensible.

---

# Project Overview

A project page should make the project's state immediately understandable.

Show:

- project identity
- company
- status
- health
- priority
- current focus
- next action
- progress
- milestones
- tasks
- recent activity
- notes
- resources

The user should understand the project within seconds.

---

# Project Health

Health is deterministic.

Initial states:

- Healthy
- Needs Attention
- Stalled

Potential signals:

- overdue tasks
- inactivity
- blocked status
- milestone progress
- upcoming deadlines
- priority
- recent activity

Avoid AI for the first implementation.

---

# Milestones

Milestones divide projects into meaningful outcomes.

A milestone contains:

- name
- description
- status
- due date
- tasks
- progress

Progress should be calculated from associated tasks.

---

# Tasks

Tasks should support:

- title
- description
- status
- priority
- due date
- project
- milestone
- estimated effort
- completed date

Initial task statuses:

- Todo
- In Progress
- Blocked
- Done

Priority:

- Low
- Medium
- High
- Urgent

---

# My Work

My Work aggregates tasks from across companies and projects.

It should help answer:

- What should I do today?
- What is overdue?
- What is urgent?
- What is next?
- What is blocked?

Support contextual filtering:

- All
- Company
- Project
- Personal

---

# Inbox

Inbox is for unprocessed information.

Examples:

- random task
- idea
- reminder
- note
- link

The user should be able to capture something quickly without deciding its final destination immediately.

---

# Calendar

Calendar should provide visibility into:

- task deadlines
- project deadlines
- events
- planned work

Start simple.

Do not build a complex calendar engine in the MVP.

---

# Weekly Review

Weekly Review should summarize:

- completed tasks
- completed milestones
- active projects
- stalled projects
- overdue work
- recent activity
- next week focus

The user should be able to record:

- wins
- problems
- lessons
- next week's priorities

---

# "What Should I Work On?"

This is a core feature.

The application should eventually recommend next actions using deterministic signals:

- priority
- due date
- overdue status
- project health
- project status
- last activity
- estimated effort

The initial implementation should be transparent.

The user should be able to understand why something is recommended.

Example:

> Work on "Finalize scraping pipeline"

Reason:

- High priority
- Due tomorrow
- Project currently Needs Attention

AI-based recommendations can be introduced later.

---

# MVP Priority

Build in this order:

1. Application shell
2. Authentication
3. Database foundation
4. Companies
5. Projects
6. Milestones
7. Tasks
8. Dashboard
9. Project health
10. My Work
11. Inbox
12. Calendar
13. Weekly Review

Do not build advanced AI features during the initial MVP.

---

# Product Principles

The product should feel:

- personal
- focused
- calm
- structured
- intelligent without being complicated
- fast
- trustworthy

Avoid making it feel like:

- enterprise project management software
- Jira clone
- Trello clone
- generic AI SaaS
