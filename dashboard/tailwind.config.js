/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'sufi-light': '#E6D9F5',
        'sufi-purple': '#8B5FBF',
        'sufi-dark': '#5B3A8C',
        'sufi-deeper': '#3D2661',
      },
    },
  },
  plugins: [],
};
