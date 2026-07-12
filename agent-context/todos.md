# 다음 작업 / 미해결 항목

## 현재 시작 지점

WP-023까지 구현·문서·검증이 green이다. 다음 작업은 **WP-024 접근성 자동화**다.

```text
1. agent-context/sessions/2026-07-12-wp023-shell-components.md를 읽는다
2. WP-024의 DoD와 FR-A11Y/FR-QA 매핑을 원문에서 확인한다
3. 현재 수동/컴포넌트별 a11y 검사와 새 루트 test:a11y 계약의 경계를 정한다
4. axe serious+ 0, keyboard smoke, CI 실행을 구현한다
5. 전체 게이트와 문서 strict validator를 실행하고 traceability를 갱신한다
```

## P0 — WP-024 접근성 자동화

- 루트 `pnpm test:a11y`가 실제로 실패 가능한 gate가 되게 한다.
- axe-core serious 이상 violation 0을 컴포넌트/문서 소비 경로에서 검증한다.
- 키보드 smoke는 skip link, off-canvas Escape, focus 이동 등 이미 존재하는 WP-023 Playwright 증거를 재사용할지 WP-024 전용 스위트로 묶을지 DoD를 기준으로 결정한다.
- Radix가 소유하는 focus trap/roles/keyboard 동작을 다시 손으로 구현하지 않는다.

## P1 — WP-025 크기 자동화

- Button 단독 gzip ≤4KB, `@conductor/css` gzip ≤20KB.
- 현재 CSS 측정치는 index 7,751B / component 7,590B다.
- docs Vite JS chunk는 약 517.81kB minified / 146.29kB gzip으로 경고가 난다. WP-025 또는 WP-028에서 근거 있게 처리한다.

## P2 — 릴리스 마감

- WP-026 release readiness.
- WP-027 consumer smoke.
- WP-028 docs performance/Lighthouse.

## 검증 기준선

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

WP-023 완료 기준: root tests 485/485, React 142/142, CSS 76/76, docs E2E 16/16, contrast 80/80.

## 열린 결정

- OD-003 FilterBar/Chip의 v1 포함 여부만 open이며 Must FR을 차단하지 않는다. FR/WP가 없으므로 구현하지 않는다.

## 계속 지킬 것

- `srs_final.md` baseline 의미를 바꾸면 CR을 먼저 등록하고 cascade한다.
- 생성 파일 `packages/tokens/src/tokens.ts`, `src/breakpoints.ts`, docs `src/generated/*`를 직접 편집하지 않는다.
- docs 검증 전 workspace dependency dist가 최신인지 확인한다. 가장 안전한 기준은 루트 `pnpm build`다.
- `@conductor/react`에 라우팅 라이브러리를 추가하지 않는다. 링크는 `renderLink`로 위임한다.
