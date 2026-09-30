# Spec Delta

## Purpose

Ensures reporter update emails are sent only when the reporter explicitly opted in during public ticket submission.

## MODIFIED Requirements

### Requirement: Email on ticket update for opted-in tickets with a reporter email
Whenever a ticket that has a reporter email and an affirmative persisted email-notification opt-in is updated, the system SHALL send an email to that address describing the update. Tickets without an affirmative opt-in SHALL NOT receive these update-notification emails, including when a reporter email is recorded.

#### Scenario: Update to an opted-in ticket with a reporter email
- **WHEN** a ticket with a reporter email and email notifications enabled is updated (any field, including status)
- **THEN** an email is sent to that reporter email describing the ticket and the update

#### Scenario: Update to an opted-out ticket with a reporter email
- **WHEN** a ticket with a reporter email and email notifications disabled is updated
- **THEN** no update-notification email is sent

#### Scenario: Update to a ticket without a reporter email
- **WHEN** an internal ticket without a reporter email is updated
- **THEN** no update-notification email is sent

#### Scenario: Legacy or omitted preference is treated as opted out
- **WHEN** a ticket's email-notification preference was not explicitly set
- **THEN** it is treated as disabled and no update-notification email is sent

### Requirement: Email delivery does not block the update response
Sending an opted-in ticket's notification email SHALL NOT delay or fail the ticket-update request's response to the caller.

#### Scenario: Email delivery fails
- **WHEN** delivery of an opted-in ticket's notification fails (e.g. the SMTP server is unreachable)
- **THEN** the ticket update still completes and returns success, and the email failure is logged without blocking or retrying

### Requirement: Ticket creation does not itself trigger a reporter email
Creating a new ticket SHALL NOT send an update-notification email to its reporter, regardless of the stored preference; notification emails start only after a subsequent update, and only if opted in.

#### Scenario: Public ticket just created
- **WHEN** a public ticket is created with a reporter email and email notifications enabled
- **THEN** no update-notification email is sent at creation time; the reporter only receives email starting from the first subsequent update
