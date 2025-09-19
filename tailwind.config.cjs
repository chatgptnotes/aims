/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./apps/web/src/**/*.{js,ts,jsx,tsx}",
    "./packages/api/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Limitless Brain Lab Brand Colors
        'lbl-navy': '#1F2B5F',
        'lbl-gold': '#FFD700',
        'lbl-dark-navy': '#2a3a6e',
        'lbl-light-gold': '#FFE55C',
        'lbl-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Myndlift-style colors
        'teal': {
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
      fontFamily: {
        'sans': ['Cabin', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['Cabin', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 215, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brain-pattern': "url('/assets/brain-pattern.svg')",
      },
    },
  },
  plugins: [],
};