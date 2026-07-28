# Troubleshooting Guide

This guide compiles common issues, error messages, and resolutions encountered when setting up, developing, or deploying the Samarth main website (**Website-25**).

---

## 💻 Local Development & Vite

### 1. Port Conflict (`Port 5173 is already in use`)
* **Symptom**: When running `pnpm run dev`, Vite fails to start or defaults to a different port (e.g. `5174`).
* **Cause**: Another service or an orphaned Vite process is running on port `5173`.
* **Resolution**:
  - Kill the process running on port 5173.
    * **Windows (PowerShell)**:
      ```powershell
      Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
      ```
    * **Linux/macOS**:
      ```bash
      kill -9 $(lsof -t -i:5173)
      ```
  - Alternatively, you can start Vite on a custom port temporarily:
    ```bash
    pnpm run dev --port 8080
    ```

### 2. Hot Module Replacement (HMR) Not Working
* **Symptom**: Editing code saves successfully in the IDE, but the browser does not update automatically without a hard refresh.
* **Cause**: The WebSocket connection Vite uses for HMR is blocked by a local network proxy or browser security extension, or fails due to WSL2 port-forwarding issues.
* **Resolution**:
  - Check the browser Console (F12) for WebSocket connection errors.
  - If using WSL2, ensure your WSL IP is correctly forwarded, or run Vite with the host flag:
    ```bash
    pnpm run dev --host 0.0.0.0
    ```
  - Clear the browser cache and restart the Vite development server.

---

## ☁️ Vercel Deployment & SPA Routing

### 1. 404 Error on Direct Route Access or Page Refresh
* **Symptom**: Direct visits to paths like `/events` or refreshing the page on `/study` results in a Vercel 404 page, but clicking navigation links inside the app works perfectly.
* **Cause**: This is a classic single-page application (SPA) routing issue. Because React handles routing client-side via `react-router-dom`, Vercel attempts to find physical directories or files at `/events/index.html` or `/study/index.html` on the server.
* **Resolution**:
  Ensure the root contains a **[vercel.json](../vercel.json)** file that redirects all requests to `index.html`:
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
  If the file is deleted or renamed, Vercel will not know how to handle SPA routing.

### 2. Deployment Fails Due to pnpm Version Mismatch
* **Symptom**: Vercel build log displays package installation failures or warnings about lockfile versions.
* **Cause**: The workspace specifies `pnpm@11.3.0` in `package.json`, but Vercel may default to an older or newer major version of pnpm.
* **Resolution**:
  Configure the environment variable `NPM_CONFIG_USER_AGENT` or specify the correct pnpm package manager version inside Vercel's project dashboard, or ensure that Vercel uses the corepack engine by setting:
  ```
  COREPACK_ENABLE_PROJECT_SPEC = 1
  ```
  in Vercel's environment variables.

---

## 🤖 Capacitor & Android Builds

### 1. Changes in React Code Do Not Appear in Android Emulator
* **Symptom**: You update code in `src/`, compile and run in Android Studio, but the app shows old code or visual layouts.
* **Cause**: Capacitor copies built assets from the `dist/` directory to the Android native folder. If you run Android Studio without syncing, native assets are out of date.
* **Resolution**:
  Ensure you always build the web assets and synchronize them before running the native build:
  ```bash
  # Step 1: Re-build React app to generate latest dist/
  pnpm run build

  # Step 2: Copy dist/ resources to Android project
  npx cap sync android
  ```

### 2. Gradle Compilation Fails: Java SDK Version Mismatch
* **Symptom**: Gradle throws compilation errors like `Unsupported class file major version` or build exceptions pointing to Gradle wrappers.
* **Cause**: The Android SDK compile tools and Gradle version used in this project require **JDK 17**. If your system defaults to JDK 8, 11, or 21, Gradle will fail to compile.
* **Resolution**:
  - Run `java -version` in your terminal to check the default Java SDK version.
  - Install JDK 17.
  - Set your `JAVA_HOME` environment variable to point to the JDK 17 installation directory.
  - In **Android Studio**, navigate to:
    `Settings -> Build, Execution, Deployment -> Build Tools -> Gradle`
    Under **Gradle JDK**, select your local JDK 17 path.

### 3. Permission Denied on `gradlew` (Linux/macOS)
* **Symptom**: Run command fails with `bash: ./gradlew: Permission denied` or similar when running CI/CD or local gradle wrapper scripts.
* **Cause**: The file permission execute bit is not set on the `gradlew` script inside the `android/` directory.
* **Resolution**:
  Change permissions using chmod:
  ```bash
  chmod +x android/gradlew
  ```
  Commit this permission change back to Git.

### 4. API Requests Fail in Android App (HTTP Cleartext Restriction)
* **Symptom**: The app loads UI on the emulator but data lists (Notice tables, playlists) are empty, or image paths fail. Chrome inspector reveals `net::ERR_CLEARTEXT_NOT_PERMITTED` errors.
* **Cause**: Android 9 (API Level 28) and above blocks cleartext HTTP (unencrypted) traffic by default. If your backend/API endpoints use `http://` instead of `https://`, Android blocks the request.
* **Resolution**:
  - Ensure all external endpoints, API integrations, and image CDNs use `https://`.
  - For local development endpoints using `http://localhost` or a local IP:
    1. Create a network security config file: **`android/app/src/main/res/xml/network_security_config.xml`**:
       ```xml
       <?xml version="1.0" encoding="utf-8"?>
       <network-security-config>
           <domain-config cleartextTrafficPermitted="true">
               <domain includeSubdomains="true">localhost</domain>
               <domain includeSubdomains="true">10.0.2.2</domain> <!-- Android Emulator host loopback -->
           </domain-config>
       </network-security-config>
       ```
    2. Reference it in your **`android/app/src/main/AndroidManifest.xml`** inside the `<application>` tag:
       ```xml
       <application
           android:networkSecurityConfig="@xml/network_security_config"
           ... >
       ```

### 5. Automated Build APK Fails (Missing Keystore)
* **Symptom**: GitHub Action `Build & Release APKs` fails on step `Decode keystore for release signing`.
* **Cause**: The GitHub Actions runner cannot sign the production release build because the necessary repository secrets are missing.
* **Resolution**:
  Add the following secrets to the GitHub repository under `Settings -> Secrets and variables -> Actions`:
  - `KEYSTORE_BASE64`: A base64-encoded string of your `.keystore` certificate. (Generate with `base64 -w 0 your-key.keystore` on Linux/macOS or `[Convert]::ToBase64String([IO.File]::ReadAllBytes('your-key.keystore'))` on Windows).
  - `KEYSTORE_PASSWORD`: The password for the keystore.
  - `KEY_ALIAS`: The alias name of the private key.
  - `KEY_PASSWORD`: The password for the private key alias.
