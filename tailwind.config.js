/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f5f0fb',
          100: '#ede5f7',
          200: '#dccef0',
          300: '#c3ace5',
          400: '#A64DFF',
          500: '#8C30DF',
          600: '#7B28C5',
          700: '#7023B0',
          800: '#6A0DAD',
          900: '#5D2E8C',
          950: '#4a2370',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
    },
  },
  plugins: [],
};
