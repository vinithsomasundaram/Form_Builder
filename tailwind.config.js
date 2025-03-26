/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-gray': 'rgb(199,194,194)',
      },
    },
  },
  plugins: [],
}
