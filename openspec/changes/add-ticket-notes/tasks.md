# Tasks

## 1. Backend notes and authorization

- [ ] 1.1 Add note persistence with ticket, author, content, and creation timestamp; verify entity schema and migration apply cleanly.
- [ ] 1.2 Implement create and list operations using the authenticated user's identity and existing ticket access rules; verify authorized and denied cases in service tests.
- [ ] 1.3 Implement administrator-only note deletion and reject note updates; verify regular users, including authors, cannot delete and no edit path mutates content.
- [ ] 1.4 Expose authenticated ticket-note endpoints and verify create/list/delete behavior and authorization in endpoint tests.

## 2. Frontend notes

- [ ] 2.1 Add ticket detail note history showing content, author, and timestamp; verify empty and populated states.
- [ ] 2.2 Add note creation for authenticated users with ticket access; verify successful submission and empty-content validation.
- [ ] 2.3 Show note deletion only to administrators and wire it to the API; verify regular users cannot invoke deletion through the UI.

## 3. Integration

- [ ] 3.1 Verify note creation, ordered history, immutable content, and administrator-only deletion end to end against the requirements in specs/ticket-notes/spec.md.
