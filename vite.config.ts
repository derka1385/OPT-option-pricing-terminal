import { defineConfig } from "vite";

// Relative base so the build works under the GitHub Pages sub-path; output goes to docs/ (Pages source).
export default defineConfig({ base: "./", build: { outDir: "docs" } });
