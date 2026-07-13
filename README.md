# // Schematic

JSON / JSONL → interactive graph visualizer. A JSON Crack rebuild skinned with
the **AliDevHub design system** (cyberpunk / neon-noir, rev 2026.06).

**Features**
- Graph view with band layout (no node overlap), pan / zoom / fit, collapse subtrees
- Auto-detects JSONL (one record per line) with per-line error reporting
- Search with neon-magenta hit highlighting
- TypeScript interface generation from any payload
- Light / dark themes driven entirely by design tokens (`THEME_CSS` in `src/App.jsx`)

**Develop**
```bash
npm install
npm run dev
```

**Deploy** — pushing to `main` triggers the GitHub Pages workflow.
Live at: `https://<your-username>.github.io/schematic/`
