/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ffffff',
        secondary: '#666666',
        accent: '#cccccc',
        dark: '#111111',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        neon: {
          '0%, 100%': {
            'box-shadow': '0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.3)'
          },
          '50%': {
            'box-shadow': '0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.4)'
          }
        },
        neonDark: {
          '0%, 100%': {
            'box-shadow': '0 0 5px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.3)'
          },
          '50%': {
            'box-shadow': '0 0 10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 0, 0, 0.4)'
          }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        neon: 'neon 2s ease-in-out infinite',
        neonDark: 'neonDark 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite'
      }
    },
  },
  plugins: [],
};