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
        "bed-time-border": "#ECC8E4",
        "bed-time-bg": "#FBF8FA",
        "bed-time-text": "#A80C73",
        "wake-up-border": "#ECC8C8",
        "wake-up-bg": "#FFF8F8",
        "wake-up-text": "#A80C0C",
        "weight-border": "#D8DCE0",
        "weight-bg": "#F4F7FA",
        "weight-text": "#506579",
        "blood-glucose-border": "#E9C1C1",
        "blood-glucose-bg": "#FFF1F1",
        "blood-glucose-text": "#C52929",
        "step-count-border": "#A9D09B",
        "step-count-bg": "#F1FFF1",
        "step-count-text": "#387238",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      width: {
        60: "60%",
      },
    },
  },
  plugins: [],
};
