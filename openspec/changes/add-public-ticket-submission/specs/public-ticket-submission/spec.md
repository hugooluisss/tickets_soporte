# Spec Delta

## Purpose

Lets an external client, with no account and no login, file a ticket against a specific project by visiting a link the team shared with them, so support requests can come directly from clients instead of always being relayed through staff.

## ADDED Requirements

### Requirement: Public project lookup
Anyone with a project's public ticket-submission link SHALL be able to see that project's name without authenticating, and SHALL see a clear error if the link's project does not exist.

#### Scenario: Valid project link
- **WHEN** a visitor opens the public ticket-submission page for an existing project
- **THEN** the page shows that project's name

#### Scenario: Invalid project link
- **WHEN** a visitor opens the public ticket-submission page for a project id that does not exist
- **THEN** the page shows an error state instead of a submission form, and no ticket can be submitted

### Requirement: Public ticket creation
Anyone with a project's public ticket-submission link SHALL be able to submit a ticket for that project by providing their name, email, an optional location, a title, an optional description, and a kind — without authenticating.

#### Scenario: Successful public submission
- **WHEN** a visitor submits the public form with a name, a valid email, a title, and a kind for an existing project
- **THEN** a ticket is created for that project with those reporter details, the submitted title/description/kind, `pending` status, `medium` priority, no assignee, and no category
- **AND** the visitor sees a confirmation that their ticket was submitted

#### Scenario: Missing required reporter details
- **WHEN** a visitor submits the public form without a name or without an email
- **THEN** the submission is rejected with a validation error and no ticket is created

#### Scenario: Missing title
- **WHEN** a visitor submits the public form without a title
- **THEN** the submission is rejected with a validation error and no ticket is created

### Requirement: Public submission rate limiting
The system SHALL limit how many public ticket submissions a single source IP address can make within a short time window, rejecting excess requests without creating a ticket.

#### Scenario: Requests within the limit
- **WHEN** a visitor submits public tickets from the same IP address at a rate within the configured limit
- **THEN** each valid submission is accepted normally

#### Scenario: Requests exceeding the limit
- **WHEN** a visitor's IP address exceeds the configured submission rate
- **THEN** further submissions from that IP are rejected until the rate window resets, and no ticket is created for a rejected request

### Requirement: Public tickets carry reporter identity instead of an internal creator
A ticket created through public submission SHALL record the reporter's name, email, and optional location instead of an internal user as its creator.

#### Scenario: Public ticket has no internal creator
- **WHEN** a ticket is created through the public submission flow
- **THEN** the ticket has no associated internal user as its creator, and has the submitted reporter name and email recorded on it

#### Scenario: Internal ticket still requires an internal creator
- **WHEN** a ticket is created through the existing authenticated ticket-creation flow
- **THEN** the ticket has the authenticated user recorded as its creator, and has no reporter name or email recorded on it
