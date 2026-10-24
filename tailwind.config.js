/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0a1a01',
          900: '#142901',
          800: '#1e3d02',
          700: '#295203',
          600: '#346e04',
          500: '#3d8205',
          400: '#5ba008',
          300: '#87c23b',
          200: '#b8dc82',
          100: '#ddeebb',
          50:  '#f0f7e8',
        },
        sand: {
          900: '#212529',
          800: '#343a40',
          700: '#495057',
          600: '#6c757d',
          500: '#868e96',
          400: '#adb5bd',
          300: '#ced4da',
          200: '#dee2e6',
          100: '#e9ecef',
          50:  '#f8f9fa',
        },
        bark: {
          900: '#191919',
          800: '#212121',
          700: '#333333',
          600: '#495057',
          500: '#6c757d',
          400: '#868e96',
          300: '#adb5bd',
          200: '#ced4da',
          100: '#e9ecef',
          50:  '#f8f9fa',
        },
      },
      fontFamily: {
        sans: ['Roboto'],
      },
    },
  },
  plugins: [],
}
