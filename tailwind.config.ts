import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#faf6f1",
          100: "#f1e8db",
          200: "#e2cfb1",
          300: "#cdac80",
          400: "#b88a5a",
          500: "#a06f44",
          600: "#855838",
          700: "#6b4530",
          800: "#523427",
          900: "#3b251c",
        },
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
