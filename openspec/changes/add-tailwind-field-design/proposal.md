# Proposal

## Why

The frontend has no design system: global styles are a single empty boilerplate file, and every component (login, ticket form, project form, category form) hand-writes its own ad-hoc CSS (~27 lines total across the whole app). Forms in particular are visually inconsistent — labels, inputs, selects, and validation messages each look slightly different from screen to screen because there's no shared styling or reusable field markup. Introducing Tailwind CSS gives the app a consistent utility-based styling foundation, and a small set of reusable field components on top of it removes the need to keep re-deriving label/input/error markup and styling by hand in every form.

## What Changes

- Add Tailwind CSS (v4, using `@tailwindcss/postcss`) to the Angular 22 build, replacing the empty `src/styles.css` boilerplate with Tailwind's entry directives and a small set of design tokens (color, spacing) reused across the app.
- Add a PostCSS config (`.postcss.config.json`) so Tailwind runs through the Angular application builder's built-in PostCSS support — no custom webpack/esbuild plugin needed.
- Introduce a shared, reusable field-design toolkit in `src/app/shared/form-field/`: standalone Angular components for a labeled text/textarea/select field, wrapping Tailwind utility classes and consistent validation-error display (touched + invalid state), replacing the current copy-pasted `<label><input></label>` + `<small>` markup.
- Migrate existing forms (login, ticket form, project form, category form) to the new field components and Tailwind utility classes, removing their component-level `.css` files where fully superseded.
- Keep the production build unaffected in kind (still `ng build --configuration production`, served as a static bundle by nginx) — Tailwind's output is purged/minified as part of that same build, no new runtime dependency or server-side step.

## Capabilities

### New Capabilities
- `frontend-design-system`: Tailwind CSS build integration plus a reusable field-design component set (labeled input/textarea/select with consistent validation-error styling) used by the app's forms.

### Modified Capabilities
(none — no existing specs cover frontend styling or forms)

## Impact

- Affected code: `frontend/package.json` (new devDependencies: `tailwindcss`, `@tailwindcss/postcss`, `postcss`), `frontend/src/styles.css`, new `frontend/.postcss.config.json` (or equivalent Angular builder config), new `frontend/src/app/shared/form-field/*` components, and the templates/styles of `auth/login`, `tickets/ticket-form`, `projects/project-form`, `categories/category-form`.
- No backend, API, or deployment impact: `frontend/Dockerfile` and `frontend/nginx.conf` are unchanged since Tailwind compiles at `ng build` time into the same static bundle already being built and served.
- No breaking changes to routes, forms' field names, or submitted data shapes — this is purely presentational/structural on the frontend.
