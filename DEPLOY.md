# Development deployment

The backend and frontend run as Docker containers, connecting to this host's existing local MySQL instance (`dev_tickets` database — no MySQL container). Public access is through this host's shared Caddy instance under path prefixes.

## Prerequisites

- The `dev_tickets` MySQL database and `dev_tickets_app` user already exist locally, granted from both `localhost` and the Docker bridge subnet (`172.19.0.0/16` on this host — check `docker network inspect tickets_soporte_default` if it ever changes).
- A root-level `.env` file exists (copy `.env.example` and fill in real values). It is git-ignored and must never be committed.

## Start / stop

```bash
docker compose -f docker-compose.dev.yml up -d   # start backend and frontend in watch mode
docker compose -f docker-compose.dev.yml ps -a   # check status
docker compose -f docker-compose.dev.yml logs backend-dev  # backend logs
docker compose -f docker-compose.dev.yml down
```

The backend and frontend source directories are bind-mounted into their dev containers. The backend runs `npm run start:dev`; the frontend runs its Angular dev server. Source changes are picked up automatically without rebuilding an image. The production `docker-compose.yml` remains available for built-image deployments.

## Run migrations

Inside the container, use the production script (not `migration:run`, which needs dev-only `ts-node` tooling not present in the runtime image):

```bash
docker compose -f docker-compose.dev.yml exec backend-dev npm run migration:run
```

## Apply a Caddy config change

The relevant block lives in `/etc/caddy/Caddyfile` on the host (not in this repo — it's shared with other projects). To change it:

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%s)   # back up first
sudo $EDITOR /etc/caddy/Caddyfile                                   # make the edit
sudo caddy validate --config /etc/caddy/Caddyfile                   # must pass before applying
sudo systemctl restart caddy                                        # NOT `reload` — see below
```

**Important**: this host's Caddy runs with `admin off`, which disables the admin API that `caddy reload`/`systemctl reload caddy` depends on to push a live config swap — `reload` fails outright with a `connection refused` error to `localhost:2019` regardless of whether the new config itself is valid. A full `systemctl restart caddy` is required instead, which causes a brief (sub-second) interruption for every project behind this shared instance, not just this one.

## Ports

| Service | Host port | Public path |
|---|---|---|
| Frontend | `127.0.0.1:4310` | `https://agents-dev.hugosantiago.dev/tickets-app/` |
| Backend | `127.0.0.1:3010` | `https://agents-dev.hugosantiago.dev/tickets-api/api/...` |

Both routes use `handle_path` in the Caddyfile (prefix stripped before forwarding) — **not** plain `handle`. Unlike `vendaly-app`/`planeaciones_frontend` (Angular dev servers started with `--serve-path`, which understand their own public prefix), this frontend is a static production build served by plain nginx with no such awareness. Using `handle` here silently breaks the app: asset requests like `/tickets-app/main-*.js` 404 into the SPA fallback (nginx serves `index.html` instead), the browser gets `text/html` where it expected JavaScript, and refuses to execute the module — resulting in a blank page with no visible error. If this route ever needs re-adding after a Caddy config loss, use `handle_path`, not `handle`.

See `openspec/changes/deploy-ticket-support-system/design.md` for why the backend's public path has a doubled-looking `/api` segment, and for the full rationale behind these decisions.
