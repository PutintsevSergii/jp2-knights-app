# Localization

## V1 Requirements

- UI strings should be i18n-ready.
- Content tables include a `language` field.
- Candidate request includes preferred language.
- Public content should be filterable or displayable by language when enough content exists.

## Content Approval

Translations of prayers, official descriptions, and formation text require pastoral/content approval.

## Implementation Notes

Use stable translation keys in mobile/admin. Avoid hardcoding official Order text in code; load approved content from seed data or content management where appropriate.

