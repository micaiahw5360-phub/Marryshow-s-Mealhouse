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
        // School theme blues (primary + shades)
        school: {
          50: "#eaf2ff",
          100: "#d6e6ff",
          200: "#adcfff",
          300: "#7fb2ff",
          400: "#4f8dff",
          500: "#1f63ff",
          600: "#174fe6",
          700: "#123fba",
          800: "#0f338f",
          900: "#0b2463",
        },
        // Kiosk neutrals (light mode)
        kiosk: {
          bg: "#fffaf0",      // warm cream
          panel: "#ffffff",
          ink: "#0f172a",     // slate-900
          muted: "#475569",   // slate-600
          line: "#e2e8f0",    // slate-200
        },
      },
      borderRadius: {
        kiosk: "22px", // chunky rounded corners
      },
      boxShadow: {
        kiosk: "0 14px 30px rgba(15, 51, 143, 0.18)",
        kioskSm: "0 8px 18px rgba(15, 51, 143, 0.14)",
      },
      fontFamily: {
        kiosk: ["ui-rounded", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};