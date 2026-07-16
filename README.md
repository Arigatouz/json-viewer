# JSON Viewer

**An interactive JSON/JSONL visualizer with TypeScript interface generation.**

JSON/JSONL data visualized as interactive graph diagrams with a cyberpunk aesthetic. Powered by the **AliDevHub design system** (neon-noir, rev 2026.06).

## What's Inside

- **Interactive Graph Visualization** — Visualize JSON structures as interactive node graphs with band layout (preventing node overlap)
- **JSONL Support** — Auto-detects and visualizes JSONL files (one JSON record per line) with per-line error reporting
- **TypeScript Interface Generation** — Automatically generate TypeScript interfaces from any JSON payload, useful for type-safe development
- **Graph Navigation** — Pan, zoom, fit-to-view, and collapse/expand subtrees
- **Search & Highlight** — Find nodes with neon-magenta hit highlighting
- **Theming** — Toggle between light and dark themes, fully driven by design tokens (`THEME_CSS` in `src/App.jsx`)

## Develop

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` triggers the GitHub Pages workflow.

Live at: `https://arigatouz.github.io/json-viewer/`

## Connect

[![Twitter / X](https://img.shields.io/badge/Twitter%20%2F%20X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/AliDevEgy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alidevegy/)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/profile.php?id=61590774857109)
[![Bluesky](https://img.shields.io/badge/Bluesky-0285FF?style=for-the-badge&logo=bluesky&logoColor=white)](https://bsky.app/profile/arigatouz.bsky.social)
