import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = 'https://fil-rouge-dev.onrender.com/'

const PROXIED_PATHS = ['/api', '/videos']

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      mode === 'production' ? BACKEND_URL : ''
    ),
  },
  server: {
    host: true,
    port: 5173,
    proxy: Object.fromEntries(PROXIED_PATHS.map((path) => [path, BACKEND_URL])),
  },
}))
