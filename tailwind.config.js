/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html', '!./node_modules/**'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#12233F', 50: '#eef1f6', 100: '#d7dee8', 200: '#aebcd1', 400: '#3b537a', 600: '#1a2d4d', 700: '#12233F', 900: '#0b1626' },
        gold: { DEFAULT: '#B8892B', 50: '#faf5e9', 100: '#f0e0bb', 300: '#d3ac5b', 400: '#c99e3f', 600: '#B8892B', 700: '#93701f', 800: '#7a5c19' },
        charcoal: '#2B2F36',
        brandmist: '#E5E7EB',
      },
      fontFamily: {
        serif: ['Cambria', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Calibri', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        elevated: '0 1px 2px rgba(18,35,63,0.05), 0 8px 20px -6px rgba(18,35,63,0.12), 0 28px 48px -16px rgba(18,35,63,0.14)',
        'elevated-hover': '0 2px 4px rgba(18,35,63,0.06), 0 14px 28px -6px rgba(18,35,63,0.16), 0 36px 60px -16px rgba(18,35,63,0.18)',
        floating: '0 2px 10px rgba(18,35,63,0.10), 0 20px 44px -10px rgba(18,35,63,0.22)',
        gold: '0 10px 28px -6px rgba(184,137,43,0.38)',
      },
    },
  },
};
