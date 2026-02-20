/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0D0D0D",
          secondary: "#1A1A1A",
          card: "#242424",
        },
        accent: {
          primary: "#39FF14",
          hover: "#32E012",
        },
        text: {
          primary: "#E8E8E8",
          secondary: "#A0A0A0",
        },
        state: {
          error: "#FF4444",
          warning: "#FFAA00",
          success: "#39FF14",
        },
        border: "#333333",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
