/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "total-sleep-and-time-in-bed-border": "#ECD3C8",
        "total-sleep-and-time-in-bed-bg": "#FFFAF8",
        "total-sleep-and-time-in-bed-text": "#A8440C",
        "sleep-score-border": "#C8D8EC",
        "sleep-score-bg": "#F8FBFF",
        "sleep-score-text": "#164FA4",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
