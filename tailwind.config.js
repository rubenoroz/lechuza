/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)'],
        'geist-mono': ['var(--font-geist-mono)'],
        manrope: ['var(--font-manrope)'],
        'playfair-display': ['var(--font-playfair-display)'],
        inter: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};
