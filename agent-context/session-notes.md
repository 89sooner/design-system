# Session: 2026-07-10 — Conductor Design System, 문서 환경 구축부터 REL-001 완료까지

## Goal

사용자 표현: "나만의 커스텀 디자인 시스템. `/home/roqkf/agent-ai-platform` 프로젝트의 디자인 스타일을 나의 디자인 시스템으로 디벨롭. Opus 4.8 메인 오케스트레이션 + Opus/Sonnet 서브에이전트 병렬. 설계 문서부터 구현 및 스캐폴딩. codex는 호출하지 않음."

## Current state

**동작함**
- `docs/` 39개 md + 루트 `AGENTS.md`/`CLAUDE.md`/`README.md`. `validate --strict` exit 0
- `srs_final.md` baseline v1.2 (사용자 승인)
- `@conductor/tokens` 완전 동작: 276 토큰 → CSS 202선언 + TS/JSON + breakpoints + CLI 3종
- 클린 체크아웃에서 게이트 7개 exit 0, 278 테스트, 빌드 6.5초
- 대비 검사 다크 40/40 통과

**반쯤 된 것**
- `packages/css`, `packages/react`, `apps/docs`는 WP-001 골격만 (자리표시 진입점 + 스모크 테스트)
- 라이트 팔레트 값은 **문서에 산출돼 있으나 코드로 옮겨지지 않음** (WP-010)
- 두 테마를 전제하는 AC 4개가 원장에 `부분`으로 남음

**깨진 것**: 없음

## Decisions

`decisions.md` 참조. 요약:

- 이름 Conductor, `--cdt-` 접두사, Vanilla CSS + 커스텀 프로퍼티(ADR-002), Radix 위임(ADR-004), `@layer` 캐스케이드(ADR-005)
- OD-001 최소 수정 / OD-002 시각회귀 REL-004 이월 / OD-004 셸 패키지 포함. OD-003만 open(비차단)
- CR-004 아키텍처 문서 4종 재해석(서버가 없으므로)
- CR-006 `status.neutralEnd` → `decorative` (해소안 A; 해소안 B `#5d6e86` 기각)
- CR-008 토큰 계층 불변식 = "자기 계층 또는 하위만 참조" (재분류 회피안 기각 — 모순을 옮길 뿐)
- CR-009 CI 순서 `build → typecheck` (생성된 타입 표면 때문)

## Changed files

이 세션이 만든 것 전부. 이전 상태는 빈 디렉터리(`.omc/`만 존재).

- `docs/**` — 39개 계획 문서 (스캐폴드 후 전부 채움)
- `AGENTS.md`, `CLAUDE.md`, `README.md` — 확정 결정 표, 명령 표, 코드 규약
- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.mjs`, `.gitignore`
- `scripts/check-deps.mjs` — 의존 방향 가드
- `.github/workflows/ci.yml` — CR-009로 순서 정정됨
- `packages/tokens/**` — 토큰 소스 7파일 + `build/` 12파일 + `contrast/` 6파일 + `lint/` 4파일 + 테스트 9파일
- `packages/css/`, `packages/react/`, `apps/docs/` — 골격만

## Commands

`commands.md`에 전체 기록. 이 세션에서 배운 함정 셋:

1. `bin/*.mjs`는 번들된 `dist/cli.js`를 실행한다. 소스 고치고 bin 직접 실행하면 **아무 일도 안 일어난다**. 음성 테스트 두 번을 이걸로 날렸고, 하마터면 "원자적 쓰기 확인됨"이라고 잘못 기록할 뻔했다
2. `dist/`가 gitignore된 상태의 `git diff --exit-code -- dist`는 **절대 실패하지 않는다**. 내가 처음 넣은 CI 검사였고 지웠다
3. `lint:tokens`는 `packages/css`가 비어 있어 자명하게 통과한다. 픽스처 주입으로 실제 검출을 확인해야 한다

## Next steps

1. `docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md` 읽기
2. **WP-008** `@conductor/css` 레이어 골격 — `@layer` 5단, `!important` 0건, `@conductor/tokens/tokens.css`를 **공개 진입점으로** import
3. WP-009 레이아웃 프리미티브
4. **WP-010** 라이트 팔레트 — 값은 `conductor_design_system_tokens.md` §5·§6에 이미 있다. 완료 후 `부분`으로 표시된 AC 4개를 재검증해 `검증됨`으로 올릴 것
5. WP-011 React 공통 계약 → WP-012~017 컴포넌트군 6개(병렬 가능)

## Risks/gotchas

`risks.md` 참조. 가장 중요한 것:

- **라이트 팔레트가 `check:contrast`를 통과할지 아직 모른다.** WP-010이 두 테마로 돌리는 첫 순간이다. R-1(글래스/글로우 재현 한계)이 여기서 터진다
- Radix DOM에는 `data-*` 속성 셀렉터만. 구조 셀렉터 쓰면 업그레이드가 CSS를 깬다(R-3)
- 검증기가 백틱 안의 `radius.md` 같은 토큰명을 문서 경로로 오인한다. 볼드를 써라
- `srs_final.md`는 baseline. 요구사항 변경은 CR 선등록 후에만

## References

- 소스 저장소: `/home/roqkf/agent-ai-platform` (읽기 전용 근거)
- 스킬: `~/.claude/skills/build-srs-prd-env/` (scaffold + validate 스크립트)
- 이 세션에서 잡은 결함 5건의 전말은 `session-summary.md` 표 참조
