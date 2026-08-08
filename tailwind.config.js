/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          bg: 'rgb(var(--color-light-bg) / <alpha-value>)',
          text: 'rgb(var(--color-light-text) / <alpha-value>)',
        },
        dark: {
          bg: 'rgb(var(--color-dark-bg) / <alpha-value>)',
          text: 'rgb(var(--color-dark-text) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'verse-bg': {
          light: 'rgb(var(--color-light-bg) / <alpha-value>)',
          dark: 'rgb(var(--color-dark-bg) / <alpha-value>)',
        },
        'verse-text': {
          light: 'rgb(var(--color-light-text) / <alpha-value>)',
          dark: 'rgb(var(--color-dark-text) / <alpha-value>)',
        },
        'verse-accent': 'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Crimson Pro', 'serif'],
        'font-voice': ['Crimson Pro', 'serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
