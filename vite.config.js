import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '4834-103-241-225-3.ngrok-free.app',
      '9f4c-103-241-225-157.ngrok-free.app',
      'a8f8-103-241-225-157.ngrok-free.app'
    ]
  },
})
