# Public API

| Method | Path                                    | Auth | Request                                                                                         | Response                              | Validation                  | Errors      | Visibility                             | Acceptance                           |
| ------ | --------------------------------------- | ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------- | ----------- | -------------------------------------- | ------------------------------------ |
| GET    | `/public/home`                          | No   | Query `language?`, `date?`, `country?` for liturgical calendar context                          | intro, today/liturgicalDay, prayerOfDay, nextEvents, CTAs | language optional; date/country validation | 500         | `PUBLIC`, `FAMILY_OPEN` published only | No private content                   |
| GET    | `/public/content-pages/:slug`           | No   | path slug, query `language?`                                                                    | approved page detail                  | visible slug only           | 404         | `PUBLIC` published only                | Official content fallback if missing |
| GET    | `/public/prayers`                       | No   | `categoryId?`, `q?`, `language?`, pagination                                                    | prayer summary list                   | safe pagination             | 400         | approved `PUBLIC` published            | Brother prayers hidden               |
| GET    | `/public/prayers/:id`                   | No   | path id                                                                                         | prayer detail                         | visible id only             | 404         | approved `PUBLIC` published            | Private id returns 404               |
| GET    | `/public/events`                        | No   | `from?`, `type?`, pagination                                                                    | event summaries                       | valid date                  | 400         | approved `PUBLIC`, `FAMILY_OPEN` published | Private events hidden                |
| GET    | `/public/events/:id`                    | No   | path id                                                                                         | event detail                          | visible id only             | 404         | approved `PUBLIC`, `FAMILY_OPEN`       | Private id returns 404               |
| POST   | `/public/candidate-requests`            | No   | name, email, optional phone, city/country, language, message, consent, optional idempotency key | created request id/status             | required consent/email/name | 400,409,429 | create only                            | Stored with consent                  |
| GET    | `/public/silent-prayer-events`          | No   | pagination                                                                                      | active public sessions with counters  | none                        | 400         | `PUBLIC`, `FAMILY_OPEN`                | Aggregate only                       |
| POST   | `/public/silent-prayer-events/:id/join` | No   | `anonymousSessionId`                                                                            | counter, expiry, socket room info     | visible active session      | 400,404     | public sessions only                   | No user record created               |

## Public API Business Rules

- Public APIs never return users, memberships, candidate profiles, roadmap records, brother-only announcements, or private chorągiew content.
- Public candidate request creation must store consent timestamp and consent text/version.
- The implemented public candidate request creation path accepts validated contact fields only, stores consent metadata, supports optional idempotency keys for safe retries, rate-limits repeated attempts, rejects duplicate active request emails, and returns only request id/status.
- Public content pages are for approved About/FAQ/candidate-path content only. Draft or unapproved official wording is never returned.
- The implemented public content-page read path returns only `PUBLISHED` + `PUBLIC` rows, excludes archived or future-published pages, and falls back to English when a requested language is unavailable.
- The implemented public prayer read paths return only approved `PUBLISHED` + `PUBLIC` prayers, exclude archived, unapproved, or future-published prayers, and return 404 for hidden detail IDs.
- The implemented public event read paths return only approved `published` + `PUBLIC`/`FAMILY_OPEN` events, exclude archived, unapproved, or future-published events, and return 404 for hidden detail IDs.

## Public Home Today Module

`/public/home` exposes a normalized `today` module so guests can see the civil
date and the API-owned liturgical calendar state without the mobile app calling
third-party providers directly.

Implemented response fields:

- `today.civilDate`: ISO date and localized display label.
- `today.liturgicalDay.name`: feast/memorial/solemnity/Sunday/day name when available.
- `today.liturgicalDay.season`: Advent, Christmas, Lent, Easter, Ordinary Time, etc.
- `today.liturgicalDay.rank`: solemnity, feast, memorial, optional memorial, Sunday, weekday.
- `today.liturgicalDay.color`: liturgical color when available.
- `today.liturgicalDay.source`: provider/source identifier.
- `today.liturgicalDay.state`: `ready`, `unavailable`, or `fallback`.
- `nextEvents[0]`: should remain the next published `PUBLIC` or `FAMILY_OPEN`
  Order event safe for guests to attend, with no private location, attendee,
  roster, candidate, or brother-only data.

Implementation rule: mobile must not call third-party liturgical calendar
providers directly. The current API slice adds a `LiturgicalCalendarProvider`
boundary and a local fallback provider that formats the civil date, exposes
`source: local-fallback`, and marks liturgical detail state as `fallback`
instead of inventing feast/season/rank/color values.

The API also supports a configurable normalized HTTP provider behind the same
boundary:

- `LITURGICAL_CALENDAR_PROVIDER=fallback|http` defaults to `fallback`.
- `LITURGICAL_CALENDAR_URL` is required only when `provider=http`.
- `LITURGICAL_CALENDAR_TIMEOUT_MS`, `LITURGICAL_CALENDAR_RETRY_ATTEMPTS`, and
  `LITURGICAL_CALENDAR_CACHE_TTL_MS` bound remote calls.
- HTTP provider responses must already match the shared `today` DTO; invalid
  or failed responses fall back to `local-fallback`.

Future provider-specific mapping can adapt Parish Companion Ordo,
LiturgicalCalendarAPI, or a self-hosted calendar service into this normalized
DTO without changing mobile clients.
