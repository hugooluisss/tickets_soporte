# Design

## Context

The frontend is Angular 22 (`@angular/build:application` builder, standalone components, signals) — see `openspec/changes/add-tailwind-field-design/design.md` for the current build/deploy setup, which this change does not alter. There is no i18n library in `frontend/package.json` today, and no `@angular/localize` usage. All UI text is inline in templates listed in proposal.md - Impact. `frontend/src/app/layout/app-shell/app-shell.component.html` is the one component rendered on every authenticated route, making it the natural home for a language switcher.

## Goals / Non-Goals

**Goals:**
- Runtime language switching with no reload, as required by the spec.
- Small, dependency-light implementation consistent with this codebase's style (hand-rolled services/components over pulling in a framework — see the field-component approach from `add-tailwind-field-design`).
- One place to add a new translated string per screen, so future screens are easy to keep in sync.

**Non-Goals:**
- No translation of backend-originated content (API error messages, ticket/project/category data) — spec explicitly excludes this.
- No third or future language beyond English/Spanish in this change.
- No pluralization/ICU message format support — the app's strings are simple labels/messages, not counts or complex grammar.
- No use of Angular's built-in `$localize`/locale-bundle i18n — it compiles separate bundles per locale selected at build time, which conflicts with the "no full reload to a different build" requirement.

## Decisions

- **Custom lightweight translation service over a library (ngx-translate/Transloco).** A hand-rolled `TranslationService` (signal-based: a `WritableSignal<Lang>` for the current language, a `computed`/lookup function `t(key)` reading from two flat dictionaries) covers this app's needs — simple key→string lookups, no pluralization/ICU — without adding a third-party i18n dependency to track across Angular major versions.
  - Alternative considered: `@ngx-translate/core`. Rejected — heavier than needed for ~7 screens of static labels, and it lazy-loads JSON over HTTP by default (extra network round-trip / asset wiring) where this app's whole translated vocabulary is small enough to ship inline in the bundle.
  - Alternative considered: `@jsverse/transloco`. Rejected for the same reason — general-purpose i18n framework where a flat dictionary + signal is sufficient, keeping in line with this codebase's preference for small hand-written pieces over frameworks (see `add-tailwind-field-design`'s field component instead of Angular Material/PrimeNG).
- **Dictionaries as TypeScript modules, not JSON assets.** `frontend/src/app/core/i18n/en.ts` and `es.ts`, each exporting a flat `Record<string, string>` keyed by dotted keys (e.g. `login.title`, `nav.tickets`). Compiled into the bundle like any other code — no extra HTTP fetch, no risk of the translation lagging behind a deploy, and type errors surface at build time if a dictionary is missing a key (checked via a shared `type TranslationKey = keyof typeof en` shared between both dictionaries).
- **Access via a `t` signal/pipe, not structural directives.** `TranslationService.t(key: TranslationKey): string` used either directly in `.ts` (e.g. building an error message) or through a small standalone `TranslatePipe` (`{{ 'login.title' | translate }}`) in templates, keeping templates close to their current shape (a text swap, not a restructure) so the migration from hardcoded strings is mechanical per template.
- **Language detection order: stored preference → browser locale → English fallback.** On `TranslationService` construction: read `localStorage` key `lang`; if absent, inspect `navigator.language`, matching `es`/`es-*` to Spanish and anything else to English; write the resolved language back only when the user explicitly switches (not on every load), so a browser-derived default doesn't silently "stick" as if it were a deliberate choice.
- **Persistence via `localStorage`.** Simplest mechanism satisfying "survives reload and future sessions"; no backend user-preference field is introduced (proposal explicitly scopes this to frontend-only, no backend changes).
- **Language switcher lives in `app-shell.component.html`** as a small `<select>` or two-button toggle next to the account controls, calling `TranslationService.setLanguage(...)`.

## Risks / Trade-offs

- **Missed strings**: a component template not updated during migration keeps showing hardcoded English → mitigation: tasks.md enumerates every template file identified in proposal.md - Impact explicitly, so migration coverage is checkable file-by-file rather than "migrate the app" as one vague task.
- **Dictionary drift**: an English key added without its Spanish counterpart (or vice versa) → mitigation: the `TranslationKey = keyof typeof en` type shared across both dictionaries makes `es.ts` a TypeScript error if it's missing a key `en.ts` has (and vice versa via a mutual `satisfies` check), catching drift at build time rather than at runtime with a blank/fallback string.
- **`navigator.language` unavailable or unusual in some environments** (e.g. `es-MX`, `es-419`) → mitigation: match by prefix (`lang.startsWith('es')`) rather than exact equality, per the spec's "any `es-*` variant" scenario.

## Migration Plan

1. Add `TranslationService`, `TranslatePipe`, and the `en`/`es` dictionaries under `frontend/src/app/core/i18n/`.
2. Add the language switcher to `app-shell.component.html`.
3. Migrate templates screen by screen (app shell → login → ticket/project/category forms and lists → dashboard/reports/profile), replacing hardcoded text with `| translate` (or `t(...)` in component code for dynamically-built strings), adding each string to both dictionaries as it's migrated.
4. Verify: for each migrated screen, toggle the language switcher and confirm the text changes with no reload; clear `localStorage` and reload with the browser locale set to Spanish and to a third language to confirm default-detection.

No backend, database, or infrastructure changes. Rollback is a plain git revert, same as `add-tailwind-field-design`.
