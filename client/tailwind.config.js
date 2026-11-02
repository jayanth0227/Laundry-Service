/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Core Brand Orange
          600: '#EA580C', // Interactive Hover Orange
          700: '#C2410C', // Deep Orange
          800: '#9A3412',
          900: '#7C2D12',
        },
        dark: {
          800: '#27272A',
          850: '#1F1F23',
          900: '#18181B', // Rich Black Surface
          950: '#09090B', // Pitch Black
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px -2px rgba(24, 24, 27, 0.08), 0 1px 4px -1px rgba(24, 24, 27, 0.04)',
        'card-hover': '0 12px 24px -6px rgba(234, 88, 12, 0.15)',
        'orange-glow': '0 4px 20px -2px rgba(249, 115, 22, 0.35)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'drum-spin': 'drumSpin 8s linear infinite',
        'bubble': 'bubble 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        drumSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bubble: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '50%': { transform: 'translateY(-10px) scale(1.08)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
      }
    },
  },
  plugins: [],
}
