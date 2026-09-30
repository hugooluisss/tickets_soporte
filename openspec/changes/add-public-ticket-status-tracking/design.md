# Design

## Context

See proposal.md for motivation and specs/public-ticket-status-tracking/spec.md for public behavior. `Ticket` is a TypeORM entity with UUID `id`; creation is centralized in `TicketsService.create()` and `createPublic()`. The prior `add-public-ticket-submission` change is implemented: nullable creator and reporter fields exist, as does the unauthenticated submission route and confirmation state. `ticket_comments` contains authenticated staff replies, not a ticket status history. The frontend has no QR package installed.

## Goals / Non-Goals

**Goals:**
- Resolve public reads using a separate high-entropy token, with uniqueness enforced by storage.
- Return an explicit public DTO rather than serializing the full ticket entity.
- Generate QR codes on the client from the same absolute tracking URL shown to the reporter.

**Non-Goals:**
- Public ticket edits, replies, email verification, token rotation, or status-change history.
- Storing or serving QR image files from the backend.

## Decisions

- Add a unique, non-null `tracking_token` column to `tickets`. Generate 32 random bytes with Node's built-in `crypto.randomBytes(32).toString('base64url')` when each ticket is created, for both internal and public flows. The database unique constraint/index is the final collision guard; retry token generation on a uniqueness collision. A random token avoids the enumeration and disclosure risks of the internal UUID and needs no new backend dependency.
- Add a public `GET /api/public/tickets/:token` read path. Query by token and map to a small allowlisted response (title, status, createdAt, kind, optional description); never return ticket id, reporter email, assignee, category, comments, or the entity wholesale. Unknown tokens return not found. Keep it separate from the authenticated ticket controller and do not add mutation routes.
- Construct the public route URL from the frontend origin and token, and generate the QR in the browser. `frontend/package.json` has no QR dependency; use the smallest suitable maintained QR encoder package (for example, `qrcode` with its browser API), with no backend image persistence.
- Show the URL and QR in the existing public submission confirmation. Add a copyable tracking URL to the authenticated ticket detail/form view so staff can share it for internally created tickets too. This avoids requiring an extra reporter identity or email workflow.
- Do not expose ticket comments as history: existing comments are authenticated staff replies and have no public/private classification. Current status is the only progress data exposed in this change.

## Risks / Trade-offs

- A bearer tracking link grants read access to the allowlisted fields to anyone who obtains it → use a cryptographically random 256-bit token and avoid sensitive fields in the public DTO.
- A token collision is extraordinarily unlikely but must not silently bind two tickets → rely on a database unique constraint and retry generation when that constraint is hit.
- Adding a required token to tickets needs a safe migration for existing rows → backfill each row with an independently generated token before enforcing NOT NULL and uniqueness; verify rollback behavior before deployment.

## Migration Plan

1. Add nullable token storage, backfill existing tickets with random unique values, then enforce NOT NULL and uniqueness; deploy backend code that assigns tokens to every new ticket.
2. Add the token lookup endpoint and allowlisted response, then add frontend tracking route and QR display.
3. Rollback by reverting application code and dropping the token column/index; no ticket data is otherwise transformed.
