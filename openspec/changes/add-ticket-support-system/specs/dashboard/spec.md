# Spec Delta

## Purpose

Gives an authenticated user an at-a-glance summary of ticket workload when they land on the system, without requiring them to build a filtered report first.

## ADDED Requirements

### Requirement: Summary metrics
The system SHALL provide, for an authenticated user, a summary that includes the total count of pending tickets, the total ticket count grouped by status, and the total ticket count grouped by project and by category.

#### Scenario: Summary with existing tickets
- **WHEN** an authenticated user requests the dashboard summary and tickets exist across multiple statuses, projects, and categories
- **THEN** the system returns the pending ticket count and the correct per-status, per-project, and per-category totals reflecting current data

#### Scenario: Summary with no tickets
- **WHEN** an authenticated user requests the dashboard summary and no tickets exist
- **THEN** the system returns a pending count of zero and empty per-status/per-project/per-category breakdowns, rather than an error

### Requirement: Summary reflects current data
The system SHALL compute summary metrics from current ticket data at request time, not from a cached or stale snapshot.

#### Scenario: Metric updates after a change
- **WHEN** a ticket's status changes from Pending to Done and the dashboard summary is requested again
- **THEN** the pending count returned decreases by one and the per-status breakdown reflects the new status
