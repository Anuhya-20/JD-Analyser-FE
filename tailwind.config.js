/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#2563EB',
          600: '#1E3A8A',
          700: '#172554',
          800: '#0F1F3D',
          900: '#060C1E',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#F8FAFC',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient':       'linear-gradient(to bottom right, #0A6CCB, #1D8AD8, #5CC8F5)',
        'brand-gradient-hover': 'linear-gradient(to bottom right, #085aaa, #176db0, #3aaee0)',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px 0 rgba(30,58,138,0.10), 0 1px 4px 0 rgba(0,0,0,0.06)',
        glass: '0 8px 32px 0 rgba(30,58,138,0.10)',
      },
      animation: {
        'counter': 'counter 1.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
