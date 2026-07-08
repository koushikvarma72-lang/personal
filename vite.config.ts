import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  // Absolute base so hashed asset URLs resolve from the domain root on every
  // route. Relative './' breaks nested routes like /product/:id under the SPA
  // history fallback.
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
