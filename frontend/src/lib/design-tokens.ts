/**
 * StudAI Design Tokens — Neo-Brutalist + Playful Social
 *
 * Design principles:
 * 1. BORDERS ARE LOUD — 2-3px solid borders, high contrast
 * 2. SHADOWS ARE HARD — Solid offset shadows, no blur
 * 3. SHAPES ARE BINARY — Either sharp (0px) or pill (9999px), nothing in between
 * 4. COLORS POP — Saturated accent colors on dark backgrounds
 * 5. TYPE IS BOLD — Heavy weights, uppercase headings, mono for labels
 * 6. MOTION IS BOUNCY — Spring physics, playful overshoots
 */

// ─── Color Palette ───
export const colors = {
  // Backgrounds
  bg: "#0D0D0D",
  bgAlt: "#1A1A2E",
  surface: "#16213E",

  // Borders (intentionally high contrast)
  border: "#2E2E4A",
  borderBright: "#FFFDF7",
  borderPrimary: "#FF6B35",
  borderSecondary: "#00E5A0",

  // Primary — Bold Orange
  primary: "#FF6B35",
  primaryFg: "#0D0D0D",

  // Secondary — Electric Mint
  secondary: "#00E5A0",
  secondaryFg: "#0D0D0D",

  // Accent — Bright Yellow
  accent: "#FFE156",
  accentFg: "#0D0D0D",

  // Extra — Hot Pink (for destructive + fun highlights)
  pink: "#FF3366",
  pinkFg: "#FFFFFF",

  // Extra — Electric Blue (for badges, links)
  blue: "#4ECDC4",

  // Text
  text: "#FFFDF7",
  textMuted: "#8B8B9E",

  // Shadows (solid colors, no opacity)
  shadowPrimary: "#FF6B35",
  shadowSecondary: "#00E5A0",
  shadowAccent: "#FFE156",
  shadowDark: "#000000",
} as const;

// ─── Shadows (hard offset, no blur) ───
export const shadows = {
  sm: "3px 3px 0px 0px #000000",
  md: "4px 4px 0px 0px #000000",
  lg: "6px 6px 0px 0px #000000",
  xl: "8px 8px 0px 0px #000000",
  primary: "4px 4px 0px 0px #FF6B35",
  secondary: "4px 4px 0px 0px #00E5A0",
  accent: "4px 4px 0px 0px #FFE156",
  pink: "4px 4px 0px 0px #FF3366",
  // Hover states — shadow grows
  hoverSm: "2px 2px 0px 0px #000000",
  hoverLg: "6px 6px 0px 0px #000000",
} as const;

// ─── Border Widths ───
export const borders = {
  thin: "2px",
  thick: "3px",
  chunky: "4px",
} as const;

// ─── Border Radii (binary: sharp or pill) ───
export const radii = {
  none: "0px",
  pill: "9999px",
  // Exception: slight round for cards to soften without losing brutalism
  card: "4px",
} as const;

// ─── Spacing Scale ───
export const space = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

// ─── Typography ───
export const typography = {
  fontHeading: "var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif",
  fontBody: "var(--font-geist-sans), system-ui, sans-serif",
  fontMono: "var(--font-geist-mono), 'JetBrains Mono', monospace",

  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    "4xl": "2.5rem",
    "5xl": "3.5rem",
    "6xl": "4.5rem",
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;
