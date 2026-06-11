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

The preflight must include the platform app identifier used by the Firebase app
registration: `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER` for iOS or
`EXPO_PUBLIC_ANDROID_PACKAGE` for Android. The Expo config reads those values
from the environment so pilot identifiers stay out of source control.

At least one native target must then validate:

| Path | Must validate |
| --- | --- |
| Guest public silent prayer | Public session list loads through the API, join uses the API-owned REST contract, RTDB updates only `silentPrayerPublicCounts/{eventId}`, and the app shows only the aggregate count |
| Brother silent prayer | Google/Firebase sign-in succeeds, brother session list loads through the guarded API, join/heartbeat/leave use the API-owned REST contracts, RTDB private count reads work only with an API-issued grant, and the app shows only the aggregate count |
| Privacy denial | The mobile client cannot read or write presence rows, read grants, participant keys, anonymous session ids, Firebase UIDs, local user ids, rosters, or prayer history paths |
| Exit/cleanup | Leaving the silent-prayer screen unsubscribes the RTDB listener, sends REST leave, and the aggregate count decrements after leave or expiry |

After the native run, copy
[`docs/deployment/native-rtdb-validation-evidence.example.json`](../deployment/native-rtdb-validation-evidence.example.json)
to a local, uncommitted evidence file and replace the sample metadata with
sanitized pilot values. Record route names, HTTP status codes, and aggregate
count transitions only. Do not include raw cookies, Firebase/OAuth tokens,
secret values, participant/session/user identifiers, rosters, private candidate
or brother data, raw logs, or screenshots that reveal those values.

Validate the evidence file before attaching it to the pilot launch ticket:

```bash
pnpm validate:mobile-rtdb-evidence -- --file /path/to/native-rtdb-evidence.json
```

This command does not prove the device run happened. It verifies that the
operator-provided evidence covers the required aggregate-only scenarios and
fails closed when obvious secrets or private identifiers appear in the evidence.

## Result Classification

| Classification | Meaning |
| --- | --- |
| Blocker | Prevents pilot or leaks private data |
| Important | Core workflow broken but no privacy leak |
| Later | Usability improvement or V2 candidate |
