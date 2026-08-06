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
          bg: '#FAF6EF',
          text: '#2B2620',
        },
        dark: {
          bg: '#1A1917',
          text: '#EDE6D9',
        },
        accent: '#B8912F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Crimson Pro', 'serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
