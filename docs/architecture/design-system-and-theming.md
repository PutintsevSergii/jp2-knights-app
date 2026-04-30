# Design System and Theming

The mobile app and Admin Lite must be built so branding can evolve without a hard rewrite. Brand decisions must live in a small number of shared design-token files, not scattered across screens and components.

## Goal

Make colors, typography, spacing, radii, shadows, state colors, and common component variants easy to change from one place while preserving platform-native implementation quality for web and mobile.

## Token Architecture

| Layer | Purpose | Examples |
| --- | --- | --- |
| Core tokens | Raw design values | `color.blue.600`, `space.4`, `font.size.md`, `radius.sm` |
| Semantic tokens | Product meaning | `color.background.app`, `color.text.primary`, `color.action.primary`, `color.status.error` |
| Component tokens | Component-level styling hooks | `button.primary.bg`, `card.border`, `input.focusRing` |
| Platform adapters | Convert tokens for each app | CSS variables/Tailwind theme for admin, TypeScript theme object for mobile |

Screens and components should use semantic or component tokens. They should not directly use raw color hex values except inside the token source.

## Repository Shape

```text
libs/
  shared/design-tokens/
    tokens/
      core.ts
      semantic.ts
      components.ts
    adapters/
      admin-css.ts
      mobile-theme.ts
    themes/
      jp2-default.ts
      high-contrast.ts
  ui/mobile/
  ui/admin/
```

The exact filenames may change, but the ownership rule should not: tokens are shared; platform UI components are platform-specific.

## Web and Mobile Reuse Strategy

- Share token names, semantic meaning, component variants, icon choices, and interaction states.
- Keep rendered components platform-specific where needed: React Native components for mobile, accessible HTML components for admin.
- Reuse design logic through typed token objects and small cross-platform helpers, not through brittle copied styles.
- Use a small set of primitives: text, surface, stack, button, icon button, input, select, tabs, list row, empty state, banner, dialog.
- Prefer component variants over ad hoc style props for product UI.

## Branding Requirements

- A brand refresh should usually change token/theme files and limited component variant mappings, not every screen.
- Tokens must include light/dark readiness even if V1 ships only one theme.
- Color tokens must include accessible foreground/background pairs.
- Status colors must be semantic and calm. Prayer, formation, and roadmap UI must avoid shame-based red failure styling.
- Official Order visual identity, marks, and wording require human approval before production.

## Implementation Rules

- No hardcoded hex colors, arbitrary spacing, or one-off typography in screens.
- No duplicated design constants in `apps/mobile` and `apps/admin`.
- New UI components must declare which tokens/variants they use.
- If a screen needs a new visual pattern, add or extend a shared token/component variant first.
- Demo fixtures and screenshots should use the default theme unless a theme-specific test is intentional.

## Quality Gates

- Lint or static checks should catch raw hex colors and unauthorized hardcoded design values outside token files.
- Mobile and admin smoke tests should render the default theme.
- At least one theme-switch or token-override test should prove that core screens respond to token changes without code edits.
- Accessibility checks should validate contrast for primary text, action, danger, and disabled states.

