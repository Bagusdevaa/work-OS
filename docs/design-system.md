# Personal Work OS — Design System

## Design Direction

The interface should be inspired by the supplied visual references.

Reference characteristics:

- clean dashboard
- premium
- modern
- spacious
- calm
- professional
- strong hierarchy
- subtle depth
- blue-oriented visual language

Do not copy the reference literally.

Use it as visual inspiration.

---

# Visual References

Reference screenshots are stored in:

docs/references/

Files:

- dashboard-reference.png
- design-system-reference.png

Use these references when evaluating visual implementation.

The design tokens in this document are the source of truth.

---

# Color Direction

Primary visual family:

- Deep Navy
- Dark Blue
- Bright Blue
- Soft Blue
- Soft Blue-Gray
- White

The primary visual identity should feel blue rather than purple.

Suggested primary gradient direction:

Dark Blue Gradient

Approximate reference:

#123288 → #295ECC

Use gradients selectively.

Do not turn the entire interface into gradients.

---

# Surfaces

Page background:

Very light blue-gray.

Cards:

White.

Navigation:

White or near-white.

Borders:

Very subtle cool gray.

Shadows:

Soft and restrained.

Avoid:

- heavy shadows
- excessive glassmorphism
- neon effects
- excessive gradients

---

# Typography

Use a clean modern sans-serif font.

Typography scale inspired by the reference:

Heading 1:
28px
Semibold

Heading 2:
22px
Semibold

Heading 3:
18px
Medium

Heading 4:
20px
Semibold

Body 1:
16px
Regular

Body 2:
15px
Regular

Body Small:
13px
Regular

Button:
18px
Medium

Button Small:
15px
Medium

Use responsive adjustments where necessary.

---

# Layout

Desktop:

Sidebar + main content.

Suggested structure:

┌──────────────┬─────────────────────────────┐
│ │ Header │
│ Sidebar ├─────────────────────────────┤
│ │ │
│ │ Main Content │
│ │ │
└──────────────┴─────────────────────────────┘

Main content should have generous horizontal spacing.

Avoid cramped dashboards.

---

# Sidebar

Desktop sidebar:

- fixed/persistent
- white surface
- clear active state
- simple icons
- strong hierarchy

Active navigation:

- blue accent
- subtle background
- clear text contrast

Mobile:

- drawer or appropriate mobile navigation

---

# Cards

Cards should generally use:

- white background
- rounded corners
- subtle border
- subtle shadow
- generous internal spacing

Do not make every piece of information a card.

Cards should group meaningful information.

---

# Buttons

Primary:

- blue
- strong contrast
- rounded
- clear hover state

Secondary:

- white/light surface
- subtle border

Destructive:

- clearly differentiated

Buttons should not use excessive gradients.

---

# Inputs

Inputs should have:

- clear label
- comfortable height
- subtle border
- visible focus state
- useful validation state

Do not rely solely on placeholder text as labels.

---

# Status Colors

Status colors should communicate meaning.

Examples:

Healthy:
positive/green family

Needs Attention:
warning/orange family

Stalled:
negative/red family

Do not use color as the only indicator.

---

# Charts

Charts should be:

- clean
- minimal
- easy to interpret

Use color sparingly.

Charts should answer a question.

Avoid decorative charts.

---

# Responsive Breakpoints

Desktop:
≥1280px

Tablet:
768px–1279px

Mobile:
<768px

Test against:

1440×900
1280×800
1024×768
768×1024
390×844

No horizontal page overflow.

---

# Spacing

Prefer a consistent spacing scale.

Do not use arbitrary spacing values everywhere.

Suggested base:

4px

Then:

4
8
12
16
20
24
32
40
48
64

Use larger spacing for section separation.

---

# Border Radius

Use moderately rounded surfaces.

Suggested:

small:
8px

medium:
12px

large:
16px

Avoid extremely rounded "pill everything" interfaces.

---

# Motion

Animations should be:

- subtle
- fast
- purposeful

Use animation for:

- navigation transitions
- dropdowns
- dialogs
- state changes
- loading

Avoid:

- excessive bouncing
- unnecessary parallax
- distracting animations

---

# UX Quality Bar

Every major screen should support:

- loading
- empty
- error
- success
- hover
- focus
- disabled
- mobile

The interface should feel polished even when there is no data.

---

# Anti-Patterns

Do not create:

- generic AI dashboard aesthetics
- excessive purple gradients
- excessive glassmorphism
- excessive rounded pills
- dense enterprise tables everywhere
- random colors
- arbitrary typography
- inconsistent spacing
- giant hero sections inside productivity screens

The application should feel like a serious personal operating system for work.
