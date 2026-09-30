import type { Config } from "tailwindcss";

// Design system: "casefile" — grant applications read as official documents.
// Paper, ink, and a single ochre stamp accent. No neon, no purple gradients,
// no glassmorphism. See docs/DESIGN.md for the reasoning.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#EFEEE7",
          raised: "#F7F6F1",
          line: "#D9D6C9",
        },
        ink: {
          DEFAULT: "#191C19",
          soft: "#4B5049",
          faint: "#7A7F76",
        },
        stamp: {
          DEFAULT: "#B4661E",
          dark: "#8F4F17",
          tint: "#F1E1CE",
        },
        ledger: {
          DEFAULT: "#2E5C4B",
          dark: "#1F4438",
          tint: "#DDE9E2",
        },
        signal: {
          risk: "#A23B2E",
          risktint: "#F3DFDB",
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-ibm-plex)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "1px",
        md: "3px",
        lg: "4px",
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
