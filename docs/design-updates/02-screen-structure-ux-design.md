# Mobile App Screen Structure & UX Design
## JP2 Knights - Mobile Application

> **See also:** [Functional Requirements](../product/functional-requirements.md) | [Flows Documentation](../flows/) | [Visibility Model](../product/visibility-model.md)

**This document specifies the UX/UI design for each screen.** For functional specifications, acceptance criteria, and permission details, see [Functional Requirements](../product/functional-requirements.md).

**Screen → Requirement Mapping:** Each screen section includes the relevant FR (Functional Requirement) ID for cross-reference.

---

## Design System

### Color Palette (Based on Organization Branding & Current App)
- **Primary Blue:** `#1d4ed8` - Main action buttons, key navigation
- **Dark Text:** `#111827` - Body text, headlines
- **Muted Text:** `#4b5563` - Secondary information, placeholders
- **Light Background:** `#f8fafc` - App background, subtle sections
- **White Surface:** `#ffffff` - Cards, modals, content surfaces
- **Border Gray:** `#d1d5db` - Dividers, subtle separations
- **Success Green:** `#15803d` - Confirmation, positive states
- **Warning Orange:** `#a16207` - Caution, pending states
- **Danger Red:** `#b91c1c` - Error, danger states

### Typography
- **Headlines:** Bold, Dark Text (#111827)
- **Body:** Regular, Dark Text (#111827)
- **Secondary:** Regular, Muted Text (#4b5563)
- **Spacing:** 4px, 8px, 12px, 16px, 24px, 32px increments
- **Border Radius:** 4px (small), 8px (medium)

### Navigation Pattern
- **Bottom Tab Navigation** - Accessible, mobile-first
- **Breadcrumbs** - For deep navigation paths
- **Back Button** - Native gesture + visual button
- **Header Consistency** - Clear titles, action buttons aligned right

---

## Application Structure

```
JP2 Knights Mobile App
├── Public/Unauthenticated
├── Candidate Module
├── Brother Module
├── Officer Management Module
└── Admin Panel
```

---

## Global Navigation & Shared Screens

### 1. **Authentication Flow**

#### Screen: Sign In
- **Requirement:** [FR-AUTH-001](../product/functional-requirements.md) - Firebase Sign-In Idle Approval
- **Purpose:** User authentication
- **Type:** Modal/Full Screen
- **Elements:**
  - App logo/header
  - Email input field
  - Password input field
  - Sign-in button (Primary Blue)
  - "Forgot Password" link
  - "Create Account" link (if applicable)
- **States:** Default, Loading, Error, Success
- **Navigation:** → Candidate/Brother Dashboard (based on role)

#### Screen: Candidate Request Form
- **Requirement:** [FR-CANDIDATE-REQ-001](../product/functional-requirements.md) - Join Interest Request
- **Purpose:** Submit application to join the Order
- **Type:** Multi-step form
- **Elements:**
  - Step indicator (1/3, 2/3, 3/3)
  - Personal Information (Name, Email, Phone)
  - Motivation/Interest section
  - Organization Unit selection
  - Confirmation & submission
- **States:** In Progress, Submitted, Error
- **Navigation:** → Confirmation screen → Public screen

#### Screen: Account Approval Pending
- **Purpose:** Show status when account awaits officer approval
- **Type:** State screen
- **Elements:**
  - Status icon (hourglass/pending)
  - Message: "Your account is awaiting officer approval"
  - Timeline: Submitted date, expected review period
  - Contact information for officer
  - Retry/refresh button
- **States:** Waiting, Contacted, Ready
- **Navigation:** → Dashboard (once approved)

---

## Candidate Module (Public Candidate)

### Navigation Structure
```
Candidate Dashboard
├── Next Step/Recommendation
├── Local Assignment
├── Responsible Officer
├── Upcoming Events
└── Announcements

Events
├── Event List
└── Event Detail

Announcements
├── Announcement List
└── Announcement Detail

Contact (Officer)
├── Officer Profile
└── Contact Form
```

### 2. **Candidate Dashboard Screen**
- **Requirement:** [FR-CANDIDATE-001](../product/functional-requirements.md) - Candidate Dashboard
- **Purpose:** Entry point for candidate journey
- **Type:** Hub/Dashboard
- **Key Sections:**
  - **Welcome Card**: "Candidate Dashboard" + name + assigned unit
  - **Next Step Section**: 
    - Large action card with next recommendation
    - Icon + Label + Description
    - CTA button (e.g., "View Events", "Complete Profile")
  - **Local Assignment**:
    - Organization unit card with location
    - City, Country, Parish information
    - Link to unit details
  - **Responsible Officer**:
    - Officer profile card
    - Name, email, contact button
  - **Upcoming Events**:
    - 3-event carousel/list
    - Scrollable if more than 3
    - Event title, date, location
  - **Announcements**:
    - Latest 2-3 announcements
    - Pinned announcements highlighted
    - Date, title, body preview
- **Navigation:** Events, Announcements, Contact
- **Actions:** View all events, View all announcements, Contact officer

### 3. **Candidate Events List Screen**
- **Requirement:** [FR-CANDIDATE-002](../product/functional-requirements.md) - Candidate Events
- **Purpose:** Discover and manage event participation
- **Type:** List with filters
- **Header:** "Candidate Events" (count badge)
- **Elements:**
  - **Filter Bar** (optional): Show upcoming/past
  - **Event Cards** (repeating):
    - Date & time (formatted: "Jan 15, 2026 - 14:30")
    - Location label
    - Event title
    - Status indicator (not attending / planning to attend)
  - **Empty State**: "No candidate-visible events are listed yet."
- **Navigation:** Tap card → Event Detail, Candidates tab → Dashboard
- **Actions:** Open event, filter, refresh

### 4. **Candidate Event Detail Screen**
- **Requirement:** [FR-EVENT-003](../product/functional-requirements.md) - Event Participation Intent
- **Purpose:** View detailed event information and manage participation
- **Type:** Detail view with actions
- **Header:** Event title + back button
- **Sections:**
  - **Event Summary**:
    - Type badge (e.g., "Formation", "Social", "Prayer")
    - Date & time (large, formatted)
    - Location with map icon (if available)
  - **Description**:
    - Full event description
    - Duration, capacity (if applicable)
  - **Participation**:
    - Current status: "You are planning to attend" / "You have not marked attendance"
    - Action button: "Plan to attend" / "Cancel intent"
  - **Additional Info** (if available):
    - Organizer details
    - Contact information
- **Navigation:** Back → Events List, Dashboard
- **Actions:** Plan to attend, Cancel intent, Share event (optional)

### 5. **Candidate Announcements List Screen**
- **Requirement:** [FR-CANDIDATE-003](../product/functional-requirements.md) - Candidate Announcements
- **Purpose:** View all candidate-targeted announcements
- **Type:** List view
- **Header:** "Candidate Announcements" (count badge)
- **Elements:**
  - **Announcement Cards**:
    - Pinned badge (if applicable)
    - Title (bold)
    - Publish date & time
    - Body preview (2-3 lines)
    - Read indicator
  - **Empty State**: "No candidate announcements are listed yet."
- **Navigation:** Tap card → Full announcement, Dashboard
- **Actions:** Read announcement, filter (optional)

### 6. **Candidate Announcements Detail Screen**
- **Purpose:** Read full announcement
- **Type:** Full content view
- **Header:** Announcement title + date
- **Content:**
  - Full body text
  - Attachments (if any)
  - Publish date/time
- **Navigation:** Back → Announcements List, Dashboard
- **Actions:** Share, Mark as read

### 7. **Contact Officer Screen** (Candidate)
- **Purpose:** Reach out to assigned responsible officer
- **Type:** Contact/Message form
- **Sections:**
  - **Officer Card**:
    - Officer name (linked from dashboard)
    - Email address
    - Phone (if available)
    - Role/title
  - **Contact Form**:
    - Subject field
    - Message field (multi-line textarea)
    - Attach file button (optional)
    - Send button
  - **Alternative Links**:
    - "Email directly" (opens email app)
    - "Call" (if phone available)
- **Navigation:** Back → Dashboard
- **States:** Draft, Sending, Sent, Error
- **Actions:** Send message, cancel

---

## Brother Module (Full Member)

### Navigation Structure
```
Brother Today
├── Quick Summary
├── Upcoming Events
├── Organization Units
└── Cards/Quick Actions

Brother Profile
├── Personal Details
├── Memberships & Degrees
└── Contact Information

My Choragiew (Organization Units)
├── Unit List
└── Unit Details

Brother Events
├── Event List
└── Event Detail

Brother Announcements
├── Announcement List
└── Announcement Detail

Silent Prayer
└── Prayer Interface
```

### 8. **Brother Today Screen** (Dashboard)
- **Requirement:** [FR-BROTHER-001](../product/functional-requirements.md) - Brother Today Dashboard
- **Purpose:** Daily summary and quick access to key information
- **Type:** Personalized Dashboard
- **Header:** "Brother Today" + greeting
- **Key Sections:**
  - **Profile Summary Card**:
    - Brother name (large)
    - Current knight degree
    - Assigned organization unit (Choragiew)
  - **Action Cards** (horizontal scroll):
    - "My Profile" card
    - "My Choragiew" card
    - "Events" card
    - "Announcements" card
    - Each with icon, label, and link
  - **Upcoming Events**:
    - Title: "Upcoming Events"
    - 3-event list
    - Each: Date, time, location, title
    - "View all events" link
  - **Organization Units**:
    - List of assigned Choragiews
    - Unit name, location (city, country), parish
    - "View all units" link
- **Navigation:** Profile, Events, Announcements, Units, Prayers
- **Actions:** Tap card to navigate, refresh

### 9. **Brother Profile Screen**
- **Requirement:** [FR-BROTHER-002](../product/functional-requirements.md) - Brother Profile
- **Purpose:** View and manage personal profile information
- **Type:** Profile detail view
- **Header:** "Brother Profile" + edit button
- **Sections:**
  - **Display Info**:
    - Name (large, bold)
    - Email
  - **Contact Information**:
    - Phone (if available)
    - Preferred language
    - "Edit" button to modify
  - **Memberships**:
    - Card per membership:
      - Organization unit name (linked)
      - Current knight degree
      - Join date (if recorded)
      - Status badge (active/inactive)
  - **Empty State** (for memberships):
    - "No memberships recorded yet"
- **Navigation:** Back → Brother Today, My Choragiew
- **Actions:** Edit profile, manage memberships

### 10. **My Choragiew Screen** (Organization Units)
- **Requirement:** [FR-ORG-001](../product/functional-requirements.md) - My Chorągiew
- **Purpose:** View all assigned local organization units
- **Type:** List view
- **Header:** "My Choragiew" (count badge)
- **Elements:**
  - **Unit Cards** (repeating):
    - Unit name (bold, large)
    - Location: "City, Country"
    - Parish (if available)
    - Public description (preview)
    - Status indicator
  - **Empty State**: "No active organization unit assigned to brother profile."
- **Navigation:** Tap card → Unit Details, Back → Brother Today
- **Actions:** View unit details, contact unit officer

### 11. **Organization Unit Detail Screen**
- **Purpose:** View details of specific Choragiew/unit
- **Type:** Detail view
- **Header:** Unit name + back button
- **Sections:**
  - **Unit Summary**:
    - Full name (heading)
    - Location (city, country, map icon)
    - Parish (if available)
    - Type (Choragiew, Commandery, etc.)
  - **Description**:
    - Public description (full text)
  - **Officer Information**:
    - Unit commander/leader
    - Contact info
  - **Member List** (visibility-based):
    - Count of members
    - Link to member list (if permitted)
  - **Upcoming Events**:
    - Events in this unit
    - List with dates
- **Navigation:** Back → My Choragiew, Back → Brother Today
- **Actions:** View events, contact officer, view members (if permitted)

### 12. **Brother Events List Screen**
- **Requirement:** [FR-EVENT-002](../product/functional-requirements.md) - Brother Events
- **Purpose:** Browse all brother-visible events
- **Type:** List with filtering
- **Header:** "Brother Events" (count badge)
- **Elements:**
  - **Filter Bar** (optional):
    - Upcoming/Past toggle
    - Organization unit filter
  - **Event Cards**:
    - Date & time (formatted)
    - Location with icon
    - Event title
    - Participation status indicator
  - **Empty State**: "No brother-visible events are listed yet."
- **Navigation:** Tap card → Event Detail, Back → Brother Today
- **Actions:** Open event, filter, search

### 13. **Brother Event Detail Screen**
- **Purpose:** View detailed event and manage participation
- **Type:** Detail with rich information
- **Header:** Event title + back button
- **Sections:**
  - **Event Header**:
    - Event type badge
    - Large date/time display
    - Location with address/icon
  - **Description**:
    - Full event description
    - Duration details
  - **Participation Section**:
    - Status: "You are planning to attend" / "You have not marked attendance"
    - Large action button: "Plan to attend" / "Cancel intent"
  - **Organizer Information**:
    - Organizing unit
    - Contact person
    - Contact email/phone
  - **Attendees** (optional):
    - Count of confirmed attendees
    - List of attendees (if visibility permits)
- **Navigation:** Back → Events, Back → Brother Today
- **Actions:** Plan to attend, Cancel, Share event

### 14. **Brother Announcements List Screen**
- **Requirement:** [FR-ANN-001](../product/functional-requirements.md) - Brother Announcements
- **Purpose:** View all brother-targeted announcements
- **Type:** List view
- **Header:** "Brother Announcements" (count badge)
- **Elements:**
  - **Announcement Cards**:
    - Pinned badge (if pinned)
    - Title (bold)
    - Publish date & time (muted)
    - Body preview (2-3 lines)
    - Unread indicator (blue dot)
  - **Empty State**: "No brother-visible announcements are listed yet."
- **Navigation:** Tap card → Full announcement, Back → Brother Today
- **Actions:** Read, mark as read, filter (optional)

### 15. **Brother Announcements Detail Screen**
- **Purpose:** Read full announcement
- **Type:** Full content view
- **Header:** Announcement title + back button
- **Content:**
  - Announcement title (large, bold)
  - Publish date & time (muted)
  - Full body text (formatted)
  - Attachments/links (if any)
  - Optional: Pinned indicator
- **Navigation:** Back → Announcements, Back → Brother Today
- **Actions:** Share, save (optional), mark as unread

### 16. **Silent Prayer Screen** (New/Enhancement)
- **Purpose:** Dedicated prayer space
- **Type:** Immersive, minimal design
- **Elements:**
  - **Minimal UI**:
    - Background image or solid color
    - Subtle timer (optional)
    - "Back" button (bottom or corner)
  - **Prayer Prompts** (rotating):
    - Daily devotion
    - Intention of the day
    - Patron saint reflection
  - **Audio** (optional):
    - Ambient music or guided meditation
    - Play/pause controls
- **Navigation:** Back → Brother Today
- **Actions:** Start timer, play/pause audio, return

---

## Officer Management Module

### Navigation Structure
```
Officer Dashboard
├── Pending Approvals
├── Candidate Management
├── Members
└── Content Management

Candidate Management
├── Candidate Requests
├── Active Candidates
└── Candidate Detail

Event Management
├── Create Event
├── Event List
└── Event Detail (Edit)

Announcement Management
├── Create Announcement
├── Announcement List
└── Announcement Detail (Edit)

Unit Management
├── Unit Overview
├── Member Management
└── Officer Team
```

### 17. **Officer Dashboard**
- **Requirement:** [FR-ADMIN-002](../product/functional-requirements.md) - Admin Lite Dashboard
- **Purpose:** Management hub for officer responsibilities
- **Type:** Dashboard with key metrics
- **Sections:**
  - **Quick Stats**:
    - Pending candidate approvals (badge)
    - Active candidates (count)
    - Upcoming events (count)
    - Pending announcements (count)
  - **Pending Items** (action section):
    - Candidate requests awaiting review
    - Events awaiting approval
    - Announcements in draft/review
  - **Quick Actions** (button grid):
    - "Review Candidates"
    - "Create Event"
    - "Post Announcement"
    - "Manage Members"
- **Navigation:** Candidate Management, Events, Announcements, Members
- **Actions:** Quick access to management areas

### 18. **Candidate Requests List Screen** (Officer)
- **Requirement:** [FR-ADMIN-001](../product/functional-requirements.md) - Candidate Request Management
- **Purpose:** Review and manage candidate applications
- **Type:** List with status filters
- **Header:** "Candidate Requests" (count by status)
- **Filter Options**:
  - New, Contacted, Invited, Rejected, Converted to Candidate
- **Request Cards**:
  - Candidate name
  - Request status
  - Submitted date
  - Action buttons: View, Contact, Approve, Reject
- **Navigation:** Tap request → Detail view
- **Actions:** Filter, bulk actions (optional)

### 19. **Candidate Request Detail Screen** (Officer)
- **Purpose:** Review candidate application and take action
- **Type:** Detail with action buttons
- **Sections:**
  - **Candidate Information**:
    - Name, email, phone
    - Preferred language
    - Requested organization unit
  - **Motivation/Application**:
    - Why they want to join
    - Background/interests
  - **Status Timeline**:
    - Submitted date
    - Last contacted date
    - Current status
  - **Action Buttons**:
    - "Contact Candidate" (send message)
    - "Send Invitation" (formal invite)
    - "Approve & Convert" (move to active candidate)
    - "Reject" (with reason)
- **Navigation:** Back → Candidate Requests
- **Actions:** Send message, approve, reject, convert

### 20. **Create Event Screen** (Officer)
- **Requirement:** [FR-ADMIN-005](../product/functional-requirements.md) - Event Management
- **Purpose:** Create and schedule events
- **Type:** Form
- **Form Fields**:
  - Event title
  - Event type (Formation, Social, Prayer, Other)
  - Description
  - Start date & time
  - End date & time (optional)
  - Location/address
  - Visibility (Candidate, Brother, Organization Unit, Officer)
  - Organizer unit
  - Capacity (optional)
  - Attachment button
- **Actions**: Save as Draft, Submit for Approval, Publish (if authorized)
- **Navigation:** Back → Event Management
- **States:** Unsaved changes warning

### 21. **Event Management List Screen** (Officer)
- **Purpose:** View and manage created events
- **Type:** List with status tabs
- **Tabs**: All, Draft, Review, Approved, Published, Archived
- **Event Cards**:
  - Event title
  - Status badge
  - Date/time
  - Visibility indicator
  - Action buttons: Edit, Delete, Publish, Archive
- **Navigation:** Tap → Edit screen
- **Actions:** Filter, search, bulk actions

### 22. **Create Announcement Screen** (Officer)
- **Requirement:** [FR-ADMIN-006](../product/functional-requirements.md) - Announcement Management
- **Purpose:** Create and schedule announcements
- **Type:** Form
- **Form Fields**:
  - Title
  - Body (rich text editor)
  - Visibility (Candidate, Brother, Officer, Admin)
  - Pin/Feature toggle
  - Publication date & time (scheduled)
  - Attachment button
  - Preview
- **Actions**: Save as Draft, Submit for Approval, Publish (if authorized)
- **Navigation:** Back → Announcement Management
- **States:** Rich text formatting toolbar, preview mode

### 23. **Announcement Management List Screen** (Officer)
- **Purpose:** View and manage announcements
- **Type:** List with status tabs
- **Tabs**: All, Draft, Review, Approved, Published, Archived
- **Announcement Cards**:
  - Title
  - Status badge
  - Publication date
  - Visibility indicator
  - Pinned indicator (if pinned)
  - Action buttons: Edit, Delete, Publish, Archive
- **Navigation:** Tap → Edit screen
- **Actions:** Filter, search, reorder (if pinned)

---

## Admin Panel (Simplified Mobile + Web)

### Admin Dashboard
- **System Statistics**: Total users, total events, system health
- **Recent Activity**: Latest user actions, content changes
- **Quick Actions**: User management, system settings, reports
- **Alerts**: Pending approvals, system alerts

### User Management
- **User List**: Search, filter by role
- **User Detail**: View/edit user info, change role, disable account
- **Role Management**: Assign permissions

### Organization Management
- **Unit Management**: Create/edit units, manage hierarchy
- **Officer Assignment**: Assign officers to units
- **Analytics**: Activity reports, member statistics

---

## Key Design Principles

### 1. **Progressive Disclosure**
- Dashboard shows essential info
- Links to detailed views for deeper content
- Hidden complexity behind expandable sections

### 2. **Clear Call-to-Action**
- Primary action in Primary Blue (#1d4ed8)
- Secondary actions in text links
- Consistent button sizing and placement

### 3. **Status Indicators**
- Status badges (Draft, Approved, Pinned)
- Color-coded states (Success/Warning/Danger)
- Count badges on navigation items

### 4. **Accessibility**
- Sufficient color contrast
- Semantic HTML structure
- Touch targets minimum 44x44px
- Clear labels on all inputs

### 5. **Offline Support** (State Indicator)
- Reconnect banner when offline
- Cached content available
- Retry actions when connection restored

### 6. **Mobile-First Design**
- Bottom navigation (5 main areas max)
- Swipeable content (events, announcements)
- Minimal horizontal scrolling
- Full-width content cards

### 7. **Responsive Layout**
- Tablet support: Grid layout (2 columns where appropriate)
- Desktop support: Wider layouts, sidebar navigation
- Breakpoint: 768px for tablet, 1024px for desktop

---

## Navigation Patterns

### Role-Based Tab Navigation

**Public/Unauthenticated:**
1. Home
2. Become a Candidate
3. About
4. Contact
5. Settings

**Candidate (Bottom Tabs):**
1. Dashboard
2. Events
3. Announcements
4. Contact Officer
5. Profile

**Brother (Bottom Tabs):**
1. Brother Today
2. Events
3. Announcements
4. My Choragiew
5. Profile

**Officer (Bottom Tabs):**
1. Dashboard
2. Candidates
3. Events
4. Announcements
5. Members

**Admin (Web + Mobile):**
- Dashboard
- Users
- Organization
- Content
- Analytics
- Settings

---

## Interaction Patterns

### List to Detail Navigation
- Tap item → Full detail view
- Back button returns to list
- Preserves scroll position (nice-to-have)

### Modal Dialogs
- Confirmation dialogs for destructive actions
- Message compose modals
- Settings/filter modals

### Empty States
- Clear icon + message explaining why empty
- Suggested next steps or CTAs
- Link back to main navigation

### Loading States
- Loading spinner (centered)
- Skeleton screens for card lists
- "Refresh" button available

### Error States
- Error icon + descriptive message
- Suggested action (Retry, Go Back)
- Contact support option for critical errors

### Success Confirmation
- Success icon + confirmation message
- Auto-dismiss after 2-3 seconds
- or Manual dismiss button

