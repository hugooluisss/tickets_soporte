# Spec Delta

## Purpose

Gives the frontend a consistent, utility-based visual foundation (Tailwind CSS) and a reusable field-design toolkit so every form in the app presents labels, inputs, and validation errors the same way instead of each screen hand-rolling its own markup and styles.

## ADDED Requirements

### Requirement: Tailwind CSS styling foundation
The frontend build SHALL compile Tailwind CSS utility classes into the application's stylesheet, and the compiled output SHALL be the styling mechanism available to every component in the app.

#### Scenario: Production build includes compiled Tailwind styles
- **WHEN** the frontend is built with `ng build --configuration production`
- **THEN** the emitted CSS bundle contains the Tailwind utility classes referenced by the app's templates, purged of unused classes

#### Scenario: Development build includes compiled Tailwind styles
- **WHEN** the frontend is built or served with the development configuration
- **THEN** Tailwind utility classes referenced by the app's templates render with their expected styles, without requiring a separate manual build step

### Requirement: Reusable labeled field component
The system SHALL provide a shared field component that renders a label, its associated input/textarea/select control, and a validation-error message, so that forms do not each redefine this markup independently.

#### Scenario: Field renders label bound to its control
- **WHEN** a form uses the shared field component with a given label text and form control
- **THEN** the rendered label is programmatically associated with the input (e.g. matching `for`/`id`), so assistive technology announces the label for that control

#### Scenario: Field shows a validation error only after interaction
- **WHEN** the bound form control is invalid and has been touched (or the form has been submitted)
- **THEN** the field displays a validation-error message
- **AND** no validation-error message is shown while the control is invalid but has not yet been touched

#### Scenario: Field hides the validation error once valid
- **WHEN** a previously invalid, touched control becomes valid
- **THEN** the field's validation-error message is no longer displayed

### Requirement: Consistent field appearance across forms
Every form in the application that collects user input through labeled fields SHALL use the shared field component (or its underlying Tailwind design tokens) for its fields, so labels, inputs, and error states look and behave consistently across the app.

#### Scenario: Existing forms use the shared field styling
- **WHEN** a user views the sign-in form, ticket form, project form, or category form
- **THEN** each form's labeled fields share the same spacing, typography, border, and error-state styling defined by the shared field component
