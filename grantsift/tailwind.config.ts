import type { Config } from "tailwindcss";

// Design system: "Milk and ink". Milky white surfaces, true black type, soft 3D clay objects.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Modernized legacy mappings for backward compatibility
        paper: {
          DEFAULT: "#F8FAFC",
          raised: "#FFFFFF",
          line: "#E2E8F0",
        },
        ink: {
          DEFAULT: "#0F172A",
          soft: "#334155",
          faint: "#64748B",
        },
        stamp: {
          DEFAULT: "#0B192C",
          dark: "#0F172A",
          tint: "#E0F2FE",
        },
        ledger: {
          DEFAULT: "#0D9488",
          dark: "#0F766E",
          tint: "#CCFBF1",
        },
        signal: {
          risk: "#EF4444",
          risktint: "#FEE2E2",
        },
        // Core Design Tokens
        brand: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#627D98",
          500: "#334E68",
          600: "#243B53",
          700: "#1E293B",
          800: "#0F172A",
          900: "#0B192C",
          950: "#050B14",
          DEFAULT: "#0B192C",
        },
        accent: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          DEFAULT: "#0D9488",
        },
        cyan: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          DEFAULT: "#06B6D4",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          DEFAULT: "#10B981",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          DEFAULT: "#F59E0B",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          DEFAULT: "#EF4444",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          card: "#FFFFFF",
          DEFAULT: "#F8FAFC",
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

