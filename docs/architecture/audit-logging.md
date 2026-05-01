# Audit Logging

## Purpose

Audit logs provide traceability for critical administrative changes without becoming analytics or surveillance.

## Events to Audit

- user created/deactivated;
- role assigned/removed;
- status changed;
- degree changed;
- organization-unit assignment changed;
- officer assignment changed;
- candidate request status changed;
- roadmap submission approved/rejected;
- event published/cancelled;
- announcement published;
- prayer published;
- visibility changed.

## Audit Fields

| Field | Meaning |
| --- | --- |
| `id` | Audit identifier |
| `actor_user_id` | Admin/system actor |
| `action` | Machine-readable action |
| `entity_type` | Target entity type |
| `entity_id` | Target entity id |
| `scope_organization_unit_id` | Scope if applicable |
| `before_summary` | JSON summary of previous critical values |
| `after_summary` | JSON summary of new critical values |
| `request_id` | Request correlation id |
| `ip_address` | Optional admin IP metadata |
| `created_at` | Timestamp |

## Rules

Audit logs should be append-only. If redaction is legally required, redact sensitive JSON summaries while preserving the event existence.
