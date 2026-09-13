# DESIGN.md — NaufalRF public-astro

Dark-first personal portfolio. Engineering / "integrated systems" voice. Anti-generic-template: every page and every homepage section has a DISTINCT macro-silhouette. No repeated centered-container + left-H2 monotony.

## 0. Palette (from `@naufalrf/design-tokens`, dark default)
- `--bg #0b0d10` page bg · `--bg-elevated #14171b` · `--bg-card #171b1f`
- `--border #262b31` · `--border-hover #3a434d`
- `--text-primary #e8eaed` · `--text-secondary #8b93a1` · `--text-tertiary #565e68`
- `--teal #3ed9c4` (primary accent) · `--amber #f2a64c` (secondary accent, status/pulse only)
- glows: `--teal-glow`, `--teal-soft`, `--amber-soft`
- radii: `--radius-card 12px`, `--radius-container 16px`
- Tailwind aliases already wired in globals.css `@theme`: `bg`, `bg-elevated`, `bg-card`, `line`, `line-hover`, `text-primary/secondary/tertiary`, `teal`, `amber`, plus legacy `primary`/`accent` → teal.

## 1. Typography
- Display/headings: **Space Grotesk** (`font-display`), tight `tracking-[-0.02em..-0.04em]`, bold.
- Body: **Inter** (`font-sans`).
- Meta/labels/telemetry: **JetBrains Mono** (`font-mono`), uppercase, wide `tracking-[0.2em+]`, small (`text-[10px]..text-xs`).
- Hierarchy contrast: big display H1/H2 (clamp 2.75rem–7vw) vs tiny mono overlines. Number chapters `01 —`, `02 —` in mono teal.

## 2. Layout principles (THE point of this redesign)
- Asymmetric 12-col thinking. Vary per section: right-aligned headers, staggered columns, overlapping/bleed cards, sticky rails, full-bleed vs contained alternation.
- **Container gutter:** content sits in a max-width container with clear L/R gutters. Background decorative layers (dot-grid, glows) are CONSTRAINED to the container / masked — never a hard full-bleed edge-to-edge wash that reads as "no side spacing."
- Kill repetitive horizontal `border-t` banding between every section. Use negative space + one strong divider max where needed.
- Images: never oversized. Avatars/photos deliberate focal points, properly sized, responsive.

## 3. Motion
- framer-motion v12. GPU only: `transform`, `opacity`. Ease `[0.22,1,0.36,1]`, durations 0.6–0.9s.
- Respect `useReducedMotion()` — disable parallax/tilt/entrance when true.
- Entrance: fade + y/x translate on `whileInView`, staggered children.

## 4. Components
- **3D ID card (hero):** lightweight perspective card — CSS `transform-style: preserve-3d` + pointer-driven `rotateX/rotateY` (framer-motion `useMotionValue`/`useSpring` or rAF), glare/sheen layer, teal accent edge, monochrome-til-hover photo. NO extra WebGL. Disable tilt on touch / reduced-motion.
- Cards: `card-base`, hover lift via `card-glow-hover`. Mono `.mono-tag` for tech/date/status chips.

## 5. Accessibility
- Color contrast: text-secondary on bg is borderline — body copy prefers text-primary/secondary; never text-tertiary for long body.
- Focus visible, aria-labels on icon links, `prefers-reduced-motion` honored.

## 6. Accepted debt
- GlobalScene WebGL backdrop persists across sections (circuit/flow/signal/terrain states) — kept; decorative layers constrained per §2.
