/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a38071', // Confident warm neutral accent
          600: '#8c6b5d',
          700: '#75584b',
          800: '#5c453b',
          900: '#44322a',
        },
        surface: '#fafafa',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // Editorial feel for headings
      }
    },
  },
  plugins: [],
}
