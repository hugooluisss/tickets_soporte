# Spec Delta

## Purpose

Allows ticket reporters to check a ticket's current status from a public link without signing in, while preventing disclosure of internal ticket identifiers or private operational data.

## ADDED Requirements

### Requirement: Opaque public tracking URL
Each ticket SHALL have a unique, hard-to-guess public tracking token distinct from its internal ticket id, and its tracking URL SHALL use that token rather than the internal id.

#### Scenario: Tracking URL does not reveal ticket id
- **WHEN** a tracking URL is created or shown for a ticket
- **THEN** its path uses the ticket's opaque token and does not contain the numeric or internal ticket id

#### Scenario: Tokens are unique
- **WHEN** tracking tokens are assigned to tickets
- **THEN** no two tickets share a token

### Requirement: Public read-only ticket status
Anyone with a valid tracking URL SHALL be able to view that ticket's current status and public-safe fields without authentication; the page SHALL not permit edits or expose other tickets or internal-only fields.

#### Scenario: View tracked ticket
- **WHEN** a visitor opens a valid tracking URL without authenticating
- **THEN** the page shows the ticket title, current status, and creation date
- **AND** it may show other public-safe fields such as kind and description
- **AND** it does not show internal id, reporter email, assignee, category, staff-only comments, or other tickets

#### Scenario: Tracking page is read-only
- **WHEN** a visitor opens a valid tracking URL
- **THEN** no ticket editing or comment submission controls are available

#### Scenario: Invalid tracking token
- **WHEN** a visitor opens a tracking URL with an unknown token
- **THEN** the page shows a not-found state and reveals no ticket data

### Requirement: QR code for ticket tracking
The frontend SHALL generate a QR code that encodes the ticket's public tracking URL, without storing a QR image on the backend.

#### Scenario: Public submitter receives tracking access
- **WHEN** a public ticket submission succeeds
- **THEN** the confirmation state shows the tracking URL and a scannable QR code that opens that URL

#### Scenario: Staff can share a ticket tracking link
- **WHEN** staff views a ticket in the authenticated ticket interface
- **THEN** the tracking URL is available to copy or share, including for tickets created internally

