2️⃣ What you should do (step by step)
Step 1 — Disable Jekyll
Create a file in your repo root called .nojekyll (empty file).
Commit & push:
git add .nojekyll
git commit -m "Disable Jekyll for SPA"
git push origin main
This tells GitHub Pages: “Don’t try to build Jekyll — just serve static files.”
Step 2 — Make sure your SPA build is ready
Run:
npm install
npm run build
This creates a folder (usually dist/ or build/) containing:
index.html
JS/CSS assets
/admin folder for Decap CMS
All of these files must be deployed to GitHub Pages, not the source code.
Step 3 — Deploy build to GitHub Pages
Option A: push contents of dist/ to main branch (root folder)
Option B (better): use a separate gh-pages branch and deploy using GitHub Actions
Make sure .nojekyll is included in the folder you deploy.
Step 4 — Configure your SPA base path (if using Vite/React)
// vite.config.js
export default defineConfig({
  base: "/BusinessGamesVersion1/", // must match your repo name
});
Without this, CSS/JS assets will 404 on GitHub Pages.