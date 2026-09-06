import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        incident: {
          bg: "#0f1117",
          card: "#1a1d27",
          border: "#2a2d3a",
          text: "#e1e4ed",
          muted: "#8b8fa3",
          accent: "#3b82f6",
          fact: "#22c55e",
          hypothesis: "#f59e0b",
          conflict: "#ef4444",
          decision: "#8b5cf6",
          action: "#06b6d4",
          risk: "#f97316",
          timeline: "#6366f1",
        },
      },
    },
  },
  plugins: [],
};

export default config;
