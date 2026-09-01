import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0d0f14",
        foreground: "#f3f4f6",
        surface: {
          50: "#181c24",
          100: "#1f2430",
          200: "#272d3b",
          300: "#323a4b",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          glow: "rgba(99, 102, 241, 0.25)",
        },
        meta: {
          green: "#66cc33",
          yellow: "#ffcc33",
          red: "#ff0000",
        },
        status: {
          completed: "#10b981",
          playing: "#3b82f6",
          dropped: "#ef4444",
          backlog: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
