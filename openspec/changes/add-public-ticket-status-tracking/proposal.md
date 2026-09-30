# Proposal

## Why

After a ticket is submitted, its reporter has no public way to check its progress without asking staff. An opaque, read-only tracking link lets public and internal reporters check current status while keeping ticket identifiers private.

## What Changes

- Give each ticket a unique opaque tracking token and expose a public tracking URL that never uses the internal ticket id.
- Add an unauthenticated, read-only tracking page showing only public-safe ticket fields and current status.
- Generate a QR code in the frontend from the tracking URL and show the link and QR after public submission; make the link available in staff ticket views for sharing with internal reporters.

## Capabilities

### New Capabilities
- `public-ticket-status-tracking`: Opaque per-ticket public tracking links, a read-only public status page, and client-generated QR access.

### Modified Capabilities

None. The submission behavior in the existing change remains unchanged; tracking adds a separate capability.

## Impact

- Backend ticket schema, entity and ticket creation paths, plus a public read endpoint that resolves opaque tokens.
- Frontend routing, public tracking view, submission confirmation, and staff ticket detail display.
- Add a small QR generation dependency to `frontend/package.json` because no QR library is currently installed.
