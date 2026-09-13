// Inline SVG motifs carry the service imagery instead of boxed icons: they
// inherit currentColor so they read correctly in both themes, cost no network
// request, and keep the circuit/signal visual language from DESIGN.md.
//
// Stroke weights sit at 2.2 for primary geometry, 1.6 for secondary, and 1.2
// for background rails, with opacity floors at 0.35. Earlier 1-1.3 weights
// rendered too faint against bg-elevated once scaled down inside cards.

export const MOTIF_NETWORK = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M22 44h44M134 44h44M100 26V14M100 62v12" stroke="currentColor" stroke-width="1.6" opacity="0.5" stroke-linecap="round" />
  <path d="M66 44c0-14 10-18 34-18s34 4 34 18M66 44c0 14 10 18 34 18s34-4 34-18" stroke="currentColor" stroke-width="1.9" opacity="0.75" />
  <circle cx="100" cy="44" r="11" stroke="currentColor" stroke-width="2.2" />
  <circle cx="100" cy="44" r="4" fill="currentColor" />
  <circle cx="22" cy="44" r="4.5" fill="currentColor" opacity="0.9" />
  <circle cx="178" cy="44" r="4.5" fill="currentColor" opacity="0.9" />
  <circle cx="100" cy="12" r="3.8" fill="currentColor" opacity="0.65" />
  <circle cx="100" cy="76" r="3.8" fill="currentColor" opacity="0.65" />
</svg>`;

export const MOTIF_IOT = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M6 60h22l7-22 9 36 8-44 9 52 8-36 7 14h22" stroke="currentColor" stroke-width="2.2" opacity="0.9" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M98 60h96" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
  <rect x="140" y="26" width="36" height="26" rx="5" stroke="currentColor" stroke-width="2.2" />
  <path d="M150 26v-8M166 26v-8" stroke="currentColor" stroke-width="1.6" opacity="0.75" stroke-linecap="round" />
  <path d="M148 60v-8M168 60v-8" stroke="currentColor" stroke-width="1.6" opacity="0.55" stroke-linecap="round" />
  <circle cx="158" cy="39" r="3.6" fill="currentColor" />
  <path d="M184 30c4 6 4 12 0 18M192 24c6 10 6 20 0 30" stroke="currentColor" stroke-width="1.6" opacity="0.55" stroke-linecap="round" />
</svg>`;

export const MOTIF_AUTOMATION = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="8" y="32" width="34" height="24" rx="5" stroke="currentColor" stroke-width="2.2" />
  <rect x="83" y="14" width="34" height="24" rx="5" stroke="currentColor" stroke-width="1.8" opacity="0.85" />
  <rect x="83" y="50" width="34" height="24" rx="5" stroke="currentColor" stroke-width="1.8" opacity="0.85" />
  <rect x="158" y="32" width="34" height="24" rx="5" stroke="currentColor" stroke-width="2.2" />
  <path d="M42 44h20M62 44V26h21M62 44v18h21M117 26h20v18h21M117 62h20V44" stroke="currentColor" stroke-width="1.6" opacity="0.6" stroke-linecap="round" />
  <circle cx="62" cy="44" r="3.4" fill="currentColor" opacity="0.9" />
  <circle cx="137" cy="44" r="3.4" fill="currentColor" opacity="0.9" />
</svg>`;

export const MOTIF_AI = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M30 22h44M30 44h44M30 66h44M122 33h48M122 55h48" stroke="currentColor" stroke-width="1.2" opacity="0.35" />
  <path d="M74 22l48 11M74 44l48-11M74 44l48 22M74 66l48-11" stroke="currentColor" stroke-width="1.6" opacity="0.6" />
  <circle cx="24" cy="22" r="5" stroke="currentColor" stroke-width="2" />
  <circle cx="24" cy="44" r="5" stroke="currentColor" stroke-width="2" />
  <circle cx="24" cy="66" r="5" stroke="currentColor" stroke-width="2" />
  <circle cx="176" cy="33" r="5.5" fill="currentColor" />
  <circle cx="176" cy="55" r="5.5" fill="currentColor" opacity="0.5" />
</svg>`;

export const MOTIF_WEB = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="30" y="10" width="140" height="20" rx="4" stroke="currentColor" stroke-width="2.2" />
  <rect x="30" y="34" width="140" height="20" rx="4" stroke="currentColor" stroke-width="1.9" opacity="0.8" />
  <rect x="30" y="58" width="140" height="20" rx="4" stroke="currentColor" stroke-width="1.6" opacity="0.6" />
  <circle cx="40" cy="20" r="2.4" fill="currentColor" />
  <circle cx="48" cy="20" r="2.4" fill="currentColor" opacity="0.7" />
  <circle cx="40" cy="44" r="2.2" fill="currentColor" opacity="0.85" />
  <circle cx="40" cy="68" r="2" fill="currentColor" opacity="0.65" />
  <path d="M100 30v4M100 54v4" stroke="currentColor" stroke-width="1.6" opacity="0.5" stroke-linecap="round" />
</svg>`;

export const MOTIF_SPEAKING = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="91" y="18" width="18" height="32" rx="9" stroke="currentColor" stroke-width="2.2" />
  <path d="M100 50v14M88 64h24" stroke="currentColor" stroke-width="2.2" opacity="0.9" stroke-linecap="round" />
  <path d="M126 26c8 8 8 24 0 32M142 18c13 13 13 34 0 47M74 26c-8 8-8 24 0 32M58 18c-13 13-13 34 0 47" stroke="currentColor" stroke-width="1.6" opacity="0.5" stroke-linecap="round" />
</svg>`;

export const MOTIF_MENTORING = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <circle cx="66" cy="28" r="10" stroke="currentColor" stroke-width="2.2" />
  <path d="M48 66c0-10 8-16 18-16s18 6 18 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
  <circle cx="132" cy="33" r="8" stroke="currentColor" stroke-width="1.8" opacity="0.85" />
  <path d="M118 66c0-9 6-14 14-14s14 5 14 14" stroke="currentColor" stroke-width="1.8" opacity="0.85" stroke-linecap="round" />
  <path d="M94 34h18M94 44h11" stroke="currentColor" stroke-width="1.6" opacity="0.55" stroke-linecap="round" />
</svg>`;

// Stage motifs for the process section. Same line-art language as the service
// motifs above, one per stage so each card reads as its own step rather than a
// paragraph with a number on it.

export const STAGE_BRIEF = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="46" y="16" width="70" height="56" rx="6" stroke="currentColor" stroke-width="2.2" />
  <path d="M60 34h42M60 46h42M60 58h24" stroke="currentColor" stroke-width="1.6" opacity="0.6" stroke-linecap="round" />
  <path d="M132 30h34a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6h-22l-12 10V36a6 6 0 0 1 6-6Z" stroke="currentColor" stroke-width="1.9" opacity="0.85" />
  <circle cx="143" cy="45" r="2.4" fill="currentColor" />
  <circle cx="152" cy="45" r="2.4" fill="currentColor" opacity="0.7" />
  <circle cx="161" cy="45" r="2.4" fill="currentColor" opacity="0.45" />
</svg>`;

export const STAGE_DEAL = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="30" y="14" width="64" height="60" rx="6" stroke="currentColor" stroke-width="2.2" />
  <path d="M44 32h36M44 44h36M44 56h20" stroke="currentColor" stroke-width="1.6" opacity="0.55" stroke-linecap="round" />
  <path d="M106 44h22" stroke="currentColor" stroke-width="1.4" opacity="0.45" stroke-linecap="round" />
  <circle cx="152" cy="44" r="22" stroke="currentColor" stroke-width="2" opacity="0.85" />
  <path d="M142 44l7 8 14-16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export const STAGE_BUILD = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="28" y="16" width="144" height="56" rx="6" stroke="currentColor" stroke-width="2.2" />
  <path d="M28 30h144" stroke="currentColor" stroke-width="1.6" opacity="0.6" />
  <circle cx="40" cy="23" r="2.6" fill="currentColor" opacity="0.85" />
  <circle cx="49" cy="23" r="2.6" fill="currentColor" opacity="0.6" />
  <path d="M44 46l8 8-8 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M62 62h34" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
  <path d="M112 44h46M112 56h30" stroke="currentColor" stroke-width="1.6" opacity="0.45" stroke-linecap="round" />
</svg>`;

export const STAGE_REVIEW = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="34" y="14" width="104" height="48" rx="5" stroke="currentColor" stroke-width="2.2" />
  <path d="M74 62v10M58 72h32" stroke="currentColor" stroke-width="1.8" opacity="0.65" stroke-linecap="round" />
  <path d="M48 30h40M48 42h26" stroke="currentColor" stroke-width="1.6" opacity="0.5" stroke-linecap="round" />
  <circle cx="132" cy="48" r="20" stroke="currentColor" stroke-width="2.2" />
  <path d="M147 63l16 14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
  <path d="M124 48l6 6 11-12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export const STAGE_REVISE = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M64 30a26 26 0 1 1-8 38" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
  <path d="M56 18v14h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M112 30h56M112 44h40M112 58h48" stroke="currentColor" stroke-width="1.6" opacity="0.45" stroke-linecap="round" />
  <path d="M156 44h12M162 38v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
</svg>`;

export const STAGE_SHIP = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M52 60h96" stroke="currentColor" stroke-width="1.4" opacity="0.45" />
  <rect x="64" y="40" width="30" height="20" rx="4" stroke="currentColor" stroke-width="2.2" />
  <rect x="106" y="40" width="30" height="20" rx="4" stroke="currentColor" stroke-width="2" opacity="0.85" />
  <path d="M100 30V12M92 20l8-8 8 8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M70 74h60" stroke="currentColor" stroke-width="1.4" opacity="0.35" />
  <circle cx="79" cy="50" r="2.6" fill="currentColor" />
  <circle cx="121" cy="50" r="2.6" fill="currentColor" opacity="0.65" />
</svg>`;

// Rail motif for the engagement panel: signal converging on a single beacon,
// matching the DESIGN.md signal language used on contact surfaces.
export const MOTIF_SIGNAL = `<svg viewBox="0 0 200 88" fill="none" class="h-full w-full" aria-hidden="true">
  <circle cx="100" cy="58" r="6" fill="currentColor" />
  <path d="M100 52V28" stroke="currentColor" stroke-width="1.8" opacity="0.8" stroke-linecap="round" />
  <path d="M78 44c6-10 16-16 22-16s16 6 22 16" stroke="currentColor" stroke-width="1.8" opacity="0.7" stroke-linecap="round" />
  <path d="M62 52c10-18 26-28 38-28s28 10 38 28" stroke="currentColor" stroke-width="1.6" opacity="0.5" stroke-linecap="round" />
  <path d="M44 60c14-26 36-40 56-40s42 14 56 40" stroke="currentColor" stroke-width="1.4" opacity="0.32" stroke-linecap="round" />
  <path d="M40 72h120" stroke="currentColor" stroke-width="1.4" opacity="0.4" />
</svg>`;

// Compact glyphs for the engagement rows, sized for a 20-24px slot. These sit
// smaller than the panel motifs, so they carry a proportionally heavier stroke.

export const GLYPH_FREELANCE = `<svg viewBox="0 0 24 24" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
  <path d="M3 8.5V16l9 4.5 9-4.5V8.5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" opacity="0.75" />
  <path d="M12 13v7.5" stroke="currentColor" stroke-width="1.5" opacity="0.6" />
</svg>`;

export const GLYPH_CONTRACT = `<svg viewBox="0 0 24 24" fill="none" class="h-full w-full" aria-hidden="true">
  <path d="M6 3h8l4 4v14H6V3Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
  <path d="M14 3v4h4" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" opacity="0.8" />
  <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" opacity="0.65" stroke-linecap="round" />
</svg>`;

export const GLYPH_FULLTIME = `<svg viewBox="0 0 24 24" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="3" y="7" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.9" />
  <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
  <path d="M3 12h18" stroke="currentColor" stroke-width="1.6" opacity="0.6" />
</svg>`;

export const GLYPH_REMOTE = `<svg viewBox="0 0 24 24" fill="none" class="h-full w-full" aria-hidden="true">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.9" />
  <path d="M3 12h18" stroke="currentColor" stroke-width="1.6" opacity="0.65" />
  <path d="M12 3c3 3.6 3 14.4 0 18M12 3c-3 3.6-3 14.4 0 18" stroke="currentColor" stroke-width="1.6" opacity="0.55" />
</svg>`;

export const GLYPH_SPEAKING = `<svg viewBox="0 0 24 24" fill="none" class="h-full w-full" aria-hidden="true">
  <rect x="9.5" y="3" width="5" height="10" rx="2.5" stroke="currentColor" stroke-width="1.9" />
  <path d="M7 12a5 5 0 0 0 10 0" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" opacity="0.85" />
  <path d="M12 17v4M9.5 21h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity="0.7" />
</svg>`;

export const GLYPH_MENTORING = `<svg viewBox="0 0 24 24" fill="none" class="h-full w-full" aria-hidden="true">
  <circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="1.9" />
  <path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
  <circle cx="17.5" cy="9.5" r="2.5" stroke="currentColor" stroke-width="1.7" opacity="0.75" />
  <path d="M15.5 20c0-2.6 1.6-4.2 3.5-4.2s3 1.4 3 3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity="0.75" />
</svg>`;

// Shared dotted-grid backdrop for motif panels. Kept here so every services
// surface renders the same texture instead of redeclaring the gradient.
export const MOTIF_PANEL_GRID =
  'background-image: radial-gradient(var(--border) 1px, transparent 1px); background-size: 12px 12px;';
