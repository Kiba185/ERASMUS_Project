/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          leaf: '#0b7f16',
          grass: '#129421',
          mist: '#f3f8f1',
          pine: '#003d12',
          moss: '#4f7258',
          sage: '#79aa7f',
          lichen: '#9fb3a2',
          fern: '#176b26',
          meadow: '#58a860',
        },
      },
      boxShadow: {
        soft: '0 14px 28px -18px rgba(0, 61, 18, 0.38)',
      },
    },
  },
  plugins: [],
}
