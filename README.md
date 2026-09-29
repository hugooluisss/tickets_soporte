# Ticket Support System

An internal support ticket system for organizing tickets by project and category, tracking client and staff replies, and supporting day-to-day administration. It includes a support overview dashboard with reply metrics, ticket reports, administrator user management, and an English/Spanish interface.

## Tech stack

- **Backend:** NestJS, TypeORM, MySQL; feature modules for authentication, users, profile, projects, categories, tickets, ticket comments, dashboard, and reports.
- **Frontend:** Angular 22 standalone components and signals, with Tailwind CSS.
- **UI utilities:** Hand-written SVG icons and charts. The frontend has a small in-house translation system (no external chart, icon, or translation libraries) with English and Spanish dictionaries, browser-locale detection, and a persisted language choice.

## Repository layout

- `backend/` — NestJS API, database configuration, migrations, and tests.
- `frontend/` — Angular application and frontend tests.
- `openspec/` — feature specifications and design documents, including proposals for the field design system, English/Spanish i18n, dashboard overview, and admin user management.

## Local development

### Backend

Install dependencies in `backend/`, start a MySQL instance, and create `backend/.env` from [`backend/.env.example`](backend/.env.example). Configure `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL`, `JWT_SECRET`, and `JWT_EXPIRES_IN` for your local environment. The example uses port `3000` and MySQL port `3306`.

From `backend/`:

```bash
npm install
npm run start:dev
```

### Frontend

The development compose file runs only the frontend with Angular hot reload, available at `http://localhost:4311`:

```bash
docker compose -f docker-compose.dev.yml up -d --build frontend-dev
```

Alternatively, install frontend dependencies and run Angular directly from `frontend/`. Open `http://localhost:4200/tickets-app/`; use the `localhost` hostname (not `127.0.0.1`), which is the configured allowed host:

```bash
npm install
npm start
```

### Compose services

`docker-compose.yml` builds both services in production mode: the backend is published on host port `3010` (container port `3000`), and the static frontend is published on host port `4310` (container port `80`). It expects the root `.env` variables shown in [`.env.example`](.env.example). For local iteration with frontend hot reload, use the `frontend-dev` service above; run the backend separately against MySQL.

## Tests

Run the test command in each app directory:

```bash
cd backend && npm test
cd frontend && npm test
```

## Production deployment

See [`DEPLOY.md`](DEPLOY.md) for production deployment instructions.

Major feature specifications and design documents are maintained under [`openspec/changes/`](openspec/changes/).
