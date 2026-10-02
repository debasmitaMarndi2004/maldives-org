import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0A2A33", 800: "#0F3B47" },
        teal: { 500: "#14B8C9", 600: "#0E8FA0" },
        aqua: { 50: "#E8F8FA" },
        soft: "#F3FAFB",
        sun: { 400: "#FBBF24" },
      },
      fontFamily: { sans: ["Plus Jakarta Sans", "Manrope", "Arial", "sans-serif"] },
      borderRadius: { card: "24px" },
      boxShadow: { soft: "0 18px 50px rgba(10, 42, 51, 0.13)" },
    },
  },
  plugins: [],
};

export default config;
