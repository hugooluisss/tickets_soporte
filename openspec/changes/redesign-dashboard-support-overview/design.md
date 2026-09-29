# Design

## Context

Backend is NestJS + TypeORM, layered controller → service → repository per resource (see `openspec/changes/add-ticket-support-system/design.md`). `Ticket` already has `createdById` (reporter) and `assignedToId` (assignee) — exactly what's needed to classify a comment as "client" (author = ticket creator) vs "staff" (author ≠ ticket creator) without a stored role column. `DashboardController`/`DashboardService`/`TicketsRepository.summary()` today return `{ pending, byStatus, byProject, byCategory }`, consumed by `frontend/src/app/features/dashboard/dashboard-view/`.

Frontend is Angular 22 standalone components + signals, Tailwind CSS (`add-tailwind-field-design`), and a hand-rolled i18n system (`add-i18n-es-en`) — both changes explicitly rejected pulling in frameworks (Angular Material/PrimeNG, ngx-translate/Transloco) in favor of small hand-written pieces matching the app's existing minimal-dependency style. No charting or icon library exists anywhere in the app today; `reports-view` renders plain text lists despite `add-ticket-support-system/design.md` once describing "aggregated charts" — that was never built, so there's no existing charting convention to match, only the general "keep it small and hand-written" one.

## Goals / Non-Goals

**Goals:**
- Real, queryable reply data (`TicketComment`) backing the dashboard's reply metrics — no UI for it yet, but a correct foundation a future change can build on directly.
- A single dashboard summary endpoint carrying everything the redesigned page needs, matching the reference design's "one dashboard, one load" pattern.
- Visual redesign (sidebar + dashboard) that reads as the same design system as the reference image, built from Tailwind utilities and small hand-rolled SVG, with zero new runtime dependencies.
- Dashboard as the default authenticated landing page.

**Non-Goals:**
- No UI for reading or writing ticket comments (explicitly deferred by the user).
- No general-purpose charting component library or reusable "chart kit" abstraction — these are three specific, small, purpose-built visuals (area/line, donut/gauge, grouped bars), not a platform.
- No changes to ticket/project/category/user CRUD behavior, filters, or existing API contracts beyond additive dashboard-summary fields.
- No pagination/infinite history on the recent-tickets list — a fixed small count (5, matching the reference) is enough for a dashboard glance; the full list already exists at `/tickets`.

## Decisions

- **`TicketComment` as its own module** (`backend/src/ticket-comments/`), mirroring the existing per-resource layering: `ticket-comment.entity.ts`, `ticket-comments.repository.ts`, `ticket-comments.service.ts`, `ticket-comments.controller.ts`, `ticket-comments.module.ts`, registered in `AppModule` alongside the other resource modules. Table `ticket_comments`: `id` (uuid PK), `ticket_id` (char(36), FK → `tickets.id`, `ON DELETE CASCADE` — a comment has no meaning once its ticket is gone), `author_id` (char(36), FK → `users.id`, `ON DELETE RESTRICT` — mirrors `tickets.created_by_id`'s restrict behavior, preserving audit history), `body` (text, not null), `created_at` (datetime, default `CURRENT_TIMESTAMP`). No `updated_at`/edit support — out of scope, comments are append-only for now.
  - Migration: new file `backend/src/database/migrations/1730000004000-CreateTicketComments.ts`, following the existing raw-SQL `queryRunner.query(...)` style used by `1730000002000-CreateTickets.ts`.
- **Role derived at query time, not stored.** A comment's client/staff classification (`author_id = tickets.created_by_id`) is computed via SQL `CASE WHEN` in the dashboard aggregate query, not persisted as a column. Alternative considered: store a `role` enum on the comment at creation time. Rejected — the ticket's `created_by_id` never changes after creation, so the classification is always derivable and storing it would just be redundant denormalization with a staleness risk if ever changed.
- **Dashboard endpoint stays a single `GET /api/dashboard/summary`**, extended in place rather than split into multiple endpoints. Alternative considered: separate endpoints per widget (`/dashboard/reply-stats`, `/dashboard/priority`, etc.). Rejected — the reference design's whole dashboard loads at once, the data volume is small (a handful of aggregates + 5 recent tickets), and one round trip keeps the frontend simpler (one loading/error state, matching the existing `dashboard-view` pattern of one `subscribe`).
- **Extended `DashboardSummary` shape** (backend `DashboardService.summary()` → `TicketsService.summary()` → `TicketsRepository`, now also querying `TicketCommentsRepository`):
  ```
  {
    pending, byStatus, byProject, byCategory,          // kept, unchanged (existing consumers: dashboard, reports' shared shape)
    totalTickets: number,
    clientReplies: number,
    staffReplies: number,
    ticketsWithoutReply: number,
    replyTimeSeries: { date: string; count: number }[],   // last 14 days, oldest first
    ticketsTrend: { date: string; created: number; solved: number }[], // last 7 days, oldest first
    byPriority: { key: 'high'|'medium'|'low'; count: number }[],
    activeTicketsTotal: number,                          // status not in (done, cancelled)
    recentTickets: { id: string; title: string; createdAt: string; status: TicketStatus }[], // newest 5
  }
  ```
  `TicketsRepository` gains the new aggregate queries (priority breakdown, trend, recent list — all scoped to `tickets`, no new dependency); a new `TicketCommentsRepository.dashboardStats(ticketCreatedByIds)`-style method (or a join against `tickets` in the comments repository) supplies reply counts and the reply-time series, keeping "which repository owns which aggregate" aligned with which table the `GROUP BY` is actually against.
- **No charting library — hand-rolled inline SVG**, per the project's established pattern (see Context). Concretely:
  - Reply-time chart: an SVG `<path>` area/line built by mapping the 14 data points to `(x, y)` coordinates in a fixed viewBox — the same technique already implicitly required for the priority gauge, just a polyline instead of an arc.
  - Priority gauge/donut: an SVG arc per priority segment using `stroke-dasharray`/`stroke-dashoffset` on a `<circle>` (a standard hand-rolled donut technique), no trigonometry library needed.
  - Tickets-created-vs-solved bars: plain HTML `<div>`s with Tailwind height utilities driven by inline `style` (percentage of the series' max value) — simplest option, no SVG needed for straight vertical bars.
  - Alternative considered: `ngx-charts` or `Chart.js`/`ng2-charts`. Rejected for the same reason `ngx-translate` and Angular Material were rejected in the two prior changes — these are three small, fixed-shape visuals, not a general charting need, and a library would add bundle weight and an API surface to learn for less control over matching the reference's exact look.
- **Icons: hand-authored inline SVG, one shared `Icon` presentation** — a small standalone component (`frontend/src/app/shared/icon/icon.component.ts`) that takes a `name` input and switches over a fixed, small set of inline `<svg>` paths (one per nav item + stat card, ~10-12 icons total). Alternative considered: an icon font or a library like `lucide-angular`. Rejected for the same no-new-dependency reasoning; the icon set needed is small and fixed, not something the app will keep growing arbitrarily.
- **Sidebar restyle is CSS/markup only** — `app-shell.component.html`/`.css` gain the branded header box, per-item icons (via the new `Icon` component), and an active-route accent bar (`routerLinkActive` already used; add a Tailwind class via that mechanism). No new routes, no change to guard logic, no change to which nav items exist.
- **Default route change is a one-line diff**: `frontend/src/app/app.routes.ts`'s `{ path: '', pathMatch: 'full', redirectTo: 'tickets' }` → `redirectTo: 'dashboard'`. No guard/redirect-loop risk since `dashboard` sits behind the same `authGuard`-protected `AppShellComponent` parent as `tickets` did.

## Risks / Trade-offs

- **`ticketsWithoutReply` and reply counts read as zero until comments exist** (no UI to create them yet) → mitigation: this is expected and documented as a Non-Goal; the dashboard requirement's "no reply activity" scenario explicitly covers rendering correctly at zero rather than erroring.
- **Hand-rolled SVG charts are more code to get right than a library call** (viewBox math, scaling, tooltip positioning) → mitigation: keep each chart's data transform (data → coordinates) as a small pure function with unit tests, isolated from the SVG markup, so the math is verifiable without a browser.
- **Extending `DashboardSummary` is additive but touches a shared shape** (`byStatus`/`byProject`/`byCategory` also flow through `TicketsService.report()` for the reports page) → mitigation: only add new fields to the dashboard-specific return type; do not change `report()`'s existing return shape, keeping `reports-view` unaffected.
- **`ON DELETE RESTRICT` on `ticket_comments.author_id`** mirrors `tickets.created_by_id`'s existing behavior but means a user with comments can never be hard-deleted → mitigation: consistent with how `tickets.created_by_id` already behaves (documented in `add-ticket-support-system/design.md`), not a new constraint pattern.

## Migration Plan

1. Backend: `TicketComment` entity/migration/repository/service/controller, module registration, unit + e2e tests per this repo's convention (see `add-ticket-support-system/tasks.md` for the testing bar).
2. Backend: extend `TicketsRepository`/`TicketsService`/`DashboardService`/`DashboardController` with the new aggregate fields, using the new `TicketCommentsRepository` for reply-derived ones.
3. Frontend: update `DashboardSummary` model + `DashboardApiService` to the extended shape.
4. Frontend: build the small shared pieces first (`Icon` component, chart data-transform functions + their SVG/DOM rendering), then the redesigned `dashboard-view` composed from them, then the sidebar restyle.
5. Frontend: flip the default route.
6. Verify end-to-end against the running backend (dev Docker setup from the prior session, or `docker compose up -d --build`), confirming empty-state and populated-state rendering per the spec's scenarios.

No rollback complexity beyond a plain git revert — additive backend fields, no destructive migration (comment table is new, nothing existing is altered or dropped).
