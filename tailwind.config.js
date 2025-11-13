/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'cabin': ['Cabin', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#323956', // Dark Navy Blue
          dark: '#232D3C',     // Darker Navy
          light: '#CAE0FF',    // Sky Blue
        },
        accent: {
          DEFAULT: '#F5D05D',  // Golden Yellow
          light: '#E4EFFF',    // Light Blue
        },
        navy: {
          900: '#232D3C',
          800: '#323956',
          700: '#3d4564',
          600: '#4a5272',
        },
        sky: {
          100: '#E4EFFF',
          200: '#CAE0FF',
        },
        gold: {
          DEFAULT: '#F5D05D',
          dark: '#d9b84a',
        }
      },
    },
  },
  plugins: [],
}