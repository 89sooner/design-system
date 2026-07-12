import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// DOCS_BASE는 하위 경로 정적 호스팅(예: GitHub Pages의 /design-system/)용이다.
// 로컬 개발·E2E·시각 회귀는 기본값 "/"를 그대로 쓴다. Refs: WP-028 FR-DOC-001
export default defineConfig({ base: process.env.DOCS_BASE ?? "/", plugins: [react()] });
