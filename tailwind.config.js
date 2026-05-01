/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF UI Display"', '"SF Pro Display"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 30px 90px rgba(0, 0, 0, 0.45)",
        soft: "0 16px 38px rgba(0, 0, 0, 0.35)",
      },
      colors: {
        ink: {
          950: "#050505",
          900: "#0b0b0b",
          850: "#0e0e0e",
          800: "#141414",
          700: "#1f1f1f",
          650: "#232323",
          600: "#343434",
          500: "#797979",
          400: "#9a9a9a",
          300: "#c7c7c7",
        },
      },
      backdropBlur: {
        panel: "40px",
      },
      keyframes: {
        "panel-in": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "loader-sweep": {
          "0%": { transform: "scaleX(0.08)", opacity: "0.45" },
          "55%": { transform: "scaleX(0.72)", opacity: "1" },
          "100%": { transform: "scaleX(1)", opacity: "0.82" },
        },
      },
      animation: {
        "panel-in": "panel-in 180ms ease-out",
        "loader-sweep": "loader-sweep 900ms ease-out infinite alternate",
      },
    },
  },
  plugins: [],
};
