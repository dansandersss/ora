/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
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
