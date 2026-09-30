# Tasks

## 1. Persist public notification preference

- [x] 1.1 Add a `reporter_email_notifications` boolean column defaulting to false and map it on `Ticket`; migrate existing tickets as opted out.
- [x] 1.2 Extend the public submission DTO and `TicketsService.createPublic()` to persist an explicitly supplied choice and default omitted values to false.

## 2. Capture explicit consent in the public form

- [x] 2.1 Add an unchecked checkbox with clear translated copy describing email notifications on ticket updates; include its boolean value in the public submission request.

## 3. Gate update notifications

- [x] 3.1 Update the shared ticket update notification path to send only when the ticket has a reporter email and the stored opt-in is true; preserve fire-and-forget delivery behavior.
- [x] 3.2 Verify opted-in tickets receive update-email attempts, opted-out and omitted-choice tickets do not, and internal tickets remain unaffected.
