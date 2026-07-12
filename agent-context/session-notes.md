# Session: 2026-07-12 — WP-023 셸 컴포넌트군 완료

## Goal

WP-023의 C-070 `AppShell`, C-071 `NavList`, C-072 `TopBar`를 `@conductor/react`에 구현하고, docs를 첫 소비자로 전환하며 전체 품질 게이트를 통과시킨다. 이어 세션 컨텍스트를 갱신해 handoff pack을 만든다.

## Current state

- WP-023 구현과 문서 추적이 완료됐다. 공개 컴포넌트는 27개에서 30개로 증가했다.
- `AppShell`은 Radix Dialog의 `modal={false}`와 plain scrim을 조합한다. Escape와 바깥 클릭은 Radix `DismissableLayer`가 처리한다.
- `NavList`는 라우팅을 `renderLink`로 소비자에게 위임한다. `@conductor/react`에는 React Router 의존성이 없다.
- `TopBar`는 title/actions/mobileNavTrigger 슬롯을 제공한다. ReactNode 슬롯 `title`과 native `title` 충돌은 native props에서 `title`을 omit하고 문자열일 때만 `<header title>`로 미러링해 해결했다.
- docs의 기존 자체 sidebar/topbar/drawer를 공개 `AppShell`/`NavList`/`TopBar`로 교체했다. docs가 실제 소비자라는 FR-DOC-001 AC-2를 닫았다.
- 19개 셸 component token을 추가했다. 토큰 총계 337개(primitive 74 / semantic 88 / component 175), CSS 선언 263개다.
- WP-018~022에서 남았던 tokens Vitest 환경 회귀와 ESLint 5건도 최소 수정으로 해소했다.

## Verification evidence

- `pnpm build` — 통과. 의존성 위반 0, tokens 337, contrast 80/80, CSS gzip index 7,751B / component 7,590B, React/docs build 통과.
- `pnpm typecheck` — 4개 workspace 전부 통과.
- `pnpm test` — 29 files, 485/485 통과.
- `pnpm lint` — 통과.
- `pnpm lint:tokens` — 40 files, 0 violations, 57 allowances.
- `pnpm check:contrast` — 80/80 통과.
- `pnpm --filter @conductor/react test -- shell` — 실제로 전체 React 12 files, 142/142 통과.
- CSS suite — 3 files, 76/76 통과.
- docs Playwright — 16/16 통과. 실제 600px viewport에서 scrim click, Escape, skip-link focus를 검증했다.
- SRS/PRD validator `--report`, `--strict` — issue 0.
- `git diff --check` — 오류 없음(LF/CRLF 경고만 존재).

## Debugging decisions

1. 첫 모바일 E2E에서 `.cdt-app-shell__overlay`가 존재하지 않았다. Radix source를 확인해 `DialogOverlay`가 `modal={false}`일 때 `null`을 반환함을 확인했다. 따라서 scrim은 plain div로 렌더하고 Content의 `DismissableLayer`가 outside pointer를 감지하게 했다.
2. 이 수정 뒤에도 E2E가 한 번 실패했다. docs E2E 명령이 `apps/docs`만 빌드해 `packages/react/dist`의 오래된 코드를 소비한 것이 원인이었다. React dist를 먼저 재빌드하자 16/16 통과했다.
3. 루트 test의 `"ink:"` 금지 검사는 새 유효 키 `skipLink:` 내부 문자열을 오탐했다. primitive leakage의 실제 의도에 맞게 top-level YAML key regex로 바꿨다.
4. 토큰 린트는 CSS 테스트 제목의 리터럴 `800px`도 검사했다. 제목을 `md breakpoint`로 바꿨다.
5. TopBar `title: ReactNode`가 native HTML `title?: string`과 충돌했다. 슬롯 API는 유지하고 inherited native title만 omit했다.

## Next steps

1. WP-024 접근성 자동화: axe serious+ 0, keyboard smoke, CI `test:a11y` 계약을 구현한다.
2. WP-025 bundle size 자동화: Button gzip ≤4KB, `@conductor/css` gzip ≤20KB를 공식 루트 스크립트와 CI 게이트로 만든다.
3. WP-026 release readiness, WP-027 consumer smoke, WP-028 docs 성능 순으로 진행한다.
4. docs Vite chunk 경고(약 517.81 kB minified / 146.29 kB gzip)는 WP-025/WP-028에서 다룬다. 현재 WP-023 실패로 취급하지 않는다.

## Risks/gotchas

- docs 단독 build/E2E는 workspace dependency의 stale `dist`를 소비할 수 있다. React 소스 변경 뒤 docs를 검증할 때는 루트 build 또는 React build를 선행한다.
- `Dialog.Root modal={false}`에서는 Radix `Dialog.Overlay`가 렌더되지 않는다. 다시 Overlay primitive로 교체하면 모바일 scrim이 사라진다.
- generated 파일 `packages/tokens/src/tokens.ts`, `src/breakpoints.ts`, docs `src/generated/*`를 직접 편집하지 않는다.
- Vite chunk warning은 기록된 후속 작업이며, WP-023 범위에서 임의 분할하지 않는다.
- OD-003 FilterBar/Chip은 여전히 open/nonblocking이고 FR/WP가 없으므로 구현하지 않는다.

## References

- `agent-context/sessions/2026-07-12-wp023-shell-components.md`
- WP-023, FR-CMP-009, FR-DOC-001, FR-A11Y-002, FR-DX-004, FR-QA-002.
