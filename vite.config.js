import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/rag_search_cite/',
  build: {
    sourcemap: true,
    target: 'esnext',
  }
})
