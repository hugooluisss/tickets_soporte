# Proposal

## Why

The ticket support system (backend + frontend, from `add-ticket-support-system`) currently only runs from local dev processes against a manually-configured local MySQL instance. To let anyone other than the implementer reach it, it needs to run as a repeatable containerized stack and be published through this machine's existing shared reverse proxy, the same way other projects on this host already are.

## What Changes

- Add a `docker-compose.yml` at the repo root that builds and runs three services: the NestJS backend, the Angular frontend (served as static files), and a MySQL database, wired together on a private Docker network with persisted data.
- Add production-oriented Dockerfiles for `backend/` and `frontend/` (multi-stage builds: install + build, then a slim runtime image).
- Add an entry to the host's shared Caddy configuration (`/etc/caddy/Caddyfile`) publishing the frontend and backend under path prefixes on the existing `agents-dev` shared site, following the same `handle` / `handle_path` convention already used for the other projects on this host (e.g. `vendaly-app`/`vendaly-api`, `planeaciones_frontend`/`planeaciones_api`).
- Document the environment variables the compose stack needs (DB credentials, JWT secret) via a `.env.example` at the repo root, without committing real secrets.

None of the above changes any application behavior from `add-ticket-support-system` — this is purely how the already-built system gets run and reached.

## Capabilities

### New Capabilities
- `deployment`: The system SHALL be reachable as a running containerized stack (frontend + backend + database) and publicly reachable through the host's shared reverse proxy under dedicated path prefixes.

### Modified Capabilities
None — no existing capability's requirements change; this only changes how the system is run and reached.

## Impact

- **New files**: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/Dockerfile`'s embedded static-file server config (e.g. an Nginx or Caddy config for serving the Angular build), `.env.example` at the repo root, a `.dockerignore` for each project.
- **Modified host config**: `/etc/caddy/Caddyfile` gains a new path-prefixed block for this project (edited directly on the host, not something the containers manage) plus a `systemctl reload caddy` (or equivalent) to apply it.
- **No changes** to backend/frontend application code, database schema, or any existing OpenSpec capability from `add-ticket-support-system`.
- **Affected systems**: this host's shared Caddy instance (currently serving `vendaly`, `speech-dashboard`, and `planeaciones` alongside a landing page on the same `:8000` site block) gains one more project's routes.
