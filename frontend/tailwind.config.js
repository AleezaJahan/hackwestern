/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f2',
          100: '#ffe1e3',
          200: '#ffc7cc',
          300: '#ffa0a8',
          400: '#ff6975',
          500: '#ff3d50',
          600: '#ed1b2e',
          700: '#c81424',
          800: '#a51422',
          900: '#881822',
        },
        warning: {
          50: '#fff8ed',
          100: '#ffeed5',
          200: '#ffdaaa',
          300: '#ffbf74',
          400: '#ff9a3c',
          500: '#ff7a16',
          600: '#f05c0c',
          700: '#c7450c',
          800: '#9e3612',
          900: '#7f2f12',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
  plugins: [],
}

