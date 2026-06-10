# Pilot Validation Plan

## Pilot Setup

- one pilot chorągiew;
- one super admin;
- one officer;
- 5-20 brothers;
- 1-5 candidates;
- representative public/candidate/brother prayers, events, announcements, roadmap, silent prayer sessions.

## Scenarios

| Scenario | Must validate |
| --- | --- |
| Guest | Open app, read prayer, view event, about, join request, public silent prayer |
| Candidate | Login, dashboard, roadmap, event, prayer, no brother content |
| Brother | Today, profile, chorągiew, event intent, roadmap submission, brother silent prayer |
| Officer | Create event, publish announcement, process request, review roadmap, create silent prayer, scoped access |
| Super Admin | Create chorągiew, assign officer, manage global prayers, publish public content, review audit |

## Native RTDB Silent-Prayer Validation

Before the native device run, execute the RTDB Expo environment preflight with
the same environment values used by the device build:

```bash
pnpm validate:mobile-rtdb-native -- --platform ios
pnpm validate:mobile-rtdb-native -- --platform android
```

At least one native target must then validate:

| Path | Must validate |
| --- | --- |
| Guest public silent prayer | Public session list loads through the API, join uses the API-owned REST contract, RTDB updates only `silentPrayerPublicCounts/{eventId}`, and the app shows only the aggregate count |
| Brother silent prayer | Google/Firebase sign-in succeeds, brother session list loads through the guarded API, join/heartbeat/leave use the API-owned REST contracts, RTDB private count reads work only with an API-issued grant, and the app shows only the aggregate count |
| Privacy denial | The mobile client cannot read or write presence rows, read grants, participant keys, anonymous session ids, Firebase UIDs, local user ids, rosters, or prayer history paths |
| Exit/cleanup | Leaving the silent-prayer screen unsubscribes the RTDB listener, sends REST leave, and the aggregate count decrements after leave or expiry |

## Result Classification

| Classification | Meaning |
| --- | --- |
| Blocker | Prevents pilot or leaks private data |
| Important | Core workflow broken but no privacy leak |
| Later | Usability improvement or V2 candidate |
