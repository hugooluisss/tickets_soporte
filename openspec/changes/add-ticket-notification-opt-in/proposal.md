# Proposal

## Why

Public ticket submission currently records a reporter email and sends an email after every later ticket update. A visitor must be able to choose whether those ongoing update notifications are sent; consent must be explicit rather than inferred from providing an email address.

## What Changes

- Add an unchecked email-notification opt-in to the unauthenticated public ticket form and send its boolean choice with the submission.
- Persist that choice on the ticket, defaulting to false when omitted and for existing tickets.
- Gate the existing update-email notification path on both the stored opt-in and a reporter email.
- Keep this preference submission-time-only; no preference editing or opt-out flow is introduced.

## Capabilities

### Modified Capabilities
- `public-ticket-submission`: capture explicit, default-off consent during public submission.
- `ticket-email-notifications`: send update emails only for opted-in tickets with a reporter email.

## Impact

- Backend ticket schema/entity and public submission DTO/service, plus the existing `TicketsService.update()` email gate.
- Public ticket form and request type.
- No change to internal ticket behavior; internal tickets have no reporter email and do not receive reporter update emails.
