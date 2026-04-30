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

## Analytics

Only basic product events are useful in V1, such as public home opened, join request submitted, and public prayer opened. Do not track prayer participation as personal spiritual analytics.

