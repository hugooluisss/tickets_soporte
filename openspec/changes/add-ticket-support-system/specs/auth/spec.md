# Spec Delta

## Purpose

Controls who can access the system by verifying credentials, issuing session tokens, and rejecting deactivated accounts, so every other capability can rely on a known, authenticated identity and role.

## ADDED Requirements

### Requirement: Login with valid credentials
The system SHALL authenticate a user given a valid email/username and password and issue a session token on success.

#### Scenario: Successful login
- **WHEN** a user submits a valid email and matching password for an active account
- **THEN** the system returns a signed session token and the user's profile (id, name, email, role)

#### Scenario: Wrong password
- **WHEN** a user submits a valid email but an incorrect password
- **THEN** the system rejects the request with an authentication error and does not reveal whether the email exists

#### Scenario: Unknown account
- **WHEN** a user submits an email that does not match any account
- **THEN** the system rejects the request with the same generic authentication error used for a wrong password

### Requirement: Inactive accounts cannot authenticate
The system SHALL reject login attempts for accounts marked inactive, even with correct credentials.

#### Scenario: Deactivated account attempts login
- **WHEN** a user with correct credentials but `is_active = false` attempts to log in
- **THEN** the system rejects the request with an account-deactivated error and issues no session token

### Requirement: Authenticated requests require a valid session token
The system SHALL require a valid, unexpired session token on every endpoint except login, and SHALL reject requests missing or presenting an invalid/expired token.

#### Scenario: Missing token
- **WHEN** a request to a protected endpoint carries no session token
- **THEN** the system responds with an unauthorized error and does not execute the endpoint's logic

#### Scenario: Expired or malformed token
- **WHEN** a request presents a token that is expired, malformed, or has an invalid signature
- **THEN** the system responds with an unauthorized error

### Requirement: Role-based access control
The system SHALL support at least two roles (Admin, Regular user) and SHALL restrict admin-only operations (e.g. managing other users' accounts) to users with the Admin role.

#### Scenario: Regular user attempts an admin-only operation
- **WHEN** an authenticated user with the Regular role calls an operation restricted to Admins
- **THEN** the system rejects the request with a forbidden error and performs no changes

#### Scenario: Admin performs an admin-only operation
- **WHEN** an authenticated user with the Admin role calls an operation restricted to Admins
- **THEN** the system executes the operation

### Requirement: Logout invalidates the client-side session
The system SHALL provide a way for an authenticated user to end their session on the client.

#### Scenario: User logs out
- **WHEN** an authenticated user requests to log out
- **THEN** the client discards its session token and subsequent requests are treated as unauthenticated until a new login succeeds
