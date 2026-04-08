import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change base to match your GitHub repository name
// e.g. if repo is github.com/username/business-games → base: '/business-games/'
export default defineConfig({
  plugins: [react()],
  base: '/BusinessGamesVersion1/',
  assetsInclude: ['**/*.PNG', '**/*.png', '**/*.JPG', '**/*.jpg'],
})
