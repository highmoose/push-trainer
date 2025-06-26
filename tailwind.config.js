const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#ffffff",
            foreground: "#171717",
            primary: {
              50: "#f8fafc",
              100: "#f1f5f9",
              200: "#e2e8f0",
              300: "#cbd5e1",
              400: "#94a3b8",
              500: "#64748b",
              600: "#475569",
              700: "#334155",
              800: "#1e293b",
              900: "#0f172a",
              DEFAULT: "#334155",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            background: "#27272a",
            foreground: "#ffffff",
            primary: {
              50: "#f8fafc",
              100: "#f1f5f9",
              200: "#e2e8f0",
              300: "#cbd5e1",
              400: "#94a3b8",
              500: "#64748b",
              600: "#475569",
              700: "#334155",
              800: "#1e293b",
              900: "#0f172a",
              DEFAULT: "#334155",
              foreground: "#ffffff",
            },
            secondary: {
              50: "#fafafa",
              100: "#f4f4f5",
              200: "#e4e4e7",
              300: "#d4d4d8",
              400: "#a1a1aa",
              500: "#71717a",
              600: "#52525b",
              700: "#3f3f46",
              800: "#27272a",
              900: "#18181b",
              DEFAULT: "#27272a",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};
