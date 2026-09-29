# Proposal

## Why

There is no support ticket management system in this repository yet. Support teams need a way to log, classify, prioritize, assign, and track work items (tickets) across projects and categories, with role-based access and reporting so managers can see workload and status distribution at a glance.

## What Changes

- Introduce a NestJS + TypeScript backend exposing a REST API, structured in strict layers: Controller → Service → Repository. Controllers only translate HTTP requests/responses; all business logic lives in services; all persistence lives in repositories.
- Introduce an Angular frontend consuming that API, structured with the equivalent layering: Components (view/interaction) → Services (business/state orchestration) → Data-access services (HTTP calls only).
- Add authentication (login/logout, JWT-based sessions) with two roles: Admin and Regular user, and an active/inactive account flag enforced at login.
- Add User management (CRUD, role assignment, active-state toggle) as an admin-only capability, kept separate from self-service profile.
- Add a Profile capability (own-profile view, password change) as its own endpoint group, separate from admin user management.
- Add Project catalog management (CRUD) with per-project ticket counts.
- Add Category catalog management (CRUD) for ticket classification.
- Add Ticket management (CRUD) with kind, priority, status, project, category, creator, assignee, and filtering by keyword/project/category/priority/status/kind/date range.
- Add a Dashboard capability exposing summary metrics (pending ticket count, totals by status/category/project).
- Add a Reports capability producing filtered, aggregated ticket counts (by status, project, category) suitable for charting.
- Establish TypeScript strict mode, DTO-based validation (class-validator) on the backend, and reactive-form validation on the frontend as cross-cutting engineering constraints (documented in design.md, not a standalone capability).

None of the above are breaking changes since this is a new system in an empty repository.

## Capabilities

### New Capabilities
- `auth`: Login/logout, JWT session issuance and validation, role model (Admin/Regular), inactive-account rejection.
- `user-management`: Admin-only CRUD of user accounts, role and active-state administration.
- `profile`: Self-service own-profile view and password change, exposed as its own endpoint group distinct from admin user management.
- `project-catalog`: CRUD of projects and per-project ticket-count queries.
- `category-catalog`: CRUD of ticket categories.
- `ticket-management`: CRUD of tickets, field validation, multi-criteria filtering, assignment.
- `dashboard`: Aggregated summary metrics for the landing/home view.
- `reporting`: Filtered ticket reports with aggregated counts for charting.

### Modified Capabilities
None — this is a greenfield system with no pre-existing specs.

## Impact

- **New code**: a NestJS backend project and an Angular frontend project, added to this repository (structure defined in design.md).
- **New database schema**: relational tables for users, projects, categories, and tickets (kind/priority/status modeled as enum columns on `tickets`, not separate lookup tables — see design.md), owned by the backend via TypeORM entities/migrations, in a PostgreSQL database.
- **New dependencies**: NestJS, TypeORM with the PostgreSQL driver (`pg`), class-validator/class-transformer, JWT library, Angular, Angular CLI/build tooling.
- **No existing systems affected** — nothing else lives in this repository today.
