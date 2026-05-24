import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  // Load .env files and VITE_* variables
  const env = loadEnv(mode, process.cwd(), '');

  // VITE_API_BASE_URL should contain the backend base (e.g. https://host.com or http://localhost:8000)
  // In development if not set we default to localhost so you can run backend locally.
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8000';

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  })
}
