# Seed Data

## Local Development Seed

Seed data grows with the implementation phase. The committed Phase 2 seed currently
covers only the identity and organization foundation needed for scope checks:

- one active Super Admin;
- one active Officer scoped to the pilot organization unit;
- two active organization units.

The full V1 local-development target is:

| Data          | Minimum                                                |
| ------------- | ------------------------------------------------------ |
| Super Admin   | 1 active user with `SUPER_ADMIN`                       |
| Organization unit | 2 units once Phase 2 officer scope tests exist      |
| Officer       | 1 user with `OFFICER` scoped to pilot organization unit |
| Brothers      | 2-5 sample brothers                                    |
| Candidate     | 1 candidate profile and 1 candidate request            |
| Prayers       | Public prayer, candidate prayer, brother prayer        |
| Events        | Public event, candidate event, brother/unit event       |
| Announcement  | One per audience: public/candidate/brother             |
| Roadmap       | Candidate roadmap and brother roadmap                  |
| Silent prayer | Public and brother sessions                            |

Local seed data must include at least two organization units for permission and visibility tests once officer scoping is implemented. A one-unit seed is acceptable only before Phase 2 scope tests exist. Later rows in the target table become required when their owning phase adds the corresponding schema and feature tests.

## Pilot Seed

Pilot seed should be created only from approved real data. It should include one pilot `CHORAGIEW` organization unit, one super admin, one officer, 5-20 brothers, 1-5 candidates, and representative public/private content.

## Approval Notes

Prayer text, official descriptions, candidate path wording, and formation roadmap content require Order approval or pastoral/content approval before production.
