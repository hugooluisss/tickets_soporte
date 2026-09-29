# Tasks

## 1. Phase 1 — Backend foundation, auth, users, profile (backend/)

Domain-folder rule for this phase: `backend/src/users/` (entity, repository, `UsersService`, `UsersController`), `backend/src/auth/` (login only), and `backend/src/profile/` (self-service, importing `UsersModule`) are three separate folders — see `design.md` - Backend file and folder organization. Keep files near the ~300-line soft guideline; split a file by sub-responsibility if it grows past that.

- [x] 1.1 Scaffold the NestJS project at `backend/` (Nest CLI, TypeScript strict mode enabled in `tsconfig.json`) and verify `npm run build` succeeds with no source files yet beyond the default app module
- [x] 1.2 Add and configure TypeORM with MySQL (`@nestjs/typeorm`, `mysql2`), including a `DatabaseModule` reading connection config from environment variables (defaulting to the local MySQL instance and database `dev_tickets`), and verify the app boots and connects to that local database
- [x] 1.3 Create the `User` entity (id, email unique, password_hash, first_name, last_name, role enum, is_active, created_at, updated_at) in `backend/src/users/` and a migration for the `users` table, and verify the migration runs cleanly against a fresh database
- [x] 1.4 Implement `UsersRepository` in `backend/src/users/` (TypeORM repository wrapper: findAll, findById, findByEmail, create, update, delete — no business rules) and verify with a repository-level test against a test database or in-memory sqlite
- [x] 1.5 Implement `UsersService` in `backend/src/users/` (business rules: unique-email check on create, password hashing on create, verify-and-update-password helper reusable by Profile, active-status and role updates, "cannot delete self" rule) with unit tests covering each rule, per `specs/user-management/spec.md`
- [x] 1.6 Implement `UsersController` in `backend/src/users/` (`GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id`, admin-only via `RolesGuard` — no profile/self-service endpoints here) with DTOs (`CreateUserDto`, `UpdateUserDto`) validated by `class-validator`, and verify with e2e tests for create/list/update/delete including the admin-only rejection scenario
- [x] 1.7 Implement `AuthModule` in `backend/src/auth/`: `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator, and `AuthService.login()` (delegates credential check to `UsersService`, rejects inactive accounts, signs a JWT with `sub`/`role`) with unit tests covering valid login, wrong password, unknown email, and inactive account, per `specs/auth/spec.md`
- [x] 1.8 Implement `AuthController` in `backend/src/auth/` with exactly one endpoint (`POST /api/auth/login`) and verify with an e2e test covering successful and failed login
- [x] 1.9 Implement `ProfileModule`/`ProfileService`/`ProfileController` in `backend/src/profile/` (`GET /api/profile`, `POST /api/profile/change-password`, both delegating to `UsersService` for the actual read/password-update logic — no duplicate persistence logic in this folder) and verify with e2e tests covering own-profile view and the "wrong current password" rejection scenario, per `specs/profile/spec.md`
- [x] 1.10 Wire the global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`) and a global exception filter mapping known error types to HTTP status codes, and verify a malformed payload to any endpoint returns a 400 with validation details

## 2. Phase 2 — Backend tickets, projects, categories, dashboard, reports (backend/) — depends on Phase 1

Domain-folder rule for this phase: `backend/src/projects/`, `backend/src/categories/`, `backend/src/tickets/`, `backend/src/dashboard/`, `backend/src/reports/` are five separate folders, each with its own controller/service/repository as needed — no shared "catalog" or "misc" controller. Keep files near the ~300-line soft guideline (e.g. keep `TicketsRepository`'s filter-building in a dedicated helper if it grows large).

- [x] 2.1 Create `Project` and `Category` entities/migrations and their `ProjectsRepository`/`CategoriesRepository`, and verify migrations run cleanly alongside the `users` migration from Phase 1
- [x] 2.2 Implement `ProjectsService`/`ProjectsController` and `CategoriesService`/`CategoriesController` (CRUD, delete restricted to Admin) with unit + e2e tests covering the scenarios in `specs/project-catalog/spec.md` and `specs/category-catalog/spec.md`, including the "clear category reference on delete" behavior
- [x] 2.3 Create the `Ticket` entity/migration (title, description, kind/priority/status enums, project_id, category_id nullable FKs, created_by_id, assigned_to_id FKs to users, timestamps) and verify the migration applies cleanly with foreign keys enforced
- [x] 2.4 Implement `TicketsRepository` with composable filter query methods (keyword, project, category, priority, status, kind, date range — combinable) and verify with tests covering each filter individually and combined, per `specs/ticket-management/spec.md`
- [x] 2.5 Implement `TicketsService` (create with defaults, update with validation, assignment validation against existing users, delete) with unit tests covering every scenario in `specs/ticket-management/spec.md` (missing title, invalid enum, assign to non-existent user, clearing title on update, etc.)
- [x] 2.6 Implement `TicketsController` (`GET/POST /api/tickets`, `GET/PATCH/DELETE /api/tickets/:id`, filter query params) with DTOs and verify with e2e tests covering listing, filtering, creation, update, assignment, and deletion
- [x] 2.7 Add `GET /api/projects/:id/tickets` to `ProjectsController` (delegating to `TicketsService`/`TicketsRepository`) and the ticket-count fields on project responses, and verify against `specs/project-catalog/spec.md` scenarios
- [x] 2.8 Implement `DashboardService`/`DashboardController` (`GET /api/dashboard/summary`: pending count, totals by status/project/category) with unit tests covering the empty-data and populated-data scenarios in `specs/dashboard/spec.md`
- [x] 2.9 Implement `ReportsService`/`ReportsController` (`GET /api/reports` with the same filters as tickets, returning filtered tickets plus aggregated counts by status/project/category, including "unassigned" groupings) with unit tests covering every scenario in `specs/reporting/spec.md`

## 3. Phase 3 — Frontend foundation, auth, shell (frontend/) — can start in parallel with Phase 1/2 against the documented API contract

Component-folder rule for this phase and Phase 4: every component is generated in its own folder with up to four files (`.component.ts`, `.component.html`, `.component.css`/`.scss`, `.component.spec.ts`) — never combine a component's markup, logic, or styles into one file, and never let one component's folder hold another component's view. Use `ng generate component` rather than hand-authoring the folder. See `design.md` - Frontend component file organization.

- [x] 3.1 Scaffold the Angular project at `frontend/` (Angular CLI, TypeScript strict mode, routing enabled) and verify `ng build` succeeds
- [x] 3.2 Implement `AuthApiService` (data-access: `login` only — the only class using `HttpClient` for the `/api/auth/login` endpoint) matching the `design.md` API contract
- [x] 3.3 Implement `AuthService` (feature service: holds current-user state, exposes `login()`/`logout()`/`isAuthenticated()`/`hasRole()`, calls `AuthApiService`, persists the token) with unit tests covering login success/failure state transitions
- [x] 3.4 Implement the login `Component`, in its own folder per the component-folder rule (reactive form, required fields, calls `AuthService.login()`, displays server-returned errors) and verify by running the app and completing a login flow against a running backend (or a mocked `AuthApiService`)
- [x] 3.5 Implement an `HttpInterceptor` that attaches the bearer token to outgoing requests and redirects to login on a 401 response, and verify with a unit test simulating a 401
- [x] 3.6 Implement route guards (`authGuard`, `roleGuard`) protecting authenticated and admin-only routes, and verify with unit tests for authenticated/unauthenticated/wrong-role cases
- [x] 3.7 Build the app shell (navigation, logout action, route outlet) and verify by navigating between placeholder routes in a running dev server

## 4. Phase 4 — Frontend tickets, projects, categories, dashboard, reports, profile (frontend/) — depends on Phase 3 and Phase 2's endpoints

- [x] 4.1 Implement `ProjectsApiService`, `CategoriesApiService`, `UsersApiService`, `ProfileApiService` (data-access only, one per backend endpoint group — `ProfileApiService` calls `/api/profile*`, kept separate from `UsersApiService`) matching their backend contracts, and their feature `ProjectsService`/`CategoriesService`/`UsersService`/`ProfileService` counterparts
- [x] 4.2 Build project and category list/create/edit/delete components (reactive forms with validators mirroring backend constraints), each in its own component folder, and verify by running each CRUD flow in a dev server against the Phase 2 backend
- [x] 4.3 Build the profile view/edit component (own info, password-change form), in its own component folder, and verify the password-change flow (success and wrong-current-password) against the Phase 1 backend
- [x] 4.4 Implement `TicketsApiService` and `TicketsService` (filter-state management, calls to the tickets endpoint with combined filters) with unit tests covering filter composition
- [x] 4.5 Build the ticket list component (filter controls for keyword/project/category/priority/status/kind/date range, results table), in its own component folder, and verify each filter individually and in combination against a running backend
- [x] 4.6 Build the ticket create/edit form component (all fields, assignee selection from users list, validation mirroring `specs/ticket-management/spec.md`), in its own component folder, and verify create/update/delete flows end-to-end in a dev server
- [x] 4.7 Implement `DashboardApiService`/`DashboardService` and the dashboard view component, in its own component folder, (summary metrics, per-status/project/category breakdowns) and verify it renders correctly against both empty and populated backend data
- [x] 4.8 Implement `ReportsApiService`/`ReportsService` and the reports view component, in its own component folder, (filters identical to ticket list, aggregated charts by status/project/category) and verify against `specs/reporting/spec.md` scenarios including the empty-result case

## 5. Cross-cutting verification

- [ ] 5.1 Run the full backend unit + e2e test suite and confirm it passes with no skipped scenarios from any `specs/*/spec.md` file
- [ ] 5.2 Run the full frontend unit test suite and confirm it passes
- [ ] 5.3 Manually walk through login → create project/category → create ticket → filter tickets → view dashboard → view report → logout, end to end with both servers running, and confirm no step relies on a component/service bypassing its layer (no `HttpClient` in a component, no direct repository access from a controller, no business logic in a data-access service)
