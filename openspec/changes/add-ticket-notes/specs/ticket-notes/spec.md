# Spec Delta

## Purpose

Provides an auditable, append-only note history on tickets so authorized users can share work context while preserving clear authorship and administrator-controlled deletion.

## ADDED Requirements

### Requirement: Add a note to an accessible ticket
The system SHALL allow any authenticated user with access to an existing ticket to add a note. The system SHALL record the authenticated user as the author and the creation timestamp, and SHALL reject empty or whitespace-only note content.

#### Scenario: Authorized user adds a note
- **WHEN** an authenticated user with access to an existing ticket submits non-empty note content
- **THEN** the system stores the note for that ticket with the authenticated user as author and a creation timestamp

#### Scenario: User without ticket access adds a note
- **WHEN** an authenticated user without access to a ticket attempts to add a note
- **THEN** the system denies the request and creates no note

#### Scenario: Empty note is rejected
- **WHEN** an authenticated user submits empty or whitespace-only note content
- **THEN** the system rejects the request and creates no note

### Requirement: View ticket notes
The system SHALL allow authenticated users with access to a ticket to view its notes, including each note's content, author, and timestamp.

#### Scenario: Accessible ticket notes are listed
- **WHEN** an authenticated user with access requests notes for a ticket
- **THEN** the system returns that ticket's notes with author and timestamp, ordered from oldest to newest

#### Scenario: Ticket has no notes
- **WHEN** an authenticated user with access requests notes for a ticket with no notes
- **THEN** the system returns an empty list

### Requirement: Notes cannot be edited
The system SHALL NOT allow notes to be edited after creation.

#### Scenario: Attempt to edit a note
- **WHEN** any user attempts to change an existing note's content
- **THEN** the system rejects the edit and leaves the note unchanged

### Requirement: Only administrators can delete notes
The system SHALL allow an administrator to delete a note and SHALL deny deletion by regular users, including the note's author.

#### Scenario: Administrator deletes a note
- **WHEN** an administrator deletes an existing note
- **THEN** the system removes the note from the ticket's note history

#### Scenario: Note author attempts deletion
- **WHEN** a regular user attempts to delete a note they authored
- **THEN** the system denies the request and leaves the note intact

#### Scenario: Regular user attempts to delete another user's note
- **WHEN** a regular user attempts to delete a note authored by someone else
- **THEN** the system denies the request and leaves the note intact
