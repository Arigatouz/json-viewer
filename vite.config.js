import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the repo name for GitHub Pages project sites:
// https://<user>.github.io/json-viewer/
export default defineConfig({
  plugins: [react()],
  base: "/json-viewer/",
});
