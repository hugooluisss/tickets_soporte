# Spec Delta

## Purpose

Lets users answer questions about ticket workload over time and across dimensions (status, project, category) by generating filtered, aggregated reports suitable for charting.

## ADDED Requirements

### Requirement: Generate a filtered ticket report
The system SHALL allow an authenticated user to generate a report using the same filter criteria available for ticket listing (project, category, priority, status, kind, and date range), returning both the matching tickets and aggregated counts.

#### Scenario: Report with filters applied
- **WHEN** a user requests a report filtered by a date range and a project
- **THEN** the system returns only tickets matching those filters, plus counts aggregated by status, by project, and by category computed over that filtered set

#### Scenario: Report with no matching tickets
- **WHEN** a user requests a report whose filters match no tickets
- **THEN** the system returns an empty ticket list and zeroed aggregate counts, rather than an error

### Requirement: Aggregated counts by status
The system SHALL include, in every report, a breakdown of matching ticket counts by status, including statuses with zero matching tickets.

#### Scenario: Status with no tickets in the filtered set
- **WHEN** a report's filters exclude all tickets of a given status
- **THEN** that status still appears in the breakdown with a count of zero

### Requirement: Aggregated counts by project and by category
The system SHALL include, in every report, a breakdown of matching ticket counts grouped by project and a separate breakdown grouped by category, including a distinct grouping for tickets with no project or no category assigned.

#### Scenario: Tickets without a project or category
- **WHEN** the filtered ticket set includes tickets with no project assigned or no category assigned
- **THEN** the project breakdown includes an "unassigned project" grouping and the category breakdown includes an "unassigned category" grouping, each with the correct count
