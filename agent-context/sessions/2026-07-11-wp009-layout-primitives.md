# Session: 2026-07-11 WP-009 layout primitives

## Goal

WP-009를 실행해 `@conductor/css`에 레이아웃 프리미티브 클래스를 추가하고, CSS 빌드가 토큰 breakpoint를 미디어쿼리 리터럴로 치환하도록 만든다.

## Current state

WP-009는 완료됐다. `packages/css/src/layout.css`가 추가됐고 `index.css`와 `component.css` 두 번들 모두 `reset -> base -> layout -> component -> utility` 순서로 빌드된다.

검증된 클래스:

- `cdt-app-shell`
- `cdt-split-layout`
- `cdt-card-grid`
- `cdt-page`
- `cdt-content-stack`

소스 `layout.css`는 `{breakpoint.md}` 별칭 표기만 갖고, 빌드 산출물은 `@conductor/tokens/breakpoints` 공개 진입점 값으로 치환된 리터럴 미디어쿼리를 갖는다. CSS 변수 `var(--cdt-breakpoint-*)`가 `@media`에 남으면 `CSS-MEDIA-VAR`로 실패한다.

## Decisions

- 카드 그리드 최소 열 폭은 새 px 리터럴이 아니라 기존 `--cdt-card-grid-min-column` 토큰을 사용한다. 이렇게 해서 `lint:tokens` allowance가 WP-008의 4건으로 유지된다.
- CSS 빌드에서 breakpoint 치환을 처리한다. CSS 변수는 미디어쿼리 조건에서 평가되지 않으므로 런타임 CSS 변수만으로는 FR-CSS-003의 반응형 AC를 만족할 수 없다.
- 테스트는 lightningcss가 `(max-width: 800px)`를 `(width <= 800px)`로 정규화할 수 있음을 고려해 AST prelude 값을 검사한다.
- WP-009 공식 검증 명령은 `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test`다. test만 실행하면 기존 dist를 검증할 수 있어 CR-012/DEV-005로 정정했다.

## Changed files

- `packages/css/src/layout.css` — WP-009 레이아웃 프리미티브 추가.
- `packages/css/build.mjs` — `layout.css`를 두 번들에 포함하고 `{breakpoint.*}` 치환기를 추가.
- `packages/css/checks.mjs` — 산출 CSS의 `@media var(--cdt-breakpoint-*)` 잔존 검사 추가.
- `packages/css/test/bundle.test.ts` — 레이아웃 레이어, 클래스, 색 속성 금지, 미디어쿼리 치환 테스트 추가.
- `packages/css/test/checks.test.ts` — `CSS-MEDIA-VAR` 음성 테스트 추가.
- `docs/40_delivery/conductor_implementation_traceability.md` — WP-009 done, FR-CSS-003/FR-TOK-009 매핑, DEV-005 기록.
- `docs/40_delivery/conductor_work_packages.md` — WP-009 DoD 완료 및 공식 명령 정정.
- `docs/00_governance/change_control.md` — CR-012 등록 및 closed.

## Commands

WP-009 완료 직후 실행한 전체 게이트:

```bash
env COREPACK_HOME=/tmp/conductor-corepack pnpm lint
env COREPACK_HOME=/tmp/conductor-corepack pnpm lint:deps
env COREPACK_HOME=/tmp/conductor-corepack pnpm build
env COREPACK_HOME=/tmp/conductor-corepack pnpm typecheck
env COREPACK_HOME=/tmp/conductor-corepack pnpm test
env COREPACK_HOME=/tmp/conductor-corepack pnpm lint:tokens
env COREPACK_HOME=/tmp/conductor-corepack pnpm check:contrast
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report --code-root .
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict
git diff --check
```

결과:

- `pnpm test`: 19 files, 330 tests passed.
- `@conductor/css` test: 57 tests passed.
- CSS gzip: `index.css` 2772B, `component.css` 2589B.
- `lint:tokens`: 15 files scanned, 0 violations, 4 allowances.
- `check:contrast`: dark 40/40 pass.
- SRS/PRD validator report/strict: no structural or traceability issues.
- `git diff --check`: pass, LF to CRLF warnings only.

## Next steps

1. WP-010을 시작한다.
2. 읽기 범위는 `docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md`, WP-010 블록, 그리고 WP-010이 직접 참조하는 ID로 제한한다.
3. 라이트 팔레트 값은 `docs/20_derived_ui_specs/conductor_design_system_tokens.md` §5/§6에 이미 있다. 새 값을 만들지 말고 옮긴다.
4. 두 테마 키 대칭, `data-cdt-theme` 우선순위, SSR flicker 방지 스니펫, contrast/check contract를 검증한다.

## Risks/gotchas

- Vitest 환경에서 `@conductor/tokens/breakpoints` subpath를 직접 import하면 해석 실패할 수 있다. 빌드는 정상이다. CSS 테스트는 빌드 산출물의 `:root` token 값을 읽는 방식으로 우회했다.
- lightningcss가 미디어쿼리 문법을 정규화한다. 테스트에서 원문 문자열을 고정하지 말고 파싱 결과나 포함 값으로 검증한다.
- `COREPACK_HOME=/tmp/conductor-corepack`를 유지하라. 기본 Corepack cache는 EROFS 문제를 낼 수 있다.

## References

- WP-009
- FR-CSS-003
- FR-TOK-009
- CR-012
- DEV-005
