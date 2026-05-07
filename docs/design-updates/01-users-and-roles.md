# Users and Roles - JP2 Knights Mobile Application

> **See also:** [Personas and User Types](../product/personas-and-user-types.md) | [Roles and Permissions](../product/roles-and-permissions.md) | [Visibility Model](../product/visibility-model.md)

## Organization Overview
The Order of Knights of St. John Paul II the Great is a Catholic men's organization focused on forming lay Catholic men through spiritual and practical works. The application supports the organizational hierarchy and member progression within the Order.

**Note:** This document focuses on **design-specific role definitions and UI/UX implications**. For complete functional and permission specifications, see the existing product documentation linked above.

## User Types and Access Levels

### 1. **Public User** (Unauthenticated)
**Description:** Visitor to the application without an account
- **Access:** Public information, candidate request form
- **Functionality:**
  - View public website information
  - Submit candidate request form
  - View order information and mission
  - Access contact information

---

### 2. **Candidate**
**Description:** Person in the formation/onboarding process to become a full brother member
- **Status:** `CANDIDATE` role
- **Profile Status:** Active, Paused, Converted to Brother, Archived
- **Access Level:** Candidate-specific views and limited content
- **Functionality:**
  - View candidate dashboard with personalized guidance
  - Access "next step" recommendations for progression
  - View assigned responsible officer (mentor/guide)
  - View assigned local organization unit (Choragiew)
  - Register for and view candidate-visible events
  - View candidate-visible announcements
  - Manage event participation (planning to attend/cancel)
  - View candidate-specific roadmap and formation materials
  - Receive push notifications for events and announcements
  - Update profile contact information (phone, preferred language)

**Candidate Progression States:**
- `new` → Initial request submission
- `contacted` → Officer has contacted candidate
- `invited` → Candidate has been invited to join
- `rejected` → Application was rejected
- `converted_to_candidate` → Request accepted, now active candidate

---

### 3. **Brother**
**Description:** Full member of the Order who has completed candidacy
- **Role:** `BROTHER`
- **Membership Status:** Active, Inactive, Archived
- **Knight Degrees:** 
  - Knight of Faith
  - Knight of Mercy
  - Knight of Solidarity
  - Knight of Our Lady (Patriotic)
- **Access Level:** Brother-specific views and broader content visibility
- **Functionality:**
  - View "Brother Today" dashboard with daily summary
  - Access full brother profile with membership history
  - View all "My Choragiew" (assigned organization units)
  - Register for and view brother-visible events
  - View detailed event information with location and timing
  - View brother-visible announcements (with pin/featured support)
  - Manage event participation with detailed tracking
  - Access "Silent Prayer" section for spiritual practices
  - View organization hierarchy and unit information
  - Receive push notifications for brother-specific content
  - Access full profile including contact details and memberships
  - View current knight degree and join dates
  - Manage organization unit assignments

---

### 4. **Wife/Family Member of Brother** (Future Enhancement)
**Description:** Family members (particularly wives) of brother members
- **Role:** `FAMILY_MEMBER` (proposed)
- **Profile Status:** Active, Archived
- **Access Level:** Limited to family-related information
- **Proposed Functionality:**
  - View limited announcements (family-focused)
  - View family member-specific events
  - Receive notifications about family gatherings
  - Access family member contact directory (optional)
  - View spouse's organization unit information
  - Manage family event participation

---

### 5. **Officer**
**Description:** Leadership member responsible for organization unit management and candidate approval
- **Role:** `OFFICER`
- **Officer Types:**
  - Ceremonial Master
  - Guardian
  - Unit Commander
  - Chaplain (Spiritual advisor)
  - Provincial Commander
  - General (Head of Order)
- **Access Level:** Leadership dashboard with management capabilities
- **Functionality:**
  - View and manage candidates in assigned organization unit
  - Approve/reject candidate applications
  - Contact candidates and send invitations
  - Track candidate progress and conversion
  - Manage brother members and memberships
  - Create and manage events
  - Post announcements (with visibility controls)
  - Manage organization unit information
  - View member lists (visibility-based)
  - Approve event participation
  - View organization analytics and reports
  - Manage officer team members
  - Access approval workflows for pending items

---

### 6. **Super Admin**
**Description:** System administrator with full application access
- **Role:** `SUPER_ADMIN`
- **Access Level:** Complete system management
- **Functionality:**
  - All officer capabilities plus:
  - Manage all organization units (global)
  - Manage all users across organization
  - Create and archive organization units
  - View complete activity logs
  - System configuration and settings
  - User role and permission management
  - Content moderation and approval
  - System health and analytics
  - Database and data management

---

## User Status Lifecycle

### Profile Status Flow
```
Created (by officer/request)
    ↓
Active ← → Inactive (paused activity)
    ↓
Converted to Brother (candidate → brother)
    ↓
Archived (no longer active)
```

### Candidate Conversion States
```
Candidate Profile Status: Active
    → Event participation
    → Announcement access
    → Officer guidance
    ↓
Membership created as BROTHER
    ↓
Brother Profile Status: Active
    → Full order access
    → Knight degree assignment
    → Broader event participation
```

---

## Content Visibility Matrix

| Content Type | Public | Candidate | Brother | Officer | Admin |
|---|---|---|---|---|---|
| Public Announcements | ✓ | ✓ | ✓ | ✓ | ✓ |
| Candidate Announcements | | ✓ | | ✓ | ✓ |
| Brother Announcements | | | ✓ | ✓ | ✓ |
| Officer Announcements | | | | ✓ | ✓ |
| Public Events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Candidate Events | | ✓ | | ✓ | ✓ |
| Brother Events | | | ✓ | ✓ | ✓ |
| Officer-only Content | | | | ✓ | ✓ |
| Admin-only Content | | | | | ✓ |
| Member Directory | | Partial | Partial | Full | Full |
| Organization Structure | | Assigned Unit | All Units | Assigned + Sub | All |

---

## Approval Workflow States

### Candidate Approval Process
- **New** → Officer review → **Contacted** → Candidate responds → **Invited** → (Auto-converts or waits) → **Converted to Candidate**
- **Alternative:** New → **Rejected** (with reason)

### Content Approval Process
- **Draft** → Officer review → **Review** → Admin approval → **Approved** → **Published**
- **Alternative:** Draft → **Archived** (unpublished)

---

## Device and Push Notification Access

### Notification Categories Available by Role
- **Candidates:** Events, Announcements, Prayer Reminders
- **Brothers:** Events, Announcements, Roadmap Updates, Prayer Reminders
- **Officers:** All of above + Administrative Alerts
- **Admins:** All notification categories + System Alerts

### Platform Support
- iOS (Apple Push Notifications)
- Android (Firebase Cloud Messaging)
- Web (Web Push Notifications)

---

## Security and Permission Model

### Permission Levels
1. **Public** - No authentication required
2. **Authenticated** - Any logged-in user
3. **Role-based** - Specific role required
4. **Unit-scoped** - Limited to assigned organization units
5. **Admin** - System-wide access

### Data Access Control
- Candidates see only their assigned information and candidate-visible content
- Brothers see their profile, memberships, and brother-visible content
- Officers see data for their organization unit and below
- Admins see all organizational data
- All users can only modify their own profile information unless they have officer+ permissions

