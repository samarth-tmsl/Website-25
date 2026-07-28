# Features & Routing Mapping

This document describes the user-facing capabilities, pages, and dynamic components of the Samarth website.

---

## 🧭 Router & View Mapping

Routing is handled client-side using `react-router-dom` in **[App.jsx](../src/App.jsx)**. The route definitions are exported in a clean registry from **[pages/index.jsx](../src/pages/index.jsx)**.

Below is a complete mapping of paths to React Page Components:

| Path | Component | Description | Primary Data Source |
| :--- | :--- | :--- | :--- |
| `/` | `Home` | Landing page featuring Hero banners, key benefits/specialities, testimonials, and statistics counters. | `data-card2.js`, `data-box.js`, `data-testimonials.js`, `dataProject.js` |
| `/events` | `Events` | Lists upcoming, present, and past events with detail slides or registration options. | `data-safalya26.js`, `data-safalya25.js`, `data-past.js` |
| `/gallery` | `Gallery` | Interactive image gallery grouped by event with full-screen lightbox sliders. | `lightgallery` & static image arrays |
| `/activity` | `Activity` | News updates, campus activities, and official student notices. | `data-blog.js` |
| `/sponsor` | `Sponsor` | Sponsorship options, sponsor grid, and brand highlights. | `dataPartner.js` |
| `/team` | `Team` | Technical heads, core team members, and contributors profile grid. | `dataTeam2.js`, `dataTeam3.js` |
| `/About` | `About` | Details of Samarth's mission, values, operations, and structure. | Static layout |
| `/contact` | `Contact` | Contact form with input validation, Google Maps iframe embed, and email/social handles. | Contact configuration |
| `/Resources` | `Exam` | Portal for competitive exam guides (GATE, UPSC, SSC, etc.). | `data-gate.js`, `data-ssc.js`, `data-cat.js` |
| `/Aspirants` | `Aspirants` | Helper portal for university entrants and study aspirants. | `dataForAspirants/` |
| `/study` | `Study` | Unified page combining Study materials, competitive exam portals, and guides. | Consolidated static databases |
| `/results` | `Results` | Student achievements, exam scores (GATE qualifiers), and highlights. | `data-results.js` |

---

## ⚡ Main Feature Modules

### 1. Unified Study & Exam Resources (`/study`)
The **[Study](../src/pages/Study.jsx)** component is a hub for student academic resources. It includes:
* **Interactive Tabs**: Users switch between GATE, CAT, UPSC-CSE, UPSC-ESE, and SSC-CGL tabs. The active tab dynamically renders custom resource components (e.g. `<Gate data={dataGate} />`).
* **Study Material Grid**: Contains columns for:
  * **Organizer**: Study PDFs, course planners.
  * **PYQs**: Links to download previous year questions for multiple semesters.
  * **Playlists**: Curated YouTube playlist series.
  * **Channels**: Recommended YouTube education channels.
* **Aspirants Section**: Quick links to official website resources, guidance channels, and exam syllabus portals.

### 2. Event Showcase (`/events`)
The **[Events](../src/pages/Events.jsx)** module displays:
* **Interactive Promotional Notifications**: Promotes ongoing major events (e.g., *Safalya*) with direct registration links.
* **Timeline Displays**: Past, present, and upcoming timelines based on static dates.

### 3. Media Gallery (`/gallery`)
The **[Gallery](../src/pages/Gallery.jsx)** uses:
* **Masonry Grid**: Responsive multi-column layout optimized for variable image heights using `react-masonry-css`.
* **Lightbox Viewer**: Integrated with `@lightgallery/react` to allow users to zoom, slide, and download photos in full screen.

### 4. Interactive Team Profiles (`/team`)
The **[Team](../src/pages/Team.jsx)** component showcases:
* Student hierarchy: Head -> Co-Heads -> Development Team.
* Hover animations (flip-box style) displaying profile image on the front and social handles (GitHub, LinkedIn, Portfolio) on the back.
