import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Сборка убирает Babel-standalone из браузера: JSX компилируется заранее,
// на выходе — обычный JS. Холодная загрузка становится заметно быстрее.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2018',
  },
})
