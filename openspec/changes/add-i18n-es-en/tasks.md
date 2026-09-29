# Tasks

## 1. Translation infrastructure

- [x] 1.1 Create `frontend/src/app/core/i18n/en.ts` with a flat `Record<string, string>` of dotted keys for all app shell strings (title check comes later; start with an empty/base structure plus a couple of smoke-test keys) and verify it compiles
- [x] 1.2 Create `frontend/src/app/core/i18n/es.ts` typed so that omitting or mistyping a key present in `en.ts` is a TypeScript compile error (e.g. `es satisfies Record<TranslationKey, string>` where `TranslationKey = keyof typeof en`), and verify a deliberately removed key fails `npm run build` (then restore it)
- [x] 1.3 Implement `frontend/src/app/core/i18n/translation.service.ts`: a signal-based service exposing the current language, a `t(key: TranslationKey): string` lookup, and `setLanguage(lang: 'en' | 'es')`; on construction, resolve language as stored `localStorage['lang']` → else `navigator.language` prefix-matched to `es`/`en` → else `'en'`
- [x] 1.4 Implement `frontend/src/app/core/i18n/translate.pipe.ts`, a standalone `TranslatePipe` (`transform(key: TranslationKey): string`) backed by `TranslationService`, reactive to language changes
- [x] 1.5 Add unit tests for `TranslationService` covering: stored preference takes precedence over browser locale; `es`/`es-MX`/`es-419`-style browser locales resolve to Spanish with no stored preference; a non-es/non-en browser locale resolves to English; `setLanguage` persists to `localStorage` and updates `t(...)`'s output immediately

## 2. Language switcher

- [x] 2.1 Add a language switcher control (English/Español) to `frontend/src/app/layout/app-shell/app-shell.component.html`, calling `TranslationService.setLanguage(...)`, styled consistent with the existing Tailwind-based header from `add-tailwind-field-design`
- [x] 2.2 Add a component test for the app shell confirming that activating the switcher calls `setLanguage` with the expected language and that shell text reflects the change without a reload (no `location.reload`/navigation call triggered)

## 3. Migrate app shell and login

- [x] 3.1 Replace hardcoded strings in `app-shell.component.html` (nav links, account/log-out controls) with `| translate`, adding corresponding keys to both dictionaries
- [x] 3.2 Replace hardcoded strings in `auth/login/login.component.html` and any user-facing text built in `login.component.ts` (e.g. the default error message) with translated lookups, adding keys to both dictionaries
- [ ] 3.3 Verify in a browser that toggling the switcher updates the app shell and login screen text between English and Spanish with no page reload

## 4. Migrate forms

- [x] 4.1 Replace hardcoded strings in `tickets/ticket-form/ticket-form.component.html` (labels, option lists, validation messages, action buttons) with translated lookups, adding keys to both dictionaries
- [x] 4.2 Replace hardcoded strings in `projects/project-form/project-form.component.html` with translated lookups, adding keys to both dictionaries
- [x] 4.3 Replace hardcoded strings in `categories/category-form/category-form.component.html` with translated lookups, adding keys to both dictionaries
- [ ] 4.4 Verify in a browser that each migrated form's labels, buttons, and validation messages switch language correctly

## 5. Migrate lists and remaining screens

- [x] 5.1 Replace hardcoded strings in `tickets/ticket-list/ticket-list.component.html` with translated lookups
- [x] 5.2 Replace hardcoded strings in `projects/project-list/project-list.component.html` and `categories/category-list/category-list.component.html` with translated lookups
- [x] 5.3 Replace hardcoded strings in `dashboard/dashboard-view/dashboard-view.component.html`, `reports/reports-view/reports-view.component.html`, and `profile/profile-view/profile-view.component.html` with translated lookups
- [x] 5.4 Grep the migrated template files for any remaining bare English text nodes outside `{{ }}`/attribute bindings to confirm no screen in scope was missed

## 6. Verification

- [x] 6.1 Run `npm run build` (production) and `npm test` inside `frontend/` and fix any failures
- [ ] 6.2 In a browser with `localStorage` cleared, set the browser/OS language to Spanish and confirm the app loads in Spanish on first visit; repeat with English and with a third language (e.g. French) and confirm it falls back to English
- [ ] 6.3 Manually switch language, reload the page, and confirm the manually selected language persists and overrides the browser default
