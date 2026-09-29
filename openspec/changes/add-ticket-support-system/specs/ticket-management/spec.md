# Spec Delta

## Purpose

Lets users create, classify, prioritize, assign, update, and search support tickets, which are the central unit of work tracked by the system.

## ADDED Requirements

### Requirement: Create a ticket
The system SHALL allow an authenticated user to create a ticket with a required title, optional description, kind, priority, project, and category, defaulting kind to "Ticket", priority to "Medium", and status to "Pending" when not specified. The creating user is recorded as the ticket's creator.

#### Scenario: Minimal valid ticket
- **WHEN** an authenticated user submits a ticket with only a title
- **THEN** the system creates the ticket with status "Pending", the submitted defaults for kind/priority, no project/category, and the submitter as creator

#### Scenario: Missing title rejected
- **WHEN** a user submits a ticket without a title
- **THEN** the system rejects the request with a validation error and creates no ticket

#### Scenario: Invalid enum value rejected
- **WHEN** a user submits a ticket with a kind, priority, or status value outside the defined set
- **THEN** the system rejects the request with a validation error

### Requirement: View and list tickets
The system SHALL allow an authenticated user to list tickets and view a single ticket's full details, including its resolved project, category, creator, and assignee names.

#### Scenario: List all tickets
- **WHEN** an authenticated user requests the ticket list with no filters
- **THEN** the system returns all tickets ordered by most recently created first

### Requirement: Filter tickets by multiple criteria
The system SHALL allow filtering the ticket list by any combination of: free-text keyword (matching title or description), project, category, priority, status, kind, and a created-at date range.

#### Scenario: Combined filters
- **WHEN** a user requests tickets filtered by a project id and a status
- **THEN** the system returns only tickets matching both criteria

#### Scenario: Keyword search
- **WHEN** a user requests tickets filtered by a keyword
- **THEN** the system returns only tickets whose title or description contains that keyword (case-insensitive)

#### Scenario: Date range filter
- **WHEN** a user requests tickets filtered by a start and end date
- **THEN** the system returns only tickets created within that inclusive date range

### Requirement: Update a ticket
The system SHALL allow an authenticated user to update a ticket's title, description, kind, priority, status, project, category, and assignee.

#### Scenario: Successful update
- **WHEN** a user submits valid updated fields for an existing ticket
- **THEN** the system persists the changes and updates the ticket's last-modified timestamp

#### Scenario: Update non-existent ticket
- **WHEN** a user submits an update for a ticket id that does not exist
- **THEN** the system rejects the request with a not-found error

#### Scenario: Clearing the title on update rejected
- **WHEN** a user submits an update that would leave the title empty
- **THEN** the system rejects the request with a validation error and leaves the ticket unchanged

### Requirement: Assign a ticket to a user
The system SHALL allow an authenticated user to assign a ticket to any existing user account, or to unassign it.

#### Scenario: Assign to a valid user
- **WHEN** a user updates a ticket's assignee to an existing user id
- **THEN** the system persists the assignment

#### Scenario: Assign to a non-existent user rejected
- **WHEN** a user updates a ticket's assignee to a user id that does not exist
- **THEN** the system rejects the request with a validation error

### Requirement: Delete a ticket
The system SHALL allow an authenticated user to delete a ticket by id.

#### Scenario: Successful deletion
- **WHEN** a user deletes an existing ticket by id
- **THEN** the system removes the ticket and it no longer appears in listings
