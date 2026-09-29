# Design

## Context

The frontend is Angular 22 using the new `@angular/build:application` (esbuild/Vite-based) builder — see `frontend/angular.json`. It has no PostCSS config today and `src/styles.css` is the untouched Angular CLI boilerplate (one comment line). The production Docker build runs `ng build --configuration production` and the result is served as a static bundle by nginx (`frontend/Dockerfile`, `frontend/nginx.conf`); there is no app server or SSR step that could run additional CSS tooling at request time. See proposal.md - Why for the motivation.

## Goals / Non-Goals

**Goals:**
- Get Tailwind utility classes working in both the dev and production Angular builds with no change to how the app is built or deployed (still a single `ng build` producing a static bundle for nginx).
- Provide one shared, reusable field component so forms stop hand-rolling label/input/error markup.
- Migrate the app's existing forms (login, ticket, project, category) to the new component/utilities as part of this change, so the toolkit has real usage from day one instead of shipping unused.

**Non-Goals:**
- No general component library or full design system (no buttons/cards/modals catalog) — scope is limited to form fields, per the proposal.
- No dark mode, theming, or i18n work.
- No changes to validation rules or submitted data shapes for any form.

## Decisions

- **Tailwind CSS v4 via `@tailwindcss/postcss`.** Angular's `@angular/build:application` builder has built-in PostCSS support: it auto-detects a `.postcssrc.json` (or `postcss.config.json`) in the project root and runs it on every stylesheet, in both `ng build` and `ng serve`/dev builds. Tailwind v4 ships `@tailwindcss/postcss` specifically for this kind of PostCSS-only integration (no separate Tailwind CLI process, no custom builder). This avoids adding a parallel build step or swapping Angular's builder.
  - Alternative considered: Tailwind CLI running as a separate watch process. Rejected — adds a second process to coordinate in dev and in the Docker build, for no benefit given the builder's native PostCSS support.
  - Alternative considered: Tailwind v3. Rejected in favor of v4 since this is a new integration with no existing v3 config to preserve, and v4's PostCSS plugin is the currently supported path.
- **`src/styles.css` becomes the single Tailwind entry point** (`@import "tailwindcss";`) plus a small `@theme` block for the handful of colors/spacing already implied by existing hand-written CSS (e.g. the login page's blue/gray palette), so migrated components have consistent tokens to reference instead of re-inventing hex values.
- **Shared field component lives at `frontend/src/app/shared/form-field/`**, as standalone Angular components consistent with the rest of the app's structure (`shared/placeholder` is the existing precedent). It wraps a label, the projected/bound control, and a `touched && invalid` error message, styled with Tailwind utility classes — matching the "reusable labeled field component" requirement in the spec.
  - Alternative considered: a directive applied to existing `<label><input>` pairs instead of a wrapping component. Rejected — the existing markup varies per form (select vs input vs textarea) and a component gives one place to keep label/input/error association and styling consistent, which a directive applied inconsistently would not guarantee.
- **Migrate forms in place, in the same change**, rather than leaving them on old markup: login, ticket form, project form, category form. This satisfies the spec's "Consistent field appearance across forms" requirement and avoids a half-migrated state where the toolkit exists but nothing outside login uses it.
- **Delete component `.css` files that become fully redundant** after migration (e.g. `login.component.css`) rather than leaving dead styles behind; keep a component's `.css` only if it still holds rules Tailwind utilities don't cleanly express (e.g. a one-off layout rule).

## Risks / Trade-offs

- **Angular's `anyComponentStyle` production budget (4kB warning / 8kB error, `angular.json`) applies per component stylesheet.** Tailwind utility classes used directly in templates don't count against this (they live in the global `styles.css`, which has its own initial-bundle budget, not the per-component one) → mitigation: keep component-level custom CSS minimal, rely on the shared field component + global styles.css for anything Tailwind can't express as template utilities.
- **Tailwind's default content scanning must actually find the app's templates** (`.html` and inline template strings in `.ts`) or utility classes get purged from the production build → mitigation: verify the production build's CSS output actually contains the classes used by migrated forms before considering the change done (covered in tasks.md).
- **Migrating four forms in one change is more surface area than adding the toolkit alone** → mitigation: migrate one form (login) first and validate the pattern (visually, and that the production build purges correctly) before repeating it for the other three, so a problem with the approach is caught early and cheaply.

## Migration Plan

1. Add Tailwind + PostCSS devDependencies and config; replace `src/styles.css` content. Confirm both `ng serve` and `ng build --configuration production` pick up Tailwind classes.
2. Build the shared field component(s) in `shared/form-field/`.
3. Migrate the login form first; verify visually and confirm the production CSS output contains the used utility classes.
4. Migrate the remaining forms (ticket, project, category) using the same component.
5. Remove now-redundant component `.css` files.

No backend, database, or infrastructure changes, so no deployment/rollback steps beyond the normal `docker compose up -d --build frontend` already used for this project (see repo `DEPLOY.md`). Rollback is a plain git revert of this change, since it touches frontend source only.
