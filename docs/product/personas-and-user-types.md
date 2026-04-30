# Personas and User Types

## V1 Roles

| Role | Authentication | Description | Primary needs |
| --- | --- | --- | --- |
| Guest | No | Public user, including interested people, wives, family members, invited public event visitors | Understand the Order, pray, discover events, submit interest |
| Candidate | Yes | Person interested in joining but not yet a brother | See onboarding path, relevant events, contact, candidate announcements |
| Brother | Yes | Member of the Order | See identity, chorągiew, events, prayers, announcements, formation roadmap |
| Officer | Yes, admin capable | Administrative user for one chorągiew | Manage local candidates, brothers, events, announcements, roadmap requests |
| Super Admin | Yes, admin capable | Global administrator | Manage all V1 data, visibility, officers, global content |

## Future Roles

These roles are extension points outside default V1. They may be proposed when there is a strong product, security, or architectural argument, but require human-owner approval and scope-doc updates before implementation.

| Future role | Possible V2 responsibility | V1 status |
| --- | --- | --- |
| Chaplain | Pastoral content review, prayer/formation input | Document only |
| Treasurer | Fees and payment records | Out of scope |
| Provincial | Regional oversight | Out of scope |
| Commander | Higher organization management | Out of scope |
| Generalate Admin | Global hierarchy administration | Out of scope |
| Wife / Family Member account | Family event participation and communications | Out of scope |

## Role Transition Model

```mermaid
flowchart LR
  Guest["Guest / Wife / Interested Person"] --> Interest["Interested Candidate Request"]
  Interest --> Candidate["Authenticated Candidate"]
  Candidate --> Brother["Brother"]
  Brother --> Officer["Officer assignment"]
```

Transitions are administrative decisions. The app must not automatically convert a candidate to brother or award degrees.
