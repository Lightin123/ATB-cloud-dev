import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // ✅ ensures files like _redirects are copied
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})
