export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        accent: '#C8A96E',
        'off-white': '#FAFAFA',
        'card-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
