# Spec Delta

## Purpose

Lets the app present its UI in either English or Spanish, defaulting to what the user's browser prefers and letting them switch and keep that choice, so Spanish-speaking users get a usable interface without relying on browser translation tools.

## ADDED Requirements

### Requirement: Default language from browser locale
On first load, with no previously stored language preference, the system SHALL select the display language based on the browser's reported language.

#### Scenario: Browser reports Spanish
- **WHEN** the app loads with no stored language preference and the browser's language is Spanish (`es` or any `es-*` variant)
- **THEN** the UI renders in Spanish

#### Scenario: Browser reports a non-Spanish, non-English language
- **WHEN** the app loads with no stored language preference and the browser's language is neither Spanish nor English
- **THEN** the UI renders in English

#### Scenario: Browser reports English
- **WHEN** the app loads with no stored language preference and the browser's language is English (`en` or any `en-*` variant)
- **THEN** the UI renders in English

### Requirement: Manual language switch
The system SHALL provide a UI control, reachable from every authenticated screen, that lets the user select English or Spanish, and SHALL apply the selected language immediately without a full page reload.

#### Scenario: User switches language
- **WHEN** the user selects a different language from the language switcher
- **THEN** all currently visible translated UI text updates to the selected language without a browser page reload

### Requirement: Persisted language preference
Once the user manually selects a language, the system SHALL remember that choice and use it on every subsequent load, overriding the browser-locale default.

#### Scenario: Preference survives a reload
- **WHEN** the user has manually selected a language and then reloads the page or starts a new session
- **THEN** the app loads in the previously selected language, regardless of the browser's reported language

### Requirement: Translated UI text coverage
User-facing text in the app shell (navigation, account controls), login, ticket/project/category forms and lists, dashboard, reports, and profile screens SHALL be presented in the currently selected language.

#### Scenario: Screen renders in the selected language
- **WHEN** the user views any of the app's screens (app shell, login, ticket/project/category forms and lists, dashboard, reports, profile) with a given language selected
- **THEN** the static UI text on that screen (labels, buttons, headings, validation messages defined by the app) is presented in the selected language

#### Scenario: Backend-originated content is not translated
- **WHEN** the app displays data or error messages returned by the backend API (e.g. ticket titles, API error text)
- **THEN** that content is shown as returned by the backend, unaffected by the selected UI language
