import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      { find: 'root', replacement: __dirname },
    ],
  },
  server: {
    host: '0.0.0.0'
  }
})
