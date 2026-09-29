# Tasks

## 1. Containerize the backend

- [ ] 1.1 Write `backend/Dockerfile` (multi-stage: `build` stage runs `npm ci && npm run build`; `runtime` stage copies `dist/` and `node_modules` (production-only) and runs `node dist/main.js`) and verify `docker build -f backend/Dockerfile backend` succeeds
- [ ] 1.2 Add `backend/.dockerignore` (excluding `node_modules`, `dist`, `.env`, test files) and verify the built image doesn't contain the real `.env`
- [ ] 1.3 Verify the built backend image runs standalone (`docker run` with the documented env vars pointing at the host MySQL via `host.docker.internal`) and responds on its internal port, per `specs/deployment/spec.md`'s "Backend container connects to the existing host database" scenario

## 2. Containerize the frontend

- [ ] 2.1 Write `frontend/Dockerfile` (multi-stage: `build` stage runs `npm ci && ng build --configuration production --base-href /tickets-app/`; `runtime` stage copies the static output into a minimal static file server image) and verify `docker build -f frontend/Dockerfile frontend` succeeds
- [ ] 2.2 Configure the runtime stage's web server for SPA fallback (unknown paths serve `index.html`) and verify a request to a non-root route (e.g. `/tickets` under the container's own root, before Caddy prefixing) returns the app shell, per the "Deep-linked route loads correctly" scenario
- [ ] 2.3 Add `frontend/Dockerfile`'s companion `.dockerignore` and verify the built image doesn't contain `node_modules` from the host or any `.env`

## 3. Compose the stack

- [ ] 3.1 Write `docker-compose.yml` at the repo root defining `backend` (build from `backend/Dockerfile`, port mapping `3010:3000`, `extra_hosts: ["host.docker.internal:host-gateway"]`, env vars from `.env`) and `frontend` (build from `frontend/Dockerfile`, port mapping `4310:80`) services
- [ ] 3.2 Write a root-level `.env.example` documenting `DB_HOST` (defaulting to `host.docker.internal`), `DB_PORT=3306`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE=dev_tickets`, `JWT_SECRET`, with placeholder values only, and verify no real secret value appears in it or in `docker-compose.yml`
- [ ] 3.3 Create a real, git-ignored root `.env` with the actual `dev_tickets_app` credentials and a real JWT secret, and verify it's excluded by `.gitignore`
- [ ] 3.4 Run `docker compose up -d --build` and verify both containers reach a running state, per the "Fresh start on a host with the prerequisite database" scenario
- [ ] 3.5 Run `docker compose exec backend npm run migration:run` and verify it reports no pending migrations (schema already applied directly on the host in earlier phases)
- [ ] 3.6 Hit the backend container directly at `http://127.0.0.1:3010/api/auth/login` and the frontend container at `http://127.0.0.1:4310/` and confirm both respond correctly before involving Caddy at all

## 4. Publish through the host's shared Caddy site

- [ ] 4.1 Back up the current `/etc/caddy/Caddyfile` (e.g. copy alongside the existing timestamped `.bak` files already present there) before editing it
- [ ] 4.2 Add the `redir`, `handle /tickets-app/*`, and `handle_path /tickets-api/*` blocks documented in `design.md` to the existing `:8000` site block, matching the exact `vendaly-app`/`vendaly-api` convention already used for other projects
- [ ] 4.3 Run `caddy validate --config /etc/caddy/Caddyfile` and verify it reports no errors before reloading
- [ ] 4.4 Reload Caddy (`systemctl reload caddy` or equivalent, matching how this host's other Caddy edits were applied) and verify the other existing projects' routes (e.g. `/vendaly-app/`, `/planeaciones_frontend/`) still respond correctly afterward — a broken edit here must not take down unrelated projects
- [ ] 4.5 Verify externally via `https://agents-dev.hugosantiago.dev/tickets-app/` that the frontend loads, and via a request through `/tickets-api/api/...` that the backend responds, per the "Frontend reachable under its path prefix" and "Backend reachable under its path prefix" scenarios

## 5. End-to-end verification

- [ ] 5.1 Through the public `agents-dev.hugosantiago.dev/tickets-app/` URL (not localhost), log in, create a project/category/ticket, and confirm the data round-trips against the real `dev_tickets` database — the same live walkthrough as tasks.md task 5.3 in `add-ticket-support-system`, but now through the deployed stack instead of local dev servers
- [ ] 5.2 Confirm no real credential or secret value exists in any file tracked by `git status`/`git ls-files`, per the "Repository inspection finds no real secrets" scenario
- [ ] 5.3 Document the operational commands (start, stop, rebuild, run migrations, apply a Caddy change) in a short section of the repo's README or a `DEPLOY.md`, so this isn't tribal knowledge held only in this OpenSpec change
