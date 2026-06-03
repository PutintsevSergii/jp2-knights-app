# Mobile Candidate Screens

| Screen                                 | Route                    | Purpose                  | Visible data                              | Primary actions                     | States                               | Restrictions           |
| -------------------------------------- | ------------------------ | ------------------------ | ----------------------------------------- | ----------------------------------- | ------------------------------------ | ---------------------- |
| Candidate Dashboard                    | `CandidateDashboard`     | Orient candidate         | next step, contact, events, announcements | open roadmap/contact/event          | no assignment state                  | Candidate only         |
| Candidate Roadmap                      | `CandidateRoadmap`       | Show onboarding path     | stages/steps/status                       | open step                           | no roadmap state                     | Own roadmap only       |
| Candidate Roadmap Step Detail          | `CandidateRoadmapStep`   | Explain one step         | title, description, status                | none in default V1                  | pending/review state if set by admin | No brother roadmap     |
| Candidate Events                       | `CandidateEvents`        | Candidate-visible events | public/family/candidate events            | open event/mark interest if allowed | empty event state                    | No brother-only events |
| Candidate Announcements                | `CandidateAnnouncements` | Candidate messages       | announcements                             | open detail                         | empty state                          | Candidate/public only  |
| Candidate Contact / Assigned Chorągiew | `CandidateContact`       | Show responsible contact | chorągiew, officer contact fields         | contact officer if configured       | unassigned state                     | Assigned data only     |

## Candidate Screen Rules

- Candidate screens must not include brother profile links.
- Candidate mode should guide calmly and avoid pressure language.
- Candidate data and roadmap history are private to candidate and scoped officers.
- The current Candidate Dashboard foundation renders the `GET /candidate/dashboard`
  payload with assignment/contact, next-step, events, empty announcements, demo
  fallback, and ready/empty/loading/error/offline/forbidden states.
- The current Candidate Events foundation renders a dedicated Gold/Grey
  `CandidateEventsScreen` over `GET /candidate/events`, with list-level own RSVP
  state for badges/actions, event detail navigation, and candidate participation
  mutation clients. `CandidateEventDetail` still uses the shared private detail
  renderer. Candidate event screens show only candidate-visible events, own
  intent state, plan/cancel action metadata, and
  ready/empty/loading/error/offline/forbidden/idle-approval states.
- The current Candidate Roadmap foundation renders an API/demo screen model over
  `GET /candidate/roadmap`. It validates the assigned-roadmap DTO, handles
  ready/empty/loading/error/offline/forbidden/idle-approval states, renders
  assigned stages/steps/status from the current user's roadmap only, and keeps
  candidate roadmap read-only with no submission action.
- The current Candidate Announcements foundation renders an API/demo
  `CandidateAnnouncements` screen model over `GET /candidate/announcements`.
  It validates the shared DTO, handles ready/empty/loading/error/offline/
  forbidden/idle-approval states, and renders one-way candidate-visible message
  bodies without brother-only content, comments, replies, read receipts, or push
  delivery state.

## Next Main-Screen Redesign Plan

The next Stitch design pass should make `CandidateDashboard` answer "what
should I do next?" immediately. Prioritize:

- personalized greeting and candidate status;
- today's civil date and liturgical day/season/rank/color;
- one dominant next formation action from the dashboard/roadmap model;
- assigned choragiew/unit summary;
- responsible officer contact with email/phone actions only when configured;
- candidate-visible event preview with the current user's own RSVP state only;
- one-way announcement preview;
- quick actions for Roadmap, Events, Contact, and Announcements;
- bottom tabs: Home, Roadmap, Events, Contact, Profile.

The redesign must not expose brother-only events, brother profile data,
candidate roadmap history belonging to anyone else, admin notes, rosters, chat,
comments, read receipts, or push delivery analytics.
