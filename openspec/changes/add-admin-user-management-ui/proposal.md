# Proposal

## Why

The sidebar's "Administration" nav item (admin-only) links to `/admin`, which renders a generic `PlaceholderComponent` reading "This page is ready for its Phase 4 feature implementation." The backend already fully implements admin user management (`UsersController`: list/create/get/update/delete, role/active-state, self-delete prevention, email-uniqueness, password hashing) — Phase 4 of the original build never added the frontend screen to use it. This closes that gap.

## What Changes

- Extend `UsersApiService` with `create`, `update`, and `delete` methods against the existing `/api/users` endpoints (currently only `list()` exists, used solely for the ticket assignee dropdown).
- Add a users-list component (admin-only) showing all accounts (name, email, role, active status) with actions to create, edit, and delete a user — mirroring the established list-component pattern (`project-list`).
- Add a users-form component (admin-only) for creating and editing a user: email, first name, last name, role (admin/user), active status, and password (required when creating, optional when editing — leaving it blank keeps the current password) — mirroring the established form-component pattern (`project-form`), using the shared `app-form-field` component.
- Replace the single placeholder `/admin` route with real routes (`/admin`, `/admin/new`, `/admin/:id/edit`), still guarded by the existing `roleGuard` (`role: 'admin'`) — the sidebar's "Administration" link needs no change, it already points at `/admin`.
- Add a visible indicator to distinguish active vs. inactive accounts in the list (styling decision in `design.md`).
- All new UI text goes through the existing i18n system (`TranslationService`/`TranslatePipe`, keys added to both `en.ts` and `es.ts`).

## Capabilities

### New Capabilities
- `user-management-ui`: the admin-facing screens (list, create, edit) for managing user accounts — consumes the already-implemented backend `user-management` API (see `openspec/changes/add-ticket-support-system/specs/user-management/spec.md`, a delta never archived to a main spec) without changing it.

### Modified Capabilities
(none — this only adds a UI consumer of an existing, unchanged API; no backend requirement changes)

## Impact

- Affected code: `frontend/src/app/features/users/` (extend `UsersApiService`/`UsersService`, add `user-list/` and `user-form/` components), `frontend/src/app/app.routes.ts` (replace the placeholder `/admin` route with the new list/create/edit routes), `frontend/src/app/core/i18n/en.ts` and `es.ts` (new keys).
- No backend changes — `backend/src/users/*` and its API contract are unchanged.
- No changes to the sidebar nav itself (`app-shell.component.html`'s "Administration" link already targets `/admin` and is already role-gated to admins).
- `frontend/src/app/shared/placeholder/placeholder.component.ts` may become unused if this was its only remaining consumer — check other routes before considering its removal (out of scope to decide here if still used elsewhere).
