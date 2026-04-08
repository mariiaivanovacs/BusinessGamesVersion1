import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/BusinessGamesVersion1/',
  // Build outputs to docs/ so GitHub Pages (main branch → /docs) is updated
  // by simply running: npm run build && git add docs && git commit && git push
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  assetsInclude: ['**/*.PNG', '**/*.png', '**/*.JPG', '**/*.jpg'],
})
