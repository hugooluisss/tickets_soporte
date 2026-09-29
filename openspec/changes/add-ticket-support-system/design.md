# Design

## Context

This is a greenfield repository — no existing code, specs, or architecture to integrate with. See `proposal.md` - Why/What Changes for the motivation and capability list. This document defines the technical shape both codebases (backend and frontend) must follow so that implementation work can be split across multiple Codex agents working concurrently without producing inconsistent architectures or colliding on the same files.

## Goals / Non-Goals

**Goals:**
- Define a repository layout that lets backend and frontend be implemented and run independently.
- Define the exact layering contract (Controller → Service → Repository on the backend; Component → Service → Data-access service on the frontend) precisely enough that any implementer produces consistent results.
- Define the data model and API surface once, so backend and frontend agents build against the same contract without needing to coordinate live.
- Pick a concrete, boring stack (ORM, auth mechanism, validation libraries) so implementers are not left guessing.

**Non-Goals:**
- Real-time features (websockets/notifications) — out of scope.
- Multi-tenant support — single organization per deployment.
- File attachments on tickets — out of scope for this change.
- CI/CD pipeline setup, containerization, or deployment topology — implementation detail left to a future change if needed.

## Decisions

### Repository layout
Two independent projects at the repo root: `backend/` (NestJS) and `frontend/` (Angular). Each has its own `package.json`, lockfile, and test runner. This lets one Codex agent own `backend/` and another own `frontend/` with zero file overlap, and a third agent can work on a specific vertical slice inside either (e.g. `backend/src/tickets/**` and `frontend/src/app/tickets/**`) once the foundation exists.

**Alternative considered**: single Nx/Turborepo monorepo with shared TS types package. Rejected for this change — it adds tooling overhead and a shared-types package becomes a third piece every agent must touch, increasing collision risk. The API contract documented below (data model, endpoints, DTOs) plays that synchronizing role instead, in plain markdown, at zero coordination cost. Revisit if the project grows enough to justify shared generated types.

### Backend layering (Controller → Service → Repository)
- **Controller**: one per distinct endpoint group, not one per entity — `AuthController` (login only), `UsersController` (admin-only account CRUD), `ProfileController` (self-service own-profile view + password change — a separate controller from `UsersController` even though both touch the `User` entity, because they are a distinct set of endpoints with distinct authorization rules), `ProjectsController`, `CategoriesController`, `TicketsController`, `DashboardController`, `ReportsController`. Responsibilities: route binding, DTO validation (via `ValidationPipe` + `class-validator`), auth/role guards, calling exactly one service method per handler, mapping the service result to an HTTP response/status code. **No query building, no direct entity manipulation, no business rules** in a controller. Rule of thumb: if a new group of endpoints doesn't map cleanly onto an existing controller's responsibility, it gets its own controller rather than being added to one that already covers something else — this is the general form of the `Users`/`Profile` split.
- **Service**: one per resource/use-case group, mirroring its controller (`UsersService`, `ProfileService`, etc.), holds business rules (e.g. "a ticket's default status is Pending", "an inactive user cannot log in", "only Admins can change roles"). Services depend on repositories via constructor injection and never import TypeORM/Prisma types directly into controllers. A service method does one thing; if a use case needs multiple steps (e.g. create ticket + compute default fields), that composition lives in the service, not spread across controller and repository. `ProfileService` composes `UsersService`/`UsersRepository` for the actual account read/password-hash logic rather than duplicating it, so there is exactly one place that knows how a password is hashed and verified.
- **Repository**: one per entity, wraps all persistence access (TypeORM `Repository<Entity>` via a thin custom repository class, or NestJS's injectable `@InjectRepository`). No business rules — only queries, filters, and mapping between entity and domain shape. Filtering logic for tickets (keyword/project/category/priority/status/kind/date range) is expressed here as composable query conditions, invoked by `TicketsService`. There is one `UsersRepository`, shared by both `UsersService` and `ProfileService` — the controller/service split by endpoint group does not imply a matching split at the repository layer, since both groups operate on the same `User` entity.

**Alternative considered**: fat "resource" services that also do persistence directly (skipping a repository layer), which is common in small NestJS apps using `@InjectRepository` straight in the service. Rejected because the proposal explicitly requires a controller→service→repository split with single-responsibility classes; collapsing service+repository would violate that constraint even though it's less code.

### Backend file and folder organization
Each domain gets its own folder under `backend/src/<domain>/` (e.g. `backend/src/users/`, `backend/src/profile/`, `backend/src/tickets/`), containing that domain's module, controller(s), service(s), repository, entity, and DTOs. `users/` and `profile/` are separate folders even though they share the `User` entity — `profile/` imports `UsersModule` rather than redefining persistence. Files should stay under roughly 300 lines as a soft guideline, not a hard gate: if a controller, service, or repository grows past that, it's a signal to split by sub-responsibility (e.g. split `TicketsRepository`'s filter-building into a dedicated query-builder helper in the same folder) rather than a rule to mechanically enforce. The point is that a large file is usually doing more than one job.

**Alternative considered**: grouping by technical layer first (`controllers/`, `services/`, `repositories/` at the top level, as in some legacy MVC frameworks). Rejected — it scatters a single domain's files across three unrelated directories, which is exactly the file organization this project is deliberately moving away from; domain-first folders keep everything about "tickets" in one place.

### Frontend layering (Component → Service → Data-access service)
- **Component**: owns template/view state only — form state, display logic, user interaction handlers. Calls exactly one (feature) service method per user action. No `HttpClient` usage in components.
- **(Feature) Service**: orchestrates a feature's client-side logic — e.g. `TicketsService` composes filter state, calls the data-access layer, exposes observables/signals to components, applies client-side derived state (e.g. formatting, computed labels). No direct `HttpClient` calls here either — it depends on a data-access service.
- **Data-access service**: one per resource (`AuthApiService`, `UsersApiService`, `ProjectsApiService`, `CategoriesApiService`, `TicketsApiService`, `DashboardApiService`, `ReportsApiService`), the only place `HttpClient` is used. Each method maps 1:1 to a backend endpoint, takes typed params, returns a typed `Observable`. No business logic — just request/response shaping (DTO in, typed model out).

**Alternative considered**: a single generic `ApiService` with a generic `get/post/put/delete`. Rejected — it re-centralizes all endpoints into one class with mixed responsibilities (auth headers aside, it still needs per-resource typing), which fights the single-responsibility requirement from the proposal. One data-access service per resource keeps each one small and independently testable/mockable.

### Frontend component file organization
Every Angular component lives in its own folder (e.g. `frontend/src/app/tickets/ticket-list/`) containing up to four files: the component class (`*.component.ts` — logic/state binding for that view), the template (`*.component.html` — markup only), the styles (`*.component.css`/`.scss` — presentation only), and the test (`*.component.spec.ts`). These are never merged — no inline template/styles in the `.ts` file, and no component logic placed inside a template or stylesheet. A component that genuinely needs none of a given file (e.g. no component-specific styling) simply omits that file; it must never absorb another component's markup or logic to avoid creating one. This is the default shape `ng generate component` already produces, so implementers should rely on the CLI generator rather than hand-rolling the folder.

**Alternative considered**: inline templates/styles for very small components (Angular supports `template`/`styles` inline in the `@Component` decorator). Rejected as a project-wide default — mixing the two styles inconsistently makes components harder to scan; a uniform four-file-folder shape is easier to enforce across agents working in parallel.

### Data model
Relational schema, one table per entity plus lookup tables for fixed enumerations:

- `users`: id, email (unique), password_hash, first_name, last_name, role (`admin` | `user`), is_active, created_at, updated_at.
- `projects`: id, name, description, created_at, updated_at.
- `categories`: id, name, created_at, updated_at.
- `tickets`: id, title, description, kind (`ticket` | `bug` | `suggestion` | `feature`), priority (`high` | `medium` | `low`), status (`pending` | `in_progress` | `done` | `cancelled`), project_id (nullable FK → projects), category_id (nullable FK → categories), created_by_id (FK → users), assigned_to_id (nullable FK → users), created_at, updated_at.

`kind`, `priority`, and `status` are modeled as Postgres enums (or check-constrained varchars) rather than separate lookup tables — they are fixed, small, code-defined sets with no admin CRUD requirement, unlike `projects`/`categories` which do need CRUD. This keeps ticket queries simple (no joins needed just to filter by status) while still validating values at the DB layer.

**Alternative considered**: lookup tables for kind/priority/status (mirroring how projects/categories work) for maximum extensibility. Rejected for now — none of the proposal's requirements call for admins to add new statuses/priorities/kinds at runtime; enums are simpler and faster to query, and can be migrated to tables later if that need appears.

### Database and ORM
**PostgreSQL** with **TypeORM**. Rationale: TypeORM has first-class NestJS integration (`@nestjs/typeorm`), native repository injection that maps directly onto this design's Repository layer, and native Postgres enum support for the `kind`/`priority`/`status` columns. Postgres over MySQL: better native enum type support (avoids re-deriving enum validation in application code alone) and is the more common default for new NestJS projects, minimizing setup friction for whichever Codex agent implements the backend foundation.

**Alternative considered**: Prisma. Prisma's generated client is excellent but its query builder does not map as naturally onto an injectable per-entity "Repository" class boundary — most Prisma+Nest setups end up with one shared `PrismaService` injected everywhere, which blurs the repository boundary this design requires. TypeORM's `Repository<T>` per entity is a closer fit to the proposal's explicit layering requirement.

### Authentication
JWT-based, stateless. `POST /auth/login` validates credentials via `AuthService` (delegates password check to `UsersService`/`UsersRepository`), rejects inactive accounts, and returns a signed JWT (`@nestjs/jwt`) containing `sub` (user id) and `role`. A `JwtAuthGuard` (Passport strategy) protects all routes except `/auth/login`; a `RolesGuard` + `@Roles('admin')` decorator enforces admin-only endpoints (user management, category/project delete). No refresh tokens in this change — access token expiry is set generously (e.g. 8h) given this is an internal support tool; revisit with refresh tokens if session length becomes a problem.

**Alternative considered**: server-side session with cookies. Rejected — JWT keeps the backend stateless and matches a SPA (Angular) + API (NestJS) split cleanly without needing session storage infrastructure.

### Validation
Backend: every write endpoint takes a `class-validator`-decorated DTO; `ValidationPipe` (global, `whitelist: true`, `forbidNonWhitelisted: true`) rejects invalid payloads before they reach a controller method body. Frontend: Angular reactive forms with built-in + custom validators mirroring backend constraints (required title, enum membership for kind/priority/status, etc.) so users get immediate feedback; the backend remains the source of truth and re-validates regardless.

### Phased rollout for parallel implementation
Because up to ~3 Codex agents can run concurrently, work is split to minimize file overlap:

1. **Phase 1 — Backend foundation, auth, users, profile** (one agent): Nest app scaffold, TypeORM setup + migrations, `User` entity/repository/`UsersService`/`UsersController` (admin CRUD), `AuthModule` (login, JWT strategy, guards, roles decorator), and `ProfileModule`/`ProfileController` (self-service view + password change, built on `UsersService`). Establishes the layering and folder pattern other backend phases copy.
2. **Phase 2 — Backend tickets/projects/categories/dashboard/reports** (one agent, after Phase 1 merges): depends on `User` entity and auth guards from Phase 1. Adds `Project`, `Category`, `Ticket` entities/repositories/services/controllers, plus `DashboardController`/`ReportsController` (read-only, composed from `TicketsRepository` aggregate queries).
3. **Phase 3 — Frontend foundation, auth, shell** (one agent, can start in parallel with Phase 1/2 against the documented API contract below): Angular app scaffold, routing, `AuthApiService`/`AuthService`, login page, auth guard/interceptor (attaches JWT, redirects on 401), app shell/navigation, role-based route guarding.
4. **Phase 4 — Frontend tickets/projects/categories/dashboard/reports** (one agent, after Phase 3 merges and Phase 2's endpoints exist): per-resource data-access services, feature services, list/detail/form components, dashboard view, reports view with charts.

This lets Phase 1 and Phase 3 run concurrently (frontend auth only needs the API *contract*, defined below, not the running backend), then Phase 2 and Phase 4 run concurrently once their respective dependencies land — never more than 2-3 agents active at once, each owning a distinct directory subtree.

### API contract (shared reference for backend and frontend agents)
All endpoints under `/api`, JSON in/out, `Authorization: Bearer <jwt>` except `/api/auth/login`.

- `POST /api/auth/login` — `{ email, password }` → `{ accessToken, user }` (the only endpoint `AuthController` owns)
- `GET /api/profile` — current user's own profile (owned by `ProfileController`, not `UsersController`)
- `POST /api/profile/change-password` — `{ currentPassword, newPassword }` (owned by `ProfileController`)
- `GET /api/users`, `POST /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id` — admin only, owned by `UsersController`
- `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id`
- `GET /api/projects/:id/tickets` — tickets belonging to a project
- `GET /api/categories`, `POST /api/categories`, `GET /api/categories/:id`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id`
- `GET /api/tickets?q=&projectId=&categoryId=&priority=&status=&kind=&dateFrom=&dateTo=`, `POST /api/tickets`, `GET /api/tickets/:id`, `PATCH /api/tickets/:id`, `DELETE /api/tickets/:id`
- `GET /api/dashboard/summary` — pending count, totals by status/category/project
- `GET /api/reports?<same filters as tickets>` — aggregated counts by status/project/category for charting

## Risks / Trade-offs

- [Enums for kind/priority/status make them code-defined, not admin-editable] → Mitigation: none of the current requirements need runtime editability; documented as a deliberate limitation, revisit as a follow-up change if needed.
- [Splitting backend/frontend into fully independent phases risks contract drift if an agent deviates from the documented API shape] → Mitigation: the API contract above is the single source of truth both phases' tasks.md entries point back to; Phase 2/4 review step (human) checks actual endpoints/DTOs against it before closing each agent's panel.
- [JWT without refresh tokens means users must re-login after expiry] → Mitigation: acceptable for an internal tool with a long-ish expiry; explicitly called out as a non-goal to revisit later.
- [No shared TS types package between backend and frontend] → Mitigation: each side defines its own DTOs/interfaces matching the documented contract; a future change can introduce a shared types package if drift becomes a recurring problem.

## Migration Plan

Not applicable — greenfield addition, no existing data or running system to migrate. Deployment/CI setup is explicitly a non-goal of this change.
