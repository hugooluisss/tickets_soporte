# Proposal

## Why

Today, filing a ticket requires an internal account and login. To let external clients report issues directly — via a link the team shares with them — the app needs a way to accept ticket submissions with no authentication, tied to the specific project the link was shared for. Once that intake exists, the team also needs to know immediately when a new public ticket arrives (a per-project webhook), and the client who filed it needs to be kept informed as the ticket progresses (email on updates) without ever needing an account.

## What Changes

- Make `tickets.created_by_id` nullable and add three new nullable columns — `reporter_name`, `reporter_email`, `reporter_location` — so a ticket is either an internal ticket (`created_by_id` set, reporter fields null) or a public one (`created_by_id` null, `reporter_name`/`reporter_email` required, `reporter_location` optional). The invariant is enforced in `TicketsService`, not a DB constraint, matching this codebase's existing validation style.
- Add a new, unauthenticated public API surface scoped to one project per link:
  - `GET /api/public/projects/:projectId` — minimal, public-safe project read (id + name only), for the public page to confirm the link is valid and show which project the ticket is for.
  - `POST /api/public/projects/:projectId/tickets` — creates a ticket for that project with reporter name/email/location, title, description, and kind; priority and status are defaulted server-side exactly like internal ticket creation; no assignee or category can be set by the public submitter.
- Add IP-based rate limiting (`@nestjs/throttler`, a new dependency) applied specifically to these two public endpoints — not globally, since the existing authenticated endpoints don't need it.
- Add a new unauthenticated frontend route (`/public/projects/:projectId/new-ticket`, outside the login-gated app shell) with a submission form and a post-submission confirmation state.
- Add a `webhook_url` column to `projects` (nullable) and a field for it in the admin project create/edit form. When a ticket is created for a project with a webhook configured, the backend sends an HTTP POST notification to that URL, fire-and-forget (logged on failure, no retry queue).
- Send an email to a ticket's `reporter_email` (when set) on every update to that ticket (`PATCH /api/tickets/:id`, any field) — status changes, reassignment, etc. Internal tickets (no `reporter_email`) never trigger this. Email is sent via SMTP through a new `nodemailer` dependency, configured with new environment variables.
- **BREAKING** (schema, not API contract): `created_by_id` changes from `NOT NULL` to nullable. Existing rows are unaffected (still have a value); this only changes what future inserts may omit. No existing internal-ticket-creation code path is affected — it still always supplies `created_by_id`.

## Capabilities

### New Capabilities
- `public-ticket-submission`: the unauthenticated, project-scoped ticket intake surface (public project read, public ticket creation, rate limiting) and the frontend page that presents it.
- `project-webhooks`: a per-project webhook URL, configurable by admins, fired when a ticket is created for that project.
- `ticket-email-notifications`: emails a ticket's reporter (when it has one) whenever the ticket is updated.

### Modified Capabilities
(none — no archived main specs exist yet in this project; the closest related delta, `openspec/changes/add-ticket-support-system/specs/ticket-management/spec.md`, is never archived, so there is nothing to formally modify. `design.md` accounts for interaction with the already-built `ticket-comments` capability from `redesign-dashboard-support-overview`.)

## Impact

- Backend: migration altering `tickets` (nullable `created_by_id`, new `reporter_name`/`reporter_email`/`reporter_location` columns) and `projects` (new `webhook_url` column); `Ticket`/`Project` entity updates; a new `public-tickets` module (controller/service reusing `TicketsService`/`ProjectsService` internals rather than duplicating logic); a new `notifications` module (webhook dispatch + email dispatch, called from `TicketsService.create`/`update`); `@nestjs/throttler` and `nodemailer` added to `backend/package.json`; new SMTP environment variables in `backend/.env.example`.
- Frontend: a new public route and form component outside the authenticated shell, reusing the existing `app-form-field` and i18n system; the admin project form gains a webhook URL field; `Ticket`/`DashboardSummary`-adjacent display code that reads `ticket.createdBy` already treats it as optional (`createdBy?: User` in `frontend/src/app/features/models.ts`, and the backend repository already `leftJoinAndSelect`s it) — no breaking change there, but any UI listing tickets should be checked to show reporter name/email for tickets with no `createdBy` (see design.md).
- No change to the existing `ticket-comments` client/staff-reply classification logic — a public ticket's `created_by_id` is `NULL`, so every comment on it is correctly classified as a staff reply by the existing SQL comparison (no client account exists to author a "client" reply). This is an intentional consequence, not a gap to close in this change.
- Existing internal ticket creation (`POST /api/tickets`) and updates (`PATCH /api/tickets/:id`) are otherwise unchanged in behavior for internal tickets (no `reporter_email` means no email is ever sent) — the update path gains a side effect (email dispatch) only when the affected ticket has a reporter email.
