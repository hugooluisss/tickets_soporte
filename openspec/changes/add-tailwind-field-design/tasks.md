# Tasks

## 1. Tailwind CSS setup

- [x] 1.1 Add `tailwindcss`, `@tailwindcss/postcss`, and `postcss` as devDependencies in `frontend/package.json` and verify `npm install` succeeds
- [x] 1.2 Add a `.postcssrc.json` (or `postcss.config.json`) at `frontend/` registering `@tailwindcss/postcss`, and verify the Angular builder picks it up (no config-not-found warning on build)
- [x] 1.3 Replace `frontend/src/styles.css` boilerplate with `@import "tailwindcss";` plus a small `@theme` block for the app's existing color/spacing palette (derived from current component CSS, e.g. login page's blue/gray values)
- [x] 1.4 Run `ng serve` (dev) and confirm a Tailwind utility class (e.g. add `class="text-red-500"` to a temporary element) renders styled, then remove the temporary element
- [x] 1.5 Run `ng build --configuration production` and confirm the emitted CSS bundle contains Tailwind's compiled/purged output (grep the built CSS for a utility class actually used in a template)

## 2. Shared field component

- [x] 2.1 Create standalone components under `frontend/src/app/shared/form-field/` for a labeled input/textarea/select field, with the label's `for` bound to the control's `id`
- [x] 2.2 Implement validation-error display driven by the bound `FormControl`'s `touched && invalid` state, hidden otherwise, and verify with a unit test covering: untouched+invalid (no error shown), touched+invalid (error shown), touched+valid (no error shown)
- [x] 2.3 Style the field component with Tailwind utility classes for label, input/select/textarea, and error text, matching the tokens from `styles.css`

## 3. Migrate login form

- [x] 3.1 Replace `auth/login/login.component.html` markup with the shared field component for email and password fields
- [x] 3.2 Remove now-redundant rules from `auth/login/login.component.css` (delete the file if nothing remains)
- [x] 3.3 Verify in a browser (`ng serve`) that sign-in still works end-to-end and validation errors appear/disappear per the field component's behavior

## 4. Migrate remaining forms

- [x] 4.1 Migrate `tickets/ticket-form/ticket-form.component.html` to the shared field component for its text/select/textarea fields and remove redundant CSS
- [x] 4.2 Migrate `projects/project-form/project-form.component.html` to the shared field component and remove redundant CSS
- [x] 4.3 Migrate `categories/category-form/category-form.component.html` to the shared field component and remove redundant CSS
- [x] 4.4 Verify in a browser that each migrated form still submits successfully and shows the same validation messages as before migration

## 5. Production build verification

- [x] 5.1 Run `docker compose up -d --build frontend` and confirm the container serves the Tailwind-styled pages (spot-check login and one migrated form over the deployed URL)
- [x] 5.2 Confirm no `anyComponentStyle` budget errors/warnings are introduced in the production build output (`angular.json` budgets)
