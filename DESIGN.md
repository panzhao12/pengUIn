# pengUIn Design System

> A playful interactive piano where a penguin dances while you play, and saved songs become draggable stickers scattered across the page.

---

## Aesthetic Direction: "Arctic Studio"

Inspired by the contrast of a tuxedo penguin on ice. Black and white piano keys, a monochrome mascot, musical warmth underneath.

**Mood:** Clean, playful, tactile. Like a Scandinavian toy store meets a jazz lounge. The kind of app that makes you smile when you open it but doesn't feel childish.

**Key principles:**

1. **High contrast, warm accents** — B&W as the foundation, with warm coral/amber touches for interactive states and recording
2. **Depth through subtle shadows** — Stickers and piano keys feel like physical objects you can touch
3. **Motion tells the story** — The penguin jumps, notes animate, stickers land with personality

---

## Typography

**Primary Font:** `"DM Sans"` (Google Fonts)

- Clean geometric sans-serif with personality
- Rounded terminals feel friendly without being childish
- Great at small sizes for sticker content

**Monospace (optional, for note labels):** `"JetBrains Mono"` or `"IBM Plex Mono"`

| Use case            | Weight         | Size             | Tracking |
| ------------------- | -------------- | ---------------- | -------- |
| Sticker title       | 600 (SemiBold) | 0.875rem (14px)  | 0        |
| Sticker description | 400 (Regular)  | 0.75rem (12px)   | 0.01em   |
| Dialog heading      | 700 (Bold)     | 1.25rem (20px)   | -0.01em  |
| Dialog labels       | 500 (Medium)   | 0.8125rem (13px) | 0.02em   |
| Recording indicator | 500 (Medium)   | 0.875rem (14px)  | 0.08em   |
| Key labels (C3 etc) | 500 (Medium)   | 0.6875rem (11px) | 0        |

**Import:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
  rel="stylesheet"
/>
```

---

## Color System

### Core Palette

| Token             | Hex       | HSL         | Use                                    |
| ----------------- | --------- | ----------- | -------------------------------------- |
| `--penguin-black` | `#1a1a2e` | 240 28% 14% | Piano body, penguin fill, primary text |
| `--penguin-white` | `#fafaf9` | 40 20% 98%  | Page background, white keys            |
| `--ivory`         | `#f5f0e8` | 36 38% 93%  | Warm off-white for stickers, dialog bg |
| `--coral`         | `#e8564a` | 5 77% 60%   | Recording state, active accent         |
| `--coral-soft`    | `#f9c4bf` | 5 77% 86%   | Recording text, hover glow             |
| `--amber`         | `#f5a623` | 37 91% 55%  | Sticker accent, save button            |
| `--amber-soft`    | `#fde8b5` | 40 94% 85%  | Sticker background tint                |
| `--slate`         | `#64748b` | 215 16% 47% | Secondary text, descriptions           |
| `--slate-light`   | `#cbd5e1` | 213 27% 84% | Borders, disabled states               |

### Dark Mode Palette

| Token             | Hex       | Use                                     |
| ----------------- | --------- | --------------------------------------- |
| `--penguin-black` | `#0f0f1a` | Page background                         |
| `--penguin-white` | `#e8e8e6` | Primary text                            |
| `--ivory`         | `#1e1e2e` | Card/sticker background                 |
| `--coral`         | `#ff6b5e` | Recording state (brighter for contrast) |
| `--slate`         | `#94a3b8` | Secondary text                          |

### Semantic Tokens

```css
:root {
  --bg-page: var(--penguin-white);
  --bg-card: var(--ivory);
  --bg-piano: var(--penguin-black);
  --text-primary: var(--penguin-black);
  --text-secondary: var(--slate);
  --accent-record: var(--coral);
  --accent-record-soft: var(--coral-soft);
  --accent-sticker: var(--amber);
  --accent-sticker-bg: var(--amber-soft);
  --border: var(--slate-light);
  --shadow-sm: 0 1px 3px rgba(26, 26, 46, 0.08);
  --shadow-md: 0 4px 12px rgba(26, 26, 46, 0.1);
  --shadow-lg: 0 8px 24px rgba(26, 26, 46, 0.12);
  --shadow-sticker: 2px 3px 8px rgba(26, 26, 46, 0.12), 0 1px 2px rgba(26, 26, 46, 0.06);
}
```

---

## Spacing Scale

8px base grid:

| Token       | Value |
| ----------- | ----- |
| `--space-1` | 4px   |
| `--space-2` | 8px   |
| `--space-3` | 12px  |
| `--space-4` | 16px  |
| `--space-5` | 24px  |
| `--space-6` | 32px  |
| `--space-8` | 48px  |

---

## Border Radius

| Token           | Value  | Use                   |
| --------------- | ------ | --------------------- |
| `--radius-sm`   | 4px    | Piano key bottoms     |
| `--radius-md`   | 8px    | Buttons, inputs       |
| `--radius-lg`   | 12px   | Dialog, stickers      |
| `--radius-full` | 9999px | Badges, recording dot |

---

## Component Design Specs

### Piano Keys

- **White keys:** `var(--penguin-white)` background, `1px solid var(--slate-light)` subtle border
- **White key active:** Slight inset shadow + scale(0.98) transform for "pressed" feel
- **Black keys:** `var(--penguin-black)` with subtle gradient (top darker)
- **Black key active:** Lighten to `#2a2a3e`
- **Piano body:** 2px solid `var(--penguin-black)`, `var(--radius-sm)` bottom corners

### Stickers (Saved Songs)

- Background: `var(--accent-sticker-bg)` with slight rotation (`transform: rotate(-2deg to 3deg)`, randomized)
- Border: none (shadow provides depth)
- Shadow: `var(--shadow-sticker)`
- Title line: `🐧` emoji + title in SemiBold
- Description: `var(--text-secondary)`, smaller
- Hover: lift shadow to `var(--shadow-md)`, slight scale(1.02)
- Click to play: brief pulse animation on the penguin emoji

### Save Dialog

- Overlay: `rgba(26,26,46,0.4)` with `backdrop-filter: blur(6px)`
- Card: `var(--bg-card)`, `var(--radius-lg)`, `var(--shadow-lg)`
- Submit button: `var(--penguin-black)` bg, white text, `var(--radius-md)`
- Cancel button: transparent bg, `var(--penguin-black)` border
- Inputs: `var(--penguin-white)` bg, `1px solid var(--border)`, `var(--radius-md)`

### Penguin Mascot

- Normal state: `var(--penguin-black)` fill
- Recording state: `var(--accent-record)` fill with soft pulsing glow
- Recording indicator text: `var(--accent-record)`, uppercase with letter-spacing for "RECORDING ♪ ♫"
- Jump animation stays as-is (already well-tuned at 1.15s ease-in-out)

---

## Motion

| Element         | Trigger          | Animation                                                      |
| --------------- | ---------------- | -------------------------------------------------------------- |
| Penguin         | Click to record  | Jump bounce 1.15s infinite (existing)                          |
| Penguin         | Stop recording   | Smooth return to Y=0 (existing)                                |
| Penguin fill    | Record toggle    | `transition: fill 0.3s ease`                                   |
| Sticker appear  | New save         | `scale(0) → scale(1.05) → scale(1)`, cubic-bezier spring, 0.4s |
| Sticker hover   | Mouse enter      | `translateY(-2px)`, shadow elevation, 0.2s                     |
| Sticker click   | Play song        | Quick pulse on the emoji (scale 1 → 1.3 → 1), 0.3s             |
| Dialog          | Open/close       | `opacity 0→1` + `translateY(8px)→0`, 0.25s                     |
| White key press | Mouse/key down   | `scale(0.98)`, inset shadow, 0.05s                             |
| Recording dot   | During recording | `opacity` pulse 1s infinite                                    |

---

## Layout

- Page is full viewport, piano centered horizontally and vertically
- Stickers scatter across the full page at random positions (already implemented)
- Stickers avoid overlapping the piano area (center zone exclusion)
- Minimum margins from viewport edges: `var(--space-5)` (24px)
- Piano container: `max-width` of the natural key layout width, auto-centered

---

## Implementation Priority

1. **Add Google Font import** — `DM Sans` in `index.html`
2. **Replace `base.css` color tokens** — Swap Vue boilerplate for the palette above
3. **Style stickers** — Warm amber background, slight rotation, spring entrance animation
4. **Style dialog** — Blur backdrop, rounded card, refined inputs/buttons
5. **Polish piano** — Subtle key press animations, border refinements
6. **Add recording state polish** — Pulsing red dot, smooth fill transition on penguin

This is not a redesign. It's taking what you already have, which is a solid interactive piano app with a great mascot, and giving it a coherent visual identity that feels as good as it sounds.
