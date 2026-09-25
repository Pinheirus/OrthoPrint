/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand Primary (Sky)
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
        // Clinical Neutrals (Slate Scale for authoritative readability)
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Semantic Clinical Feedback (Desaturated, calm, clinical tones)
        clinical: {
          success: '#10B981', // Clinical Emerald
          'success-bg': '#ECFDF5',
          'success-border': '#A7F3D0',
          'success-text': '#065F46',

          warning: '#F59E0B', // Clinical Amber
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          'warning-text': '#92400E',

          error: '#EF4444', // Clinical Crimson
          'error-bg': '#FEF2F2',
          'error-border': '#FECACA',
          'error-text': '#991B1B',

          info: '#0EA5E9',
          'info-bg': '#F0F9FF',
          'info-border': '#BAE6FD',
          'info-text': '#075985',
        },
        // Background Gradient Colors (Clinical soft sky tint to pure white)
        background: {
          gradientTop: '#E2F0FD', // More noticeable soft clinical sky tint giving organic depth
          gradientBottom: '#FFFFFF',
          fallback: '#F8FAFC',
        },
        // Glass tokens (~88-92% opacity surfaces, ~40-60% opacity borders)
        glass: {
          surface: 'rgba(255, 255, 255, 0.92)',
          'surface-subtle': 'rgba(255, 255, 255, 0.86)',
          'surface-dense': 'rgba(255, 255, 255, 0.96)',
          border: 'rgba(255, 255, 255, 0.85)',
          'border-subtle': 'rgba(226, 232, 240, 0.50)',
        },
      },
      fontFamily: {
        geist: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Type scale optimized for high-contrast hospital lighting
        display: ['34px', { lineHeight: '42px', fontWeight: '700', letterSpacing: '-0.02em' }],
        h1: ['26px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '-0.015em' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
        h3: ['17px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-medium': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        tiny: ['11px', { lineHeight: '15px', fontWeight: '600', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
        '5xl': '44px',
        glass: '32px',
        'glass-sm': '20px',
        'glass-lg': '36px',
      },
      boxShadow: {
        // Soft, organic diffused floating elevation matching reference vibe
        soft: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
        'glass-sm': '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        'glass-md': '0 8px 28px -4px rgba(15, 23, 42, 0.06)',
        'glass-lg': '0 16px 40px -6px rgba(15, 23, 42, 0.08)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      width: {
        touch: '44px',
      },
      height: {
        touch: '44px',
      },
      transitionTimingFunction: {
        clinical: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        tap: '120ms',
        'tab-switch': '180ms',
        surface: '220ms',
      },
    },
  },
  plugins: [],
};