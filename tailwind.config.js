/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Duolingo-exact palette
        feather: '#58CC02',
        'feather-dark': '#58A700',
        'feather-light': '#89E219',
        macaw: '#1CB0F6',
        'macaw-dark': '#1899D6',
        bee: '#FFC800',
        'bee-dark': '#E5A400',
        cardinal: '#FF4B4B',
        'cardinal-dark': '#EA2B2B',
        beetle: '#CE82FF',
        'beetle-dark': '#A560E8',
        fox: '#FF9600',
        'fox-dark': '#E08600',
        humpback: '#2B70C9',
        eel: '#4B4B4B',
        wolf: '#777777',
        hare: '#AFAFAF',
        swan: '#E5E5E5',
        polar: '#F7F7F7',
        snow: '#FFFFFF',
        ink: '#3C3C3C',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Nunito"', 'system-ui', 'sans-serif'],
        sans: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        xl2: '16px',
      },
      boxShadow: {
        btn: '0 4px 0 0 rgba(0,0,0,0.18)',
        card: '0 2px 0 0 #E5E5E5',
      },
    },
  },
  plugins: [],
}
