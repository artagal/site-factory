import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f8faf7",
        mint: "#1f9d7a",
        coral: "#d95f43",
        brass: "#b98523",
        skyline: "#2c7da0"
      },
      boxShadow: {
        soft: "0 18px 40px rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
