# Google Slides Design Mockup Prompt
## JP2 Knights Mobile App - High-Fidelity Mockups

> **See also:** [Functional Requirements](../product/functional-requirements.md) | [Screen Structure & UX Design](02-screen-structure-ux-design.md)

**This prompt generates visual mockups for the screens defined in [02-screen-structure-ux-design.md](02-screen-structure-ux-design.md).** Each screen maps to a Functional Requirement (FR-###) for requirements verification.

---

## How to Use This Prompt

This prompt is designed to be used with:
- **Google Slides** (using built-in shape/text tools or add-ons like Relume)
- **Figma** (design collaboration tool)
- **Adobe XD** or **Sketch** (professional design tools)
- **Miro** (whiteboarding/prototyping)

### Instructions:
1. Copy this entire prompt
2. Paste into your design tool's AI/prompt feature OR
3. Use it as a reference guide for manual mockup creation
4. Adjust dimensions for your target device (iPhone 12 = 390×844px)

---

## DESIGN SYSTEM SPECIFICATION

### Color Palette
```
Primary: #1d4ed8 (Blue) - Main actions, navigation
Dark Text: #111827 (Near-black) - Headlines, body text
Muted Text: #4b5563 (Gray) - Secondary info, labels
Light Background: #f8fafc (Off-white) - App background
White Surface: #ffffff (Pure white) - Cards, modals
Border: #d1d5db (Light gray) - Dividers, borders
Success: #15803d (Green) - Confirmations, success states
Warning: #a16207 (Orange) - Cautions, pending states
Danger: #b91c1c (Red) - Errors, warnings, delete actions
```

### Typography
- **Headlines (Heading 1):** 28px, Bold, #111827
- **Subheading (Heading 2):** 20px, Bold, #111827
- **Body Text (Body 1):** 16px, Regular, #111827
- **Secondary Text (Body 2):** 14px, Regular, #4b5563
- **Labels (Label):** 12px, Medium, #4b5563
- **Buttons (Button):** 16px, Medium, #ffffff on #1d4ed8

### Spacing & Layout
- **Margins:** 16px (4 units of 4px)
- **Padding:** 16px inside cards
- **Gaps between elements:** 8px or 16px
- **Border Radius:** 4px (corners) to 8px (larger components)
- **Device:** Mobile (390px width) with 16px side margins = 358px content width

---

## MOCKUP CREATION PROMPT

Use this comprehensive prompt with your design tool's AI feature:

---

### **PROMPT FOR AI DESIGN TOOL (Copy Below):**

```
Create high-fidelity mobile app mockups for "JP2 Knights" - a Catholic 
organization app. Use the specified design system throughout.

DEVICE: iPhone 12 (390px × 844px)
SAFE AREA: 16px margins on sides

COLOR SCHEME (required):
- Primary: #1d4ed8
- Text: #111827
- Secondary Text: #4b5563
- Background: #f8fafc
- White Surface: #ffffff
- Borders: #d1d5db
- Success: #15803d
- Warning: #a16207
- Error: #b91c1c

TYPOGRAPHY:
- Headlines: 28px Bold
- Subheadings: 20px Bold
- Body: 16px Regular
- Secondary: 14px Regular
- Labels: 12px Regular

SPACING: 16px margins, 8-16px gaps, 4-8px border radius

CREATE THE FOLLOWING SCREENS (in order):

---

SCREEN 1: CANDIDATE DASHBOARD
Layout: Vertical scroll
Header: White surface, "Candidate Dashboard" as title
Content:
- Welcome card (light background): Shows candidate name + organization unit
- "Next Step" section: Large blue button with icon + text ("View Events")
- "Local Assignment" card: Shows city, country, parish
- "Responsible Officer" card: Shows officer name + email + contact button
- "Upcoming Events" section: Show 2-3 events with date, location, title
- "Announcements" section: Show 2 announcements with date, title, preview
Footer: Bottom navigation with 5 tabs (Dashboard, Events, Announcements, Contact, Profile)

SCREEN 2: CANDIDATE EVENTS LIST
Layout: Vertical scroll
Header: "Candidate Events" title with count badge
Content:
- Event cards (repeating) with:
  - Date/time: "Jan 15, 2026 - 14:30"
  - Location with icon
  - Event title (bold)
  - Status indicator (small badge: "Not attending" or "Planning to attend")
- Each card: white background, 8px border radius, 16px padding, light border
Empty state (if no events): Icon + "No candidate-visible events are listed yet."
Footer: Bottom navigation

SCREEN 3: CANDIDATE EVENT DETAIL
Layout: Vertical scroll
Header: Event title + back button + close button
Content:
- Event type badge (e.g., "Formation") in light background
- Large date/time display
- Location with map icon
- Event description (full text)
- Participation section:
  - Status text: "You are planning to attend"
  - Large primary button: "Plan to attend" (or "Cancel intent" if already attending)
- Organizer information section

SCREEN 4: BROTHER DASHBOARD (BROTHER TODAY)
Layout: Vertical scroll
Header: White surface, "Brother Today" title
Content:
- Profile summary card: Name (large), current degree, organization unit
- Action cards (4 cards in 2×2 grid):
  - "My Profile" with icon
  - "My Choragiew" with icon
  - "Events" with icon
  - "Announcements" with icon
- "Upcoming Events" section: Show 3 events with full details
- "My Choragiew" section: Show 2-3 organization units
Footer: Bottom navigation with 5 tabs (Today, Events, Announcements, Choragiew, Profile)

SCREEN 5: BROTHER PROFILE
Layout: Vertical scroll
Header: "Brother Profile" + edit button
Content:
- Personal info section:
  - Name (large)
  - Email
  - Phone (if available)
  - Language preference
- Memberships section: Show 1-2 membership cards with:
  - Organization unit name
  - Current degree
  - Join date
  - Status badge

SCREEN 6: MY CHORAGIEW (ORGANIZATION UNITS)
Layout: Vertical scroll
Header: "My Choragiew" title with count
Content:
- Organization unit cards (repeating):
  - Unit name (bold, 20px)
  - Location: "City, Country"
  - Parish (secondary text)
  - Public description preview
  - Subtle border, light background option
Empty state: Icon + "No active organization unit assigned"

SCREEN 7: BROTHER EVENTS LIST
Layout: Vertical scroll
Header: "Brother Events" title with count
Content:
- Event cards similar to candidate, but with more detail:
  - Type badge
  - Date/time
  - Location
  - Title
  - Attendance status indicator
Footer: Bottom navigation

SCREEN 8: BROTHER ANNOUNCEMENTS LIST
Layout: Vertical scroll
Header: "Brother Announcements" with count
Content:
- Announcement cards:
  - "Pinned" badge (if applicable) in warning orange
  - Title (bold)
  - Publish date (secondary text)
  - Body preview (2-3 lines)
  - Unread indicator (blue dot if unread)
- Each card: white surface, subtle border

SCREEN 9: OFFICER DASHBOARD
Layout: Vertical scroll
Header: "Officer Dashboard" title
Content:
- Quick stats cards (grid of 4):
  - "Pending Approvals" with count badge + icon
  - "Active Candidates" with count + icon
  - "Events" with count + icon
  - "Announcements" with count + icon
- Action buttons (full width, stacked):
  - "Review Candidates" (primary blue)
  - "Create Event" (primary blue)
  - "Post Announcement" (primary blue)
  - "Manage Members" (secondary)
- Recent activity section with 2-3 items

SCREEN 10: CREATE EVENT FORM
Layout: Vertical scroll
Header: "Create Event" + close/back button
Content:
- Form fields (full width, 16px padding):
  - "Event Title" input
  - "Event Type" dropdown (Formation, Social, Prayer, Other)
  - "Description" textarea
  - "Start Date & Time" date/time picker
  - "End Date & Time" date/time picker
  - "Location" input
  - "Visibility" dropdown (Candidate, Brother, Officer, Admin)
  - "Organization Unit" dropdown
  - Attachment button with + icon
- Form actions (bottom):
  - "Save as Draft" (secondary button)
  - "Submit for Approval" (primary button)
- Button layout: Side-by-side, 8px gap

SCREEN 11: SIGN IN
Layout: Vertical centered
Header: App logo (if available)
Content:
- "Sign In" title (large, centered)
- Email input field (label: "Email", placeholder: "Enter your email")
- Password input field (label: "Password", placeholder: "Enter password")
- "Forgot Password?" link (blue, secondary size)
- "Sign In" button (primary blue, full width)
- Sign-up link: "Don't have an account? Create one" (secondary)
States to show: Default, Focus state, Error state (with red border)

SCREEN 12: CANDIDATE REQUEST FORM (MULTI-STEP)
Show step 1 of 3:
Header: "Join the Order" + step indicator "1/3"
Content:
- "Personal Information" section:
  - Name input
  - Email input
  - Phone input
- Navigation:
  - "Back" button (secondary, disabled on step 1)
  - "Next" button (primary blue)

---

DESIGN NOTES:
- Use consistent spacing (16px margins, 8-16px gaps)
- All buttons should be at least 44px tall
- Cards should have 8px radius and subtle shadows (optional)
- Text should have sufficient contrast (WCAG AA minimum)
- Bottom navigation should be sticky/fixed
- Include loading states (spinner) where applicable
- Use icons from system set (iOS or Material Design)
- Maintain 16px safe margins on mobile
- Include one "empty state" mockup showing no data scenario
- All form inputs should have focus states (light blue border)
- Status badges should use the warning/success/danger colors appropriately

---

INTERACTION ELEMENTS TO SHOW:
1. Active tab (bottom nav): Blue highlight, white background
2. Inactive tab: Gray text, no background
3. Primary button: Blue background, white text, slight shadow
4. Secondary button: White background, blue border, blue text
5. Link: Blue text, no underline (unless hover)
6. Form input focus: Blue border, light blue background tint
7. Error state: Red border, red text label
8. Success state: Green checkmark, green text
9. Card hover (mockup show as selected): Slight shadow increase
10. Badge/count: Small circle with count, primary blue or red

---

ADDITIONAL REQUIREMENTS:
- Include loading screen mockup (spinner, "Loading...")
- Include error screen mockup (error icon, retry button)
- Include offline state (banner at top: "Reconnect to refresh")
- Show one notification/toast mockup (success message)
- Create a color palette swatch sheet
- Create a typography specimen sheet showing all font sizes/weights
- Show component library (buttons, inputs, cards, badges)
- Include one tablet layout view (iPad landscape: wider, 2-column)
- Add navigation flow diagram showing screen relationships

---

EXPORT REQUIREMENTS:
- Export as high-resolution PNG/PDF (2x scale for Retina displays)
- Include artboard labels
- Keep all layers organized and named
- Create a master slide with design system specifications
- Provide a comments document with design rationale
- Ensure all colors match the specified hex values exactly

---

END OF PROMPT
```

---

## Alternative: Manual Mockup Instructions

If using **Google Slides** manually:

### Setup
1. New presentation, portrait orientation
2. Slide size: **Custom** → 390×844px (iPhone 12 dimensions)
3. Set background color to #f8fafc

### Per Screen
1. Create new slide
2. Add shapes/rectangles for:
   - Header bar (white, 60-80px height)
   - Content area (full width)
   - Bottom navigation (white, 60px height, fixed to bottom)
3. Add text labels for:
   - Screen title
   - Section headers
   - Body content
   - Button labels
4. Use color picker to apply exact hex colors
5. Use "Grid" view to maintain spacing alignment

### Recommended Add-Ons for Google Slides
- **Relume** - AI-powered design mockup generator
- **Figma for Google Slides** - Embed Figma prototypes
- **Pptx.js** - Better shape/component management

---

## Design Tool Recommendations

### Best for This Project:
1. **Figma** (Free tier available)
   - Collaborative
   - Component libraries
   - Prototype interactions
   - Design system features
   
2. **Adobe XD** (Free starter plan)
   - Smooth interactions
   - Built-in component system
   - Easy handoff to developers

3. **Sketch** (Mac, subscription required)
   - Comprehensive design system support
   - Extensive plugin ecosystem

4. **Penpot** (Open source)
   - Similar to Figma
   - Self-hosted option

### For Quick Prototyping:
- **Google Slides** + manual design
- **Miro** + whiteboard approach
- **Canva** + templates (limited)

---

## Design Handoff Checklist

Once mockups are created:

- [ ] Export all screens at 2x resolution (Retina)
- [ ] Create component library documentation
- [ ] Document all color codes (match hex values)
- [ ] Specify typography (font names, sizes, weights)
- [ ] Define spacing system (16px grid)
- [ ] Document interaction states (hover, focus, active, disabled)
- [ ] Create navigation flow diagram
- [ ] Provide accessibility notes (color contrast, touch targets)
- [ ] Create responsive design specs (tablet/desktop layouts)
- [ ] Generate design tokens JSON file (if using Figma/XD)
- [ ] Document any special animations or transitions

---

## Reference Information

### Organization Details
- **Order:** Knights of St. John Paul II the Great
- **Patron:** Saint John Paul II
- **Primary Audience:** Catholic men (lay brothers, candidates, spouses)
- **Geographic:** 9 provinces (Poland, Canada, Ukraine, France, Spain, Philippines, Italy, USA, Lithuania)
- **Hierarchy:** General → Provinces → Commanderies → Choragiews (local units)
- **Member Progression:** Public → Candidate → Brother (4 degrees)

### User Roles
1. **Public** - No authentication
2. **Candidate** - In formation (limited access)
3. **Brother** - Full member (broad access)
4. **Officer** - Leadership (management features)
5. **Admin** - System management (full access)

### Key Features by Role
- **Candidates:** Dashboard, Events, Announcements, Officer Contact, Profile
- **Brothers:** Enhanced Dashboard, Events, Announcements, Organization Units, Profile
- **Officers:** Candidate Management, Event Creation, Announcements, Member Management

---

## Testing the Mockups

### Usability Considerations
- Test with actual users from each role
- Verify color contrast (WCAG AA standard)
- Ensure touch targets are ≥44×44px
- Test on actual devices (iOS & Android)
- Validate empty states with real data scenarios
- Check loading/error states

### Accessibility Checklist
- [ ] Color is not the only indicator of state
- [ ] Form inputs have clear labels
- [ ] Error messages are specific
- [ ] Focus order is logical
- [ ] Text has sufficient contrast
- [ ] Images have alt text
- [ ] Icons have labels or tooltips

