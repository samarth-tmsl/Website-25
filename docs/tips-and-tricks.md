# Developer Tips & Tricks

This document compiles best practices, layout techniques, terminal shortcuts, and advanced debugging processes for Samarth website developers.

---

## 🔍 Mobile WebView Debugging (Capacitor)

Because Capacitor runs the React application inside a native Android WebView container, you cannot access standard browser developer tools directly on the mobile screen. Use Chrome's remote debugging capabilities instead.

### Step-by-Step Remote Inspection
1. **Connect Your Device**:
   - Enable **Developer Options** and **USB Debugging** on your physical Android device.
   - Connect it to your machine via USB, or launch an Android Virtual Device (AVD) emulator in Android Studio.
2. **Run the App**:
   - Sync and deploy the app to your device/emulator:
     ```bash
     pnpm run build
     npx cap sync android
     npx cap open android
     ```
   - In Android Studio, click **Run** (green play icon) to boot the application.
3. **Launch Chrome Inspector**:
   - Open Google Chrome on your development machine and navigate to:
     ```
     chrome://inspect/#devices
     ```
   - Locate your device/emulator and find the **WebView** target running the Samarth application under the `com.samarthtmsl.com` package name.
   - Click **Inspect**. This opens standard Chrome Developer Tools (Console, Elements, Network) mapped directly to your running mobile application. You can view console errors, modify styles in real-time, and run javascript commands.

---

## 🎨 SCSS & CSS Stylesheets Integration

The website primarily utilizes a modular SCSS layout architecture alongside several localized vanilla CSS files. 

### 1. Reusing SCSS Abstract Variables & Mixins
Before writing custom CSS rules for spacing, responsiveness, or colors, leverage the variables and mixins located under `src/scss/abstracts/`:

* **Breakpoint Mixin (`src/scss/abstracts/_mixin.scss`)**:
  Import and apply pre-defined media query breakpoints to design responsive pages:
  ```scss
  @use '../abstracts/variables' as *;
  @use '../abstracts/mixin' as *;

  .my-container {
      width: 100%;
      padding: 10px;

      // Targets tablets (max-width: 991px)
      @include tablet {
          padding: 20px;
      }

      // Targets mobile viewports (max-width: 767px)
      @include mobile {
          padding: 15px;
      }
  }
  ```
* **Variables (`src/scss/abstracts/_variables.scss`)**:
  Utilize consistent theme color schemes:
  - `$primary-color`: The primary branding color.
  - `$title-color`: The color for headings and bold texts.
  - `$body-color`: Standard body font color.
  - `$white-color` / `$bg-color-dark`: Interface colors.

### 2. SCSS vs. Localized CSS Files
While the core framework encourages modular stylesheets loaded under `src/scss/component/` (which are aggregated in `src/scss/component/_index.scss` and forwarded to the root), some features use localized `.css` stylesheets imported directly inside page views. For example:
- **[About.jsx](../src/pages/About.jsx)** imports [FlipBoxStyles.css](../src/pages/FlipBoxStyles.css) for team-profile flips.
- **[Exam.jsx](../src/pages/Exam.jsx)** imports [resc.css](../src/pages/resc.css) for resource grid layout.

When implementing new styles, you can either:
- Create a standard SCSS component file at `src/scss/component/_feature.scss` and add `@forward 'feature';` in `src/scss/component/_index.scss`.
- Add a localized stylesheet directly in the directory of your component if it requires isolated, ad-hoc styling.

---

## 🚀 Adding a New Page or Sub-route

To create and publish a new page on the platform:

1. **Create the Component**:
   Create a functional React component file in `src/pages/` (e.g. `MyNewPage.jsx`):
   ```jsx
   import React from 'react';
   import PageTitle from '../components/pagetitle/PageTitle';

   const MyNewPage = () => {
     return (
       <div className="my-new-page">
         <PageTitle title="My New Page" />
         <div className="content">Welcome to the new page.</div>
       </div>
     );
   };

   export default MyNewPage;
   ```
2. **Register the Route**:
   Open **[src/pages/index.jsx](../src/pages/index.jsx)** and append your route mapping:
   ```javascript
   import MyNewPage from './MyNewPage';

   const routes = [
       ...
       { path: '/my-new-page', component: <MyNewPage /> },
   ];
   ```
   *Note: React Router automatically catches matches and renders the Header, Footer, and the page dynamically.*

---

## 🎹 Vite Terminal CLI Shortcuts

When running the Vite local development server (`pnpm run dev`), you can execute helpful actions by pressing keys directly inside the running terminal:

| Key | Description |
| :--- | :--- |
| **`o`** | Attempts to open the application in your default browser. |
| **`r`** | Forces a full reload/restart of the Vite development server cache and processes. |
| **`u`** | Shows the active local and network URLs mapping to the dev server. |
| **`h`** | Prints the help menu displaying all available CLI commands. |
| **`q`** | Stops the development server process. |

---

## 📝 Release Smoke Test Checklist

Before executing a deployment or merging a pull request, run through this quick manual smoke test checklist to ensure zero layout regressions:

- [ ] **Mobile Responsive Overflow**: Inspect the site in Chrome DevTools using responsive viewport settings (e.g. iPhone SE, Pixel 7 width). Ensure no components cause horizontal page scrolls.
- [ ] **AOS Animations**: Scroll through the homepage to verify that Animate on Scroll (AOS) fades and movements load smoothly and do not block text visibility.
- [ ] **LightBox Sliders**: Go to the `/gallery` page, select any category, and click on an image. Ensure the lightbox slides open, swipe works on touch screens, and the close button is clickable.
- [ ] **Form Validations**: Fill out the `/contact` form with an invalid email address and ensure inline input warnings fire correctly.
- [ ] **Android Hardware Back-Button**: Launch the built app on an Android device. Navigate between `/events`, `/study`, and `/team`. Press the device's physical back button. Ensure it returns to the previously loaded route instead of terminating/minimizing the application.
