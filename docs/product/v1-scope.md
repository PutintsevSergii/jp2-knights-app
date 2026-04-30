# V1 Scope

## V1 Capability Contract

V1 includes four modes:

| Mode | Included in V1 | Primary value |
| --- | --- | --- |
| Public Discovery | Yes | Discover the Order, read public prayers, view public/family events, submit interest |
| Candidate | Yes | Guided onboarding and candidate-visible content |
| Brother | Yes | Daily companion, profile, chorągiew, prayers, events, roadmap, silent prayer |
| Admin Lite | Yes | Manage V1 data and workflows without ERP complexity |

## In Scope

- public home;
- about the Order content;
- approved public content pages for About, FAQ, and candidate path wording;
- public prayer library;
- public and family-open events;
- public silent prayer counter;
- join interest request form with consent;
- candidate request review;
- candidate account and dashboard;
- candidate roadmap, events, announcements, and assigned contact;
- brother Today dashboard;
- brother profile and my chorągiew;
- brother prayer library, events, participation intent, announcements;
- formation roadmap and officer review;
- silent brother prayer;
- notification preferences and device tokens for authenticated users;
- Admin Lite for chorągwie, brothers, candidates, content, events, announcements, roadmap submissions, silent prayer;
- audit metadata and critical action logs;
- PostgreSQL, Redis, NestJS API, React Native mobile, Next.js admin, Nx monorepo.
- TypeScript strict mode, pnpm workspaces, Prisma migrations, OpenAPI contracts, and shared Zod validation schemas.

## V1 Limitations

- one simplified organization layer around chorągiew; no full Generalate/Province/Commandery hierarchy;
- participation intent only, not verified attendance;
- aggregate silent prayer counters only, not participant lists;
- basic content approval, not a complex editorial workflow;
- no payment, chat, feed, comments, social ranking, maps, geocheck-ins, analytics suite, or exports.

## Launch Target

The first release should be validated with one pilot chorągiew, one super admin, one officer, a small brother registry, several candidates, and representative public/private content.
