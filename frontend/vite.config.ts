import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = 'http://localhost:3000'

const PROXIED_PATHS = ['/auth', '/user', '/video', '/genre', '/comment', '/admin', '/videos']

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: Object.fromEntries(PROXIED_PATHS.map((path) => [path, BACKEND_URL])),
  },
})
