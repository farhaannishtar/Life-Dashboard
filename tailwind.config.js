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
        "brown-border": "#ECD3C8",
        "brown-bg": "#FFFAF8",
        "brown-text": "#A8440C",
        "blue-border": "#C8D8EC",
        "blue-bg": "#F8FBFF",
        "blue-text": "#164FA4",
        "purple-border": "#ECC8E4",
        "purple-bg": "#FBF8FA",
        "purple-text": "#A80C73",
        "reddish-brown-border": "#ECC8C8",
        "reddish-brown-bg": "#FFF8F8",
        "reddish-brown-text": "#A80C0C",
        "gray-border": "#D8DCE0",
        "gray-bg": "#F4F7FA",
        "gray-text": "#506579",
        "red-border": "#E9C1C1",
        "red-bg": "#FFF1F1",
        "red-text": "#C52929",
        "green-border": "#A9D09B",
        "green-bg": "#F1FFF1",
        "green-text": "#387238",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
