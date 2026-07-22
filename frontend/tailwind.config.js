/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Original colors
        page: '#F8F4EA',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAF7F0',
        },
        sidebar: {
          active: '#FBEFD1',
        },
        gold: {
          50: '#FBF3DE',
          200: '#F0D896',
          400: '#D9AE47',
          500: '#C9992E',
          600: '#B8860B',
          700: '#8C6A14',
        },
        ink: {
          900: '#211D17',
          700: '#4A443B',
          400: '#9A9186',
          200: '#E4DFD3',
        },
        card: {
          black: {
            start: '#211B14',
            end: '#3E2F19',
            text: '#F3E6C4',
          }
        },
        success: {
          bg: '#E4F1E8',
          text: '#3E7C56',
        },
        pending: {
          bg: '#F6E9CE',
          text: '#A97A1F',
        },
        danger: {
          bg: '#F8E3E1',
          text: '#B4453A',
        },
        // New Template Colors
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "background": "var(--color-background)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "inverse-surface": "var(--color-inverse-surface)",
        "surface-container-low": "var(--color-surface-container-low)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "surface-container": "var(--color-surface-container)",
        "on-primary": "var(--color-on-primary)",
        "error": "var(--color-error)",
        "on-background": "var(--color-on-background)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "error-container": "var(--color-error-container)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "tertiary": "var(--color-tertiary)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "on-error-container": "var(--color-on-error-container)",
        "surface-bright": "var(--color-surface-bright)",
        "primary": "var(--color-primary)",
        "secondary-container": "var(--color-secondary-container)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "primary-container": "var(--color-primary-container)",
        "on-surface": "var(--color-on-surface)",
        "surface-container-high": "var(--color-surface-container-high)",
        "secondary": "var(--color-secondary)",
        "on-primary-container": "var(--color-on-primary-container)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "tertiary-container": "var(--color-tertiary-container)",
        "primary-fixed": "var(--color-primary-fixed)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "on-error": "var(--color-on-error)",
        "surface-tint": "var(--color-surface-tint)",
        "outline": "var(--color-outline)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "on-secondary": "var(--color-on-secondary)",
        "inverse-primary": "var(--color-inverse-primary)",
        "surface-dim": "var(--color-surface-dim)",
        "surface-variant": "var(--color-surface-variant)",
        "outline-variant": "var(--color-outline-variant)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "on-tertiary": "var(--color-on-tertiary)"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "stack-lg": "32px",
        "gutter": "24px",
        "sidebar-width": "280px",
        "margin-desktop": "40px",
        "stack-sm": "8px",
        "container-max-width": "1440px",
        "stack-md": "16px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Hanken Grotesk", "sans-serif"],
        "headline-md": ["Noto Serif", "serif"],
        "headline-lg": ["Noto Serif", "serif"],
        "display-lg": ["Noto Serif", "serif"],
        "label-md": ["Hanken Grotesk", "sans-serif"],
        "label-sm": ["Hanken Grotesk", "sans-serif"]
      },
      fontSize: {
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "500"}],
        "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "500"}],
        "display-lg": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}]
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E4BE5C 0%, #B8860B 100%)',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(33, 29, 23, 0.06)',
        'card-hover': '0 10px 30px rgba(33, 29, 23, 0.10)',
        'gold-glow': '0 8px 24px rgba(184, 134, 11, 0.35)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
