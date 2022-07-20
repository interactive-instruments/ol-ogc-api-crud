/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
        colors: {
            'ol-button-hover': 'var(--ol-toggle-active-bg,rgba(0,60,136,.7))'
        },
    },
  },
  plugins: [],
};
