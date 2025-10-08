import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/products': 'http://localhost:5000',
  // Proxy only admin API endpoints, not SPA routes like /admin/login or /admin/dashboard
      '/admin/upload-images': 'http://localhost:5000',
      '/admin/upload-image': 'http://localhost:5000',
  '/admin/products': 'http://localhost:5000',
  '/admin/users': 'http://localhost:5000',
      // Other backend APIs used by the app
      '/orders': 'http://localhost:5000',
      '/profile': 'http://localhost:5000',
      '/user-orders': 'http://localhost:5000',
      '/wishlist': 'http://localhost:5000',
      '/auth': 'http://localhost:5000',
      '/images': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
