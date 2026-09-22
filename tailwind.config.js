/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ora: {
          background: '#1E1E21',
          surface: '#29292D',
          dark: '#151516',
          gold: '#C9A24B',
          primary: '#F5F3EF',
          secondary: '#A9A7A4',
          divider: '#39393D',
          error: '#E08C7D',
        },
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
      },
      spacing: {
        0.5: 2,
        1: 4,
        2: 8,
        3: 16,
        4: 24,
        5: 32,
        6: 64,
      },
      borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
      },
    },
  },
  plugins: [],
};
