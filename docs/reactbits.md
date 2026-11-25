# React Bits Integration Guide

This guide describes how **React Bits** ([reactbits.dev](https://reactbits.dev/)) components are integrated into the Samarth main website (`Website-25`).

---

## 🌟 Overview

React Bits is an open-source collection of animated, interactive React components (text animations, animated backgrounds, and micro-interactions).

Because `Website-25` is built with **Vite + React 18 + SCSS** (without Tailwind CSS), all React Bits components use the **`JS-CSS`** flavor. This ensures hardware-accelerated animations, zero unnecessary bloat, and full compatibility with our existing stylesheet hierarchy.

---

## 📁 Directory Structure

```
src/
├── components/
│   └── reactbits/
│       ├── SplitText.jsx       # Staggered letter-by-letter entrance animation
│       ├── BlurText.jsx        # Blur-to-focus typography effect
│       ├── SpotlightCard.jsx   # Radial cursor spotlight tracking card
│       └── index.js            # Unified component exports
└── scss/
    └── component/
        └── _reactbits.scss     # React Bits styling classes
```

---

## 🛠️ CLI Configuration (`components.json`)

The project includes a `components.json` file in the root directory configured with the `@react-bits` registry:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "",
    "css": "src/App.scss",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "src/components",
    "utils": "src/utils"
  },
  "registries": {
    "@react-bits": "https://reactbits.dev/r/{name}.json"
  }
}
```

### 🌍 Global CLI & Direct Terminal Usage
`reactbit`, `shadcn`, and `jsrepo` are installed globally on your machine:

```bash
# Using the dedicated global reactbit CLI:
reactbit list                           # View popular components and flavors
reactbit add SplitText-JS-CSS           # Add a component to the current project
reactbit init                           # Setup components.json in any new project

# Using shadcn directly:
shadcn add @react-bits/SplitText-JS-CSS

# Using jsrepo directly:
jsrepo add https://reactbits.dev/r/SplitText-JS-CSS.json
```

---

## 💻 Connecting Other IDEs (Cursor, VS Code, Windsurf, Claude Code)

You can connect your other IDEs directly to React Bits via the **Model Context Protocol (MCP)** server:

### 1. Cursor (`.cursor/mcp.json`)
The project includes `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "shadcn",
      "args": ["mcp"]
    }
  }
}
```
In Cursor, your AI agent can now search, preview, and automatically install React Bits components directly from natural language prompts.

### 2. VS Code (`.vscode/mcp.json`)
The project includes `.vscode/mcp.json`:
```json
{
  "servers": {
    "shadcn": {
      "command": "shadcn",
      "args": ["mcp"]
    }
  }
}
```

### 3. Global IDE Setup for Any Future Project
To initialize MCP in any new project or folder inside your other IDE, simply open the project terminal and run:
```bash
reactbit mcp cursor    # For Cursor
reactbit mcp vscode    # For VS Code
```


---

## 🧩 Included Components & Usage

### 1. `SplitText`
Splits a string into animated words or characters with staggered entrance physics.

```jsx
import { SplitText } from '../components/reactbits';

<SplitText
  text="Empowering Youth For The Future"
  delay={35}
  className="heading pd"
/>
```

### 2. `BlurText`
Staggers text with an interactive blur-to-focus entrance transition.

```jsx
import { BlurText } from '../components/reactbits';

<BlurText
  text="Discover study resources, past exam questions, and community events."
  delay={60}
  animateBy="words"
  direction="top"
/>
```

### 3. `SpotlightCard`
Wraps card items (e.g. event cards, team profiles) with a sleek radial glow that follows the pointer coordinate.

```jsx
import { SpotlightCard } from '../components/reactbits';

<SpotlightCard
  spotlightColor="rgba(124, 58, 237, 0.25)"
  spotlightRadius={280}
>
  <div className="card-content">
    <h3>Live Event</h3>
  </div>
</SpotlightCard>
```
