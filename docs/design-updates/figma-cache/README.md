# Phase 10A Figma Cache

Cached from `figma.com/design/Byh7E8Yev3jEm0Zg9SgZoJ/jp-project` on May 8, 2026.

The Figma file has no local variables or local styles, so implementation uses frame-derived values extracted from the priority screens.

## Screenshots

| Frame | Node | Local screenshot |
| --- | --- | --- |
| Sign In (Gold/Grey) | `1:2` | [sign-in-1-2.png](screenshots/sign-in-1-2.png) |
| Candidate Events (Gold/Grey) | `1:47` | [candidate-events-1-47.png](screenshots/candidate-events-1-47.png) |
| Brother Today (Gold/Grey) | `1:177` | [brother-today-1-177.png](screenshots/brother-today-1-177.png) |
| Candidate Requests (Gold/Grey) | `1:1635` | [candidate-requests-1-1635.png](screenshots/candidate-requests-1-1635.png) |

## Extracted Palette

| Token role | Value | Source notes |
| --- | --- | --- |
| App background | `#FBF8FF` | Frame backgrounds, app chrome |
| Surface | `#FFFFFF` | Cards/forms |
| Primary text | `#1A1B22` | Headings and body emphasis |
| Muted text | `#4E4632` | Body and metadata |
| Subdued text | `#80765F` | Inputs/placeholders |
| Gold action | `#FECC00` | Primary buttons and active nav |
| Gold pressed | `#F0C100` | Brother Today accent |
| Gold text/link | `#745C00` | Links and brand text |
| Gold darker | `#6E5700` | Active labels and selected badges |
| Gold deep | `#574500` | Date badge text |
| Card border | `#D1C5AB` | Forms/cards |
| Chrome border | `#E3E1EC` | Top/bottom nav separators |
| Soft fill/border | `#EEEDF7` | Secondary badges/cards |
| Success | `#15803D` | Invited status |
| Warning | `#A16207` | Contacted status |
| Danger | `#B91C1C` | Rejected/not-attending status |

## Extracted Type

Primary font: `Work Sans`.

| Role | Size | Weight | Line height | Letter spacing |
| --- | ---: | --- | ---: | ---: |
| Display title | 48 | 700 | 52.8 | -0.96 to -1.2 |
| Screen title | 32 | 600 | 38.4 | -0.32 |
| Section title | 24 | 600-700 | 31.2 | 0 |
| Card title | 18 | 700 | 28.8 | 0 |
| Body | 16 | 400-500 | 24 | 0 |
| Secondary | 14 | 400-600 | 14-20 | 0.28 where button-like |
| Label | 12 | 500-700 | 12-16 | 0.6-1.2 |

## Layout Notes

- Mobile frames are `390px` wide.
- Outer mobile horizontal padding is usually `32px`.
- Main vertical section gaps are commonly `48px`.
- Cards use `12px` radius with `1px` borders.
- Buttons use `8px` radius; badges use `9999px` radius.
- Common card shadow: black at `5%`, offset `0 1`, blur `2`.
- Candidate Requests has stronger modal/card shadows: black at `10%`, offset `0 4`, blur `6`, and offset `0 10`, blur `15`.

## Frame Structure Summary

### Sign In `1:2`

- Header image/logo block, title `JP2 Knights`, subtitle.
- V1 functional adaptation: use the frame as the Gold/Grey auth-shell baseline,
  but render Google/Gmail Firebase sign-in instead of the email/password fields
  shown in the Figma artifact.
- Primary provider action uses `#FECC00` with dark text.
- Footer links to public account/request flow.

### Candidate Events `1:47`

- Top app bar, bottom nav, page title `Upcoming Events`.
- Event cards with `12px` radius, gold border, title, status badge, date/location metadata, and action row.
- Status examples: planning to attend, RSVP needed, not attending.

### Brother Today `1:177`

- Top app bar and bottom nav.
- Profile bento card with avatar, greeting, degree badge, choragiew badge.
- 2x2 quick-action grid.
- Upcoming event cards with compact date tile and event metadata.

### Candidate Requests `1:1635`

- Responsive Admin Lite reference frame, not a native Expo officer surface.
- Header with four metric/filter cards: New, Contacted, Invited, Rejected.
- Candidate cards include initials, name, status badge, date/location metadata, message preview, and scoped review/contact actions.
