import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "Fira Code", "monospace"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        ink: {
          950: "#08091a",
          900: "#0d1030",
          800: "#121640",
          700: "#18204f",
          600: "#1f2a65",
          500: "#2540a0",
          400: "#3358c4",
          300: "#5577e0",
          200: "#8fa4ef",
          100: "#c9d4f8",
          50: "#eef1fd",
        },
        gold: {
          600: "#a06c00",
          500: "#c98d0a",
          400: "#e8a813",
          300: "#f5c442",
          200: "#fad97a",
          100: "#fef0c2",
          50: "#fffbea",
        },
        green: {
          500: "#0d7a4e",
          400: "#10a368",
          100: "#d1f5e6",
          50: "#edfaf4",
        },
        red: {
          500: "#c1272d",
          400: "#e03030",
          100: "#fde5e5",
          50: "#fff5f5",
        },
        amber: {
          500: "#b45309",
          400: "#d97706",
          100: "#fef3c7",
        },
        surface: {
          base: "var(--bg-base)",
          DEFAULT: "var(--bg-surface)",
          raised: "var(--bg-raised)",
          sunken: "var(--bg-sunken)",
          overlay: "var(--bg-overlay)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        txt: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          faint: "var(--text-faint)",
          "on-brand": "var(--text-on-brand)",
        },
      },
      spacing: {
        "4.5": "18px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
        "22": "88px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        DEFAULT: "10px",
        md: "14px",
        lg: "20px",
        pill: "999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(8, 9, 26, 0.06)",
        sm: "0 2px 8px rgba(8, 9, 26, 0.08), 0 0 0 1px rgba(8, 9, 26, 0.04)",
        md: "0 4px 20px rgba(8, 9, 26, 0.10), 0 0 0 1px rgba(8, 9, 26, 0.05)",
        lg: "0 12px 40px rgba(8, 9, 26, 0.14)",
        xl: "0 24px 80px rgba(8, 9, 26, 0.18)",
        "glow-ink": "0 0 0 3px rgba(51, 88, 196, 0.25), 0 0 20px rgba(51, 88, 196, 0.15)",
        "glow-gold": "0 0 0 3px rgba(232, 168, 19, 0.25), 0 0 20px rgba(232, 168, 19, 0.1)",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.3s ease both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "slide-in-r": "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
