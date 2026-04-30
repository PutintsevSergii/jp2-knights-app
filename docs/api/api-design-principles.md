# API Design Principles

## V1 API Style

Use REST with OpenAPI 3.1 for V1. Resource boundaries are clear, testable, long-lived, and easier for mobile/admin coding agents to implement in phases.

## Principles

- Public APIs return only public published content.
- Protected APIs require authentication, active status, role checks, and scope checks.
- Visibility filtering happens in backend services or repositories.
- List endpoints are paginated.
- List endpoints use stable sorting and documented filters.
- Validation errors use a common error contract.
- Critical admin mutations create audit logs.
- IDs in URLs must not bypass authorization.
- All request and response DTOs have runtime validation and generated TypeScript types.
- Public write endpoints use rate limiting and abuse protection.

## Common Request Rules

- Use JSON request/response bodies.
- Use ISO 8601 timestamps.
- Use stable enum strings documented in `/docs/data/database-design.md`.
- Use `request_id`/correlation id in logs and error responses.
- Use cursor pagination for high-growth feeds and page/pageSize only for small admin lists.
- Use idempotency keys for public candidate request creation and any future retryable mutation that could create duplicates.
