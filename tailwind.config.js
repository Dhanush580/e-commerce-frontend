/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'rgb(9, 46, 32)',
          light: 'rgb(245, 245, 245)'
        },
        gold: '#d4af37'
      },
    },
  },
  plugins: [],
}
