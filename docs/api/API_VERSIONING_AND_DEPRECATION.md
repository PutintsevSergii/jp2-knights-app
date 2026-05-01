# API Versioning and Deprecation Policy

This document defines how the JP2 App API will evolve over time while maintaining stability for mobile and admin clients.

## Versioning Strategy

### API Version Format

The JP2 API uses **URL-based versioning** with the format:

```
https://api.example.com/v1/endpoint
https://api.example.com/v2/endpoint
```

- **v1**: Current production API. Supports mobile app (current release) and admin.
- **v2+**: Future API versions introduced only when breaking changes are necessary.

### Semantic Versioning (for documentation)

Internally, we track API changes using semantic versioning:
- **MAJOR**: Breaking change (removed endpoint, changed response format without deprecation period)
- **MINOR**: Backwards-compatible addition (new endpoint, new optional field)
- **PATCH**: Backwards-compatible fix (bug fix, performance improvement)

Example: `v1.3.2` (major=1, minor=3, patch=2)

### Stability Policy

| Change Type | Major | Minor | Patch | Deprecation Period | Impact |
|---|---|---|---|---|---|
| Add new endpoint | ✗ | ✓ | ✗ | None | Clients optional; can ignore |
| Add optional field to request | ✗ | ✓ | ✗ | None | Clients continue to work |
| Add optional field to response | ✗ | ✗ | ✓ | None | Clients ignore new field |
| Change required field | ✓ | ✗ | ✗ | 3 releases (6+ months) | Clients must adapt |
| Remove endpoint | ✓ | ✗ | ✗ | 3 releases (6+ months) | Clients must update |
| Rename endpoint | ✓ | ✗ | ✗ | 3 releases (6+ months) | Old path available; new path preferred |
| Change error response format | ✓ | ✗ | ✗ | 3 releases (6+ months) | Error handling code needs update |
| Change request/response content-type | ✓ | ✗ | ✗ | 3 releases (6+ months) | Client must change parser |

---

## Adding New Endpoints

### Within Same Major Version (Minor/Patch)

New endpoints are **always backwards-compatible**. Clients can safely ignore them.

```ts
// Old client continues to work
GET /v1/public/prayers   // Still works

// New client can use new endpoint
GET /v1/prayers/by-category   // New endpoint added in v1.3
```

**No deprecation period required.** Old clients continue using old endpoint; new clients can adopt new endpoint when ready.

### OpenAPI Contract

Update the OpenAPI spec and regenerate the TypeScript client:

```sh
# After adding new endpoint to NestJS controller
pnpm contract:generate   # Regenerates OpenAPI and client
pnpm contract:check      # Ensures generated client compiles
```

---

## Breaking Changes and Deprecation

### Deprecating an Endpoint

When an endpoint must be removed or significantly changed:

1. **Announce deprecation** (at least 3 releases / 6+ months ahead):
   - Update OpenAPI spec with `x-deprecated: true` and deprecation message
   - Add a `Deprecation: true` HTTP header to deprecated endpoint responses
   - Document in [API changelog](api-changelog.md) (future doc)
   - Notify known client developers (email, in-app banner, etc.)

2. **Maintain dual endpoints**:
   ```ts
   // Old endpoint (deprecated but still works)
   GET /v1/prayers/:id
   → 200 OK { ... } + Deprecation: true header

   // New endpoint (preferred)
   GET /v1/prayers/:id/full-text
   → 200 OK { ... }
   ```

3. **After deprecation period** (at least 3 releases):
   - Remove old endpoint
   - Increment major version if necessary
   - Update OpenAPI spec
   - Require all clients to update

### Example: Removing a Field from Response

**Current response** (v1.1):
```json
{
  "id": "123",
  "title": "Prayer of the Day",
  "text": "...",
  "legacy_category": "morning"  // Deprecated; use 'category' instead
}
```

**Deprecation announcement** (v1.2):
```json
{
  "id": "123",
  "title": "Prayer of the Day",
  "text": "...",
  "legacy_category": "morning",  // ⚠️ DEPRECATED; use 'category' instead
  "category": "morning"
}
```

OpenAPI schema:
```yaml
prayer_response:
  type: object
  properties:
    legacy_category:
      type: string
      deprecated: true
      description: "DEPRECATED as of v1.2. Use 'category' instead. Will be removed in v2."
```

**After deprecation period** (v1.5+):
```json
{
  "id": "123",
  "title": "Prayer of the Day",
  "text": "...",
  "category": "morning"
}
```

### Example: Renaming an Endpoint

**Current** (v1.1–1.3):
```
GET /v1/brother/my-organization-units  (old)
GET /v1/brother/chorągiew             (new, same response)
```

Both endpoints work; old endpoint includes deprecation header.

**After deprecation period** (v2.0):
```
GET /v1/brother/chorągiew  (only option; old deleted)
```

---

## Version Transition Plan

### From v1 to v2 (Future)

A new major version (v2) is introduced **only when**:
- 3+ breaking changes have accumulated, OR
- A fundamental architectural change is needed (e.g., GraphQL, new protocol)

**Process**:
1. All breaking changes are announced and deprecated in v1.x for 6+ months
2. Clients are notified and given time to update
3. v2 launches; v1 endpoint continues as a proxy to v2 for backward compatibility (optional; can sunsetting is set)
4. v1 sunset date is announced (e.g., 12 months after v2 launch)

**Transition timeline example**:
```
v1.2: Breaking change A announced (deprecation in v1.2–v1.5)
v1.3: Breaking change B announced (deprecation in v1.3–v1.6)
v1.4: Breaking change C announced (deprecation in v1.4–v1.7)
v1.5–v1.7: Deprecation period (6+ months)
v2.0: Major version launch (A, B, C implemented; v1 still available)
v2.6: v1 sunset announced (deprecation in v2.6–v3.0)
v3.0: v1 removed
```

---

## Mobile and Admin Client Updates

### Mobile App Versioning

Mobile app versions are deployed independently from API versions:

- **Mobile v1.0** (shipped): Uses API v1
- **Mobile v1.1** (shipped later): Uses API v1, adds UI for new v1 endpoints
- **Mobile v2.0** (shipped much later): Uses API v2 (breaking changes)

**Minimum supported API version**: 
- Mobile v1.0 supports API v1.0+
- Mobile v2.0 requires API v2.0+ (doesn't support v1)

### Admin Web App Versioning

Admin app (Next.js) is updated alongside API:

- **Admin v1.x** (deployed): Uses API v1, includes new admin UX for new v1 features
- **Admin v2.0** (deployed): Uses API v2 (when v2 launches)

### Version Pinning

When a mobile release or admin release ships:
- Pin the minimum API version it requires (in `package.json` or environment config)
- Example: Mobile app requires at least API v1.3.0

If a user is running an old mobile app and the API is upgraded, the API must continue supporting the old client's endpoints (backwards compatibility).

---

## Client-Side Adaptations

### For Mobile App

```ts
// Use generated OpenAPI client; it's backwards-compatible
import { defaultClient } from '@jp2/api-client';

// If endpoint was renamed:
// Old code still works
const prayers = await defaultClient.getPrayers();

// New code works too (in newer app version)
const prayers = await defaultClient.getPrayersByCategory();
```

### For Admin Web App

```ts
// Generated Next.js API routes proxy to backend
// If backend endpoint changes, regenerate client and update route handlers
```

---

## OpenAPI Schema Evolution

### Backwards-Compatible Changes

These changes require **only** a MINOR version bump and do not require client updates:

- ✅ Add a new optional field to response
- ✅ Add a new endpoint
- ✅ Deprecate (mark as deprecated, but keep working)
- ✅ Extend a string enum with a new value (if client ignores unknown values)
- ✅ Change response status code order (e.g., 201 Created → 200 OK for same semantic meaning)

### Breaking Changes

These require **MAJOR** version bump and deprecation period:

- ❌ Remove an endpoint
- ❌ Change response structure (e.g., flatten nested object)
- ❌ Rename an endpoint or field
- ❌ Change a required field to optional (or vice versa) without a compatible period
- ❌ Change error response format
- ❌ Change content-type (JSON → XML)

---

## Deprecation Header Details

All deprecated endpoints return an HTTP header:

```
Deprecation: true
Sunset: <RFC 7231 date of removal>
Link: <url-of-replacement>; rel="successor-version"
```

Example:
```
Deprecation: true
Sunset: Wed, 31 Dec 2025 00:00:00 GMT
Link: </v1/prayers/by-category>; rel="successor-version"
```

---

## Changelog and Communication

### API Changelog (Future)

After each release, update `docs/api/api-changelog.md` with:

```markdown
## v1.3.0 (Released June 1, 2026)

### New
- Added `GET /v1/prayers/by-category` endpoint

### Changed
- (none)

### Deprecated
- `GET /v1/prayers/legacy` (deprecated in v1.2, removed in v1.3)

### Fixed
- Fixed race condition in silent prayer counter

### Breaking Changes
- (none)

### Migration Guide
- If using `/v1/prayers/legacy`, migrate to `/v1/prayers` with category filter.
```

### Client Notifications

Before removing a deprecated endpoint:

1. Email to client developers: "Endpoint X deprecating; sunset date Y"
2. In-app banner (for admin web): "Your API client is out of date; update recommended"
3. Release notes: "Mobile v1.1 requires API v1.3+"

---

## FAQs

### Q: Can I use a deprecated endpoint in my client?

Yes, until the sunset date. Plan your update before the endpoint is removed.

### Q: What happens if my old mobile app tries to call a removed endpoint?

**Recommended**: API returns 410 Gone with a helpful error message directing them to upgrade.

Alternative: API maintains a v1 compatibility layer that proxies to v2 (more work; not planned for JP2).

### Q: How do I know when to update my client?

Check the `Deprecation` header in API responses and the OpenAPI spec. All deprecations are documented at least 6 months in advance.

### Q: Can I skip a major version?

No. If mobile v1.0 requires API v1.0, and API v2.0 is released, you must update mobile to a v2.x-compatible version. Skipping v2 is not supported.

---

## Version Support Matrix

| Mobile | Admin | API | Notes |
|--------|-------|-----|-------|
| v1.0 | v1.0 | v1.0+ | Initial release |
| v1.1 | v1.1 | v1.1+ | New features in v1.1 |
| v2.0 | v2.0 | v2.0+ | Major release (breaking changes) |

---

**Last Updated**: May 1, 2026
