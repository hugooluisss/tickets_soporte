# Spec Delta

## Purpose

Lets Admins maintain the set of user accounts: create, edit, deactivate, and assign roles. This is an admin-only endpoint group, distinct from the self-service `profile` capability.

## ADDED Requirements

### Requirement: Admin can create a user account
The system SHALL allow an Admin to create a new user account with a unique email, name, role, and active status.

#### Scenario: Successful creation
- **WHEN** an Admin submits a new user with a unique email and required fields
- **THEN** the system creates the account with a securely hashed password and the specified role and active status

#### Scenario: Duplicate email rejected
- **WHEN** an Admin submits a new user whose email already belongs to an existing account
- **THEN** the system rejects the request with a validation error and creates no account

### Requirement: Admin can list and view user accounts
The system SHALL allow an Admin to list all user accounts and view a single account's details.

#### Scenario: List all users
- **WHEN** an Admin requests the list of users
- **THEN** the system returns all user accounts with id, name, email, role, and active status (never the password hash)

### Requirement: Admin can update a user's role and active status
The system SHALL allow an Admin to change another user's role and to activate or deactivate their account.

#### Scenario: Deactivate a user
- **WHEN** an Admin sets an existing user's active status to inactive
- **THEN** the system persists the change and that user can no longer authenticate (see `auth` capability)

#### Scenario: Change a user's role
- **WHEN** an Admin changes an existing user's role from Regular to Admin (or vice versa)
- **THEN** the system persists the new role and subsequent authorization checks use it

### Requirement: Admin can delete a user account
The system SHALL allow an Admin to delete a user account that is not referenced as the currently authenticated Admin's own account.

#### Scenario: Delete an existing user
- **WHEN** an Admin deletes a user account by id
- **THEN** the system removes the account and it can no longer be authenticated against

