# CMS Deployment Guide

This document describes how to deploy the Samarth website CMS (Google Apps Script Backend, Admin Dashboard, and Public Client) step by step.

---

## 1. Deploying the Google Apps Script Backend

### Step 1: Create a Google Apps Script Project
1. Log into your Google account (preferably the official Samarth club account).
2. Go to [Google Apps Script Dashboard](https://script.google.com/).
3. Click **New Project** and rename the project to `Samarth Website CMS`.

### Step 2: Copy backend code files
1. Copy the contents of the files inside the [backend/](file:///e:/projects/Website-25/backend) directory:
   - Create `Config.gs` and paste the contents of `backend/Config.gs`.
   - Create `Code.gs` and paste the contents of `backend/Code.gs`.
   - Create `Router.gs`, `Auth.gs`, `Permissions.gs`, `Sheets.gs`, `Drive.gs`, `Team.gs`, `Guests.gs`, `Gallery.gs`, `Events.gs`, `Announcements.gs`, `Sponsors.gs`, `AuditLogs.gs`, `Validation.gs`, and `Utils.gs` and copy their respective files.
2. In the Apps Script project settings (cog icon), enable **Show "appsscript.json" manifest file in editor** if it's not visible, and paste the contents of `backend/appsscript.json`.

### Step 3: Run the Auto-Setup installer
1. In the Apps Script editor toolbar, select the `runSetup` function from the dropdown.
2. Click **Run**.
3. You will be prompted to grant authorization permissions. Authorize the script using the Google account.
4. Once completed, check the **Execution log** (Ctrl+Enter). It will display the generated spreadsheet and folder IDs.
5. Copy these IDs, open `Config.gs` in your Apps Script project, and paste them into:
   - `SPREADSHEET_ID`
   - `ROOT_FOLDER_ID`
   - `FOLDER_IDS` (paste the respective subfolder IDs generated in the logs).
6. Click **Save** (Ctrl+S).

### Step 4: Publish as a Web App
1. Click **Deploy** -> **New deployment** in the top right.
2. Select type: **Web app** (gear icon -> Web app).
3. Configure settings:
   - **Description**: `Samarth Website CMS v1.0`
   - **Execute as**: `User deploying the web app` (Me)
   - **Who has access**: `Anyone` (necessary for browser API requests to execute)
4. Click **Deploy**.
5. Copy the generated **Web app URL** (which should end with `/exec`). This is your `VITE_API_URL`.

---

## 2. Deploying the Admin Panel

The admin panel is a React + Vite application that compiles to static HTML/JS/CSS assets.

### Step 1: Create Google OAuth credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project (or create one).
3. Navigate to **APIs & Services** -> **Credentials**.
4. Click **Create Credentials** -> **OAuth client ID**.
5. Application Type: **Web application**.
6. Name: `Samarth CMS Admin Panel`.
7. Authorized JavaScript origins:
   - Add local development URL (e.g. `http://localhost:5174`).
   - Add your production admin dashboard URL (e.g. `https://admin.samarthtmsl.in`).
8. Click **Create** and copy your **Client ID**.
9. Open [admin/src/pages/Login.jsx](file:///e:/projects/Website-25/admin/src/pages/Login.jsx) and replace the `client_id` string inside `google.accounts.id.initialize` with your new OAuth Client ID.

### Step 2: Build the Admin Panel
1. Install dependencies and compile using pnpm at the root directory:
   ```bash
   pnpm --filter samarth-cms-admin build
   ```
2. The compiled files will reside inside `admin/dist/`.

### Step 3: Upload to host
- You can deploy the `admin/dist/` folder to any static hosting provider (Vercel, Netlify, Github Pages, or your own VPS).
- On the first load, navigate to the Login page. A setup box will ask for the Google Apps Script Web App URL. Paste the URL copied in the backend deployment step, and click **Save**. This will configure the endpoint locally in the browser!

---

## 3. Deploying the Public Client

### Step 1: Configure Environment variables
1. In the root directory, create a `.env` or `.env.local` file (or set them on your build host like Vercel).
2. Add the API URL key:
   ```env
   VITE_API_URL=https://script.google.com/macros/s/YOUR_GAS_SCRIPT_ID/exec
   ```

### Step 2: Build and deploy
1. Run build in the root directory:
   ```bash
   pnpm build
   ```
2. Upload the `dist/` directory to Vercel, Netlify, or your domain.
