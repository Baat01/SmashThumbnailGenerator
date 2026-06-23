import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : '/SmashThumbnailGenerator/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
    },
  }
})

