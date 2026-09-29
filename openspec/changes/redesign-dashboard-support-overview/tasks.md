# Tasks

## 1. Backend: ticket-comments capability

- [x] 1.1 Create migration `backend/src/database/migrations/1730000004000-CreateTicketComments.ts` for table `ticket_comments` (id uuid PK, ticket_id FK→tickets ON DELETE CASCADE, author_id FK→users ON DELETE RESTRICT, body text not null, created_at datetime default CURRENT_TIMESTAMP) and verify it applies cleanly with `npm run migration:run` against a local dev DB
- [x] 1.2 Add `TicketComment` entity (`backend/src/ticket-comments/ticket-comment.entity.ts`) matching the migration, and verify the app boots with TypeORM entity validation passing
- [x] 1.3 Implement `TicketCommentsRepository` (`backend/src/ticket-comments/ticket-comments.repository.ts`): create, list-by-ticket ordered oldest-first, and a dashboard aggregate method returning client/staff reply counts, tickets-without-reply count, and a 14-day daily reply-count series — with unit tests covering each
- [x] 1.4 Implement `TicketCommentsService` with validation (non-empty body, ticket must exist — reuse `TicketsService.findById` for the not-found check) and unit tests for the empty-body and nonexistent-ticket rejection scenarios from `specs/ticket-comments/spec.md`
- [x] 1.5 Implement `TicketCommentsController` (`POST /api/tickets/:ticketId/comments`, `GET /api/tickets/:ticketId/comments`, `JwtAuthGuard`-protected) with DTOs validated by `class-validator`, and e2e tests covering create/list/empty-body-rejection/nonexistent-ticket-rejection
- [x] 1.6 Register `TicketCommentsModule` in `backend/src/app.module.ts` and verify `npm run build` (backend) succeeds

## 2. Backend: extend dashboard summary

- [x] 2.1 Add to `TicketsRepository`: ticket priority breakdown for active (non-done/non-cancelled) tickets, active-tickets total, 7-day tickets-created-vs-solved series, and 5 most recent tickets (id/title/createdAt/status) — with unit tests for each query, including the "no data in window" zero-filled case
- [x] 2.2 Wire `TicketsService.summary()` (or a new `DashboardService`-level composition) to combine `TicketsRepository`'s new aggregates with `TicketCommentsRepository`'s dashboard aggregate into the extended `DashboardSummary` shape from `design.md`, keeping existing `pending`/`byStatus`/`byProject`/`byCategory` fields unchanged
- [x] 2.3 Update `DashboardController`/`DashboardService` unit and e2e tests to cover the extended response shape, including the zero-state scenarios from `specs/dashboard-overview/spec.md` (no comments, no tickets)
- [x] 2.4 Run the full backend test suite (`npm test` in `backend/`) and confirm it passes

## 3. Frontend: shared visual building blocks

- [x] 3.1 Create `frontend/src/app/shared/icon/icon.component.ts`, a standalone component taking a `name` input and rendering one of a fixed set of hand-authored inline SVG icons (nav items: tickets, projects, categories, dashboard, reports, profile, administration, logout; stat cards: total tickets, client replies, staff replies, tickets without reply) — verify each icon renders via a component test asserting the right `<svg>` is present per `name`
- [x] 3.2 Implement pure data-transform functions (no DOM) for: mapping a reply-time series to SVG polyline/area coordinates, mapping a priority breakdown to donut arc `stroke-dasharray`/`stroke-dashoffset` values, and mapping a created-vs-solved series to bar heights (percentage of max) — under `frontend/src/app/features/dashboard/` — with unit tests covering empty series, single-point series, and typical multi-point series
- [x] 3.3 Update `DashboardSummary` in `frontend/src/app/features/models.ts` and `DashboardApiService`/`DashboardService` to the extended shape from `design.md`, and verify with a unit test that the service passes through the new fields unchanged

## 4. Frontend: dashboard page rebuild

- [x] 4.1 Build the 4 stat cards (Total tickets, Client replies, Staff replies, Tickets without reply) using the new `Icon` component and Tailwind, with translated labels added to `en.ts`/`es.ts`
- [x] 4.2 Build the reply-time chart card (headline number for the latest day + SVG area/line from the 14-day series) using the data-transform from 3.2, with an empty-state that renders zero-valued points without erroring (per spec)
- [x] 4.3 Build the ticket-priority donut/gauge card (center total active-tickets number, colored arc per priority, legend) using the data-transform from 3.2
- [x] 4.4 Build the tickets-created-vs-solved bar chart card (two-series grouped/stacked bars, day labels, "view full report" link to `/reports`) using the data-transform from 3.2
- [x] 4.5 Build the recent-tickets list card (colored left border and status pill per ticket, "view all" link to `/tickets`, empty state per spec) and verify clicking "view all" navigates to the ticket list
- [x] 4.6 Add all new UI strings to `en.ts`/`es.ts`, verify a missing Spanish key would fail the build (per the existing i18n type-check convention), and toggle the language switcher to confirm every new label translates
- [x] 4.7 Add/update `dashboard-view.component.spec.ts` covering: populated state renders all 4 cards + 3 charts + recent list, empty/zero state renders without error, and "view all"/report-link navigation

## 5. Frontend: sidebar restyle and default route

- [x] 5.1 Restyle `app-shell.component.html`/`.css` to match the reference's sidebar (branded header box, per-item icons via the new `Icon` component, active-route accent bar using existing `routerLinkActive`, user name display) without removing or renaming any existing nav item, and verify each nav link still navigates correctly
- [x] 5.2 Change `frontend/src/app/app.routes.ts`'s default child redirect from `tickets` to `dashboard`, and update `app.routes.spec.ts` to assert the new default
- [x] 5.3 Manually verify in a browser: logging in lands on the dashboard, and navigating to the app root while already authenticated also lands on the dashboard

## 6. Full verification

- [ ] 6.1 Run `npm run build` (production) and `npm test` inside `frontend/` and fix any failures
- [ ] 6.2 Run `npm run build` and `npm test` inside `backend/` and fix any failures
- [ ] 6.3 Manually walk through the dashboard in a browser against a populated dev database (tickets in various statuses/priorities, at least one comment created directly via the new API) and confirm every card/chart shows data consistent with that data
- [ ] 6.4 Manually walk through the dashboard against an empty/fresh dataset and confirm every card/chart renders an empty/zero state without error
