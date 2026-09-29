# Spec Delta

## Purpose

Maintains the catalog of projects that tickets can be organized under, and reports how many tickets (total and pending) belong to each project.

## ADDED Requirements

### Requirement: Authenticated user can list and view projects
The system SHALL allow any authenticated user to list all projects and view a single project's details.

#### Scenario: List all projects
- **WHEN** an authenticated user requests the list of projects
- **THEN** the system returns all projects with id, name, and description

### Requirement: Authenticated user can create and edit projects
The system SHALL allow an authenticated user to create a new project with a required name, and to edit an existing project's name or description.

#### Scenario: Create with missing name
- **WHEN** a user submits a new project without a name
- **THEN** the system rejects the request with a validation error and creates no project

#### Scenario: Successful edit
- **WHEN** a user submits an update to an existing project's name and/or description
- **THEN** the system persists the change

### Requirement: Project deletion is restricted to Admins
The system SHALL allow only Admins to delete a project.

#### Scenario: Regular user attempts to delete a project
- **WHEN** a Regular-role user attempts to delete a project
- **THEN** the system rejects the request with a forbidden error and the project remains

#### Scenario: Admin deletes a project
- **WHEN** an Admin deletes an existing project
- **THEN** the system removes the project

### Requirement: Project ticket counts
The system SHALL report, for a given project, the total number of tickets and the number of pending tickets associated with it.

#### Scenario: Project with tickets
- **WHEN** a user requests a project's details
- **THEN** the response includes the total ticket count and the pending ticket count for that project

### Requirement: List tickets belonging to a project
The system SHALL allow an authenticated user to retrieve all tickets associated with a given project.

#### Scenario: Retrieve a project's tickets
- **WHEN** a user requests the tickets for a specific project id
- **THEN** the system returns only tickets whose project matches that id
