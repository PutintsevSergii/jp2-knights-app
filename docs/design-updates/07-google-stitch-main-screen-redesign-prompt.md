# Google Stitch Main Screen Redesign Prompt

Status: Next planned design task
Last updated: June 3, 2026

Use this prompt in Google Stitch to generate the next mobile main-screen design
set for the JP2 Knights app. The goal is not a marketing landing page. The goal
is a role-aware first screen that helps each user state take the most useful
next action without exposing private data.

## Product Idea

JP2 Knights is a Catholic fraternity, prayer, formation, and local community
companion app. Guests should understand the Order, pray, discover open events,
see what liturgical day it is today, and request to join. Logged-in candidates
should immediately see today's liturgical context, their next formation action,
responsible contact, and candidate-visible events. Logged-in brothers should get
a daily command center for prayer, formation, events, announcements, and today's
liturgical day.

## Design System

- Device: iPhone 14 / 390 x 844 mobile frames.
- Visual direction: calm Catholic fraternity app, useful and warm, not a
  marketing site.
- Palette: Stitch Ecclesia.
  - Background parchment: `#FEF9EF`
  - Surface: `#FFFFFF`
  - Primary gold: `#D6A21E`
  - Deep gold text/accent: `#795900`
  - Primary ink: `#1D1C16`
  - Muted brown: `#4F4634`
  - Subdued taupe: `#817662`
  - Borders: `#D3C5AE`, `#E7E2D8`, `#ECE8DE`
  - Optional secondary blue for public-safe informational badges only: `#356382`
- Typography: Inter for functional text. Use a restrained serif-style heading
  feel only if Stitch can render it cleanly; otherwise keep Inter bold headings.
- Layout: mobile-first, dense enough for repeated daily use. Use cards only for
  real repeated items or framed tools; do not place cards inside cards.
- Radius: 4-8 px for cards/buttons; pill only for badges/chips.
- Navigation: persistent bottom tab bar, 5 tabs max, with icon above label.
- Accessibility: high contrast, tap targets at least 44 px, no text overlap,
  no tiny critical actions.

## Required Frames

Generate these frames in this order:

1. `Anonymous Guest Home`
2. `Candidate Home`
3. `Brother Home`
4. `Idle Approval Home`
5. `Officer Mobile Handoff`

All frames must share the same visual system and should feel like one app.

## Frame 1: Anonymous Guest Home

Purpose: First unauthenticated screen. Convert confusion into clear next steps:
learn, pray, attend, join, sign in.

Data/functionality to show:

- Top app bar:
  - Title: `JP2 Knights`
  - Left icon: menu
  - Right action: account/sign-in icon
- Today strip:
  - Civil date, for example `Wednesday, June 3`
  - Liturgical day name, for example `Memorial of Saint Charles Lwanga and
    Companions`
  - Season/rank/color chip, for example `Ordinary Time`, `Memorial`, `Red`
  - If liturgical data is unavailable, show the civil date and `Liturgical
    calendar unavailable`.
- Hero:
  - Headline: `Prayer, fraternity, and formation`
  - Body: one short sentence explaining the Order.
  - Primary CTA: `Request to Join`
  - Secondary CTA: `Sign In`
- Public action grid:
  - `About the Order`
  - `Prayer Library`
  - `Public Events`
  - `Silent Prayer`
- Today in prayer card:
  - Prayer title
  - Short public excerpt
  - Action: `Read Prayer`
- Silent prayer card:
  - Active intention title
  - Aggregate counter only, for example `18 praying now`
  - Action: `Join Prayer`
  - Do not show participant names, avatars, or lists.
- Next open event card:
  - Badge: `Family Open` or `Public`
  - Event title
  - Date/time
  - Safe location label only
  - Copy should make guest attendance clear, for example `Guests may attend`
  - Action: `View Details`
- Joining path strip:
  - Three compact steps: `Request`, `Officer Review`, `Formation Begins`
  - No guarantee of membership or account approval.
- Bottom tabs:
  - Home, About, Prayers, Events
  - Do not include Join as a tab; show Request to Join only on anonymous guest
    Home.

States to imply in design notes:

- If no prayer/event exists, show a calm empty row, not a blank space.
- If offline, keep About/Join visible and show public data as unavailable.
- Never show private brother/candidate content.

## Frame 2: Candidate Home

Purpose: Logged-in candidate dashboard. The most useful thing is the next
formation action, plus responsible contact and candidate-visible events.

Data/functionality to show:

- Top app bar:
  - Title: `Candidate Home`
  - Greeting line: `Peace, [First Name]`
  - Status chip: `Candidate`
- Primary next-step module:
  - Title from assigned roadmap or dashboard, for example `Next formation step`
  - Step title
  - Short body/requirement
  - Status badge: `Not started`, `In review`, `Rejected`, or `Complete`
  - Primary action: `Open Roadmap`
- Today's liturgical context:
  - Civil date
  - Liturgical day/season/rank/color
  - Short prayer cue, for example `Pray with the Church today`
- Assignment card:
  - Assigned choragiew/unit name
  - City/country or parish if available
  - Candidate status
- Responsible officer card:
  - Officer name
  - Email/phone if available
  - Actions: `Email` and `Call` only if data exists
  - Do not include chat or in-app messaging.
- Upcoming candidate-visible events:
  - 2 compact event rows/cards
  - Date, title, safe location label
  - Own RSVP badge only: `Planning`, `Not attending`, `No response`
  - Action: `View`
- Announcements preview:
  - 1-2 one-way messages
  - Pinned badge if applicable
  - No replies, comments, read receipts, or delivery analytics.
- Quick actions:
  - Roadmap
  - Events
  - Contact
  - Announcements
- Bottom tabs:
  - Home, Roadmap, Events, Contact, Profile

States to imply in design notes:

- No assignment: show a gentle state telling the candidate an officer will
  complete assignment.
- No roadmap: show `Formation path not assigned yet`.
- No events: show `No candidate-visible events yet`.
- Do not show brother-only events, brother profile, rosters, admin notes, or
  officer-only controls.

## Frame 3: Brother Home

Purpose: Logged-in brother daily command center. The most useful thing is a
single daily focus backed by prayer, formation, events, and announcements.

Data/functionality to show:

- Top app bar:
  - Title: `Brother Today`
  - Greeting: `Peace, [First Name]`
  - Small profile/avatar button
- Identity summary:
  - Current degree
  - Primary choragiew/unit
  - Membership status
- Today's liturgical context:
  - Civil date
  - Liturgical day/season/rank/color
  - Optional short cue connected to prayer of the day
- Today's focus module:
  - One primary recommended action:
    - `Continue Formation`
    - `Join Silent Prayer`
    - `View Upcoming Event`
    - or `Read Announcement`
  - Short explanation
  - Primary action button
- Formation card:
  - Assigned roadmap/stage
  - Next step status
  - Action: `Open Roadmap`
  - No automatic degree awarding.
- Prayer card:
  - Prayer of the day or recommended brother-visible prayer
  - Action: `Read Prayer`
- Silent prayer card:
  - Active event title
  - Aggregate counter only
  - Action: `Join`
  - No participant names, avatars, or lists.
- Upcoming event card:
  - Event title, date/time, location label
  - Visibility/type badge
  - Own RSVP badge/action only
  - No attendee list.
- Announcement preview:
  - Latest brother-visible one-way announcement
  - Pinned badge if applicable
- Quick action grid:
  - My Profile
  - My Choragiew
  - Prayers
  - Events
  - Roadmap
- Bottom tabs:
  - Today, Roadmap, Events, Prayers, Profile

States to imply in design notes:

- No roadmap: show `No formation path assigned`.
- No active silent prayer: show a quiet inactive state.
- No events/announcements: show compact empty rows.
- Do not show admin controls, brother rosters, participant lists, chat,
  comments, or social feeds.

## Frame 4: Idle Approval Home

Purpose: A signed-in Firebase identity that does not yet have an app role. Keep
the user public-only while explaining status.

Data/functionality to show:

- Top app bar: `JP2 Knights`
- Status panel:
  - Title: `Access review pending`
  - Body: explain that an officer must approve app access.
  - Optional expiry/rejected copy variant if visible.
- Public-safe actions:
  - `Return Home`
  - `Prayer Library`
  - `Public Events`
  - `Sign Out`
- Small note:
  - `Private candidate and brother areas stay locked until approval.`
- Bottom tabs:
  - Home, About, Prayers, Events
  - Do not include Join as a tab; show Request to Join only on anonymous guest
    Home.

Restrictions:

- Do not show private dashboard cards, role selector, or self-approval.

## Frame 5: Officer Mobile Handoff

Purpose: In V1, officers and Super Admins use Admin Lite web, not a native
officer mobile mode. If an authenticated officer opens mobile without a
candidate/brother role, the app should hand off clearly.

Data/functionality to show:

- Top app bar: `JP2 Knights`
- Status panel:
  - Title: `Admin tools are on the web`
  - Body: `Use Admin Lite to review requests, manage events, and update content.`
- Actions:
  - Primary: `Open Admin Lite`
  - Secondary: `Public Home`
  - Secondary: `Sign Out`
- Public-safe preview:
  - Optional public prayer/event row below.

Restrictions:

- Do not design native officer dashboards, member registries, admin forms, or
  mobile management workflows for this V1 screen.

## Output Requirements

- Produce editable mobile frames, not just one static collage.
- Name every layer semantically.
- Keep each frame scrollable but make the primary action visible in the first
  viewport.
- Include empty/offline/forbidden notes as annotations near the relevant
  modules, not as extra full screens unless Stitch requires it.
- Use the same bottom-tab dimensions and top-app-bar pattern across frames.
- Do not introduce chat, payments, maps, analytics dashboards, social feeds,
  participant lists, public rosters, private member directories, or
  hierarchy-derived permissions.

## Backend/Data Notes For Designers

- Liturgical day data will be fetched by the backend through a provider adapter,
  not directly from the mobile app.
- The mobile app should receive a normalized `today` module from `/public/home`
  or the authenticated dashboard payload, with civil date, liturgical day name,
  season, rank, color, and source/unavailable state.
- Candidate provider options currently identified for implementation planning:
  Parish Companion Ordo for a simple free REST calendar, or the open-source
  LiturgicalCalendarAPI for a richer self-hostable/general Roman calendar path.
- The next Order event shown to guests must come from the existing
  public/family-open event contract and must never expose private location,
  roster, attendee, or brother-only event data.
