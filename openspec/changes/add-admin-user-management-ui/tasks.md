# Tasks

## 1. Frontend: extend UsersApiService

- [x] 1.1 Add `create`, `update`, and `delete` methods to `frontend/src/app/features/users/users-api.service.ts` (`POST /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`), matching `ProjectsApiService`'s method shapes, and add matching pass-through methods to `frontend/src/app/features/users/users.service.ts`
- [x] 1.2 Add unit tests for the new `UsersApiService` methods (request method/URL/body) following the existing test pattern used for `list()`

## 2. Frontend: user list screen

- [x] 2.1 Create `frontend/src/app/features/users/user-list/user-list.component.{ts,html}` (admin-only, table of email/name/role/active-status, "new" button, edit/delete actions per row) mirroring `features/projects/project-list/`
- [x] 2.2 Add the active/inactive indicator using new `.status-pill-active`/`.status-pill-inactive` CSS classes added to `frontend/src/styles.css` alongside the existing `.status-pill` base class
- [x] 2.3 Add all new UI strings (column headers, empty state, delete confirmation/error) to `en.ts`/`es.ts`
- [x] 2.4 Add a component test covering: list renders rows with role/active indicator, delete success removes a row, delete failure (e.g. self-delete) shows an error and keeps the row

## 3. Frontend: user create/edit form

- [x] 3.1 Create `frontend/src/app/features/users/user-form/user-form.component.{ts,html}` mirroring `features/projects/project-form/`: fields for email, first name, last name, role (select: admin/user), active status (select: active/inactive), password — using `app-form-field` for each
- [x] 3.2 Implement password validation: required + min length 8 on create, optional + min length 8 (when provided) on edit; omit the password field from the update payload entirely when left blank on edit
- [x] 3.3 Implement `save()` branching on `id` (create vs. update) per the established pattern, navigating back to the user list on success and showing a translated error on failure (including the duplicate-email case)
- [x] 3.4 Pre-fill the form from `UsersService.get`-equivalent lookup when editing (add a `get(id)` method to `UsersApiService`/`UsersService` if not already present, matching `ProjectsApiService.get`)
- [x] 3.5 Add all new UI strings (labels, validation errors, save button states) to `en.ts`/`es.ts`
- [x] 3.6 Add a component test covering: create submits the expected payload including password, edit submits without a password field when left blank and with one when provided, validation blocks submission when required fields are empty

## 4. Frontend: routing

- [x] 4.1 Replace the placeholder `/admin` route in `frontend/src/app/app.routes.ts` with `/admin` (`UserList`), `/admin/new` (`UserForm`), and `/admin/:id/edit` (`UserForm`), all keeping the existing `roleGuard`/`data: { role: 'admin' }`
- [x] 4.2 Update `app.routes.spec.ts` if it references the old placeholder-based `/admin` route
- [x] 4.3 Check whether `frontend/src/app/shared/placeholder/placeholder.component.ts` is still referenced by any other route; note the finding (no other routes reference it; removal remains out of scope)

## 5. Verification

- [x] 5.1 Run `npm run build` (production) and `npm test` inside `frontend/` and fix any failures
- [ ] 5.2 Against the running backend, manually verify: an Admin can view the user list, create a user (with password), edit a user without changing the password, edit a user with a new password (and log in as that user to confirm the new password works), deactivate a user, and delete a user that is not their own account
- [ ] 5.3 Manually verify that attempting to delete the currently authenticated admin's own account shows an error and the account remains
- [ ] 5.4 Manually verify that a non-admin user cannot reach `/admin`, `/admin/new`, or `/admin/:id/edit` (redirected away)
