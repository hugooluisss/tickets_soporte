# Spec Delta

## Purpose

Captures a public reporter's explicit choice about receiving email notifications for later updates to their ticket.

## MODIFIED Requirements

### Requirement: Public ticket creation
Anyone with a project's public ticket-submission link SHALL be able to submit a ticket for that project by providing their name, email, an optional location, a title, an optional description, a kind, and an optional email-notification opt-in choice — without authenticating. The opt-in choice SHALL default to false when not provided.

#### Scenario: Public submission defaults to no email notifications
- **WHEN** a visitor submits a valid public ticket without selecting email notifications
- **THEN** the ticket is created with email notifications disabled

#### Scenario: Public submitter opts in to update emails
- **WHEN** a visitor submits a valid public ticket and explicitly selects email notifications
- **THEN** the ticket records that email notifications are enabled

#### Scenario: Public submitter's email does not imply consent
- **WHEN** a visitor provides a reporter email but leaves the email-notification choice unchecked
- **THEN** the ticket is created with email notifications disabled

### Requirement: Public tickets carry reporter identity instead of an internal creator
A ticket created through public submission SHALL record the reporter's name, email, and optional location instead of an internal user as its creator, and SHALL persist the email-notification choice with a default of false.

#### Scenario: Public ticket stores explicit preference
- **WHEN** a ticket is created through public submission
- **THEN** its stored email-notification preference matches the explicit submission choice, or is false if no choice was provided

#### Scenario: Internal ticket still requires an internal creator
- **WHEN** a ticket is created through the existing authenticated ticket-creation flow
- **THEN** the ticket has the authenticated user recorded as its creator, and has no reporter name or email recorded on it
