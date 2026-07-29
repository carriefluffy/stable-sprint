import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ESM-safe __dirname shim (vite.config is loaded as ESM by this project).
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../../',
  resolve: {
    // @/ alias — mirror of tsconfig.app.json paths so the Arcticons registry
    // installs (@/components/icons/...) resolve at dev and build time.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // The game-engine workspace ships CommonJS (dist/index.js with
    // module.exports), so Vite's dev server can't consume its named exports
    // directly. Pre-bundling it through esbuild applies CJS→ESM interop and
    // exposes Player, Score, etc. as real named exports. The production build
    // path (tsc -b && vite build) already interops on its own, so this is
    // dev-server only.
    include: ['@celo-atari-games/stable-sprint-engine']
  }
})
