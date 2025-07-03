import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'f19c-43-250-157-8.ngrok-free.app',
      '64f7-2402-a00-142-9fc3-3093-315a-226-46bb.ngrok-free.app'
    ]
  },
})
