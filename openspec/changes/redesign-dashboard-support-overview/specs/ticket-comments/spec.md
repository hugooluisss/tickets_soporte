# Spec Delta

## Purpose

Stores comments (replies) on a ticket as real, queryable data — who wrote it and when — so reply-based metrics (client vs staff activity, tickets without any reply) can be computed accurately instead of estimated or hardcoded.

## ADDED Requirements

### Requirement: Create a ticket comment
An authenticated user SHALL be able to create a comment on an existing ticket by supplying its body text; the system SHALL record the authenticated user as the comment's author and the current time as its creation time.

#### Scenario: Authenticated user adds a comment
- **WHEN** an authenticated user submits a non-empty comment body for an existing ticket
- **THEN** the system creates a comment recording that ticket, that user as author, the body text, and the creation timestamp

#### Scenario: Empty comment body is rejected
- **WHEN** a comment is submitted with an empty or whitespace-only body
- **THEN** the system rejects the request and does not create a comment

#### Scenario: Comment on a nonexistent ticket is rejected
- **WHEN** a comment is submitted for a ticket id that does not exist
- **THEN** the system rejects the request with a not-found error and does not create a comment

### Requirement: List a ticket's comments
An authenticated user SHALL be able to retrieve the comments recorded for an existing ticket, ordered from oldest to newest.

#### Scenario: List comments for a ticket with replies
- **WHEN** an authenticated user requests the comments for a ticket that has comments
- **THEN** the system returns all of that ticket's comments ordered by creation time, oldest first

#### Scenario: List comments for a ticket with no replies
- **WHEN** an authenticated user requests the comments for a ticket that has no comments
- **THEN** the system returns an empty list

### Requirement: Comment author role is derived from the ticket's creator
The system SHALL classify each comment as a "client" reply if its author is the ticket's creator, or a "staff" reply otherwise, without requiring the role to be supplied explicitly.

#### Scenario: Ticket creator comments on their own ticket
- **WHEN** the user who created a ticket adds a comment to it
- **THEN** that comment is classified as a client reply

#### Scenario: A different user comments on the ticket
- **WHEN** a user who did not create the ticket (e.g. the assignee or another staff member) adds a comment to it
- **THEN** that comment is classified as a staff reply
