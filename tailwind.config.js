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
        "blue-border": "#C8D8EC",
        "blue-bg": "#F8FBFF",
        "blue-text": "#164FA4",
        'fitbit-text': '#00B0B9',
        'fitbit-bg': '#002A3A',
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      fontSize: {
        22: "22px",
        26: "26px",
        28: "28px",
        64: "64px",
      },
      flexGrow: {
        2: "2",
      },
      spacing: {
        "5_5": "1.32rem",
      },
    },
  },
  plugins: [],
};
