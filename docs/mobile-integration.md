# Mobile Platform Integration

This document describes how the Samarth React application is bundled into a hybrid mobile application targeting Android using **Capacitor**.

---

## 📱 Capacitor Configuration

The mobile settings are defined in the root configuration file **[capacitor.config.json](../capacitor.config.json)**:
* **`appId`**: `com.samarthtmsl.com` (Unique app identifier for target app stores)
* **`appName`**: `Samarth TMSL` (The app name shown under the launcher icon)
* **`webDir`**: `dist` (The build directory that Capacitor syncs to the native Android container)

---

## 🛠️ Local Android Environment Setup

To run or build the app locally on an Android device or emulator:

### 1. Requirements
* Install **Android Studio**.
* Ensure the **Android SDK** (API Level 33 or 34 recommended) is installed.
* Ensure **Java JDK 17** is installed and configured in your environment (`JAVA_HOME`).

### 2. Synchronization
Whenever you modify the React web code, you must first re-build the web app and then sync the static assets with the Android platform:
```bash
# 1. Build the production React bundle
pnpm run build

# 2. Sync the built folder (dist/) to the android/ project directory
npx cap sync android
```

### 3. Open in Android Studio
To compile, debug, or run the app from your local machine:
```bash
npx cap open android
```
This launches Android Studio directly loaded with the `./android` project directory. From Android Studio, you can:
* Run the app on a connected physical device or virtual emulator.
* Build debug or release APKs/Bundles (`.aab`).

---

## 🤖 GitHub Actions CI/CD Build Pipelines

The repository features automated GitHub workflows to build and release APKs directly from the GitHub interface (`workflow_dispatch` trigger).

### 1. Build & Release Debug APK (`.github/workflows/release-debug-apk.yml`)
* **Trigger**: Manual workflow dispatch.
* **Process**:
  1. Sets up Node.js v20 and installs project dependencies.
  2. Runs `npm run build` to build the web bundle.
  3. Installs Capacitor and runs `npx cap sync android`.
  4. Sets up Java JDK 17.
  5. Makes `gradlew` executable and runs `./gradlew assembleDebug` in the `android` folder.
  6. Releases `android/app/build/outputs/apk/debug/app-debug.apk` directly to GitHub Releases tagged as `debug-v1.0.<run_number>`.

### 2. Build & Release Signed Release APK (`.github/workflows/release-apk.yml`)
* **Trigger**: Manual workflow dispatch.
* **Secrets Required**:
  * `KEYSTORE_BASE64`: Base64 string representation of the release `.keystore` certificate.
  * `KEYSTORE_PASSWORD`: Keystore password.
  * `KEY_ALIAS`: Keystore certificate key alias.
  * `KEY_PASSWORD`: Key password.
* **Process**:
  1. Performs checkout, installs dependencies, builds React web app, and runs `npx cap sync android`.
  2. Decodes the Base64 key to write the binary keystore: `echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore`.
  3. Launches the gradle compiler: `./gradlew assembleRelease` inside `./android`.
  4. Releases the signed production APK (`android/app/build/outputs/apk/release/app-release.apk`) to GitHub Releases.
