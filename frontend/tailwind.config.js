/* tailwind.config.js - Updated color palette to match new scheme */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New simple, fresh color scheme
        primary: {
          50: "#F0F9F4",
          100: "#DBF0E5",
          200: "#B7E1CD",
          300: "#8ED2B1",
          400: "#65C395",
          500: "#3CB371",
          600: "#2E8B57",
          700: "#236B43",
          800: "#1A4F32",
          900: "#113822",
        },
        accent: {
          50: "#FFF8EB",
          100: "#FFEEC9",
          200: "#FFDD94",
          300: "#FFCC5E",
          400: "#FFBB28",
          500: "#F4A261",
          600: "#E76F51",
        },
        neutral: {
          50: "#FCFCFA",
          100: "#F8F9F7",
          200: "#E9ECEA",
          300: "#D1D5D4",
          400: "#9CA3A2",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        // Legacy school mapping for backward compatibility
        school: {
          50: "#F0F9F4",
          100: "#DBF0E5",
          200: "#B7E1CD",
          300: "#8ED2B1",
          400: "#65C395",
          500: "#3CB371",
          600: "#2E8B57",
          700: "#236B43",
          800: "#1A4F32",
          900: "#113822",
        },
        kiosk: {
          bg: "#F8F9F7",
          panel: "#FFFFFF",
          ink: "#1F2937",
          muted: "#6B7280",
          line: "#EDF2F7",
        },
      },
      borderRadius: {
        kiosk: "28px",
        "card": "32px",
      },
      boxShadow: {
        kiosk: "0 14px 30px rgba(60, 179, 113, 0.12)",
        kioskSm: "0 8px 18px rgba(60, 179, 113, 0.08)",
        card: "0 20px 30px -12px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        kiosk: ["ui-rounded", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};