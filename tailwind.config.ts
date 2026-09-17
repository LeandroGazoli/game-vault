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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        "border-active": "var(--border-active)",
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          50: "#181c24",
          100: "#1f2430",
          200: "#272d3b",
          300: "#323a4b",
        },
        card: {
          DEFAULT: "var(--card)",
          hover: "var(--card-hover)",
          foreground: "var(--card-foreground)",
        },
        // Exigidos pelos componentes shadcn. Aditivos — nenhum token existente mudou.
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          glow: "rgba(99, 102, 241, 0.25)",
          foreground: "var(--accent-foreground)",
          cyan: "var(--accent-cyan)",
          emerald: "var(--accent-emerald)",
          amber: "var(--accent-amber)",
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
