# Proposal

## Why

The row-action links/buttons in the app's data tables ("Editar", "Eliminar") are text-only, which makes table rows visually noisy and inconsistent with the redesigned dashboard's icon-based nav (`redesign-dashboard-support-overview`), which already established hand-rolled inline-SVG icons (via the shared `app-icon` component) as this project's preferred way to represent actions.

## What Changes

- Replace the text labels of the per-row action controls in the projects, categories, users (admin), and tickets tables with icon-only controls, using the existing shared `app-icon` component (`frontend/src/app/shared/icon/icon.component.ts`).
- Add two new icon glyphs to `IconName`/`app-icon`: `edit` and `delete`, hand-rolled inline SVG, matching the existing glyphs' style (stroke-based, `viewBox="0 0 24 24"`).
- Keep the actions accessible: each icon-only control keeps an `aria-label` (from the existing `common.edit`/`common.delete` i18n keys) and a `title` tooltip, so no information is lost for assistive-tech users or sighted users who prefer a text hint on hover.
- No changes to the underlying action behavior (`remove(...)`, edit routing) — only the row-action markup/presentation changes.
- **BREAKING** (visual only, not an API/routing contract): sighted users relying on the visible words "Editar"/"Eliminar" in a table row will now see icons with a hover tooltip instead.

## Capabilities

### New Capabilities
- `table-row-actions`: defines that data tables' per-row edit/delete controls are icon-only (with accessible labels/tooltips), and which shared component renders them.

### Modified Capabilities
(none — no existing capability spec currently governs table row-action presentation)

## Impact

- Frontend only. Affected files:
  - `frontend/src/app/shared/icon/icon.component.ts` — add `edit`/`delete` to `IconName` and their SVG markup.
  - `frontend/src/app/features/projects/project-list/project-list.component.html`
  - `frontend/src/app/features/categories/category-list/category-list.component.html`
  - `frontend/src/app/features/users/user-list/user-list.component.html`
  - `frontend/src/app/features/tickets/ticket-list/ticket-list.component.html` (delete action only — this table's "edit" affordance is the ticket title link, which is unaffected)
- No backend, API, or i18n key changes (existing `common.edit`/`common.delete` keys are reused as `aria-label`/`title` text, in both `en.ts` and `es.ts`).
- No new dependencies — this follows the project's established preference for small hand-written SVG over an icon library (see `add-tailwind-field-design/design.md`, `redesign-dashboard-support-overview/design.md`).
