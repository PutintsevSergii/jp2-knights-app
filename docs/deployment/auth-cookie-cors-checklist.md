# Auth Cookie, CORS, And Redirect Checklist

Use this checklist after custom domains resolve over HTTPS and before pilot
traffic is approved. It complements the domain/DNS runbook by focusing on the
auth session cookie, Firebase redirect domains, Admin Lite cookie forwarding,
and realtime CORS behavior.

## Expected Runtime Shape

- API public origin: `https://api.example.org`.
- Admin Lite public origin: `https://admin.example.org`.
- Mobile API base: `https://api.example.org/api`.
- Firebase Authentication authorized domains include the final Admin hostname
  and any API hostname required by the auth/session topology.
- Admin Lite server routes forward the browser `Cookie` header to backend API
  clients.
- API auth creates `jp2_session` only after provider token verification and
  matching CSRF evidence when session-cookie creation is available.
- In production, `jp2_session` is expected to be `HttpOnly`, `Secure`,
  `SameSite=Lax`, and `Path=/`.

## Firebase Redirect Domains

Verify in the Firebase console:

- Google sign-in provider is enabled for the pilot Firebase project.
- Authorized domains include the final Admin hostname.
- Authorized domains include generated Cloud Run hostnames only when they are
  intentionally used for staging smoke checks.
- Authorized domains do not include stale local, preview, or unrelated hostnames
  for the pilot environment.
- Mobile public Firebase values match the same Firebase project used by the API
  Firebase Admin credentials.

## Admin Session Cookie Checks

Run these checks in a fresh browser profile after DNS and HTTPS are ready:

1. Open the final Admin Lite HTTPS origin.
2. Complete Google/Firebase sign-in with an approved pilot user.
3. Confirm the response from `POST /api/auth/session` sets `jp2_session` only on
   HTTPS.
4. Confirm cookie attributes are `HttpOnly`, `Secure`, `SameSite=Lax`, and
   `Path=/`.
5. Reload `/admin/dashboard` and confirm the Admin route still resolves the
   current user through the forwarded cookie.
6. Visit a scoped Admin route as an ordinary officer and confirm Super Admin
   privacy workflows remain hidden and API-denied.
7. Sign out and confirm `POST /api/auth/logout` clears `jp2_session`.

Do not record raw cookie values in notes or screenshots.

## REST Origin Checks

The deployed REST API should not require broad browser CORS for ordinary Admin
Lite operation because Admin server routes forward credentials to API clients.
Validate:

- Admin Lite pages load through the Admin origin and do not require browser
  JavaScript to call private API routes cross-origin with cookies.
- Mobile uses `EXPO_PUBLIC_API_BASE_URL` and bearer/provider-token session
  creation, not browser cookies.
- Public unauthenticated API routes remain usable from the mobile API base.
- Private API routes still reject requests without an approved bearer token or
  forwarded `jp2_session`.

If future browser-to-API credentialed CORS is introduced, it must be explicitly
scoped to the final Admin origin, must send `Access-Control-Allow-Credentials:
true`, and must not use wildcard origins with credentials.

## Realtime CORS Checks

Silent-prayer Socket.IO compatibility currently allows credentials for the
socket namespace while live pilot realtime should use Firebase RTDB aggregate
listeners.

Before launch:

- Confirm `SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` for live API.
- Confirm `EXPO_PUBLIC_SILENT_PRAYER_REALTIME_PROVIDER=firebase-rtdb` for
  mobile pilot builds.
- If Socket.IO compatibility is exercised in staging, verify brother socket auth
  accepts the forwarded `jp2_session` cookie only for authorized brother users.
- Confirm Socket.IO responses still expose aggregate count state only.
- Confirm Firebase RTDB rules deny client writes to counts, presence rows, and
  read grants.

## Curl Smoke Examples

Check API health through the final domain:

```bash
curl -i https://api.example.org/api/health
```

Check that a private Admin API path rejects unauthenticated requests:

```bash
curl -i https://api.example.org/api/admin/dashboard
```

Check the Admin route through the final domain after signing in in a browser:

```bash
curl -I https://admin.example.org/admin/dashboard
```

Use browser developer tools, not committed logs, to inspect the actual
`Set-Cookie` header after sign-in.

## Launch Gate

Do not approve pilot launch until:

- Firebase authorized domains match the final pilot domains.
- Admin sign-in sets the production `jp2_session` cookie attributes.
- Admin route handlers keep forwarding cookies to API clients.
- Logout clears the session cookie.
- Private API routes reject unauthenticated requests.
- No wildcard credentialed REST CORS is required for Admin Lite.
- Live silent-prayer realtime is on Firebase RTDB and remains aggregate-only.
