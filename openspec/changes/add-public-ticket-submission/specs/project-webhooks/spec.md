# Spec Delta

## Purpose

Lets a project have a webhook URL that gets notified whenever a new ticket is created for it, so a team's own tools (chat, ticketing, monitoring) can react to incoming tickets without polling the app.

## ADDED Requirements

### Requirement: Configure a project's webhook URL
An Admin SHALL be able to set, change, or clear a project's webhook URL when creating or editing the project.

#### Scenario: Set a webhook URL
- **WHEN** an Admin saves a project with a webhook URL provided
- **THEN** that URL is stored as the project's webhook URL

#### Scenario: Clear a webhook URL
- **WHEN** an Admin saves an existing project with its webhook URL field left empty
- **THEN** the project's webhook URL is cleared

#### Scenario: Project without a webhook URL
- **WHEN** a project has no webhook URL configured
- **THEN** no webhook notification is attempted for tickets created against that project

### Requirement: Webhook notification on ticket creation
When a ticket is created for a project that has a webhook URL configured, the system SHALL send an HTTP notification to that URL describing the new ticket.

#### Scenario: Ticket created for a project with a webhook
- **WHEN** a ticket (public or internal) is created for a project that has a webhook URL configured
- **THEN** the system sends an HTTP POST to that URL with the new ticket's identifying details (at minimum: ticket id, title, project, and reporter info if present)

#### Scenario: Webhook delivery failure does not block ticket creation
- **WHEN** a project's webhook URL is unreachable or returns an error response
- **THEN** the ticket is still created successfully, and the failure is logged without retrying delivery

### Requirement: Webhook delivery does not require the recipient to be reachable synchronously by the client
Webhook delivery SHALL happen as a side effect of ticket creation and SHALL NOT delay or fail the ticket-creation response to the caller (public submitter or authenticated staff) waiting on webhook delivery to complete.

#### Scenario: Slow or unreachable webhook endpoint
- **WHEN** a project's webhook URL is slow to respond or does not respond at all
- **THEN** the ticket-creation request still completes and returns success to the caller within the app's normal response time
