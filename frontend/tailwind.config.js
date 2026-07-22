/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E4BE5C 0%, #B8860B 100%)',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(33, 29, 23, 0.06)',
        'card-hover': '0 10px 30px rgba(33, 29, 23, 0.10)',
        'gold-glow': '0 8px 24px rgba(184, 134, 11, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
