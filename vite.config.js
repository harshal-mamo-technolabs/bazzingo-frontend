import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '1c87ae3d14b9.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  },
})
