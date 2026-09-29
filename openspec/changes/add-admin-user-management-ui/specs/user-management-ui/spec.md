# Spec Delta

## Purpose

Gives Admins a working screen to manage user accounts — list, create, edit, and delete — instead of a placeholder, so the account administration the backend already supports is actually usable.

## ADDED Requirements

### Requirement: Admin-only access to the administration screen
Only an authenticated user with the Admin role SHALL be able to view the user administration screens; any other user navigating to them SHALL be redirected away.

#### Scenario: Admin views the administration screen
- **WHEN** an authenticated Admin navigates to the administration screen
- **THEN** the list of user accounts is shown

#### Scenario: Non-admin is blocked
- **WHEN** an authenticated non-Admin user navigates to the administration screen's URL directly
- **THEN** the user is redirected away and the user list is not shown

### Requirement: List user accounts
The administration screen SHALL show every user account's name, email, role, and active/inactive status.

#### Scenario: Accounts exist
- **WHEN** an Admin views the administration screen and accounts exist
- **THEN** each account is listed with its name, email, role, and a visibly distinct indicator of whether it is active or inactive

#### Scenario: No accounts other than the viewer
- **WHEN** an Admin views the administration screen
- **THEN** at minimum their own account appears in the list (an account list is never empty, since the viewer is always an existing user)

### Requirement: Create a user account
An Admin SHALL be able to create a new user account by providing email, first name, last name, role, active status, and an initial password.

#### Scenario: Successful creation
- **WHEN** an Admin submits the create-user form with a unique email and all required fields, including a password
- **THEN** a new account is created with those details and appears in the account list

#### Scenario: Duplicate email rejected
- **WHEN** an Admin submits the create-user form with an email already used by an existing account
- **THEN** the system shows an error and does not create a new account

#### Scenario: Missing required field rejected
- **WHEN** an Admin submits the create-user form with the email, first name, last name, or password left empty
- **THEN** the system shows a validation error for that field and does not submit the form

### Requirement: Edit a user account
An Admin SHALL be able to edit an existing user's email, first name, last name, role, and active status, and SHALL be able to optionally set a new password.

#### Scenario: Update details without changing password
- **WHEN** an Admin edits an existing user's details and leaves the password field blank
- **THEN** the account's other fields are updated and its existing password is unchanged

#### Scenario: Update details with a new password
- **WHEN** an Admin edits an existing user and provides a new password
- **THEN** the account's password is updated along with any other changed fields

#### Scenario: Deactivating an account
- **WHEN** an Admin sets an existing account's status to inactive and saves
- **THEN** the account is persisted as inactive and reflects that status in the account list

### Requirement: Delete a user account
An Admin SHALL be able to delete a user account other than their own currently authenticated account.

#### Scenario: Delete another account
- **WHEN** an Admin deletes a user account that is not their own
- **THEN** the account is removed and no longer appears in the account list

#### Scenario: Attempting to delete own account
- **WHEN** an Admin attempts to delete the account they are currently authenticated as
- **THEN** the deletion is rejected and the account remains in the list, with an error shown to the Admin
