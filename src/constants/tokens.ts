/**
 * OrthoPrint Design System Tokens
 * Clinical, high-contrast, light-only design specification.
 */

export const Colors = {
  // Brand Primary (Sky Blue)
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Base Brand Primary
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    DEFAULT: '#0EA5E9',
  },

  // Background Gradient (Clinical soft sky tint to pure white)
  background: {
    gradientTop: '#BAE6FD', // Noticeable soft clinical sky blue (sky-200)
    gradientMiddle: '#E0F2FE', // Soft sky tint (sky-100)
    gradientBottom: '#F0F9FF', // Gentle ambient tint at bottom (sky-50) so cards have backdrop to blur
    solidFallback: '#E0F2FE',
  },

  // Clinical Neutrals (Slate Scale for WCAG AA compliance under hospital lights)
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155', // Body secondary text (>= 4.5:1 contrast against white/glass)
    800: '#1E293B', // Subheaders & emphasized text
    900: '#0F172A', // Primary headers & high-contrast readings (14.2:1 against glass)
  },

  // Semantic Clinical States (Desaturated, calm, clinical tones)
  clinical: {
    success: {
      base: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#065F46',
    },
    warning: {
      base: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#92400E',
    },
    error: {
      base: '#EF4444',
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#991B1B',
    },
    info: {
      base: '#0EA5E9',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      text: '#075985',
    },
  },

  // Glassmorphic Surface Specifications
  // High opacity (85-92%) to prioritize clinical legibility over transparency
  glass: {
    surface: 'rgba(255, 255, 255, 0.90)',
    surfaceSubtle: 'rgba(255, 255, 255, 0.85)',
    surfaceDense: 'rgba(255, 255, 255, 0.94)',
    border: 'rgba(255, 255, 255, 0.60)',
    borderSubtle: 'rgba(226, 232, 240, 0.65)',
  },
} as const;

export const Typography = {
  fontFamilies: {
    geist: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"IBM Plex Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  scale: {
    display: {
      fontSize: 34,
      lineHeight: 42,
      fontWeight: '700' as const,
      letterSpacing: -0.68,
    },
    h1: {
      fontSize: 26,
      lineHeight: 34,
      fontWeight: '700' as const,
      letterSpacing: -0.39,
    },
    h2: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500' as const,
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500' as const,
    },
    tiny: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600' as const,
      letterSpacing: 0.44,
    },
  },
} as const;

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Radii = {
  sm: 10,
  md: 14,
  glass: 20,
  lg: 24,
  full: 9999,
} as const;

export const Elevation = {
  glassSm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  glassMd: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
  },
  glassLg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;

export const TouchTarget = {
  minSize: 44,
} as const;

export const Motion = {
  durations: {
    tap: 120,
    tabSwitch: 180,
    surface: 220,
  },
  easing: {
    clinical: [0.16, 1, 0.3, 1] as const, // Calm, smooth deceleration
  },
} as const;

export const IconSizes = {
  inline: 16,
  status: 20,
  nav: 24,
  action: 28,
  hero: 36,
} as const;
