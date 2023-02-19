// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  plugins: [
    // ...
    require('@tailwindcss/forms'),
  ],
  content: [
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  // ...
}