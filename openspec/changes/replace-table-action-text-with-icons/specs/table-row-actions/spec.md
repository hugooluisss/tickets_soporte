# Spec Delta

## Purpose

Defines how per-row edit/delete controls in the app's data tables (projects, categories, users, tickets) are presented: as accessible icon-only controls instead of visible text labels, so table rows stay compact and visually consistent with the rest of the app's icon usage.

## ADDED Requirements

### Requirement: Icon-only row actions
Each data table's per-row "edit" and "delete" controls SHALL render as icon-only controls (no visible text label) using the shared icon component, while preserving their existing behavior (navigating to the edit route, or invoking the row's delete action).

#### Scenario: Edit control shows an icon, not text
- **WHEN** a user views a row in the projects, categories, or users table
- **THEN** the row's edit control renders the shared edit icon
- **AND** no visible text label (e.g. "Editar"/"Edit") is rendered next to it

#### Scenario: Delete control shows an icon, not text
- **WHEN** a user views a row in the projects, categories, users, or tickets table
- **THEN** the row's delete control renders the shared delete icon
- **AND** no visible text label (e.g. "Eliminar"/"Delete") is rendered next to it

#### Scenario: Row action behavior is unchanged
- **WHEN** a user activates an icon-only edit or delete control
- **THEN** the same underlying behavior fires as before the icon change (edit navigates to the record's edit route; delete invokes the row's existing delete/removal flow, including any existing confirmation)

### Requirement: Accessible label on icon-only row actions
Every icon-only row-action control SHALL expose an accessible name equivalent to its previous text label, through the current locale's translated string, so the control remains usable by assistive technology and identifiable on hover.

#### Scenario: Screen reader announces the action
- **WHEN** an assistive technology user focuses an icon-only edit or delete control
- **THEN** the control's accessible name (`aria-label`) matches the current locale's translated "Edit"/"Delete" text (the same string previously shown visibly)

#### Scenario: Sighted user gets a hover hint
- **WHEN** a mouse user hovers an icon-only edit or delete control
- **THEN** a native tooltip (`title` attribute) shows the current locale's translated "Edit"/"Delete" text

#### Scenario: Label follows the active locale
- **WHEN** the user's active locale changes (e.g. from Spanish to English)
- **THEN** the icon-only control's accessible label and tooltip text update to match the new locale, consistent with the rest of the app's translated strings
