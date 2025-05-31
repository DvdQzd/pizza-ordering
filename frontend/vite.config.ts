import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 3001,
      host: 'localhost'
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true
  }
})
