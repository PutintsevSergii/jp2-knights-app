# Mobile Public Screens

| Screen | Route | Purpose | Visible data | Primary actions | Empty/loading/error | Restrictions |
| --- | --- | --- | --- | --- | --- | --- |
| Public Home | `PublicHome` | First unauthenticated screen | intro, prayer of day, next public/family event | learn, pray, view event, join, login | all required | Public content only |
| About the Order | `AboutOrder` | Explain Order and candidate path | mission, spirituality, FAQ | start join request | content fallback | Requires Order approval |
| Public Prayer Categories | `PublicPrayerCategories` | Browse public prayer groups | categories | select category | empty category state | `PUBLIC` only |
| Public Prayer List | `PublicPrayerList` | List prayers | prayer summaries | search/open prayer | empty search | `PUBLIC` only |
| Public Prayer Detail | `PublicPrayerDetail` | Read prayer | title/body/category | favorite/cache if local | not found for private id | No private prayers |
| Public Events List | `PublicEventsList` | Discover events | public/family events | filter/open/share | no events | No private events |
| Public Event Detail | `PublicEventDetail` | Event detail | title/time/location label/description | add calendar/share/join interest | cancelled state | No private location |
| Join Request Form | `JoinRequestForm` | Submit interest | form fields and consent | submit | field validation | Consent required |
| Join Request Confirmation | `JoinRequestConfirmation` | Confirm submission | safe confirmation text | return home | none | No account promise |
| Public Silent Prayer | `PublicSilentPrayer` | Anonymous prayer session | title/intention/counter | join/leave | disconnected/closed | Aggregate only |
| Login | `Login` | Auth entry | login fields/provider | login | auth errors | No public registration bypass |

## Current Implementation Note

The current Phase 3 mobile app includes an Expo entry point, typed public launch
state, a token-backed `PublicHome` screen model, a React Native `PublicHome`
screen, and a React Native `AboutOrder` screen. In `api` mode it loads
`/api/public/home` and `/api/public/content-pages/about-order` from the
configured API base URL, validates both payloads with shared DTO schemas, and
maps request failures to `error` or `offline` states. In `demo` mode it keeps
using local fallback payloads. The model covers `ready`, `empty`, `loading`,
`error`, `forbidden`, and `offline` states and maps public CTAs to canonical
public routes.

Phase 4 adds React Native public prayer and event list views. `PublicPrayerCategories`
loads `/api/public/prayers`; `PublicEventsList` loads `/api/public/events`.
Both validate shared DTOs, support API/demo runtime modes, and expose only
public-safe summaries. Prayer/event detail screens remain pending.

## Analytics

Only basic product events are useful in V1, such as public home opened, join request submitted, and public prayer opened. Do not track prayer participation as personal spiritual analytics.
