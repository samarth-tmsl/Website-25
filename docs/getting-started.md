# Getting Started Guide

This document describes how to set up your local development environment, install project dependencies, run the development server, and build the Samarth website project for production.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **Node.js**: Version `20.x` or later is recommended.
2. **Package Manager**: The project uses **pnpm** (version `11.3.0` is specified in `package.json`).
3. **Android Studio** (Optional): Required only if you intend to run or build the hybrid mobile application locally.

---

## ⚙️ Initial Setup

Follow these steps to set up the project locally:

### 1. Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/samarth-tmsl/Website-25
cd Website-25
```

### 2. Install Dependencies
Install dependencies using **pnpm**:
```bash
pnpm install
```
*(If you do not have pnpm installed globally, you can install it using `npm install -g pnpm`, or fallback to standard npm via `npm install`.)*

---

## 🚀 Running Locally

### Start Development Server
To launch the Vite development server with hot-module replacement (HMR):
```bash
pnpm run dev
```
By default, the server runs on:
* **URL**: [http://localhost:5173](http://localhost:5173)
* **Port**: `5173` (defined in `vite.config.js`)
* It will automatically attempt to open the page in your default web browser (configured via `open: true` in `vite.config.js`).

---

## 🏗️ Building for Production

### Build the Application
To compile and bundle assets for production deployment:
```bash
pnpm run build
```
* The production-ready bundle will be outputted to the `dist/` directory.
* The build output includes minified JavaScript, optimized CSS, and statically copied assets.

### Preview Production Build Locally
To test the production build locally before deploying it:
```bash
pnpm run preview
```
This runs a local web server serving the contents of the `dist/` folder.

---

## 📊 Visualizing the Architecture

The repository includes a custom 3D architecture visualization generator script. To run this script and generate a structural dependency graph (`public/graph-data.json`):
```bash
pnpm run visualize
```
This script traverses all components, styles, pages, and assets to output a graphical representation of imports and folders.
