# Localization

## V1 Requirements

- UI strings should be i18n-ready.
- Content tables include a `language` field.
- Candidate request includes preferred language.
- Public content should be filterable or displayable by language when enough content exists.

## Current Implementation Status

The Phase 10B localization foundation is in place. `@jp2/shared-i18n` defines stable UI translation keys, a default English catalog, locale normalization, interpolation, and fallback behavior. Mobile and Admin Lite expose app-local helpers over that shared translator so new Phase 10B UI copy can use keys instead of hardcoded strings.

Existing pre-roadmap screens still contain English UI strings and should be migrated incrementally when touched. Content `language` fields, candidate preferred-language capture, and approved content workflows remain separate from the UI string catalog.

## Content Approval

Translations of prayers, official descriptions, and formation text require pastoral/content approval.

## Implementation Notes

Use stable translation keys in mobile/admin. Avoid hardcoding official Order text in code; load approved content from seed data or content management where appropriate.

Phase 10B roadmap work should add new UI strings to `@jp2/shared-i18n` first, use the mobile/admin helpers from the screen model layer, and keep approved formation/prayer/official text in content tables or seed data rather than embedding it in the UI catalog.
