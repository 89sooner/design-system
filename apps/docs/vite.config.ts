import react from "@vitejs/plugin-react";
import { Features } from "lightningcss";
import { defineConfig } from "vite";

// DOCS_BASE는 하위 경로 정적 호스팅(예: GitHub Pages의 /design-system/)용이다.
// 로컬 개발·E2E·시각 회귀는 기본값 "/"를 그대로 쓴다. Refs: WP-028 FR-DOC-001
//
// Vite 8 minifies CSS with Lightning CSS for its default target (Chrome 111). Chrome supports `:dir()`
// only from 120, so Lightning CSS rewrites every `:dir(rtl)` rule into a `:lang(ar), :lang(fa), …` list.
// That matches the page language, not the `dir` attribute, and the RTL mirroring of FR-CSS-006 stops
// working under `dir="rtl"`. Keep `:dir()` as written; the supported browsers (NFR-005) all have it.
// Refs: CR-089 FR-CSS-006 NFR-005
export default defineConfig({
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react()],
  css: { lightningcss: { exclude: Features.DirSelector } },
});
