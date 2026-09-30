# Tasks

## 1. Backend: schema changes

- [x] 1.1 Create migration `backend/src/database/migrations/1730000005000-AddTicketReporterFields.ts`: `tickets.created_by_id` → nullable, add `reporter_name`/`reporter_email`/`reporter_location` (nullable varchar), add `projects.webhook_url` (nullable varchar) — and verify it applies cleanly with `npm run migration:run` against the local dev DB
- [x] 1.2 Update `Ticket` entity (`created_by_id` nullable, new reporter fields) and `Project` entity (`webhookUrl`) to match, and verify the app boots with TypeORM entity validation passing

## 2. Backend: public ticket submission

- [x] 2.1 Add `TicketsService.createPublic(projectId, { reporterName, reporterEmail, reporterLocation, title, description, kind })` — validates project exists, reporter name/email required, title required, defaults priority=medium/status=pending/no assignee/no category — with unit tests covering success and each validation-rejection scenario from `specs/public-ticket-submission/spec.md`
- [x] 2.2 Add a public-safe `ProjectsService` read (or reuse `findById` and map to `{ id, name }` in the controller) and implement `PublicTicketsController` (`GET /api/public/projects/:projectId`, `POST /api/public/projects/:projectId/tickets`, no auth guard) with DTOs validated by `class-validator`, and e2e tests covering valid/invalid project id and successful/rejected ticket creation
- [x] 2.3 Add `@nestjs/throttler` as a dependency, wire a per-IP rate limit scoped to `PublicTicketsController` only (not global), and add a test confirming requests beyond the configured limit are rejected without creating a ticket
- [x] 2.4 Register the new module in `backend/src/app.module.ts` and verify `npm run build` succeeds

## 3. Backend: project webhooks

- [x] 3.1 Add `webhookUrl` to `CreateProjectDto`/`UpdateProjectDto` (`@IsOptional() @IsUrl()`) and thread it through `ProjectsService.create`/`update`, with unit tests for setting, clearing, and validating an invalid URL
- [x] 3.2 Implement `WebhookNotifierService` (`backend/src/notifications/webhook-notifier.service.ts`): fire-and-forget POST with the ticket/project payload from `design.md`, catching and logging failures without throwing, with unit tests covering: no webhook configured (no call attempted), successful POST, and a failing/unreachable POST (logged, not thrown)
- [x] 3.3 Call `WebhookNotifierService` from `TicketsService.create()` and `createPublic()` after successful ticket creation, and verify with a test that ticket creation succeeds and returns immediately even when the webhook call fails or hangs

## 4. Backend: ticket update email notifications

- [x] 4.1 Add `nodemailer` as a dependency, implement `EmailNotifierService` (`backend/src/notifications/email-notifier.service.ts`) configured from new `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` env vars (added to `backend/.env.example` with placeholder values), fire-and-forget send with failures caught and logged
- [x] 4.2 Call `EmailNotifierService` from `TicketsService.update()` after a successful update, only when the updated ticket has `reporterEmail` set, and verify with unit tests: update with reporter email sends (attempts) an email, update without reporter email sends nothing, ticket *creation* never sends this email, and a failing send doesn't block/fail the update response

## 5. Frontend: public submission page

- [x] 5.1 Add a public, unauthenticated route `/public/projects/:projectId/new-ticket` in `frontend/src/app/app.routes.ts` (outside the authGuard-protected shell, sibling to `/login`)
- [x] 5.2 Build the public ticket-submission form component (reporter name/email/location, title, description, kind — using `app-form-field`, all new labels through `en.ts`/`es.ts`), fetching the project name via the new public endpoint and showing an error state for an invalid project id
- [x] 5.3 Add a post-submission confirmation state (replaces the form after a successful submit, no navigation back into the authenticated app)
- [x] 5.4 Verify the page and its `TranslationService`/`TranslatePipe` usage work fully logged out (no auth token in `localStorage`) — confirm no component in this route's tree assumes an authenticated user

## 6. Frontend: admin webhook field

- [x] 6.1 Add a `webhookUrl` field (type `url`, optional) to `frontend/src/app/features/projects/project-form/` using `app-form-field`, wired through `ProjectsApiService`/`ProjectsService`, with a translated label and validation error added to `en.ts`/`es.ts`

## 7. Verification

- [x] 7.1 Run `npm run build` and `npm test` inside `backend/` and fix any failures
- [x] 7.2 Run `npm run build` and `npm test` inside `frontend/` and fix any failures
- [x] 7.3 Manually walk through: open a project's public link, submit a valid ticket, confirm it appears in the admin ticket list with reporter name/email/location visible and no internal creator; attempt an invalid project id and confirm the error state; exceed the rate limit and confirm rejection — verified via API (public lookup returns id+name; submission creates a ticket with createdById null and reporter fields set; invalid project id returns 404; 4th+ rapid request returns 429); reporter name/email/location display in the admin ticket list and ticket-form was a gap found during this verification and has since been implemented and re-verified (build/tests green)
- [x] 7.4 Manually set a project's webhook URL to a local listener (or inspect logs) and confirm a POST is attempted on ticket creation for that project, for both a public and an internal ticket — verified: local listener received the exact documented payload for both a public ticket (with reporterName/reporterEmail) and an internal ticket (without them)
- [x] 7.5 Manually update a ticket that has a reporter email and confirm an email send is attempted (check logs if no real SMTP server is configured in this environment), and confirm updating an internal ticket (no reporter email) triggers no email attempt — verified via backend logs: exactly one logged email-delivery attempt (failed, no real SMTP configured, as expected) for the reporter-having ticket, none for the internal ticket; both PATCH requests returned 200 without delay
