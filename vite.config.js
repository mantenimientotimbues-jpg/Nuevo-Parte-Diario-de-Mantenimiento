import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // necesario para que Codespaces exponga el puerto correctamente
    port: 5173,
  },
});
