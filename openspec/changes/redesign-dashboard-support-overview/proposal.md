# Proposal

## Why

The dashboard is currently the plainest screen in the app — a heading, one pending-count box, and three unstyled text lists (by status/project/category) with no visual hierarchy, charts, or at-a-glance summary. The user wants the app's visual design elevated to match a reference support-dashboard design (stat cards, charts, a styled sidebar, a recent-activity list), and wants the dashboard to be the first thing seen after logging in rather than the ticket list.

## What Changes

- Add a `TicketComment` backend capability (entity, migration, create/list-by-ticket endpoints) so ticket "replies" become real, queryable data. **No comment-reading/writing UI is built in this change** — it exists solely to feed dashboard metrics; a future change adds the UI.
- Extend the dashboard backend endpoint (`GET /api/dashboard/summary`) with: total ticket count, client-reply count, staff-reply count, tickets-without-any-reply count, a daily reply-count time series (last 14 days), a daily tickets-created-vs-tickets-solved time series (last 7 days), a ticket priority breakdown (high/medium/low), and a small recent-tickets list (id, title, createdAt, status) — sufficient for the whole redesigned dashboard to load from one request, matching the reference design's single-endpoint dashboard pattern.
- Rebuild the dashboard page (frontend) to match the reference design's visual language, adapted to our real data: 4 stat cards (Total tickets, Client replies, Staff replies, Tickets without reply), a reply-time area/line chart, a ticket-priority donut/gauge, a tickets-created-vs-solved bar chart, and a recent-tickets list with status-colored left borders and status pill badges. No new charting or icon library — hand-rolled inline SVG, consistent with this project's established preference for small hand-written pieces over frameworks (see `add-tailwind-field-design/design.md` and `add-i18n-es-en/design.md`).
- Restyle the app shell's sidebar to match the reference's visual style (branded header box, icon + label nav items, active-item accent bar, user name display), keeping all existing nav items (Tickets, Projects, Categories, Dashboard, Reports, Profile, Administration) unchanged.
- **BREAKING** (routing behavior, not an API contract): change the authenticated area's default route from `tickets` to `dashboard` — `frontend/src/app/app.routes.ts`'s `{ path: '', pathMatch: 'full', redirectTo: 'tickets' }` becomes `redirectTo: 'dashboard'`. Anyone relying on landing on the ticket list right after login will instead land on the dashboard.
- All new UI text goes through the existing i18n system (`TranslationService`/`TranslatePipe`, keys added to both `en.ts` and `es.ts`).

## Capabilities

### New Capabilities
- `ticket-comments`: a backend-only capability — `TicketComment` entity/table, and endpoints to create a comment on a ticket and list a ticket's comments, with role (client vs staff) derived from whether the comment author is the ticket's creator.
- `dashboard-overview`: the redesigned dashboard — extended summary data (counts, time series, priority breakdown, recent tickets) and the frontend page that presents it in the reference design's visual style, as the default post-login route.

### Modified Capabilities
(none — no archived main specs exist yet in this project to modify; the original ticket-support-system specs live only as delta specs under `openspec/changes/add-ticket-support-system/specs/`, never archived)

## Impact

- Backend: new `TicketComment` entity/repository/service/controller under `backend/src/ticket-comments/` (naming to be confirmed in design), a new migration in `backend/src/database/migrations/`, and changes to `backend/src/tickets/tickets.repository.ts` / `tickets.service.ts` / `dashboard/dashboard.service.ts` to compute and return the extended summary shape.
- Frontend: `frontend/src/app/features/dashboard/*` (rebuilt view + updated `DashboardSummary` model/API service), `frontend/src/app/layout/app-shell/*` (sidebar restyle), `frontend/src/app/app.routes.ts` (default redirect), new small hand-rolled chart/icon pieces (likely under `frontend/src/app/shared/`), and new `en.ts`/`es.ts` translation keys.
- No changes to existing ticket/project/category/user CRUD behavior or their public API contracts — this only adds a new `ticket-comments` API surface and extends the dashboard summary response shape (additive fields; existing `pending`/`byStatus`/`byProject`/`byCategory` fields are kept for backward compatibility with the reports page, which reuses similarly-shaped data).
