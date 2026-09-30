# Design

## Context

Four list views render per-row action controls as plain text inside an `<a>`/`<button>`, each independently: `project-list`, `category-list`, `user-list` (edit + delete), and `ticket-list` (delete only — its "edit" affordance is the row's title link). The app already has a shared `app-icon` component (`frontend/src/app/shared/icon/icon.component.ts`) with a closed `IconName` union and a `@switch` rendering hand-rolled inline SVG per name — the pattern established for the redesigned dashboard/sidebar. See `proposal.md` for why this change is being made now.

## Goals / Non-Goals

**Goals:**
- Reuse `app-icon` rather than introducing a second icon mechanism.
- Keep the four list templates' diffs minimal and mechanical (swap text node for `<app-icon>` + `aria-label`/`title`).
- Preserve existing accessible names via the existing `common.edit`/`common.delete` i18n keys — no new translation keys needed.

**Non-Goals:**
- No visual redesign of the tables beyond the action cell (spacing, borders, etc. stay as-is).
- No change to which actions exist per table (ticket-list still has no icon-only "edit" action; it keeps using the title link).
- No icon library/dependency addition.

## Decisions

- **Extend `IconName` with `'edit' | 'delete'`, add matching `@case` SVG branches.** Alternative considered: a separate small `RowActionIconComponent`. Rejected — `app-icon` already is the project's single icon surface; adding a second one would duplicate the pattern the redesign-dashboard change just established.
- **Render as `<button type="button" [attr.aria-label]="'common.edit' | translate" [attr.title]="'common.edit' | translate"><app-icon name="edit" /></button>`, keeping the edit control a `<button>` with `(click)` navigation via `Router`, or keep it an `<a [routerLink]>` wrapping the icon with the same attributes** — whichever matches each file's existing element (`<a>` for edit, `<button>` for delete) to avoid unrelated semantic-element churn in this change. Alternative considered: converting all edit links to buttons for uniformity. Rejected — out of scope; this change is about label→icon, not element-type normalization.
- **No new i18n keys.** The existing `common.edit`/`common.delete` values already are the correct accessible strings in both `en.ts`/`es.ts`; reuse them for `aria-label`/`title` instead of adding e.g. `common.editIconLabel`.

## Risks / Trade-offs

- [Risk] Icon-only controls are less discoverable for first-time users than text labels → Mitigation: `title` tooltip on hover/focus, matching how the sidebar nav already pairs icons with (visible, in that case) labels; delete stays destructive-looking via existing color/styling on the button, unchanged by this design.
- [Risk] Forgetting `aria-label` on any one of the four tables would silently regress accessibility for that table only → Mitigation: the spec's "Accessible label" requirement gives one scenario per control type; tasks.md will include a manual per-table check (each of the 4 files) since there's no existing automated a11y test harness in this repo to hook into.
