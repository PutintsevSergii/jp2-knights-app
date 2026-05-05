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
