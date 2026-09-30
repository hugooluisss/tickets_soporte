# Tasks

## 1. Ticket tracking tokens

- [ ] 1.1 Add a unique tracking token column and migration that backfills existing tickets with random opaque tokens before enforcing non-null uniqueness; verify migration up/down against a populated database.
- [x] 1.2 Generate a cryptographically random token for both internal and public ticket creation using Node crypto; verify created tickets always persist distinct tokens and collision handling retries.

## 2. Public tracking API and page

- [x] 2.1 Add an unauthenticated token lookup endpoint returning only the allowlisted public fields and not-found for unknown tokens; verify response shape excludes internal id, reporter email, assignment, category, and comments.
- [ ] 2.2 Add a read-only public tracking route and page for title, status, creation date, and permitted safe fields; verify valid and invalid links while logged out and confirm no mutation controls exist.

## 3. Tracking link and QR exposure

- [ ] 3.1 Add a browser-side QR code dependency only if none suitable is already available, and generate a QR from the absolute tracking URL; verify scanning opens the same URL and no image is sent to or stored by the backend.
- [ ] 3.2 Show tracking URL and QR in public submission confirmation; verify a successfully submitted ticket exposes the persisted token URL.
- [ ] 3.3 Show a copyable tracking URL in staff ticket views for public and internal tickets; verify both ticket origins have usable links.

## 4. Integration verification

- [ ] 4.1 Verify tokens are non-enumerable, unique, persisted across reloads, and resolve only the corresponding ticket through the public read-only page.
