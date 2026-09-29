# Spec Delta

## Purpose

Maintains the catalog of categories used to classify tickets by topic or type of work.

## ADDED Requirements

### Requirement: Authenticated user can list and view categories
The system SHALL allow any authenticated user to list all categories and view a single category's details.

#### Scenario: List all categories
- **WHEN** an authenticated user requests the list of categories
- **THEN** the system returns all categories with id and name

### Requirement: Authenticated user can create and edit categories
The system SHALL allow an authenticated user to create a new category with a required, unique name, and to rename an existing category.

#### Scenario: Create with missing name
- **WHEN** a user submits a new category without a name
- **THEN** the system rejects the request with a validation error and creates no category

#### Scenario: Duplicate category name
- **WHEN** a user submits a new category whose name matches an existing category's name
- **THEN** the system rejects the request with a validation error

#### Scenario: Successful rename
- **WHEN** a user submits a new name for an existing category
- **THEN** the system persists the new name

### Requirement: Category deletion is restricted to Admins
The system SHALL allow only Admins to delete a category.

#### Scenario: Regular user attempts to delete a category
- **WHEN** a Regular-role user attempts to delete a category
- **THEN** the system rejects the request with a forbidden error and the category remains

#### Scenario: Admin deletes a category
- **WHEN** an Admin deletes an existing category
- **THEN** the system removes the category and existing tickets that referenced it retain no category (their category reference is cleared, not the ticket deleted)
