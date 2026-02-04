/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  extend: {
    borderRadius: {
      '4xl': '32px',
    },
    borderWidth: {
      12: '12px',
    },
  },
},

  plugins: [],
}
