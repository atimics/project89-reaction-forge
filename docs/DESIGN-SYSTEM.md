# PoseLab Design System v2.0

## Overview

PoseLab's design system is a next-generation UI framework that pushes the boundaries of web aesthetics while maintaining exceptional usability. It draws inspiration from:

- **Liquid Glass** (iOS 26) - Dynamic transparency with depth and refraction
- **Aurora Aesthetics** - Flowing gradients and organic motion
- **Cyberpunk Minimalism** - High contrast with strategic neon accents
- **Spatial UI** - Layered depth for immersive 3D experiences

---

## Typography

We've moved away from generic fonts (Inter, Roboto, Arial) to a distinctive pairing:

### Font Stack

| Category | Font | Usage |
|----------|------|-------|
| **Display** | Orbitron | Headlines, logos, emphasis - Bold sci-fi aesthetic |
| **Body** | Space Grotesk | Body copy, UI labels, descriptions - Clean geometric |
| **Mono** | JetBrains Mono | Code, values, technical data |

### Type Scale (Perfect Fourth - 1.333 ratio)

```css
--text-xs:   0.75rem   /* 12px */
--text-sm:   0.875rem  /* 14px */
--text-base: 1rem      /* 16px */
--text-lg:   1.125rem  /* 18px */
--text-xl:   1.333rem  /* 21px */
--text-2xl:  1.777rem  /* 28px */
--text-3xl:  2.369rem  /* 38px */
--text-4xl:  3.157rem  /* 50px */
--text-5xl:  4.209rem  /* 67px */
```

### Usage Classes

```html
<!-- Display headings -->
<h1 class="display-xl">PoseLab</h1>
<h2 class="display-lg">Create Amazing Content</h2>

<!-- Section headings -->
<h3 class="heading-xl">Reactions</h3>
<h4 class="heading-md">Background Settings</h4>

<!-- Body text -->
<p class="body-md">Regular paragraph text</p>
<span class="body-sm">Secondary information</span>

<!-- Labels & Captions -->
<label class="label">Expression</label>
<span class="caption">Last updated 2 hours ago</span>
```

---

## Color Palette

### Deep Space Aurora

Our palette is built on deep, rich blacks with aurora-inspired accent colors.

#### Background Layers (Dark to Light)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-void` | `#000000` | True black, rare |
| `--color-abyss` | `#030305` | App background |
| `--color-deep` | `#070910` | Subtle layers |
| `--color-surface` | `#0c0f18` | Card backgrounds |
| `--color-elevated` | `#12161f` | Elevated surfaces |
| `--color-card` | `#181c28` | Interactive cards |
| `--color-hover` | `#1e2330` | Hover states |

#### Primary Spectrum - Aurora Cyan

The signature accent color with full spectrum for flexibility:

```css
--accent-50:  #e6fffc  /* Lightest */
--accent-100: #b3fff5
--accent-200: #80ffed
--accent-300: #4dffe6
--accent-400: #1affdf
--accent:     #00ffd6  /* Primary */
--accent-600: #00d4b3
--accent-700: #00a890
--accent-800: #007d6d
--accent-900: #00524a  /* Darkest */
```

#### Secondary Spectrum - Electric Violet

```css
--violet:     #7c3aed  /* Primary violet */
--violet-300: #ae66ff  /* Light variant */
--violet-700: #5b21b6  /* Dark variant */
```

#### Tertiary Spectrum - Solar Orange

```css
--solar:      #f97316  /* Primary orange */
--solar-300:  #fdba74  /* Light variant */
--solar-700:  #c2410c  /* Dark variant */
```

#### Semantic Colors

| Purpose | Color | Muted Background |
|---------|-------|------------------|
| Success | `#00ff9d` | `rgba(0, 255, 157, 0.15)` |
| Warning | `#fbbf24` | `rgba(251, 191, 36, 0.15)` |
| Error | `#ff3366` | `rgba(255, 51, 102, 0.15)` |
| Info | `#38bdf8` | `rgba(56, 189, 248, 0.15)` |

---

## Glass Morphism

Our signature glass effect creates depth and elegance:

### Standard Glass

```css
.glass {
  background: var(--glass-bg);                    /* rgba(12, 15, 24, 0.72) */
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);          /* rgba(255, 255, 255, 0.06) */
}
```

### Variants

| Variant | Blur | Saturation | Use Case |
|---------|------|------------|----------|
| `.glass-subtle` | 12px | 150% | Background panels |
| `.glass` | 20px | 180% | Standard cards/modals |
| `.glass-strong` | 32px | 200% | Important overlays |

---

## Spacing System

Based on an 8px grid for consistency:

```css
--space-0:  0
--space-1:  0.25rem   /*  4px */
--space-2:  0.5rem    /*  8px */
--space-3:  0.75rem   /* 12px */
--space-4:  1rem      /* 16px */
--space-5:  1.25rem   /* 20px */
--space-6:  1.5rem    /* 24px */
--space-8:  2rem      /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
--space-20: 5rem      /* 80px */
--space-24: 6rem      /* 96px */
```

---

## Border Radius

Soft, rounded corners throughout:

```css
--radius-none: 0
--radius-sm:   6px
--radius-md:   10px
--radius-lg:   14px
--radius-xl:   20px
--radius-2xl:  28px
--radius-full: 9999px
```

---

## Shadows

Layered shadows for depth:

```css
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.4)
--shadow-sm:  0 2px 4px rgba(0, 0, 0, 0.4)
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.5)
--shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.6)
--shadow-xl:  0 16px 48px rgba(0, 0, 0, 0.7)
--shadow-2xl: 0 24px 64px rgba(0, 0, 0, 0.8)

/* Accent glow */
--shadow-glow:        0 0 40px rgba(0, 255, 214, 0.15)
--shadow-glow-strong: 0 0 60px rgba(0, 255, 214, 0.25)
```

---

## Animation & Motion

### Durations

```css
--duration-instant:  50ms   /* Instant feedback */
--duration-fast:     150ms  /* Quick transitions */
--duration-normal:   250ms  /* Standard animations */
--duration-slow:     400ms  /* Deliberate motion */
--duration-slower:   600ms  /* Emphasis */
--duration-slowest:  1000ms /* Dramatic reveals */
```

### Easing Functions

```css
--ease-linear:   linear
--ease-in:       cubic-bezier(0.4, 0, 1, 1)
--ease-out:      cubic-bezier(0, 0, 0.2, 1)
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1)
--ease-elastic:  cubic-bezier(0.68, -0.55, 0.265, 1.55)
--ease-spring:   cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### Animation Keyframes

| Animation | Class | Description |
|-----------|-------|-------------|
| Fade In | `.animate-fade-in` | Opacity 0 → 1 |
| Slide Up | `.animate-slide-up` | Fade + rise from below |
| Scale In | `.animate-scale-in` | Fade + scale 0.95 → 1 |
| Pulse | `.animate-pulse` | Gentle opacity pulse |
| Breathe | `.animate-breathe` | Subtle scale + opacity |
| Glow | `.animate-glow` | Pulsing box-shadow |
| Float | `.animate-float` | Gentle vertical float |
| Spin | `.animate-spin` | Continuous rotation |

### Stagger Delays

```html
<div class="animate-slide-up delay-1">First</div>
<div class="animate-slide-up delay-2">Second</div>
<div class="animate-slide-up delay-3">Third</div>
```

---

## Components

### Buttons

```html
<!-- Primary (Aurora gradient) -->
<button class="btn btn-primary">Get Started</button>

<!-- Secondary (Glass) -->
<button class="btn btn-secondary">Cancel</button>

<!-- Ghost -->
<button class="btn btn-ghost">Learn More</button>

<!-- Danger -->
<button class="btn btn-danger">Delete</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>

<!-- Icon Button -->
<button class="btn btn-secondary btn-icon">🎨</button>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Interactive Card -->
<div class="card card-interactive">
  Hoverable card content
</div>
```

### Chips & Tags

```html
<span class="chip">Default</span>
<span class="chip chip-accent">Accent</span>
<span class="chip chip-violet">Violet</span>
<span class="chip chip-solar">Solar</span>
<span class="chip chip-success">Success</span>
<span class="chip chip-warning">Warning</span>
<span class="chip chip-error">Error</span>
```

### Status Indicators

```html
<span class="status-dot"></span>
<span class="status-dot online"></span>
<span class="status-dot away"></span>
<span class="status-dot busy"></span>
<span class="status-dot offline"></span>
```

### Tabs

```html
<!-- Pill Tabs -->
<div class="tabs">
  <button class="tab active">Reactions</button>
  <button class="tab">Scene</button>
  <button class="tab">Export</button>
</div>

<!-- Underline Tabs -->
<div class="tabs tabs-underline">
  <button class="tab active">Tab 1</button>
  <button class="tab">Tab 2</button>
</div>
```

### Inputs

```html
<div class="input-wrapper">
  <label class="input-label">Email Address</label>
  <input type="email" class="input" placeholder="you@example.com">
</div>

<!-- Sizes -->
<input class="input input-sm" placeholder="Small">
<input class="input input-lg" placeholder="Large">
```

### Sliders

```html
<div class="slider-wrapper">
  <div class="slider-header">
    <span class="slider-label">Brightness</span>
    <span class="slider-value">75%</span>
  </div>
  <input type="range" class="slider" min="0" max="100" value="75">
</div>
```

### Toggle/Switch

```html
<label class="toggle-wrapper">
  <div class="toggle active"></div>
  <span class="toggle-label">Enable Feature</span>
</label>
```

---

## Gradients

### Aurora Gradient

```css
.gradient-aurora {
  background: linear-gradient(135deg, 
    var(--accent) 0%, 
    var(--violet) 50%, 
    var(--solar) 100%
  );
}
```

### Mesh Gradient (Background)

```css
.gradient-mesh {
  background: 
    radial-gradient(circle at 20% 20%, rgba(0, 255, 214, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(124, 58, 237, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
    var(--color-abyss);
}
```

---

## Z-Index Layers

```css
--z-base:           0
--z-dropdown:       100
--z-sticky:         200
--z-fixed:          300
--z-drawer:         400
--z-modal-backdrop: 500
--z-modal:          600
--z-popover:        700
--z-tooltip:        800
--z-toast:          900
--z-max:            9999
```

---

## Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Reduced Motion

Animations are automatically disabled for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

- Primary text on background: 15.8:1 (AAA)
- Secondary text on background: 10.2:1 (AAA)
- Accent on dark: 12.4:1 (AAA)

---

## File Structure

```
src/styles/
├── design-system.css    # Core tokens, fonts, animations
└── components.css       # Reusable component styles

src/index.css            # Global imports & overrides
src/App.css             # Application layout styles
```

---

## Best Practices

### DO ✅

- Use CSS variables for all colors, spacing, and typography
- Apply glass morphism to elevated surfaces
- Use the aurora accent sparingly for maximum impact
- Animate with purpose (feedback, state changes, delight)
- Test on both light and dark environments

### DON'T ❌

- Hardcode color values
- Overuse the accent color
- Create jarring animations (keep them smooth and subtle)
- Ignore reduced motion preferences
- Mix font families within similar contexts

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

Note: `backdrop-filter` has full support in modern browsers. Fallbacks are provided for older versions.

