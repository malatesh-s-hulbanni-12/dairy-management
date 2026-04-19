import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/',  // Change from './' to '/'
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://dairy-management-backend.vercel.app/',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
})