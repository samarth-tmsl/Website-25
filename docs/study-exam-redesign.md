# Study & Exam Page Redesign

This document captures the planned redesign of the NIRMAAN study experience for the `/study` route while keeping the current project branding, route architecture, and content model intact.

---

## 1. Scope and intent

The redesign should modernize the Study & Exam Resources page without replacing the current functionality or breaking the existing route structure. The site already exposes the same experience through both `/study` and `/Resources`, and the current page entry point is defined in [../src/pages/Exam.jsx](../src/pages/Exam.jsx).

The page is rendered through a reusable library component, [../src/components/resources/ExamResourceLibrary.jsx](../src/components/resources/ExamResourceLibrary.jsx), which is the natural integration point for the visual redesign. The core exam content is not embedded directly in JSX; it is stored as structured data for maintainability and re-use.

---

## 2. Current architecture baseline

### Route surface

The route is intentionally lightweight:

- [../src/pages/Exam.jsx](../src/pages/Exam.jsx) mounts the page shell.
- It renders a title block (`PageTitle`) and the study resource library component.
- The same module is used for both `/study` and `/Resources` routes as documented in [./features.md](./features.md).

### Data model

The exam catalog is mostly data-driven and should remain so after the redesign:

- [../src/assets/fake-data/study-exams.js](../src/assets/fake-data/study-exams.js): stores exam title, category, resourceName, and the long-form markdown content shown within each exam detail dialog.
- [../src/assets/fake-data/exam-resources.js](../src/assets/fake-data/exam-resources.js): stores exam-specific resource links for PYQs, study materials, syllabus, and roadmap.

This split keeps the UI layer focused on display, while the content and resource configuration remain easy to edit later without altering layout logic.

---

## 3. Redesign goals

The new study page should follow the visual language of the existing NIRMAAN brand while incorporating a premium, educational layout inspired by the reference PDF.

### Required experience

1. Hero section
   - Title: `Study & Exam Resources`
   - Subtitle: `Everything you need for your preparation journey.`
   - Modern gradient treatment with the site’s current purple/navy palette.

2. Preparation toolkit cards
   - General Exam Guide
   - Preparation Roadmap
   - Study Resources
   - Previous-Year Questions
   - Each card should present a short description and polished hover/focus state.

3. Explore Exams section
   - Heading: `Explore Exams`
   - Description: `Choose your exam and access free study resources, previous-year questions, and preparation guides.`
   - Responsive card grid for the current exam set.

4. Exam detail modal
   - Centered dialog with blur and overlay.
   - Purple gradient theme and accessible contrast.
   - Escape/backdrop close handling.
   - Mobile-friendly viewport behavior.
   - Scrollable content area.

5. WhatsApp integration
   - Only for relevant GATE exam pages.
   - Clear, dedicated community section.
   - External links open in new tabs with security attributes.

---

## 4. Content ownership and correctness rules

The redesign is not a place to invent or simplify exam information.

### Required handling of the source content

- The exam-specific modal content must be extracted from the provided Google Doc / DOCX source and preserved as close to the original structure as possible.
- Existing headings, ordering, and terminology should remain intact where available.
- If a section is missing in the source data, the UI should not fabricate it.
- Copy should be organized per exam rather than shared across multiple cards.

This aligns with the project’s current strategy: the data file for each exam already stores a complete markdown-like content body. The redesign should continue that practice rather than embedding ad-hoc text directly into UI components.

---

## 5. WhatsApp community mapping

The exam modals show the main NIRMAAN 2027 Aspirants group for all exams, plus exam-specific communities where supplied:

| Exam | Additional group |
| --- | --- |
| CAT | NIRMAAN CAT Aspirants |
| UPSC | NIRMAAN UPSC Aspirants |
| SSC CGL | NIRMAAN SSC Aspirants |
| GATE CS/IT | GATE CS/IT-specific group |
| GATE ECE | GATE ECE-specific group |
| GATE EE | None; main group only |

The CAT group uses the supplied C4JK invite link; GATE EE has only the shared main group. The community list is configured in [../src/components/resources/ExamResourceLibrary.jsx](../src/components/resources/ExamResourceLibrary.jsx), separately from the modal rendering logic.

---

## 6. Recommended implementation architecture

To preserve maintainability, keep the redesign split between content and presentation.

### Layering

1. Presentation layer
   - [../src/components/resources/ExamResourceLibrary.jsx](../src/components/resources/ExamResourceLibrary.jsx)
   - Handles card list rendering, modal state, and interaction logic.

2. Content layer
   - [../src/assets/fake-data/study-exams.js](../src/assets/fake-data/study-exams.js)
   - Stores modal copy and headings per exam.
   - [../src/assets/fake-data/exam-resources.js](../src/assets/fake-data/exam-resources.js)
   - Stores URLs for related resources.

3. Community configuration
   - WhatsApp links are kept in a configuration object in [../src/components/resources/ExamResourceLibrary.jsx](../src/components/resources/ExamResourceLibrary.jsx).
   - Shared and exam-specific links are combined when the modal is rendered.

### Design principle

The UI should render the same underlying data in a more premium container, not replace the data model with static mock content. That preserves the project’s architecture and keeps future content edits to a single source of truth.

---

## 7. Acceptance checklist for implementation

The future implementation should satisfy the following checklist:

- Route remains stable and no unrelated pages are modified.
- Design follows the existing NIRMAAN branding with purple-gradient accents.
- Exam cards remain responsive across breakpoints.
- Each card opens a modal with title, category, and exam-specific body content.
- Background is blurred and non-interactive while modal is open.
- Escape, backdrop click, and close icon all dismiss the modal.
- Scroll lock applies when the modal is active.
- Each exam modal includes the main NIRMAAN 2027 group and any mapped exam-specific group.
- WhatsApp links open in a new tab with appropriate security attributes.
- No exam copy is invented or merged across categories.

---

## 8. Documentation note

This document intentionally reflects the product and implementation requirements rather than a code change. The underlying Google Doc or DOCX remains the source of truth for the final exam copy, and any future implementation should treat that outside source as authoritative before publishing the page.
