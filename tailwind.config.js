/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['lineseed', 'sans-serif'],
        'body': ['tt', 'serif'],
    },
    colors: {
      'primary': 'var(--color-primary)',
      'accent': 'var(--color-accent)',
      'secondary': 'var(--color-secondary)',
      'text-color': 'var(--color-text)',
      'text-color-alt': 'var(--color-text-alt)',
      'background': 'var(--color-bg)',
      'background-alt': 'var(--color-bg-alt)',
      'background-active': 'var(--color-active)',
      'line': 'var(--color-line)',
      'line-alt': 'var(--color-line-alt)',
    },
  },
},
  plugins: [],
};
