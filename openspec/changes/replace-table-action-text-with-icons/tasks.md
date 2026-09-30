# Tasks

## 1. Icon component

- [x] 1.1 Add `'edit' | 'delete'` to `IconName` in `frontend/src/app/shared/icon/icon.component.ts` and add their `@case` SVG branches, matching the existing glyphs' stroke style; verify by rendering `<app-icon name="edit" />` and `<app-icon name="delete" />` and visually confirming both render a distinct, legible glyph at the existing `.icon` size.

## 2. Projects table

- [x] 2.1 In `frontend/src/app/features/projects/project-list/project-list.component.html`, replace the edit link's and delete button's visible text with `<app-icon>`, adding `aria-label`/`title` bound to `'common.edit'`/`'common.delete'` translations; verify the row's edit link and delete button still work (navigate to edit route, invoke `remove(project)`) and no longer show visible text.

## 3. Categories table

- [x] 3.1 Apply the same icon-only change to `frontend/src/app/features/categories/category-list/category-list.component.html`'s edit link and delete button; verify edit navigation and `remove(row)` still work and no visible text remains.

## 4. Users (admin) table

- [x] 4.1 Apply the same icon-only change to `frontend/src/app/features/users/user-list/user-list.component.html`'s edit link and delete button; verify edit navigation and `remove(user)` still work and no visible text remains.

## 5. Tickets table

- [x] 5.1 Apply the icon-only change to `frontend/src/app/features/tickets/ticket-list/ticket-list.component.html`'s delete button only (this table has no separate row-level edit control — the title link stays a text link); verify `remove(t)` still works and no visible "Eliminar"/"Delete" text remains in that cell.

## 6. Verification

- [ ] 6.1 Manually check all four updated tables in both `en` and `es` locales: hovering each icon shows the correct translated tooltip, and a screen reader (or the browser accessibility inspector) reports the correct accessible name for each icon-only control.
- [x] 6.2 Run the frontend's existing test suite (`npm test` in `frontend/`) and confirm no existing tests broke.
