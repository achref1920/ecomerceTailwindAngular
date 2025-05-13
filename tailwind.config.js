/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {colors: {
      coral: {
        300: '#FF6B6B',
        300: '#FF6B6B',
        400: '#FF4D4D',
      },
    },
  },
  },
  plugins: [require('@tailwindcss/forms')],
}

