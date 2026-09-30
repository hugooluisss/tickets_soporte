# Design

## Context

See proposal.md for motivation and specs/ticket-notes/spec.md for externally visible behavior. Ticket and project entities use TypeORM relations and timestamp columns; ticket routes are JWT-protected, and administrator routes use the existing roles guard and `UserRole.ADMIN` convention.

An existing change-local `ticket-comments` delta covers dashboard replies with creation and listing behavior, but does not define note deletion or ticket access policy. This proposal defines a separate user-facing notes capability and does not assume that dashboard comments and notes are the same resource.

## Goals / Non-Goals

**Goals:**
- Store ticket notes with a ticket, author, content, and creation time.
- Enforce ticket access for reads and creation and administrator-only deletion.
- Keep note content immutable after creation.

**Non-Goals:**
- Editing notes, reactions, attachments, or real-time updates.
- Changing the existing dashboard comment/reply metrics capability.

## Decisions

- Follow the existing domain-first NestJS and TypeORM patterns, with note-specific persistence and service behavior and routes nested under tickets. This keeps note operations aligned with the current ticket API; a separate resource is preferable to changing ticket CRUD semantics.
- Use the authenticated principal as the sole source of authorship and timestamp creation. Clients cannot choose or change either value.
- Reuse the existing role guard for admin-only deletion rather than adding a new authorization mechanism.
- Apply the repository's existing ticket-access policy when resolving whether a user may view or add a note. The ticket CRUD controller itself currently applies JWT authentication without per-ticket ownership checks; this change must not treat authentication alone as proof of access if a narrower access policy exists elsewhere.
- Assume notes are add/delete only. Existing ticket and project entities expose update timestamps for their own records, but no existing note entity or requirement indicates note editing is expected.

## Risks / Trade-offs

- The current ticket controller exposes tickets to authenticated users without explicit per-ticket access checks. The intended meaning of “access” must follow any established policy found during implementation; if none exists, all authenticated users currently able to view tickets count as having access. → Verify related authorization code before implementing note checks.
- Dashboard comments may overlap conceptually with notes. Keeping them separate avoids altering dashboard behavior without a deliberate product decision. → Reconcile only if the product later decides both are one resource.

## Open Questions

- Does the application have a ticket-specific access rule beyond the current authenticated-user access to ticket routes? If not, this proposal treats all authenticated users as having access.
