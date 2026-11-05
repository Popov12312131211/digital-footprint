import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--background)",
        "bg-2": "var(--background-secondary)",
        blue: "var(--accent-blue)",
        purple: "var(--accent-purple)",
        cyan: "var(--accent-cyan)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        ink: "var(--text-primary)",
        "ink-2": "var(--text-secondary)",
      },
      borderRadius: {
        glass: "24px",
        "glass-sm": "18px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.06)" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.55" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        sweep: "sweep 14s linear infinite",
        "pulse-ring": "pulseRing 4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
