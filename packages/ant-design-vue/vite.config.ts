import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  root: __dirname,
  plugins: [
    vue(),
    vueJsx(),
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
