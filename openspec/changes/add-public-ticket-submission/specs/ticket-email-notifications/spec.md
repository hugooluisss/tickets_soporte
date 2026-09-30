# Spec Delta

## Purpose

Keeps a ticket's reporter informed by email as their ticket is worked on, without requiring them to have an account or check back in the app.

## ADDED Requirements

### Requirement: Email on ticket update for tickets with a reporter email
Whenever a ticket that has a reporter email is updated, the system SHALL send an email to that address describing the update.

#### Scenario: Update to a ticket with a reporter email
- **WHEN** a ticket that has a reporter email recorded is updated (any field, including status)
- **THEN** an email is sent to that reporter email describing the ticket and the update

#### Scenario: Update to a ticket without a reporter email
- **WHEN** an internal ticket (no reporter email recorded) is updated
- **THEN** no email is sent

### Requirement: Email delivery does not block the update response
Sending the notification email SHALL NOT delay or fail the ticket-update request's response to the caller.

#### Scenario: Email delivery fails
- **WHEN** the configured email delivery fails (e.g. the SMTP server is unreachable)
- **THEN** the ticket update still completes and returns success, and the email failure is logged without blocking or retrying

### Requirement: Ticket creation does not itself trigger a reporter email
Creating a new ticket SHALL NOT send a notification email to its reporter — only subsequent updates do.

#### Scenario: Public ticket just created
- **WHEN** a ticket is created with a reporter email (e.g. through public submission)
- **THEN** no email is sent at creation time; the reporter only receives email starting from the ticket's first subsequent update
