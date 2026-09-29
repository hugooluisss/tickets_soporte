# Spec Delta

## Purpose

Lets any authenticated user view their own account information and change their own password, as a self-service endpoint group separate from admin-only user management.

## ADDED Requirements

### Requirement: Authenticated user can view their own profile
The system SHALL allow any authenticated user to retrieve their own profile information.

#### Scenario: View own profile
- **WHEN** an authenticated user requests their own profile
- **THEN** the system returns their name, email, role, and active status

### Requirement: Authenticated user can change their own password
The system SHALL allow an authenticated user to change their own password by providing their current password and a new password.

#### Scenario: Successful password change
- **WHEN** an authenticated user submits their correct current password and a valid new password
- **THEN** the system updates the stored password hash and future logins require the new password

#### Scenario: Wrong current password
- **WHEN** an authenticated user submits an incorrect current password
- **THEN** the system rejects the request with a validation error and leaves the stored password unchanged
