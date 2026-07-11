#hidden
# aci:v1 id=fefc068 src=agent-context/sessions/2026-07-11-wp015-radix-overlays.md
@kv sha256=86f965aecdac7749e0ec27b68d5ca5de650ef2a6e1c2227cdc6c4781c4db9bfe bytes=3431 lines=51 title=Session-2026-07-11-WP-015-Radix-오버레이-컴포넌트
@sig agent-context/sessions/2026-07-11-wp015-radix-overlays.md;packages/react/src/overlay.tsx;Dialog/Drawer;radix-ui/react-dialog;Tooltip/Menu;observe/unobserve/disconnect;packages/react/package.json;testing/overlay.test.tsx;packages/react/src/index.ts;testing/public-components.ts;packages/css/src/components.css;test/bundle.test.ts;overlay/menu;QA/work;package/traceability;dark/light;80/80;FR-A11Y-003/005;Select/Switch/Checkbox;role/aria;QA/traceability;Risks/gotchas;hover/focus;Session
@h1 Session: 2026-07-11 — WP-015 Radix 오버레이 컴포넌트
@h2 Goal
@path WP-015를 Radix 접근성 동작을 유지하는 wrapper로 구현하고, 작업물과 handoff를 분리 커밋한다.
@h2 Current state
@path WP-015 done: Dialog, Drawer, Tooltip, DropdownMenu compound namespaces가 packages/react/src/overlay.tsx에 있다.
@path Dialog/Drawer는 같은 @radix-ui/react-dialog 경로를 사용하고, Tooltip/Menu는 전용 Radix package wrapper다.
@path 고정 runtime dependencies: dialog 1.1.19, tooltip 1.2.12, dropdown-menu 2.1.20. 다음 WP는 WP-016 폼이다.
@h2 Decisions
@b Conductor는 Radix가 제공하는 role, aria-*, focus trap, Escape, focus restore, scroll lock을 구현하거나 덮어쓰지 않는다. wrapper는 className과 visual-only props만 추가한다.
@b Radix dependencies는 peer가 아니라 정확 버전의 package dependency로 둔다. tsup external에도 명시해 library output에 번들하지 않는다.
@b Tooltip SSR registry renderer는 Provider 안에 Root를 넣어야 한다. Provider 밖 Root는 SSR에서 즉시 throw한다.
@path ResizeObserver는 jsdom에 없어 overlay test에서 최소 observe/unobserve/disconnect polyfill을 둔다. 브라우저 동작 구현이 아니다.
@h2 Changed files
@path packages/react/package.json, pnpm-lock.yaml, tsup.config.ts — 정확 고정 Radix dependencies and externalization.
@path packages/react/src/overlay.tsx, testing/overlay.test.tsx — four overlay namespaces and interaction tests.
@path packages/react/src/index.ts, testing/public-components.ts — public exports and SSR registry.
@path packages/css/src/components.css, test/bundle.test.ts — tokenized overlay/menu styles and data-state selector checks.
@path delivery QA/work package/traceability docs — WP-015 status and FR mapping.
@h2 Commands
@cmd Final gate: pnpm build && pnpm test && pnpm typecheck && pnpm lint:tokens && pnpm check:contrast → 27 files / 434 tests, 0 violations, dark/light 80/80.
@b strict validator passed.
@b Initial SSR registry test failed: Tooltip Root lacked Tooltip Provider. Renderer now wraps it.
@b Initial jsdom overlay test exposed asynchronous focus restore, absent ResizeObserver, and pointer-only menu opening. Use waitFor, a test-local ResizeObserver shim, and default-open menu role inspection.
@h2 Next steps
@path Read WP-016, FR-CMP-007, FR-A11Y-003/005, Field and form component specs.
@path Confirm whether Select/Switch/Checkbox require new exact Radix packages; add only those and externalize them.
@path Preserve {...userProps} before Radix-owned props; do not set Radix role/aria attributes directly.
@cmd Register public components, run full gates, update QA/traceability, then make work and handoff commits separately.
@h2 Risks/gotchas
@b Radix portal content does not render inside the Testing Library container; query by role from the document.
@b Tooltip.Root requires Tooltip.Provider, including SSR renderer fixtures.
@path jsdom lacks ResizeObserver and Radix pointer flows may not match a native click. Keep the shim test-only; actual browser a11y validation remains WP-024.
@path CSS for Radix DOM may use only the documented [data-state], [data-side], [data-align], [data-highlighted], [data-disabled] attributes; avoid structure and hover/focus selectors for menu state.
@h2 References
@path 95f8bba Implement Radix overlay primitives — Refs WP-015 FR-CMP-006 FR-A11Y-002 FR-A11Y-005 FR-TOK-008.
