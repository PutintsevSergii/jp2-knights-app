# Admin Content Publishing Flow

## Covers

18. Admin publishes prayer content.

| Item | Detail |
| --- | --- |
| Actor | Officer with content permission, Super Admin |
| Trigger | New prayer/content/event/silent prayer needs publication |
| Preconditions | Content text approved where required |
| Happy path | Admin creates draft, sets language/visibility, submits review, approved, published, visible to correct audience |
| Alternative paths | Archive draft; return to draft after review; super admin publishes directly if policy allows |
| Failure cases | Missing approval, missing visibility, `CHORAGIEW` without target, officer out of scope |
| Permissions | Role policy; super admin all |
| Data created/updated | Publishable content table, approval metadata, audit log |
| Acceptance criteria | Only published content reaches app users; pastoral/content approval marked where needed |

```mermaid
flowchart LR
  Draft --> Review --> Approved --> Published --> Archived
```

