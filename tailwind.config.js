/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gemini: {
          50: '#f0f4f9',
          100: '#e1e9f4',
          200: '#c5d7ed',
          300: '#99bcde',
          400: '#649bca',
          500: '#3f7db2',
          600: '#2d6394',
          700: '#264f77',
          800: '#234463',
          900: '#213a53',
          950: '#152537',
        },
        surface: {
          light: '#f8fafc',
          card: '#ffffff',
          dark: '#131314',
          cardDark: '#1e1f20',
          hoverDark: '#282a2c',
          borderDark: '#333538'
        }
      },
      fontFamily: {
        sans: [
          'Google Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(66, 133, 244, 0.15)',
        'glow-md': '0 0 25px -4px rgba(138, 92, 246, 0.2)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      }
    },
  },
  plugins: [],
}
