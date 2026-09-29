# Spec Delta

## Purpose

Makes the ticket support system runnable as a repeatable containerized stack and reachable by anyone with network access to this host's shared `agents-dev` site, instead of only existing as ad hoc local dev processes.

## ADDED Requirements

### Requirement: The stack starts from a single command
The system SHALL be startable with a single `docker compose up` (optionally `--build`) invocation that brings up the backend and frontend containers, with no other manual container-orchestration step required.

#### Scenario: Fresh start on a host with the prerequisite database
- **WHEN** an operator with a `.env` file populated per `.env.example` runs `docker compose up -d --build` on a host where the `dev_tickets` MySQL database and user already exist
- **THEN** both the backend and frontend containers reach a running state without additional manual steps beyond the documented migration-run step

### Requirement: The backend container connects to the existing host database
The backend container SHALL connect to the host's existing MySQL instance and `dev_tickets` database rather than requiring a separate containerized database.

#### Scenario: Backend container starts against the host database
- **WHEN** the backend container starts with the documented `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_DATABASE` environment variables pointing at the host's MySQL
- **THEN** the backend successfully establishes a database connection and serves requests backed by that database's existing data

### Requirement: The frontend is served as a static production build
The frontend container SHALL serve the Angular application's production build as static files, with client-side routes falling back to `index.html`.

#### Scenario: Deep-linked route loads correctly
- **WHEN** a request is made directly to a client-side route other than the root (e.g. the tickets list route) through the frontend container
- **THEN** the container serves the application shell (`index.html`) rather than a 404, and the Angular router then renders the requested route

### Requirement: Both services are reachable through the host's shared reverse proxy
The system SHALL be reachable externally through the host's existing shared Caddy site under dedicated path prefixes, without requiring its own dedicated site, port, or DNS entry.

#### Scenario: Frontend reachable under its path prefix
- **WHEN** a request is made to the shared site's `/tickets-app/` path prefix
- **THEN** the request is routed to the frontend container and the application loads

#### Scenario: Backend reachable under its path prefix
- **WHEN** an authenticated API request is made to the shared site's `/tickets-api/` path prefix
- **THEN** the request is routed to the backend container and receives the same response it would if called directly against the backend container's own port

### Requirement: Static assets are proxied with their correct content type
When reached through the host's shared reverse proxy under its path prefix, every static asset referenced by the frontend's application shell SHALL be served with its correct content type, not silently substituted with the SPA fallback document.

#### Scenario: A referenced script asset loads as a script through the proxy
- **WHEN** a request is made through the shared site's `/tickets-app/` path prefix for a JavaScript asset referenced by the application shell
- **THEN** the response has a JavaScript content type and the asset's real content, not the HTML of the SPA fallback document

### Requirement: No secrets are committed to the repository
The system SHALL keep real database credentials and JWT secrets out of every file tracked by version control, providing only placeholder values in any committed example file.

#### Scenario: Repository inspection finds no real secrets
- **WHEN** the repository's tracked files are inspected for the deployment configuration
- **THEN** only placeholder credential values appear in any committed file, and the real values exist solely in a git-ignored `.env`
