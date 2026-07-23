/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          100: '#EAF2ED',
          200: '#C7DACD',
          300: '#9DBBA8',
          400: '#6E9A80',
          950: '#06140F',
          900: '#0A1F17',
          800: '#0F2E21',
          700: '#153D2C',
          600: '#1D5039',
          500: '#276B4A',
        },
        gold: {
          400: '#E8C77E',
          500: '#D4AF5A',
          600: '#B8924A',
        },
        coral: {
          500: '#E27D5F',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
