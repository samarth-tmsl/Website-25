# Deployment & Operations

This document describes how the Samarth website is compiled, optimized, hosted, and monitored in production.

---

## ☁️ Hosting Platform: Vercel

The application is configured to deploy as a Single Page Application (SPA) on **Vercel**.

### SPA Rewrites (`vercel.json`)
Since React Router handles endpoints client-side (e.g. `/events`, `/study`), any direct browser request to these URLs will cause a 404 error if vercel doesn't know to serve the base `index.html` page first.
To prevent this, the **[vercel.json](../vercel.json)** routing config rewrite is active:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This forces all route configurations to fall back to the root `index.html` file, letting `react-router-dom` render the appropriate page component dynamically.

---

## 📈 Monitoring & Web Vitals

1. **Vercel Analytics**:
   * Integrated into **[src/App.jsx](../src/App.jsx)** via the `<Analytics />` component imported from `@vercel/analytics/react`.
   * Captures traffic details, visitor counts, and core page metrics.
2. **Speed Insights** (Optional):
   * Component imports exist but are currently commented out in `src/App.jsx`.

---

## 🚀 Manual & Automated Deployments

### 1. Automated Git-hook Deployments
Vercel connects directly to the GitHub repository:
* **Production Branch**: Code merged to `main` automatically triggers a production deployment build.
* **Preview Branches**: Code pushed to open pull requests triggers preview deployments for developer review.

### 2. Manual Production Build Commands
If you need to generate a local bundle or deploy manually using the Vercel CLI:
```bash
# 1. Compile React & Vite assets
pnpm run build

# 2. Deploy compiled 'dist/' directory using Vercel CLI
npx vercel --prod
```
* **Build command defined on Vercel**: `npm run build`
* **Output directory**: `dist`
