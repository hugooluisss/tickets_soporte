# Spec Delta

## Purpose

Gives users an at-a-glance summary of ticket activity — volume, reply activity, priority mix, recent trend, and the newest tickets — as the first screen they see after logging in, replacing the previous plain-text dashboard.

## ADDED Requirements

### Requirement: Dashboard is the default screen after login
After a successful login, and whenever an authenticated user navigates to the application's root path with no more specific route, the system SHALL show the dashboard.

#### Scenario: Landing on the dashboard after login
- **WHEN** a user successfully logs in with no `returnUrl` requesting a different page
- **THEN** the user is shown the dashboard

#### Scenario: Navigating to the app root while authenticated
- **WHEN** an authenticated user navigates to the application's root path
- **THEN** the user is shown the dashboard

### Requirement: Ticket volume and reply summary
The dashboard SHALL show, as a set of summary figures: the total number of tickets, the number of client replies, the number of staff replies, and the number of tickets that have received no reply at all.

#### Scenario: Summary figures reflect current data
- **WHEN** a user views the dashboard
- **THEN** the displayed total ticket count, client-reply count, staff-reply count, and tickets-without-reply count match the underlying ticket and comment data at the time of loading

### Requirement: Reply activity over time
The dashboard SHALL show a chart of reply activity (comment counts) over a recent multi-day window, and SHALL show the most recent day's count as a headline figure.

#### Scenario: Recent window has reply activity
- **WHEN** a user views the dashboard and comments were created within the displayed window
- **THEN** the chart shows a data point for each day in the window with that day's comment count

#### Scenario: Recent window has no reply activity
- **WHEN** a user views the dashboard and no comments exist within the displayed window
- **THEN** the chart renders with all data points at zero, without erroring

### Requirement: Ticket priority breakdown
The dashboard SHALL show the breakdown of active (non-terminal-status) tickets by priority (high, medium, low), along with the total count of active tickets.

#### Scenario: Priority breakdown reflects current data
- **WHEN** a user views the dashboard
- **THEN** the displayed per-priority counts and total active-ticket count match the current set of tickets not in a terminal status (done or cancelled)

### Requirement: Tickets created vs. solved trend
The dashboard SHALL show a chart comparing, for each of the most recent 7 days, the number of tickets created that day against the number of tickets marked done that day.

#### Scenario: Day with both created and solved tickets
- **WHEN** a user views the dashboard and a day in the window has both newly created tickets and tickets marked done
- **THEN** the chart shows both counts for that day

#### Scenario: Day with no activity
- **WHEN** a day in the window has neither tickets created nor tickets marked done
- **THEN** the chart shows zero for both series on that day, without erroring

### Requirement: Recent tickets list
The dashboard SHALL show a list of the most recently created tickets, each showing its title, creation date, and status, and SHALL let the user navigate from this list to the full ticket list.

#### Scenario: Recent tickets exist
- **WHEN** a user views the dashboard and tickets exist
- **THEN** the list shows the most recently created tickets in descending order of creation time, each with a visibly distinct indicator for its status

#### Scenario: No tickets exist
- **WHEN** a user views the dashboard and no tickets exist
- **THEN** the recent-tickets list shows an empty state instead of an error

#### Scenario: Navigating to the full ticket list
- **WHEN** a user activates the recent-tickets list's "view all" action
- **THEN** the user is taken to the full ticket list screen
