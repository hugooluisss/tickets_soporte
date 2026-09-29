# Design

## Context

`add-ticket-support-system` built the backend (NestJS) and frontend (Angular) and explicitly deferred containerization/deployment as a non-goal. Both currently only run as local dev processes against the host's local MySQL (`dev_tickets`, already created and used — see that change's design.md). This host also already runs several other projects behind a single shared Caddy instance (`/etc/caddy/Caddyfile`, listening on `:8000`, publicly reachable through a tunnel as `agents-dev`), each published under its own path prefix (`/vendaly-app/`, `/vendaly-api/`, `/planeaciones_frontend/`, `/planeaciones_api/`, etc.), reverse-proxying to a plain host port each project's own process or container exposes. There is no per-project Caddy container in this pattern — Caddy runs once, on the host, and every project's compose stack just exposes host ports for it to target.

## Goals / Non-Goals

**Goals:**
- Package the backend and frontend as containers that can be brought up with a single `docker compose up`.
- Reuse the existing host MySQL instance and `dev_tickets` database rather than running a second, container-local MySQL — avoids a port clash on 3306 (already bound by the host's MySQL) and avoids a second copy of the same data.
- Publish both services through the host's existing shared Caddy config, following the exact same `handle`/`handle_path` path-prefix convention already used for every other project on this host.
- Keep real credentials and secrets out of any committed file.

**Non-Goals:**
- Running MySQL itself in a container for this deployment (a future change can revisit this if the project ever needs to run on a host without a pre-existing MySQL).
- TLS termination or DNS — the tunnel/Cloudflare layer in front of this host's Caddy already handles that for `agents-dev`, unchanged by this work.
- CI/CD (automated build/deploy pipelines) — out of scope; this change only makes the stack runnable, not automatically deployed on push.
- Horizontal scaling, health-check orchestration, or zero-downtime deploys — this is a single small internal tool; a `docker compose up -d --build` restart is an acceptable deploy story for now.

## Decisions

### No MySQL container; connect to the host's existing MySQL
The backend container reaches the host's MySQL via Docker's `host.docker.internal` host-gateway mapping (`extra_hosts: ["host.docker.internal:host-gateway"]` in compose), using the same `dev_tickets` database and `dev_tickets_app` user already created for local dev. This means the containerized backend and any local dev instance share one database — acceptable for this project's current single-environment reality, and avoids the churn of migrating real data into a second MySQL instance later.

**Alternative considered**: a `mysql` service in `docker-compose.yml` with its own volume. Rejected for now — port 3306 is already bound by the host's MySQL, so the container would need a different host port anyway, adding a second, empty database to keep in sync with the one already in use, for no real benefit at this project's current scale.

### Host port allocation
Two new host ports, chosen to avoid every port already in use on this host (checked live: 22, 53, 443, 3000, 3306, 4200, 4201, 4301, 4302, 8000, 8080, 9000, 9001, plus a few ephemeral/service ports):
- Backend container exposes host port **3010** (container listens on 3000 internally, mapped `3010:3000`, to match the app's own `PORT` default without renumbering the app).
- Frontend container (static build served by a lightweight web server) exposes host port **4310** (`4310:80`).

These are internal-only ports, reachable at `127.0.0.1:3010`/`127.0.0.1:4310` on the host — never exposed directly to the internet. Only Caddy's `:8000` site is publicly reachable (through the existing tunnel), and it reverse-proxies to these.

### Container images
- **Backend**: multi-stage `backend/Dockerfile` — a `build` stage (`node:20-alpine`, `npm ci`, `npm run build`) producing `dist/`, then a slim `runtime` stage (same `node:20-alpine` base, `npm ci --omit=dev`, copies `dist/` and runs `node dist/main.js`). Migrations are run as an explicit `docker compose exec backend npm run migration:run:prod` step (documented, not automatic on every container start, so a bad migration can't silently loop-crash the container on restart). `migration:run:prod` is a separate script from the one used in local dev — it targets the compiled `dist/database/data-source.js` via the plain `typeorm` CLI, since the production image intentionally excludes `ts-node`/`typeorm-ts-node-commonjs` (dev-only dependencies that the local-dev `migration:run` script needs).
- **Frontend**: multi-stage `frontend/Dockerfile` — a `build` stage (`node:22-alpine` — this Angular CLI version requires Node ≥22.22.3, unlike the backend, which has no such constraint and stays on `node:20-alpine`; `npm ci`, `ng build --configuration production`) producing the static `dist/frontend/browser` output with `--base-href /tickets-app/` (matching the Caddy prefix below), then a `runtime` stage using `nginx:alpine` to serve the static files, configured to fall back to `index.html` for Angular's client-side routing.

**Alternative considered**: serving the frontend from the same Nest process (backend serves the Angular build as static assets). Rejected — it would blur the "two independent projects" repository layout this project's main design.md already established, and couples frontend deploys to backend restarts for no benefit.

### Caddy publishing (host-level, edited directly, not containerized)
Add to `/etc/caddy/Caddyfile`'s existing `:8000` site block, mirroring the `vendaly-app`/`vendaly-api` and `planeaciones_frontend`/`planeaciones_api` pairs exactly:

```caddyfile
redir /tickets-app /tickets-app/ 308
redir /tickets-api /tickets-api/ 308

handle /tickets-app/* {
	reverse_proxy 127.0.0.1:4310
}

handle_path /tickets-api/* {
	reverse_proxy 127.0.0.1:3010
}
```

Note the asymmetry, intentional and matching the existing convention exactly: `handle` keeps the `/tickets-app/` prefix intact when forwarding to the frontend (the Angular build's `--base-href /tickets-app/` expects to see that prefix in its own asset URLs), while `handle_path` strips `/tickets-api` before forwarding to the backend — and the backend's own `app.setGlobalPrefix('api')` (from `add-ticket-support-system`) means the full public path ends up as `/tickets-api/api/...`. This looks slightly redundant but is deliberate: it keeps this change from having to touch the backend's already-established, already-tested `/api` prefix, and mirrors exactly how `planeaciones_api` (whose backend has no internal prefix) versus a project with one would differ — documented here once so it isn't mysterious later. The frontend's production environment config points its `apiBaseUrl` at the relative path `/tickets-api/api`, so this is invisible to the app itself.

After editing the file, apply with `caddy reload --config /etc/caddy/Caddyfile` (or the host's existing `systemctl reload caddy`, matching how prior projects' Caddy edits were applied) — not a full restart, so other projects' currently-open connections aren't dropped.

**Alternative considered**: giving the ticket system its own dedicated Caddy site block bound to its own port or subdomain. Rejected — every other project on this host is published through the single shared `:8000` site under a path prefix; a separate site block would be inconsistent with the established pattern for no real benefit, and would need its own DNS/tunnel entry.

### Secrets
A root-level `.env.example` documents the variables `docker-compose.yml` reads (`DB_HOST` defaulting to `host.docker.internal`, `DB_PORT=3306`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE=dev_tickets`, `JWT_SECRET`), with placeholder values. The real `.env` (git-ignored, same convention as `backend/.env` from `add-ticket-support-system`) holds the actual `dev_tickets_app` password and a real JWT secret, and is created once, manually, on this host — never committed, never generated by a Codex agent into a tracked file.

## Risks / Trade-offs

- [Sharing the host MySQL between local dev and the containerized deployment] → Mitigation: acceptable for this project's current single-environment scale; revisit with a dedicated container/volume if a second (e.g. staging) environment is ever needed.
- [Manual Caddy edit + reload is a manual step outside version control for the live config] → Mitigation: the exact block to add is documented verbatim in this design doc and in tasks.md, so it's copy-pasteable and reviewable even though the live file itself isn't tracked in this repo.
- [Migrations are a manual `docker compose exec` step, not automatic] → Mitigation: deliberate — an automatic migration-on-boot that fails would crash-loop the container; documented as an explicit deploy step in tasks.md instead.
- [Double `/api` segment in the public backend URL (`/tickets-api/api/...`)] → Mitigation: cosmetic only, fully encapsulated in the frontend's environment config; documented above so a future reader isn't confused by it.

## Migration Plan

1. Build and start the stack locally (`docker compose build && docker compose up -d`), confirm both containers are healthy and the backend can reach the host MySQL.
2. Run `docker compose exec backend npm run migration:run:prod` — should report "No migrations are pending" since Phase 1/2 migrations already ran directly on the host; this only matters if the container's view of the schema ever diverges.
3. Add the Caddy block above to `/etc/caddy/Caddyfile`, validate with `caddy validate --config /etc/caddy/Caddyfile`, then reload.
4. Verify externally: `https://agents-dev.hugosantiago.dev/tickets-app/` loads the Angular app, and it can log in and round-trip data through `/tickets-api/api/...`.
5. Rollback, if needed: `docker compose down` stops the new containers; reverting the Caddy edit and reloading removes the public routes. Neither step touches the host MySQL or its data.
