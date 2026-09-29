# Tasks

## 1. Containerize the backend

- [x] 1.1 Write `backend/Dockerfile` (multi-stage: `build` stage runs `npm ci && npm run build`; `runtime` stage copies `dist/` and `node_modules` (production-only) and runs `node dist/main.js`) and verify `docker build -f backend/Dockerfile backend` succeeds
- [x] 1.2 Add `backend/.dockerignore` (excluding `node_modules`, `dist`, `.env`, test files) and verify the built image doesn't contain the real `.env`
- [x] 1.3 Verify the built backend image runs standalone (`docker run` with the documented env vars pointing at the host MySQL via `host.docker.internal`) and responds on its internal port, per `specs/deployment/spec.md`'s "Backend container connects to the existing host database" scenario

## 2. Containerize the frontend

- [x] 2.1 Write `frontend/Dockerfile` (multi-stage: `build` stage runs `npm ci && ng build --configuration production --base-href /tickets-app/`; `runtime` stage copies the static output into a minimal static file server image) and verify `docker build -f frontend/Dockerfile frontend` succeeds
- [x] 2.2 Configure the runtime stage's web server for SPA fallback (unknown paths serve `index.html`) and verify a request to a non-root route (e.g. `/tickets` under the container's own root, before Caddy prefixing) returns the app shell, per the "Deep-linked route loads correctly" scenario
- [x] 2.3 Add `frontend/Dockerfile`'s companion `.dockerignore` and verify the built image doesn't contain `node_modules` from the host or any `.env`

## 3. Compose the stack

- [x] 3.1 Write `docker-compose.yml` at the repo root defining `backend` (build from `backend/Dockerfile`, port mapping `3010:3000`, `extra_hosts: ["host.docker.internal:host-gateway"]`, env vars from `.env`) and `frontend` (build from `frontend/Dockerfile`, port mapping `4310:80`) services
- [x] 3.2 Write a root-level `.env.example` documenting `DB_HOST` (defaulting to `host.docker.internal`), `DB_PORT=3306`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE=dev_tickets`, `JWT_SECRET`, with placeholder values only, and verify no real secret value appears in it or in `docker-compose.yml`
- [x] 3.3 Create a real, git-ignored root `.env` with the actual `dev_tickets_app` credentials and a real JWT secret, and verify it's excluded by `.gitignore`
- [x] 3.4 Run `docker compose up -d --build` and verify both containers reach a running state, per the "Fresh start on a host with the prerequisite database" scenario. Required a MySQL grant for `dev_tickets_app` from the Docker bridge subnet (`172.19.0.0/16`) in addition to `localhost` — the local-dev-only grant from `add-ticket-support-system` didn't cover container traffic.
- [x] 3.5 Run `docker compose exec backend npm run migration:run` and verify it reports no pending migrations (schema already applied directly on the host in earlier phases). Note: the documented `migration:run` script depends on `ts-node`/`typeorm-ts-node-commonjs`, which aren't in the production image's dependencies; added a `migration:run:prod` script (plain `typeorm` CLI against the compiled `dist/database/data-source.js`) for use inside the container instead.
- [x] 3.6 Hit the backend container directly at `http://127.0.0.1:3010/api/auth/login` and the frontend container at `http://127.0.0.1:4310/` and confirm both respond correctly before involving Caddy at all

## 4. Publish through the host's shared Caddy site

- [x] 4.1 Back up the current `/etc/caddy/Caddyfile` (e.g. copy alongside the existing timestamped `.bak` files already present there) before editing it
- [x] 4.2 Add the `redir`, `handle_path /tickets-app/*`, and `handle_path /tickets-api/*` blocks documented in `design.md` to the existing `:8000` site block. Correction after initial deploy: the frontend block was first written as plain `handle` (matching `vendaly-app`/`planeaciones_frontend`), which produced a blank page in the browser — the static nginx-served build has no `--serve-path` awareness of the prefix the way those Angular dev servers do, so asset requests 404'd into the SPA fallback with the wrong MIME type. Fixed to `handle_path`, verified assets serve with correct content-types afterward.
- [x] 4.3 Run `caddy validate --config /etc/caddy/Caddyfile` and verify it reports no errors before reloading
- [x] 4.4 Apply the change with `sudo systemctl restart caddy` (not `reload` — this host's Caddy runs with `admin off`, so `reload`'s admin-API push fails with `connection refused`; discovered live and documented in `design.md`) and verify the other existing projects' routes (`/vendaly-app/`, `/planeaciones_frontend/`) still respond correctly afterward — confirmed via direct curl, both returned 200
- [x] 4.5 Verify externally via `https://agents-dev.hugosantiago.dev/tickets-app/` that the frontend loads (200), that its referenced JS/CSS assets serve with correct content types (not the SPA fallback's `text/html`, per "A referenced script asset loads as a script through the proxy"), and via a request through `/tickets-api/api/auth/login` that the backend responds (400/401 for a bad login attempt, not a connection error), per the "Frontend reachable under its path prefix" and "Backend reachable under its path prefix" scenarios

## 5. End-to-end verification

- [x] 5.1 Through the public `agents-dev.hugosantiago.dev/tickets-app/` URL's API (not localhost), logged in with a temporary verification admin, created a project/category/ticket, confirmed the round-trip via a filtered list call, then deleted the temporary project/category/ticket/user afterward — data round-tripped correctly against the real `dev_tickets` database
- [x] 5.2 Confirmed no real credential or secret value exists in any file tracked by `git status`/`git ls-files` — `.env` is git-ignored, `.env.example` and `docker-compose.yml` contain only placeholders/variable references
- [x] 5.3 Document the operational commands (start, stop, rebuild, run migrations, apply a Caddy change) in a short section of the repo's README or a `DEPLOY.md`, so this isn't tribal knowledge held only in this OpenSpec change
