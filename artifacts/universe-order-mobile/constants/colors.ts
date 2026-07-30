/**
 * Cosmic design tokens — mirrored from artifacts/universe-order/src/index.css
 * Deep midnight blue palette with gold accents.
 */

const colors = {
  light: {
    // Legacy aliases
    text: '#f4f9fd',
    tint: '#fbbe23',

    // Core surfaces
    background: '#060c1a',
    foreground: '#f4f9fd',

    // Cards / elevated surfaces
    card: '#080f20',
    cardForeground: '#f4f9fd',
    cardBorder: '#18253a',

    // Primary action (cosmic gold)
    primary: '#fbbe23',
    primaryForeground: '#060c1a',

    // Secondary / subdued surfaces
    secondary: '#18253a',
    secondaryForeground: '#f4f9fd',

    // Muted / placeholder elements
    muted: '#18253a',
    mutedForeground: '#8fa3b8',

    // Accent highlights
    accent: '#18253a',
    accentForeground: '#f4f9fd',

    // Destructive
    destructive: '#f03737',
    destructiveForeground: '#f4f9fd',

    // Borders and inputs
    border: '#18253a',
    input: '#18253a',
  },

  // Border radius: 0.75rem from web = 12px
  radius: 12,
};

export default colors;
