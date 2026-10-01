import type { Config } from "tailwindcss";

// Design system: "Milk and ink". Milky white surfaces, true black type, soft 3D clay objects.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F3F1EA",
          raised: "#FAF8F3",
          line: "#E3E0D6",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#3B3A37",
          faint: "#77746C",
        },
        stamp: {
          DEFAULT: "#0A0A0A",
          dark: "#2A2A28",
          tint: "#E9E6DB",
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
        serif: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "44px",
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

