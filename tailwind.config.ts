import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#5B8FD9",
          "primary-dark": "#3A6FBF",
          "primary-light": "#EDF5FF",
          bg: "#E4EDF7",
          card: "#FFFFFF",
          "card-secondary": "#EDF3FA",
          "text-primary": "#1E3A5F",
          "text-secondary": "#5F7A9B",
          border: "#C5D8F0",
          "sidebar-bg": "#1B2F4E",
          "sidebar-hover": "#243B55",
          "sidebar-text": "#B8D0EE",
          "sidebar-active": "#5B8FD9",
        },
      },
      fontFamily: {
        sans: ["Noto Sans TC", "system-ui", "-apple-system", "sans-serif"],
        mono: ["SF Mono", "Consolas", "Monaco", "Courier New", "monospace"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(91, 143, 217, 0.12)",
        "card-hover": "0 4px 20px rgba(91, 143, 217, 0.18)",
        topbar: "0 1px 4px rgba(91, 143, 217, 0.08)",
        btn: "0 2px 6px rgba(91, 143, 217, 0.24)",
      },
      borderRadius: {
        card: "14px",
        badge: "9999px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
