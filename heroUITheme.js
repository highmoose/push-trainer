// Simple HeroUI theme configuration
const heroUITheme = {
  type: "dark", // light or dark
  layout: {
    radius: {
      small: "4px",
      medium: "6px",
      large: "8px",
    },
  },
  themes: {
    dark: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
      },
    },
  },
};

export default heroUITheme;
