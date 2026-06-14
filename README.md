# Contrast Timber 3D — Component Library

A neumorphic "carved wood" UI skin built on Bootstrap 5.3.3, featuring high-contrast specular bevels, a warm terracotta/copper ink palette, light/dark theming, and full RTL support.

## Files

- `index.html` — page shell, router, and view templates
- `timber-studio.css` — full stylesheet (variables, bevels, components)
- `timber-studio.js` — router, theming, and component interactions
- `lightwood.png` — wood grain texture (shared across light/dark modes via `multiply` blend)

## Design System

### Surfaces

All surfaces share the same wood texture and blend mode, differentiated by **shadow direction**:

| Class | Shadow | Meaning |
|---|---|---|
| `.wood-panel` | `--nm-inset` | Base containers (sidebar, header, footer) |
| `.wood-element` | `--nm-outset` | Interactive controls (buttons) — raised |
| `.wood-card` | `--nm-outset` | Content cards — raised |
| `.wood-card-flat` | `--nm-inset` | Summary/recessed cards |
| `.wood-card-inset` | deep inset | Carved content trays |
| `.wood-stat-card` | `--nm-outset` | Dashboard stat tiles |

**Rule of thumb:** outset = interactive/raised, inset = pressed/recessed/display-only.

### Ink Colors (typography & icons)

| Class | Purpose |
|---|---|
| `.btn-wood-primary` | Default text/icon ink |
| `.btn-wood-secondary` | Terracotta accent |
| `.btn-wood-action` | Copper/amber — primary CTAs |
| `.btn-wood-success` | Moss green — positive states |
| `.btn-wood-danger` | Mahogany red — errors/faults |
| `.btn-wood-accent` | Walnut — tertiary accent |

### Theming

Toggle via `data-bs-theme="light"` / `"dark"` on `<html>`. All colors, inks, and bevel shadows (`--nm-outset`, `--nm-outset-hover`, `--nm-inset`) are redefined per theme; the wood texture itself is reused across both via `multiply` blend mode.

### RTL

Toggle via `dir="rtl"` + `lang="ar"` on `<html>`. Layout mirrors automatically — sidebar, toasts, accent borders, and dropdown carets flip sides.

## Components

### Navigation
- Sidebar nav pills (`.sidebar .nav-pills .nav-link`) — raised when inactive, carved-in when `.active`
- Mobile sidebar (`.sidebar.show` + `.sidebar-overlay`, toggled via `toggleSidebar()`)
- Pagination (`.wood-pagination`)

### Buttons
- `.wood-element` + intent class (`btn-wood-action`, etc.)
- Sizes via Bootstrap (`btn-sm`, default, custom large)
- Icon-only (square, fixed width/height)
- States: normal, `.active` (pressed), `:disabled`
- Loading state: `.wood-spinner` + disabled button
- Grouped actions: `.wood-rocker-track` + `.rocker-segment`

### Forms
- Text inputs / selects: `.wood-input-carved` (selects get custom SVG caret via `.form-select`)
- Checkboxes: `.wood-checkbox` + `.wood-checkbox-box`
- Radios: `.wood-radio` + `.wood-radio-circle`
- Switches: `.wood-switch` + `.wood-switch-track` / `.wood-switch-thumb`
- Rocker segmented control: `.wood-rocker-track`

> **Note:** native `<select>` option popups are OS-rendered and cannot be fully themed. The closed select box and caret are styled; for fully custom dropdowns (e.g. color-swatch pickers), build a custom listbox using the `.wood-popover` pattern.

### Feedback
- Alerts: `.wood-alert-carved` (+ `.btn-close-raised`)
- Toasts: `.wood-toast-container` + `showToast(type, title, message)` / `dismissToast(el)`
- Badges: `.wood-badge` (raised) / `.wood-badge-inset` (carved)
- Progress bars: `.wood-progress` + `.wood-progress-bar.bar-{secondary|action|success|danger|accent}`
- Tooltips: `.wood-tooltip-trigger` + `.wood-tooltip.tt-top`
- Popovers: `.wood-popover` + `.show` (toggle via JS, see below)

### Modals
- `.wood-modal-backdrop` / `.wood-modal-content` / header / body / footer
- Controls: `openWoodModal()` / `closeWoodModal()`

### Data Display
- Cards: `.wood-card` (+ `.wood-card-hover`, `.wood-card-flat`, `.wood-card-accent`, `.wood-card-horizontal`)
- Tables: `.wood-table` inside `.wood-card-inset` + `.wood-table-container`
- Skeleton loaders: `.wood-skeleton` + `.wood-skeleton-{text|title|circle|card}`
- Empty states: `.wood-empty-state`

### Utilities
- Custom scrollbars on `.sidebar`, `#mainViewport`, `.wood-table-container`
- Focus-visible outlines on all interactive elements
- Disabled-state styling for buttons, inputs, rockers, switches

## Known Constraints

- **Accessibility:** the high-contrast palette update improved text contrast significantly (`--studio-text` / `--studio-text-alt` now meet WCAG AA/AAA against `#f5d5b4`). Continue checking new ink colors against backgrounds when extending the palette.
- **Performance:** each `.wood-element`/`.wood-card` carries 4-layer box-shadows + a blended texture. Avoid applying these classes to large repeated lists (e.g. every table row) — reserve for cards, buttons, and containers.
- **Native popups:** `<select>` option lists and browser-native popovers cannot be themed beyond the closed-state control.

## Adding a New Page

1. Add a `<template id="view-{name}">...</template>` block.
2. Add a sidebar nav item: `<a ... onclick="navigateTo('{name}')">`.
3. The router handles template injection and active-state styling automatically.

> ⚠️ When adding popover toggles, avoid naming functions `togglePopover` — it collides with the native `HTMLElement.togglePopover()` API. Use `toggleWoodPopover()` instead.

## Extending the Palette

To add a new ink color, define it per theme:

```css
:root, [data-bs-theme="light"] {
    --btn-text-newcolor: #hexvalue;
}
[data-bs-theme="dark"] {
    --btn-text-newcolor: #hexvalue;
}
.btn-wood-newcolor { color: var(--btn-text-newcolor) !important; }
```

Then reuse via `.wood-badge`, `.wood-progress-bar.bar-newcolor::after`, `.wood-card-accent`, etc.
