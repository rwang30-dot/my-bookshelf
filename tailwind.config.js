/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bookshelf: {
          50: '#fdfbf7',
          100: '#f7f2ea',
          200: '#eee3d2',
          300: '#e1ccb2',
          400: '#cca986',
          500: '#b88c64',
          600: '#9d704d',
          700: '#7f573d',
          800: '#684734',
          900: '#563a2c',
        }
      },
      boxShadow: {
        'book': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 4px 4px 10px rgba(0, 0, 0, 0.15)',
        'book-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08), 8px 8px 20px rgba(0, 0, 0, 0.22)',
      }
    },
  },
  plugins: [],
}
