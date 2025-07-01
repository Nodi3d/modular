/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['F5.6', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        serif: ['Marcellus', 'Yu Gothic', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Inter', 'serif'],
      },
      colors: {
        primary: '#111111',
        secondary: '#25FEC1',
        content: {
          h: '#1C1C1C',
          m: '#707070',
          l: '#BDBDBD',
          xl: '#E9E9E9',
          xxl: '#F5F5F5',
          'h-a': 'rgba(28,28,28,.89)',
          'm-a': 'rgba(28,28,28,.56)',
          'l-a': 'rgba(28,28,28,.26)',
          'xl-a': 'rgba(28,28,28,.12)',
          'xxl-a': 'rgba(28,28,28,.08)',
          'dark-h-a': 'rgba(255,255,255,.89)',
          'dark-m-a': 'rgba(255,255,255,.56)',
          'dark-l-a': 'rgba(255,255,255,.26)',
          'dark-xl-a': 'rgba(255,255,255,.12)',
          'dark-xxl-a': 'rgba(255,255,255,.08)',
        },
        surface: {
          base: '#E7E7E7',
          ev1: '#35383B',
          ev2: '#000000',
          'sheet-h': 'rgba(255,255,255,.64)',
          'sheet-m': 'rgba(255,255,255,.56)',
          'sheet-l': 'rgba(255,255,255,.32)',
        },
        system: {
          'error-h': '#F3785D',
          'error-m': 'rgba(243,120,93,.56)',
          'error-l': 'rgba(243,120,93,.26)',
          warning: 'rgba(254, 161, 41, 1.0)',
          success: '#00FF00',
          info: '#4597F7',
        },
      },
    },
  },
  plugins: [],
}

