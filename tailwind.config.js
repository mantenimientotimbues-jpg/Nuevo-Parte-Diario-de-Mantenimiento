/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Misma paleta utilizada en los diagramas del DRF, para mantener
        // consistencia visual entre el documento y el prototipo.
        agdNavy: "#1F3864",
        agdBlue: "#2E74B5",
        agdBlueLight: "#EAF1FB",
        agdGold: "#8A6D00",
        agdGoldLight: "#FBF3D9",
        agdGreen: "#2E7D32",
        agdGreenLight: "#E8F5E9",
        agdRed: "#A61C1C",
        agdRedLight: "#FBE7E7",
        agdPurple: "#5B2C87",
        agdPurpleLight: "#F1E9F7",
        agdOrange: "#B45F06",
        agdOrangeLight: "#FCEEE1",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
