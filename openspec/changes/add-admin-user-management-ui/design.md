# Design

## Context

Backend `UsersController`/`UsersService` (`backend/src/users/`) already implements everything this UI needs: `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id`, admin-only via `RolesGuard`+`@Roles('admin')`, self-delete rejected with a `ConflictException`, duplicate email rejected with a `ConflictException`, password hashed server-side. No backend change is needed or in scope — see proposal.md - Impact.

Frontend `frontend/src/app/features/users/` today has only `UsersApiService.list()` and `UsersService.list()`, used exclusively by `ticket-form`'s assignee dropdown. `frontend/src/app/app.routes.ts` has a single `/admin` route rendering `shared/placeholder/PlaceholderComponent`. The established list/form component pair for an admin resource is `features/projects/project-list/` + `features/projects/project-form/` (Tailwind classes, `app-form-field` shared component, `TranslationService`/`TranslatePipe`, a `saving`/`error` signal pair, `save()` branching create vs. update on `this.id`). `User` (`frontend/src/app/features/models.ts`) already has the right shape: `{ id, email, firstName, lastName, role: 'admin'|'user', isActive }`.

## Goals / Non-Goals

**Goals:**
- A working admin screen at `/admin` replacing the placeholder, following the exact list/form pattern already established by `projects`/`categories`.
- Create/edit/delete wired to the existing, unchanged backend API.

**Non-Goals:**
- No backend changes — the API is complete and out of scope (proposal.md - Impact).
- No self-service profile changes — `profile` (self-service own-account view/password-change) is a separate, already-existing capability and untouched here; this is strictly the admin-on-other-accounts screen.
- No bulk actions (bulk delete/role-change) — one account at a time, matching every other admin list in this app.
- No password-strength UI beyond the backend's existing `MinLength(8)` validation (mirrored client-side for immediate feedback, not reimplemented server-side).

## Decisions

- **Routes**: replace the single placeholder route with three, all still behind `roleGuard`/`data: { role: 'admin' }` (unchanged guard, just applied to more routes) under `/admin`:
  - `/admin` → `UserList` (list)
  - `/admin/new` → `UserForm` (create)
  - `/admin/:id/edit` → `UserForm` (edit)
  This mirrors `/projects`, `/projects/new`, `/projects/:id/edit` exactly, so the sidebar's existing "Administration" link (already pointing at `/admin`) needs no change.
- **One `UserForm` component handles both create and edit**, exactly like `ProjectForm`/`CategoryForm`/`TicketForm`: `readonly id = this.route.snapshot.paramMap.get('id')`, and `save()` branches on whether `id` is set.
- **Password field behavior**: the form always has a password field. On create it's required (`Validators.required`, `Validators.minLength(8)`); on edit it's optional (`Validators.minLength(8)` only, no `required`) and, if left blank, is omitted from the update payload entirely (not sent as an empty string) so `UsersApiService.update()` doesn't overwrite the password — this matches `UpdateUserDto.password` already being `@IsOptional()` server-side.
- **Role and active-status fields as native `<select>`s** (role: admin/user; active status: active/inactive), each using `app-form-field`'s existing `kind="select"` support (already used by `ticket-form` for kind/priority/status) — no new field-component work needed.
- **Active/inactive indicator reuses the `status-pill` visual pattern** (already in `frontend/src/styles.css` from the ticket-status work) rather than inventing a new component: two new small modifier classes, `status-pill-active`/`status-pill-inactive`, added to the existing `.status-pill` base class, keeping one consistent "colored pill" visual language across the app instead of a second one. Role does not get a colored pill — it's plain text in the table, since role (admin/user) isn't a state-machine-style status like ticket status or active/inactive, and inventing a color mapping for a 2-value role adds visual noise without matching an established pattern elsewhere in the app.
- **Self-delete UI guard**: the delete action is available in the list for every row, including the currently authenticated admin's own row (consistent with how `ProjectList`/`CategoryList` show delete for every row without pre-filtering) — the backend's existing `ConflictException` on self-delete surfaces as the row's error message, exactly like every other list's delete-error handling (`error: () => this.error.set(this.translations.t('...'))`). No client-side special-casing of "is this my own row" is needed; the spec's "Attempting to delete own account" scenario is satisfied by surfacing the backend's existing rejection, not by preventing the click.
  - Alternative considered: disable/hide the delete button on the admin's own row. Rejected — it's extra client-side logic duplicating a check the backend already enforces correctly, and every other delete flow in this app already relies on surfacing the backend's error rather than predicting it client-side.
- **`UsersApiService` gains `create`/`update`/`delete`**, matching the shape of `ProjectsApiService`'s equivalent methods (same HTTP verbs/paths pattern: `POST /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`).

## Risks / Trade-offs

- **`PlaceholderComponent` may become unused** once `/admin` no longer references it → mitigation: proposal.md already flags this as a follow-up check, not a blocking task here — grep for other routes using it before removing it, in a later cleanup if it turns out unused.
- **Editing your own account's role/active-status through this screen** (e.g. an admin demoting or deactivating themselves) is technically allowed by the backend (only *delete* is self-blocked, not update) → mitigation: none needed for this change — it's existing backend behavior, out of scope to change here, and matches the already-approved backend spec (`add-ticket-support-system/specs/user-management/spec.md` only restricts delete, not update).

## Migration Plan

1. Extend `UsersApiService` with `create`/`update`/`delete`.
2. Build `UserList` (admin-only list + delete action).
3. Build `UserForm` (create + edit, password-optional-on-edit logic).
4. Update `app.routes.ts` to the three real routes in place of the placeholder.
5. Add i18n keys to `en.ts`/`es.ts`; add the two new `status-pill-active`/`status-pill-inactive` CSS classes.
6. Verify against the real backend (already running, no changes needed): create a user, edit it (with and without a password change), attempt to delete your own account (expect rejection), delete another account (expect success).

No rollback complexity beyond a plain git revert — frontend-only, no migration, no API contract change.
