import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:5500',
        secure: false,
      },
      '/staff': {
        target: 'http://localhost:5500',
        secure: false,
      },
    }
  }
})
