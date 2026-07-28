# Samarth Website Documentation (A-Z)

Welcome to the official developer documentation suite for **Samarth's main website (Website-25)**. This suite serves as a comprehensive A-Z guide for installing, developing, understanding, and deploying the codebase.

Samarth is a student-driven, community-oriented platform built for MAKAUT students, providing unified study resources, event listings, photo galleries, and important notices.

---

## 📚 Table of Contents

Please select a document below to explore specific parts of the platform:

1. **[Getting Started](./getting-started.md)**
   * Details environment requirements, dependency installations, and quick local startup.
2. **[Architecture & Project Structure](./architecture.md)**
   * Explains directory layouts, core abstractions, styling methodologies (SCSS), and the 3D-map architecture script.
3. **[Features & Routing Mapping](./features.md)**
   * Describes the layout of pages, routes, data objects, and primary interactive modules (Exam details, Study playlists, and Aspirants resources).
4. **[Mobile Platform Integration](./mobile-integration.md)**
   * Explains how the hybrid Capacitor wrapper targets Android platforms and documents CI/CD release APK generation pipelines.
5. **[Development & Coding Guidelines](./development-guide.md)**
   * Standards for component styling, React design patterns, custom state additions, and asset image optimization.
6. **[Deployment & Operations](./deployment.md)**
   * Guides on Vercel deployment, settings (`vercel.json`), and analytics dashboards.
7. **[Troubleshooting Guide](./troubleshooting.md)**
   * Outlines solutions to typical Vite server, SPA routing, and Capacitor/Android build challenges.
8. **[Developer Tips & Tricks](./tips-and-tricks.md)**
   * Productivity tips, mobile WebView inspecting, custom page layouts, and release smoke test validation.

---

## 🛠️ Tech Stack Quick Reference

* **Framework**: React 18 & Vite
* **Styling**: SCSS (structured into variables, mixins, and components)
* **Hybrid Wrapper**: Capacitor CLI & Android SDK
* **Libraries**: Swiper, AOS (Animate on Scroll), LightGallery, Chart.js
* **Hosting**: Vercel
* **Package Manager**: pnpm (v11)
