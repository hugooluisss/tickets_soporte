# Proposal

## Why

All UI text in the frontend is hardcoded in English directly inside component templates (nav, login, forms, lists, dashboard, reports, profile). The support desk's users are Spanish-speaking, so the app needs to present itself in Spanish (and keep English available) — with the browser's language picked up automatically, and a manual override for users whose browser doesn't match their preference.

## What Changes

- Add a runtime-switchable i18n mechanism (translation dictionaries + a language service), not Angular's build-time `$localize`/locale-bundle i18n — switching language must not require reloading a different build.
- Default language SHALL be derived from `navigator.language` at first load: Spanish if the browser reports a Spanish locale (`es`, `es-*`), English otherwise.
- Add a language switcher control in the app shell header, visible on every authenticated screen, letting the user pick English or Spanish at any time.
- The user's manual choice SHALL persist across reloads and future sessions (stored client-side) and SHALL take precedence over the browser-language default on every subsequent load.
- Extract all user-facing strings from templates (app shell nav/account, login, ticket/project/category forms and lists, dashboard, reports, profile) into English and Spanish translation dictionaries, and wire templates to look up strings through the new mechanism instead of hardcoded text.
- Out of scope: translating error messages returned by the backend API, translating field *data* (ticket titles/descriptions entered by users), and Angular's own build-time i18n tooling.

## Capabilities

### New Capabilities
- `frontend-i18n`: language detection, manual language switching with persistence, and translated UI text across the app's screens.

### Modified Capabilities
(none — no existing specs cover localization; `frontend-design-system` from the prior change covers styling/fields, not text content)

## Impact

- Affected code: `frontend/package.json` (new i18n devDependency/runtime dependency), a new language/translation service and translation dictionaries (e.g. `frontend/src/app/core/i18n/`), the app shell header (language switcher), and every component template currently containing hardcoded English text (login, ticket/project/category forms and lists, dashboard, reports, profile).
- No backend changes, no API contract changes, no changes to `frontend/Dockerfile` or `frontend/nginx.conf` — this is a frontend-only, build-output-compatible change (same single static bundle, same deployment).
- No breaking changes to routes, form field names, or submitted data shapes.
