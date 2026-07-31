# Development & Coding Guidelines

This document outlines coding conventions, best practices, and standard workflows for contributors working on the Samarth website codebase.

---

## ⚛️ React & Javascript Guidelines

1. **Functional Components**: Write all new components as React functional components with hooks (`useState`, `useEffect`).
2. **Prop Validation**: Use `prop-types` to declare and validate expected props for components to minimize runtime errors.
3. **Client-side Routing**:
   * All routes must be registered in **[src/pages/index.jsx](../src/pages/index.jsx)** by appending them to the export array:
     ```javascript
     { path: '/new-route', component: <NewComponent /> }
     ```
   * Do not hardcode routing links with standard `<a>` tags. Always use `<Link>` or `<NavLink>` from `react-router-dom` to ensure single-page application navigation.

---

## 🎨 SCSS & Styling Guidelines

The application strictly avoids ad-hoc inline styles. Follow this SCSS structure:

1. **Variables & Theme Settings**: Colors, fonts, and breakpoint media queries are declared in **[src/scss/abstracts/_variables.scss](../src/scss/abstracts/_variables.scss)**. Reference these variables rather than typing raw hex codes.
2. **Mixins**: Utilize helper layouts in **[src/scss/abstracts/_mixin.scss](../src/scss/abstracts/_mixin.scss)** for styling flexboxes, grids, gradients, and custom responsive breakpoints.
3. **Component Stylesheet Location**:
   * Create styling files inside the **`src/scss/component/`** directory (e.g., `_my-feature.scss`).
   * Import the new stylesheet file within **`src/scss/component/_index.scss`**:
     ```scss
     @forward 'my-feature';
     ```
4. **Scoping**: Prefix styling selectors with your component-specific container classes to prevent accidental selector collision in other views.

---

## 💾 Adding or Updating Simulated Data

Static list contents (e.g., team members, previous year papers, YouTube playlist URLs) are stored under **`src/assets/fake-data/`**.
* Maintain the flat JSON structure of these arrays.
* Always define and export data objects in distinct JS files (e.g., `data-card.js`) and import them directly inside page files.
* Clean up any unused files from `src/assets/fake-data/` to keep the build sizes lean.

---

## 🖼️ Image & Asset Handling

Large asset images can degrade site loading speed and performance metrics. The repository includes an automated pre-commit hook via Husky for local image compression.

### Local Pre-Commit Image Optimizer (`.husky/pre-commit`)
* When you commit files, a pre-commit hook runs `pnpm convert-images` (defined in `scripts/convert-images/index.mjs`) to check for new or modified image files (`.png`, `.jpg`, `.jpeg`).
* **WebP Export**: It automatically optimizes images, exports them as `.webp`, and replaces the original source files in the Git index.
* **Exempt Paths**: The directories `public/images2/new/guest/` and `android/` are exempted from image compression checks.
* **Guideline**: If you introduce brand new assets, place them under `public/images/`. When you stage and commit them, the pre-commit hook will automatically optimize them, convert them to `.webp`, and update any references inside your staged source files.
