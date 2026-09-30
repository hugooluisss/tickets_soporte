# Proposal

## Why

Ticket work needs a durable place for authenticated staff and other authorized users to leave context and decisions. Notes will retain who added each entry and when, while restricting deletion to administrators so the record remains trustworthy.

## What Changes

- Add a ticket-notes capability for creating and reading timestamped notes authored by the authenticated user.
- Permit note creation only to authenticated users who have access to the ticket.
- Allow only administrators to delete notes; note authors and other regular users cannot delete notes.
- Keep notes append-only for non-administrators: notes cannot be edited after creation.

## Capabilities

### New Capabilities
- `ticket-notes`: Add, list, and administrator-delete notes associated with tickets, with author and timestamp metadata.

### Modified Capabilities

None. Existing ticket and comment specs are change-local deltas and there are no archived main specs to modify.

## Impact

- Backend ticket-note persistence, authenticated endpoints, ticket-access authorization, and administrator role checks.
- Frontend ticket detail experience for viewing and adding notes, with deletion controls available only to administrators.
- No new external dependencies are expected; implementation should follow existing NestJS, TypeORM, and role-guard conventions.
