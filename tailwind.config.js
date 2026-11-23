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
        // Soft Sleep Inspired Palette
        ivory: {
          DEFAULT: '#F8F6F1',
          50: '#FDFCFB',
          100: '#F8F6F1',
          200: '#F1EDE5',
          300: '#E8E2D7',
        },
        cream: {
          DEFAULT: '#F1EDE5',
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#F1EDE5',
          300: '#E3DDD2',
          400: '#D5CCBF',
        },
        charcoal: {
          DEFAULT: '#242424',
          900: '#1A1A1A',
          800: '#242424',
          700: '#333333',
          600: '#4D4D4D',
          500: '#666666',
        },
        beige: {
          DEFAULT: '#D8CDBD',
          100: '#EFEBE4',
          200: '#E5DFD6',
          300: '#D8CDBD',
          400: '#C2B4A0',
          500: '#A99882',
        },
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
          900: '#242424',
          950: '#1A1A1A',
        },
        noir: {
          900: '#242424',
          800: '#2A2A2A',
          700: '#383838',
          600: '#4A4A4A',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest: '.18em',
        ultra: '.24em',
      }
    },
  },
  plugins: [],
};

