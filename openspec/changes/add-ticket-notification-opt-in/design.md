# Design

## Context

`add-public-ticket-submission` is implemented. Public tickets store `reporterName`, `reporterEmail`, and `reporterLocation` on `Ticket`. `TicketsService.update()` currently calls `EmailNotifierService.notify()` whenever the updated ticket has a reporter email; the notifier also checks only for that email. The public form is `frontend/src/app/features/tickets/public-ticket-form/` and posts through `PublicTicketApiService`. `add-public-ticket-status-tracking` is a separate in-flight change that plans to show a tracking URL and QR after submission; this change does not alter its confirmation behavior or treat that email/link as implemented.

## Goals / Non-Goals

**Goals:**
- Require an explicit affirmative choice before sending update-notification emails for publicly submitted tickets.
- Preserve the current email content, timing, and fire-and-forget delivery behavior when opted in.
- Treat omitted or legacy preference values as not opted in.

**Non-Goals:**
- Changing notification preferences after submission, unsubscribe links, email verification, or notification digests.
- Applying this consent flag to staff-created internal tickets.
- Gating any distinct tracking-link or ticket-confirmation email that may be specified separately.

## Decisions

- Add a boolean `reporter_email_notifications` column to `tickets` (entity property `reporterEmailNotifications`). It defaults to `false` in storage and entity creation. Existing rows are migrated as false; `createPublic()` stores the submitted value, treating omission as false. Keeping the preference on the ticket makes the decision travel with its reporter email and update lifecycle.
- Add `reporterEmailNotifications?: boolean` to the public submission DTO and form model/API type. The form checkbox starts unchecked, and only a checked value sends `true`. The backend remains authoritative and defaults missing input to false.
- Gate the existing update email at the shared `TicketsService.update()` path: call the notifier only when both `updated.reporterEmail` and `updated.reporterEmailNotifications` are truthy. This preserves internal-ticket behavior and prevents any alternate caller of the existing update service from bypassing the preference. The notifier may retain a defensive check for the same flag.
- Do not add a preference-update API or UI. The reporter's choice is captured once at submission, as the requirement does not request a later change mechanism.
- Keep tracking-link access separate. The in-flight tracking change specifies link/QR display after submission, not email delivery; any future tracking email must be considered independently and must not be silently interpreted as ongoing update consent.

## Risks / Trade-offs

- A checkbox label must clearly explain that opting in means email on ticket updates; use the existing translation system for its text.
- Any future endpoint that sends reporter update emails outside `TicketsService.update()` must apply the same persisted preference.

## Migration Plan

1. Add the false-default boolean column and entity property; existing tickets remain opted out.
2. Carry the explicit value from public form through DTO and `TicketsService.createPublic()` into persistence.
3. Gate update notification dispatch on opt-in plus reporter email, then verify opted-in, opted-out, omitted, and internal cases.

Rollback can remove the column and form field and restore the prior reporter-email-only notification condition.
