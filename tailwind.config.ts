import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050507",
          900: "#09090d",
          800: "#0e0e14",
          700: "#14141c",
          600: "#1a1a24",
          500: "#242432",
          400: "#3a3a4a",
          300: "#6b6b7e",
          200: "#a1a1ae",
          100: "#e4e4ec",
        },
        neon: {
          blue: "#4d8bff",
          cyan: "#5ef2ff",
          violet: "#a26bff",
          red: "#ff4d6d",
          amber: "#ffb84d",
          green: "#3cf2a0",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        gridShift: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 48px" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite",
        gridShift: "gridShift 16s linear infinite",
        blink: "blink 1.1s steps(1) infinite",
        shimmer: "shimmer 3.2s linear infinite",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse at center, rgba(77,139,255,0.16), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
