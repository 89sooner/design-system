# 다음 작업 / 미해결 항목

## 현재 시작 지점

WP-018~022 구현은 작업 트리에 있고 docs 빌드·타입검사·Playwright 15/15가 통과한다. 그러나 루트 test와 lint가 red이고 delivery 문서 동기화가 덜 끝났으므로 **WP-023을 바로 시작하지 않는다.**

```text
1. agent-context/sessions/2026-07-12-wp018-022-docs-site.md를 읽는다
2. vitest.config.ts의 tokens jsdom 변경을 검토하고 pnpm test를 복구한다
3. docs catalog ESLint 2건과 기존 React lint 3건의 범위를 확인한다
4. WP-018~022 DoD 체크박스와 FR-DOC-001 상태를 AC별 증거로 동기화한다
5. 전체 게이트를 다시 통과시킨다
6. 그 뒤 WP-023 셸 컴포넌트군을 시작한다
```

## P0 — handoff 시점의 red 상태 해소

- `pnpm test`: 3 failures. `vitest.config.ts`가 tokens project를 node → jsdom으로 바꾼 것이 원인이다. file-URL 기반 테스트 3곳이 깨진다.
- `eslint .`: 5 errors. 새 docs 2건(`catalog.tsx` unused error/info) + 기존 React contract test 3건.
- 가장 작은 test 복구 후보는 tokens project의 `environment: "node"`, `include: ["src/**/*.test.ts"]` 복원이다. docs E2E는 Playwright라 이 설정에 의존하지 않는다.

## P1 — WP-018~022 문서 마감

- `conductor_work_packages.md`: summary는 done이지만 WP-018~022의 모든 DoD가 `[ ]`다. 테스트/코드 증거를 확인해 동기화한다.
- `conductor_implementation_traceability.md`: FR-DOC-001이 “WP-019~022 미완료”를 전제로 `부분`인데 그 WP들은 같은 파일에서 done이다. AC-2 포함 전체 요구를 읽고 상태를 재평가한다.
- docs 빌드의 507.34 kB chunk warning은 기록만 한다. WP-025 size gate와 WP-028 Lighthouse 전에는 임의 최적화하지 않는다.

## P2 — 다음 구현 WP

**WP-023 셸 컴포넌트군**

- C-070 AppShell, C-071 NavList, C-072 TopBar.
- `NavList.renderLink`로 링크 렌더를 소비자에게 위임한다. `@conductor/react`에 React Router를 추가하지 않는다.
- 800px 미만 off-canvas는 overlay click/Escape로 닫히며 Radix가 focus/keyboard behavior를 소유한다.
- AppShell은 skip link와 main id/focus 연결을 제공한다.
- public exports, `publicComponents` registry, SSR renderer, shared contract suite를 함께 갱신한다.

## 검증 순서

```text
pnpm build
pnpm typecheck
pnpm test
pnpm lint
pnpm lint:tokens
pnpm check:contrast
pnpm --filter docs test:e2e
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict
```

Playwright는 제한된 sandbox에서 preview webServer가 뜨지 않을 수 있다. 같은 명령이 browser/localhost 권한을 가진 실행에서는 15/15 통과했다.

## 열린 결정

- OD-003 FilterBar/Chip의 v1 포함 여부만 open이며 Must FR을 차단하지 않는다. FR이 없으므로 구현하지 않는다.

## 계속 지킬 것

- `srs_final.md`는 baseline v1.2. 요구사항 의미 변경은 CR 선등록 후 cascade한다.
- 생성 파일 `packages/tokens/src/tokens.ts`, `src/breakpoints.ts`, docs `src/generated/*`를 직접 편집하지 않는다.
- 코드/문서 불일치는 DEV → CR 절차 없이 조용히 바꾸지 않는다.
- 도메인 컴포넌트는 이식하지 않는다(F-X-009).
