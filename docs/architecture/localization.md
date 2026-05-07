# Localization

## V1 Requirements

- UI strings should be i18n-ready.
- Content tables include a `language` field.
- Candidate request includes preferred language.
- Public content should be filterable or displayable by language when enough content exists.

## Current Implementation Status

Localization is not implemented as a UI translation layer yet. The app currently has content `language` fields, candidate preferred-language capture, and some fixed English date formatting, but mobile and Admin Lite UI strings are still hardcoded English. The localization foundation is scheduled for Phase 10B.

## Content Approval

Translations of prayers, official descriptions, and formation text require pastoral/content approval.

## Implementation Notes

Use stable translation keys in mobile/admin. Avoid hardcoding official Order text in code; load approved content from seed data or content management where appropriate.

Phase 10B should add a shared translation-key contract, a default English catalog, mobile/admin lookup helpers, missing-key fallback behavior, and tests before replacing Phase 10B-touched UI copy.
