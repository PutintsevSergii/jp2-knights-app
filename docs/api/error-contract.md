# Error Contract

## Shape

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource.",
    "details": [],
    "requestId": "req_123",
    "timestamp": "2026-04-29T12:00:00Z"
  }
}
```

## Common Codes

| HTTP | Code                   | Use                                     |
| ---- | ---------------------- | --------------------------------------- |
| 400  | `VALIDATION_ERROR`     | Invalid request body/query              |
| 401  | `UNAUTHORIZED`         | Invalid/expired provider credential     |
| 403  | `FORBIDDEN`            | Missing session or role/scope/visibility denied |
| 403  | `IDLE_APPROVAL_REQUIRED` | Firebase-authenticated identity is awaiting, rejected, or expired for local access approval |
| 404  | `NOT_FOUND`            | Resource missing or not visible to user |
| 409  | `CONFLICT`             | Duplicate or invalid state transition   |
| 429  | `RATE_LIMITED`         | Public write or retry limit exceeded    |
| 422  | `BUSINESS_RULE_FAILED` | Valid shape but violates domain rule    |
| 500  | `INTERNAL_ERROR`       | Unexpected server error                 |

## Rule

For private resources, the API may return 404 instead of 403 when revealing existence would leak data.

Idle Firebase identities remain public-only. Protected Candidate, Brother, and
Admin Lite APIs return `IDLE_APPROVAL_REQUIRED` without returning protected
payloads so clients can show approval guidance while public content remains
available.
