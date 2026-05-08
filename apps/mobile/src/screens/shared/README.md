# Mobile Shared Screen Components

Before adding a React Native component under `apps/mobile/src/screens`, check this
inventory and reuse an existing component when the role and behavior match.

## Inventory

| File                      | Component             | Purpose                                                                             | Key props / variants                                        | Reuse guidance                                                                                    |
| ------------------------- | --------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `CalendarIcon.tsx`        | `CalendarIcon`        | Small calendar glyph for event metadata and quick actions.                          | `size: "compact" \| "regular"`, `emphasized`                | Reuse for event/date affordances before creating another calendar icon.                           |
| `ClockIcon.tsx`           | `ClockIcon`           | Compact clock glyph for time metadata rows.                                         | None                                                        | Reuse for event times and schedule rows.                                                          |
| `DegreeIcon.tsx`          | `DegreeIcon`          | Small badge glyph for degree/formation labels.                                      | None                                                        | Reuse in profile or formation badges.                                                             |
| `DemoModeBanner.tsx`      | `DemoModeBanner`      | Shared visible demo-mode label.                                                     | None                                                        | Use anywhere mobile demo chrome is shown.                                                         |
| `FilterIcon.tsx`          | `FilterIcon`          | Compact filter glyph for list filter actions.                                       | None                                                        | Reuse for filter buttons before adding a new funnel/sliders icon.                                 |
| `FlagIcon.tsx`            | `FlagIcon`            | Small flag glyph for choragiew/organization badges.                                 | None                                                        | Reuse for organization-unit badges.                                                               |
| `GroupIcon.tsx`           | `GroupIcon`           | Group/people glyph for organization or community quick actions.                     | `emphasized`                                                | Reuse for choragiew/community action cards; do not use for roster exposure.                       |
| `MegaphoneIcon.tsx`       | `MegaphoneIcon`       | Announcement glyph with optional red notification dot.                              | `emphasized`                                                | Reuse for one-way announcements and notices.                                                      |
| `MenuIcon.tsx`            | `MenuIcon`            | Three-line menu glyph for mobile top bars.                                          | None                                                        | Reuse inside top chrome; prefer `MobileTopBar` for full header.                                   |
| `MobileBottomNav.tsx`     | `MobileBottomNav`     | Shared fixed bottom navigation container.                                           | `items` with `id`, `label`, `active`, `disabled`, `onPress` | Reuse for Figma Gold/Grey private mobile tabs.                                                    |
| `MobileBottomNavItem.tsx` | `MobileBottomNavItem` | Single bottom navigation item.                                                      | `label`, `active`, `disabled`, `onPress`                    | Use through `MobileBottomNav` unless a single item is needed in tests or a custom container.      |
| `MobileTopBar.tsx`        | `MobileTopBar`        | Shared mobile top app bar with menu, brand text, and avatar initials.               | `title`, `avatarText`, `tone: "default" \| "gold"`          | Reuse for Figma Gold/Grey mobile screens before adding local header markup.                       |
| `PersonIcon.tsx`          | `PersonIcon`          | Person glyph for profile/account quick actions.                                     | `emphasized`                                                | Reuse for profile/account cards.                                                                  |
| `PinIcon.tsx`             | `PinIcon`             | Location pin glyph for metadata rows.                                               | `tone: "taupe" \| "brown"`                                  | Reuse for event or organization locations.                                                        |
| `QuickActionIcon.tsx`     | `QuickActionIcon`     | Adapter that maps Brother Today quick-action icon keys to shared icons.             | `icon`, `emphasized`                                        | Reuse for Brother Today style quick-action grids; extend only when the model adds a new icon key. |
| `ScreenStatePanel.tsx`    | `ScreenStatePanel`    | Shared bordered state panel for loading, empty, error, forbidden, and offline copy. | `title`, `body`, optional `heading`                         | Reuse for non-ready screen states.                                                                |
| `StatusDot.tsx`           | `StatusDot`           | Small tone dot for event status badges.                                             | `tone: "planning" \| "needed" \| "cancelled"`               | Reuse for RSVP/participation status badges.                                                       |

Rules:

- One exported React/React Native component per file.
- New shared components must be added to this inventory in the same change with
  a concise purpose, key props/variants, and reuse guidance.
- Do not duplicate chrome, icon, state, badge, card, or nav components in a
  screen file when a shared component can be parameterized instead.
