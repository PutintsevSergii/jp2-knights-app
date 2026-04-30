# Out of Scope for V1

The following are outside the default V1 scope. They may be proposed only when there is a strong product, security, or architectural argument, and they require explicit human-owner approval before implementation.

| Area | Excluded features |
| --- | --- |
| Payments | Fees, donations, payment history, treasurer workflows |
| Social | Chat, comments, likes, social feed, public rankings |
| Maps | Brother map, church map, mass time integrations, geocheck-ins |
| Analytics | Growth dashboards, conversion analytics, complex reports, authority exports |
| Hierarchy | Full Generalate/Province/Commandery hierarchy and approval chains |
| Formation | Automated degree awarding, advanced canonical/official validation, gamification, streaks |
| Documents | Electronic signatures, formal document repository, versioned official corpus |
| Media | Photo reports, galleries, live audio/video prayer |
| Family accounts | Wife/family login accounts and family communications |

## Rule for Agents

If a V1 feature seems to require one of the above, first try to simplify the feature and document the limitation. If simplification would materially weaken the product or architecture, ask the human owner for permission before coding.

An approved scope expansion must update:

- this file;
- [v1-scope.md](v1-scope.md);
- [v2-backlog.md](v2-backlog.md);
- [../traceability.md](../traceability.md);
- affected API, data, screen, delivery, and test docs.
