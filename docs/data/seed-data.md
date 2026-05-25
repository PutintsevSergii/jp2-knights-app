# Seed Data

## Local Development Seed

Seed data grows with the implementation phase. The committed seed currently
covers the identity and organization foundation needed for scope checks plus the
Phase 3 public About content fallback, Phase 4 public content fixtures, the
Phase 5/6 Idle access review fixture, and the first Phase 7 candidate
request/profile fixtures, Phase 9 announcement fixtures, and the first Phase
10B roadmap fixtures:

- one active Super Admin;
- two active Officers, each scoped to a different organization unit;
- two active Brothers, one scoped to the pilot organization unit and one scoped to the second organization unit;
- one inactive Brother fixture with an inactive membership for lifecycle checks;
- local Firebase-provider identity links for `demo-admin`, `demo-officer`, `demo-candidate`, and `demo-brother`;
- one scoped identity access approver assignment for the demo officer;
- one pending `identity_access_reviews` fixture for `idle-review@example.test`;
- two active organization units.
- one published `PUBLIC` `about-order` content page for local development.
- one published `PUBLIC` prayer category and prayer.
- one published `BROTHER` prayer fixture that must remain hidden from public reads.
- one published `PUBLIC` event fixture.
- one published `BROTHER` event fixture that must remain hidden from public reads.
- one published `CANDIDATE` announcement fixture.
- one published `BROTHER` announcement fixture that must remain hidden from candidates.
- two active candidate profiles assigned to different organization units.
- one `new` candidate request assigned to the pilot organization unit with consent metadata and an idempotency key.
- one published candidate onboarding roadmap assigned to candidates in both organization units.
- one published brother formation roadmap assigned to brothers in both organization units.
- one pending brother roadmap submission fixture for scoped officer review in the pilot organization unit.
- one rejected brother roadmap submission fixture in the second organization unit for resubmission-path demos.
- one archived roadmap assignment/submission fixture tied to an inactive brother; it must stay outside active reads and review queues.
- draft and archived roadmap definition fixtures for Admin Lite configuration-state inspection.

The full V1 local-development target is:

| Data              | Minimum                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Super Admin       | 1 active user with `SUPER_ADMIN`                                                                            |
| Organization unit | 2 units once Phase 2 officer scope tests exist                                                              |
| Officer           | 2 users with `OFFICER`, each scoped to a different organization unit                                        |
| Identity review   | 1 pending Idle review and 1 scoped approver assignment                                                      |
| Brothers          | 2-5 sample brothers, plus inactive/archived lifecycle fixtures                                              |
| Candidate         | 2 candidate profiles across organization units and 1 candidate request                                      |
| Prayers           | Public prayer, candidate prayer, brother prayer                                                             |
| Events            | Public event, candidate event, brother/unit event                                                           |
| Announcement      | One per audience: public/candidate/brother                                                                  |
| Roadmap           | Candidate and brother roadmaps across two organization units, plus pending/rejected/archived/draft fixtures |
| Silent prayer     | Public and brother sessions                                                                                 |

Local seed data must include at least two organization units for permission and visibility tests once officer scoping is implemented. A one-unit seed is acceptable only before Phase 2 scope tests exist. Later rows in the target table become required when their owning phase adds the corresponding schema and feature tests.

## Pilot Seed

Pilot seed should be created only from approved real data. It should include one pilot `CHORAGIEW` organization unit, one super admin, one officer, 5-20 brothers, 1-5 candidates, and representative public/private content.

## Approval Notes

Prayer text, official descriptions, candidate path wording, and formation roadmap content require Order approval or pastoral/content approval before production.
