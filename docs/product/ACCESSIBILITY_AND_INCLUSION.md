# Accessibility and Inclusion Requirements

This document defines accessibility and inclusion standards for the JP2 App, ensuring it is usable by brothers, candidates, and guests with diverse abilities.

## Principle

The Order values every person's spiritual life and participation. The app must not create barriers to access based on ability, age, device, or circumstance.

---

## WCAG 2.1 Compliance

The JP2 App targets **WCAG 2.1 Level AA** (Web Content Accessibility Guidelines), the industry standard for inclusive digital products.

### What This Means

- **Vision**: Text is readable; images have alt text; colors have sufficient contrast
- **Motor**: Buttons and links are large enough; keyboard navigation works
- **Hearing**: Videos have captions; audio descriptions are available where meaningful
- **Cognitive**: Language is clear; instructions are simple; no flashing/seizure triggers

### Scope

- **Mobile app** (React Native): Accessibility labels, keyboard navigation, screen reader support
- **Admin web** (Next.js): WCAG 2.1 Level AA for all admin screens
- **Prayers and content**: Readable fonts, sufficient line spacing, no dense paragraphs

---

## Specific Requirements by Feature

### Vision Accessibility

**Color Contrast**
- Text on background: minimum 4.5:1 ratio (normal text), 3:1 ratio (large text)
- Interactive elements: 3:1 ratio for borders, icons, focus states
- Tools: Use WebAIM Contrast Checker or Lighthouse to validate

**Alt Text and Descriptions**
- Images in prayers (if any): descriptive alt text ("Icon of a praying hands" not just "image.png")
- Prayer of the day image: alt text like "Illuminated manuscript of a prayer about hope"
- Announcement images: descriptive alt text
- Event images: descriptive alt text
- No decorative images without empty alt (alt="")

**Text Readability**
- Minimum font size: 16px (mobile), 14px (web) for body text
- Line height: at least 1.5x font size
- Letter spacing: at least 0.12x font size
- Max line length: 80 characters (prevents eye strain)
- Use sans-serif fonts for screen readability

**Dark Mode / High Contrast**
- App supports system-level dark mode preference
- High-contrast mode preserves readability (not rely on color alone)
- Prayer text should be readable in light and dark modes

### Motor Accessibility

**Touch Target Size**
- Buttons and interactive elements: minimum 48×48 dp (device-independent pixels)
- Links in text: may be smaller but must be touchable with a swipe gesture
- Spacing between targets: at least 8dp to avoid accidental taps

**Keyboard Navigation**
- All interactive elements reachable via Tab key
- Logical tab order (top to bottom, left to right)
- Focus indicator visible (blue ring or equivalent)
- Escape key closes menus/overlays
- Admin screens must be fully keyboard-navigable

**Gesture Alternatives**
- Swipe gestures (list scrolling) have button alternatives
- Long-press interactions have button alternatives
- Two-finger gestures have single-finger alternatives

### Hearing Accessibility

**Audio Content**
- If priest recites a prayer as audio: provide transcript or captions
- Silent prayer events: no audio requirement (prayer is silent)
- Announcements: no audio-only content

**Notifications**
- Push notifications use both text and sound (not sound alone)
- Critical notifications (e.g., roadmap approval) have text for screen reader

### Cognitive Accessibility

**Clear Language**
- Sentences are short (under 20 words average)
- No jargon without explanation
- Order-specific terms (chorągiew, reguła) are defined on first use
- Instructions are simple and step-by-step

**Predictable Behavior**
- App screens follow consistent patterns (e.g., button placement)
- Navigation is consistent (back button works as expected)
- No surprising modal interruptions during prayer
- Form errors clearly explain what went wrong

**Cognitive Load**
- Brother Today screen shows only today's essentials (not overwhelming)
- Prayer list shows category tags for quick scanning
- Event list shows date, time, location clearly
- No dense tables or complex data visualizations in V1

**No Seizure Risks**
- No flashing or flickering at > 3 Hz (can trigger photosensitive seizures)
- Silent prayer counter updates smoothly (no rapid flashes)
- Loading spinners are gentle

---

## Screen Reader Support

### Mobile (React Native)

Use React Native accessibility props:

```tsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Say Amen to this prayer"
  accessibilityHint="Adds this prayer to your favorites"
  onPress={() => { /* ... */ }}
>
  <Text>Amen</Text>
</TouchableOpacity>
```

**Required labels**:
- Buttons: clear action label ("Join prayer", "Submit roadmap step")
- Images: descriptive alt text (not "icon" or "image")
- Form inputs: associated labels (not floating placeholder)
- Lists: announce count ("10 prayers")
- Modals: announce role ("Dialog: Confirm prayer submission")

### Web (Next.js)

Use semantic HTML and ARIA attributes:

```jsx
<button
  aria-label="Submit roadmap step"
  aria-describedby="step-help"
  onClick={...}
>
  Submit
</button>
<p id="step-help">Describe what you've completed.</p>
```

**Required**:
- Form labels: `<label htmlFor="input-id">`
- Buttons: clear text or `aria-label`
- Images: `<img alt="..."/>`
- Icons: `aria-hidden="true"` if decorative
- Headings: proper hierarchy (h1 > h2 > h3)
- Landmarks: `<nav>`, `<main>`, `<footer>`
- Live regions: `aria-live="polite"` for dynamic content

---

## Device and Context Considerations

### Low-Bandwidth Environments

Many brothers may have limited data plans or slow connections:

- Images are optimized (compressed, responsive sizes)
- App works with 2G/3G connections (not require high bandwidth)
- Offline cache allows prayer reading without network
- Critical content (prayer text) is prioritized over decorative images

### Older Devices

Some members may use older Android or iOS devices:

- App works on Android 8+ and iOS 12+ (covers ~95% of devices)
- No heavy animations (keeps frame rate smooth on older hardware)
- Minimal JavaScript (fast startup on older CPUs)
- Testing includes iPhone 7, Android 8 devices (Phase 13 hardening)

### Temporary Disabilities

A brother with a broken arm or temporary injury should still use the app:

- Voice input support (use system voice-to-text if available)
- Single-hand gestures (reach bottom of screen from thumb)
- Reduce reliance on precise taps

---

## Testing & Validation

### Automated Testing

- **Lighthouse Accessibility Audit**: Run in CI; target score ≥ 90
- **axe DevTools**: Browser extension for WCAG checks; address violations
- **WAVE**: WebAIM tool; check contrast, alt text, structure
- **Color contrast checker**: WebAIM contrast checker; validate all text

### Manual Testing

- **Keyboard navigation**: Tab through entire app; ensure no traps
- **Screen reader**: Test with built-in screen readers (NVDA on Windows, JAWS, VoiceOver on Mac, TalkBack on Android, VoiceOver on iOS)
- **Color blindness**: Use simulator (color oracle, Coblis) to verify non-color-only information
- **High contrast mode**: Test in system high-contrast settings
- **Old devices**: Test on iPhone 7, Android 8 device

### Phase 13 Checklist

Before pilot launch:

- [ ] Lighthouse accessibility score ≥ 90 (admin, mobile)
- [ ] No axe violations (critical, serious) on main screens
- [ ] Screen reader navigation works (prayer reading, event signup, roadmap submission)
- [ ] Keyboard navigation works on admin web (fully keyboard operable)
- [ ] Touch targets ≥ 48×48 dp on mobile
- [ ] Text contrast ≥ 4.5:1 on all text
- [ ] Alt text on all meaningful images
- [ ] No flashing or rapidly changing content
- [ ] Tested on old devices (iPhone 7, Android 8)
- [ ] Dark mode readable

---

## Inclusive Design Principles

Beyond accessibility, consider **inclusive design**:

### Diverse Religious Expressions

- Public prayers in multiple traditions (if Order includes diverse spiritualities)
- Visual icons include diverse imagery (not just one ethnic representation)
- Language is inclusive (not assuming male-only membership)

### Family Participation

- Guest mode allows wives and children to participate in public prayer
- Events marked "family-open" are welcoming to non-members
- Brother profile doesn't expose personal details that could concern families

### Digital Literacy

- Clear instruction screens for first-time users
- Help text at point of use (not buried in separate help section)
- Tooltips explain technical terms (API, authentication, etc.)

### Offline & Low-Tech Communities

- Features that don't require constant connectivity (silent prayer, prayer reading)
- Printed instructions if a retreat center lacks WiFi
- Optional push notifications (not required to use app)

---

## Role-Specific Considerations

### Guest
- Public screens are discoverable without signup
- No mandatory fields except necessary consent
- Clear CTA to "Learn more" about the Order

### Candidate
- Roadmap steps are clearly explained
- Can ask for clarification (future: candidate support forum)
- Success states visible (e.g., "Step 1 submitted; waiting for review")

### Brother
- Prayer text is readable without scrolling (single screen if possible)
- Event participation is one tap
- Profile is read-only (secure; no form confusion)

### Officer
- Admin screens have clear labels for every action
- Confirmation dialogs prevent accidental deletes
- Error messages explain how to fix issues
- Bulk actions (if added) have previews

---

## What's Out of Scope (V1)

- **Braille display support** (nice-to-have; test with screen readers instead)
- **Deaf interpreters or signing** (future; requires video infrastructure)
- **Full i18n for all languages** (localization is planned but not all translations in V1)
- **Dyslexia-friendly fonts** (consider for V2 if user feedback suggests it)
- **Real-time captions** (no video content in V1)

---

## Legal and Ethical Responsibility

### Legal Context (US/EU)

- **ADA Title III**: US law requiring public-facing digital products to be accessible
- **WCAG 2.1 Level AA**: De facto standard; lack of compliance is indefensible in court
- **GDPR**: EU law requiring accessible privacy notices and consent mechanisms

### Ethical Context

- Religious organizations have a **moral obligation** to include people with disabilities
- Accessibility is not a "nice feature"; it's a requirement for equitable participation
- The Holy Spirit doesn't discriminate by ability; neither should our tools

---

## Resources

### Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility by the Fireside](https://www.lireo.com/web-accessibility-by-the-fireside/) (plain English intro)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (browser audit)
- [axe DevTools](https://www.deque.com/axe/devtools/) (browser extension)
- [WAVE](https://wave.webaim.org/) (WebAIM tool)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Oracle](https://www.colororacle.org/) (color blindness simulator)

### Screen Readers
- **Windows**: NVDA (free), JAWS (paid)
- **Mac**: VoiceOver (built-in)
- **iOS**: VoiceOver (built-in)
- **Android**: TalkBack (built-in)

---

## Ownership and Accountability

| Concern | Owner | Phase |
|---------|-------|-------|
| Text contrast, alt text, readable fonts | Mobile/Web leads | As implemented |
| Touch target size, gesture alternatives | Mobile lead | Phases 3-13 |
| Keyboard navigation, ARIA labels | Web lead | Phases 3-13 |
| Screen reader testing | QA (with accessibility specialist) | Phase 13 |
| Overall WCAG AA compliance | Lead architect | Phase 13 & ongoing |

---

**Last Updated**: May 1, 2026
