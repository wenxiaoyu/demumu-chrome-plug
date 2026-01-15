import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from 'vite-plugin-web-extension'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: './src/manifest.json',
      watchFilePaths: ['src/**/*'],
      disableAutoLaunch: true,
      additionalInputs: [
        'src/icons/icon-16.svg',
        'src/icons/icon-48.svg',
        'src/icons/icon-128.svg',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
