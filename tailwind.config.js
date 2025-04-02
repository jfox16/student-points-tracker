/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app': {
          'background': '#f3f4f6',
          'border': '#e5e7eb',
          'text': {
            'primary': '#111827',
            'secondary': '#9ca3af',
            'accent': '#3b82f6'
          }
        }
      }
    },
  },
  plugins: [],
} 