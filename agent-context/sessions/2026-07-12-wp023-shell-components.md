# Session History — 2026-07-12 WP-023 셸 컴포넌트군

## 요청과 범위

사용자는 기존 변경사항을 나눠 커밋한 뒤 WP-023을 진행하라고 했다. 이 세션은 WP-018~022 뒤 남은 red 상태를 먼저 복구하고, C-070 AppShell/C-071 NavList/C-072 TopBar 구현, docs 소비자 마이그레이션, 문서 원장 동기화, 전체 검증까지 완료했다.

## 선행 red 복구

- `vitest.config.ts`: tokens project를 다시 node 환경과 `.test.ts` 범위로 제한했다. docs E2E와 무관한 jsdom 전환이 file URL 기반 tokens 테스트를 깨뜨리고 있었다.
- `packages/react/src/testing/contract.test.tsx`: 빈 interface와 unused callback 인자를 최소 수정했다.
- `apps/docs/src/catalog.tsx`: `componentDidCatch`의 unused 인자를 제거했다.

## 구현

### React public API

- `packages/react/src/shell.tsx`
  - `AppShell`: Radix Dialog 기반 controlled/uncontrolled mobile nav, skip link, sidebar/main slots.
  - `NavList`: section/label/item 모델, `aria-current`, 소비자 `renderLink` 위임.
  - `TopBar`: mobileNavTrigger/title/actions slots.
- `packages/react/src/index.ts`: 컴포넌트와 타입 export.
- `packages/react/src/testing/public-components.ts`: registry와 SSR smoke를 30개로 확장.
- `packages/react/src/testing/shell.test.tsx`: 공통 계약, 링크 위임, skip focus, Escape, slots 등 16개 테스트.
- `packages/react/src/index.test.ts`: routing dependency 부재와 module-scope browser global 부재 검증.

### CSS/tokens

- `packages/tokens/src/components.ts`: appShell, skipLink, navList/navItem/navSectionLabel, topBar와 sectionLabel font weight를 포함한 19개 token 추가.
- `packages/css/src/components.css`: desktop shell, mobile off-canvas/scrim, nav/topbar, responsive 1080/800/560 규칙 추가.
- `packages/css/src/utility.css`: skip link가 전용 component token을 사용하도록 갱신.
- CSS 번들 계약 테스트를 새 클래스/token/breakpoint에 맞게 확장.

### Docs first consumer

- `apps/docs/src/App.tsx`: 자체 sidebar/topbar/drawer를 공개 AppShell/NavList/TopBar로 교체. React Router는 docs에 남고 `renderLink`로 연결된다.
- `catalog.tsx`: 공개 3개 컴포넌트 live preview 추가.
- `docs.css`: 중복 셸 스타일 제거.
- Playwright: 공개 shell class 사용, 600px scrim click, Escape, skip-link focus를 검증. catalog 수는 30.

### Planning/traceability

- token spec에 shell token 계약 추가.
- component spec의 OD-004 문구를 closed/included로 정리.
- API contracts를 실제 30개 공개 표면에 맞게 갱신.
- QA-012/013, QA-165~176을 구현 증거로 체크.
- WP-023 상태와 DoD를 done으로 전환.
- ledger에서 FR-CMP-009, FR-DOC-001, FR-DOC-003, FR-A11Y-002, FR-DX-004, FR-QA-002를 최신 증거에 맞게 갱신.

## 중요한 디버깅 기록

### Radix non-modal Overlay

모바일 E2E가 overlay selector 부재로 실패했다. CSS 문제가 아니라 Radix 구현 계약이었다. `Dialog.Root modal={false}`이면 `Dialog.Overlay`는 렌더되지 않는다. plain scrim을 Content와 같은 Portal에 두면 Radix Content의 `DismissableLayer`가 scrim pointer-down을 outside interaction으로 받아 닫는다. Escape도 Radix가 처리한다. 브라우저에서 두 경로 모두 검증했다.

### stale workspace dist

수정 뒤에도 docs E2E가 실패했는데, docs 스크립트는 apps/docs만 build하고 `@conductor/react`의 이전 dist를 소비하고 있었다. React package를 먼저 build하자 통과했다. 소스 기반 unit test green만으로 docs 소비 산출물이 최신이라고 가정하면 안 된다.

### 문자열 오탐

- generated tokens test가 `tokens.json` 전체에서 `"ink:"` substring을 찾았다. 새 정상 키 `skipLink:`가 이를 포함해 실패했다. top-level key regex로 실제 primitive leakage만 잡게 수정했다.
- token lint는 테스트 설명 문자열도 검사해 `800px`을 literal 위반으로 잡았다. 설명을 `md breakpoint`로 바꿨다.

### TopBar title 충돌

슬롯 `title: ReactNode`는 요구 API지만 `HTMLAttributes<HTMLElement>`의 native `title?: string`과 교차하면 타입이 좁아진다. native title을 inherited props에서 omit하고, slot이 string일 때만 header의 native title로 미러링했다. ReactNode slot과 공통 native-prop 계약을 모두 보존한다.

## 최종 검증

- root build/typecheck/test/lint/lint:tokens/check:contrast 전부 통과.
- 29 files / 485 tests, React 142, CSS 76, Playwright 16.
- tokens 337, CSS declarations 263, contrast 80/80.
- CSS gzip 7,751B(index), 7,590B(component).
- 문서 validator report/strict issue 0.
- 공개 registry 30, package routing dependency 0.

## 남은 일

WP-024 접근성 자동화가 다음이다. 이후 WP-025 size, WP-026 readiness, WP-027 consumer smoke, WP-028 performance가 남아 있다. Vite chunk warning은 후속 범위이며 WP-023 gate 실패가 아니다.
