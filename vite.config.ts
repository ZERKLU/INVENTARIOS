import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base' corrige el problema de pantalla blanca en GitHub Pages.
  // './' hace que las rutas sean relativas, funcionando en cualquier subcarpeta.
  base: 'INVENTARIOS/', 
})