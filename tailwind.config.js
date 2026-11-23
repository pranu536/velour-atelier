/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF8F5',
          100: '#F5F0EB',
          200: '#E8DED2',
          300: '#D5C4B0',
          400: '#BCA38A',
          500: '#9E8268',
          600: '#7F6650',
          700: '#614D3C',
          800: '#433428',
          900: '#1F1813',
          950: '#120E0B',
        },
        noir: {
          900: '#0A0A0A',
          800: '#141414',
          700: '#222222',
          600: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      letterSpacing: {
        widest: '.2em',
        ultra: '.25em',
      }
    },
  },
  plugins: [],
};
