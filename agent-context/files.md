# 중요 파일과 역할

## 최우선 — 다음 에이전트가 먼저 읽을 것

| 경로 | 역할 |
| --- | --- |
| `docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md` | **여기서 시작한다.** 읽기 순서, 확정된 스택, 명령, WP별 실행 루프, 금지된 지름길, 제출 형식 |
| `docs/40_delivery/conductor_work_packages.md` | WP-001 ~ WP-028. 각 WP의 목표·관련 ID·선행·구현 범위·제외·DoD·검증 명령 |
| `docs/40_delivery/conductor_implementation_traceability.md` | **살아있는 원장.** WP 상태, FR→코드 매핑, 편차(DEV) 로그, 알려진 제약. WP 완료마다 갱신 |
| `docs/10_requirements/srs_final.md` | **baseline v1.2.** 최고 우선순위 진실. §12.1이 대비 정책 확정표 |
| `docs/00_governance/change_control.md` | CR 대장, 게이트 로그, cascade 기록. baseline 변경은 여기서 시작 |

## 문서 세트 (`docs/`, 39개 `.md`)

```
docs/README.md                        마스터 인덱스, 우선순위, cascade 순서, 검증 명령
docs/00_governance/    (4)  document_definitions / implementation_workflow / change_control
docs/10_requirements/  (7)  feature / prd / workflow / glossary / srs_final / traceability_matrix
docs/20_derived_ui_specs/ (10) product_ia / wireframe / screen_flow / screen_state_matrix /
                               ui_component_spec / design_system_tokens / screen_qa_checklist /
                               ai_agent_implementation_request / ai_agent_execution_brief
docs/30_technical_architecture/ (11) system / frontend / backend(=빌드 파이프라인) /
                               api_contracts(=패키지 공개 API) / data_model(=토큰 스키마) /
                               async_events_jobs(=CI 잡) / security(=공급망) /
                               infrastructure_operations / observability_reliability / ADR
docs/40_delivery/      (5)  implementation_roadmap / release_validation_plan /
                            work_packages / implementation_traceability
```

### 자주 참조하게 될 문서

| 경로 | 왜 |
| --- | --- |
| `docs/20_derived_ui_specs/conductor_design_system_tokens.md` | **1000줄 넘음.** §4 primitive 팔레트, §5 semantic 토큰 표(다크·라이트 값), §6 라이트 파생 규칙, §7 component 토큰, §8 대비 검사 쌍. **라이트 팔레트 값이 여기 이미 있다** — WP-010에서 새로 만들지 말고 옮겨라 |
| `docs/20_derived_ui_specs/conductor_ui_component_spec.md` | C-001 ~ C-072 컴포넌트 카탈로그. props 표, 접근성 책임 분담, 소스 CSS 인용 |
| `docs/30_technical_architecture/conductor_api_contracts.md` | `package.json` `exports` JSON 예시, CLI 계약, 컴포넌트 props TS 인터페이스 |
| `docs/20_derived_ui_specs/conductor_screen_qa_checklist.md` | QA-001 ~ QA-211. WP DoD가 인용한다 |
| `docs/30_technical_architecture/conductor_architecture_decision_records.md` | ADR-001~010. 구현 에이전트는 이 결정을 재결정하지 않는다 |

## 코드

### 루트

| 경로 | 역할 |
| --- | --- |
| `package.json` | 워크스페이스 루트. 스크립트: `build`, `test`, `typecheck`, `lint`, `lint:deps`, `lint:tokens`, `check:contrast` |
| `scripts/check-deps.mjs` | **의존 방향 가드.** 허용 에지만 통과(`css→tokens`, `react→css`, `react→tokens`, `docs→*`). 역방향·순환이면 `DEP_DIRECTION` / `DEP_CYCLE` + exit 1 |
| `.github/workflows/ci.yml` | `install → lint → lint:deps → build → typecheck → test → lint:tokens → check:contrast`. **`typecheck`가 `build` 뒤에 오는 이유는 CR-009** |
| `.gitignore` | `packages/tokens/src/tokens.ts`, `src/breakpoints.ts`는 **생성 파일**이라 무시된다 |
| `AGENTS.md` / `CLAUDE.md` | 확정 결정 표, 명령 표, 코드 태깅 규약, 편차 프로토콜 |

### `packages/tokens/` — REL-001 산출물 (유일하게 구현된 패키지)

**토큰 소스 (사람이 편집)**

| 파일 | 역할 |
| --- | --- |
| `src/schema.ts` | `TokenDefinition`(key/tier/value|alias/usage/description/icon/themeSpecific), 계층 랭크 |
| `src/primitives.ts` | 원시 ramp: `ink.*`, `indigo.*`, `slate.*`, 상태 계열, 폰트 스택, 이징. **CSS 산출 안 됨, export 안 됨** |
| `src/palette.dark.ts` | 다크 semantic 팔레트 (기준 테마). `focusRing` alpha 0.80, `border.control` 신규 |
| `src/scales.ts` | `font.size`(7), `font.lineHeight`(7), `space`(8), `radius`(5), `z`(6), `breakpoint`(3), `motion`(3) |
| `src/components.ts` | component 토큰 115개: `button.*`, `card.*`, `badge.*`, `table.*`, `input.*`, `overlay.*`, `page.*` |
| `src/contrast-pairs.ts` | 대비 검사 쌍 40개 (CP-001 ~ CP-041, **CP-025 결번** — CR-006) |
| `src/token-source.ts` | 위 소스를 하나로 모으는 진입점 |

**빌드 파이프라인 (`src/build/`)**

| 파일 | 역할 |
| --- | --- |
| `reference.ts` | `{key}` 참조 해석, 깊이 ≤10, 순환 검출(`TOK-CYCLE`), 미존재 키(`TOK-UNKNOWN-REF`) |
| `tiers.ts` | 계층 방향 검사. **자기 계층 또는 하위만 허용**(CR-008). 위반 시 `TOK-TIER` |
| `names.ts` | 점 표기 → `--cdt-` kebab 변환, 접두사 검사, 이름 충돌 검출 |
| `emit-css.ts` / `emit-ts.ts` / `emit-json.ts` | `tokens.css` / `tokens.{js,d.ts}` / `tokens.json` 산출 |
| `media.ts` | `@media` 조건의 브레이크포인트를 **리터럴 px로 치환** (CSS 변수는 미디어쿼리에서 평가 안 됨). `var()` 형태와 `{breakpoint.sm}` 별칭 형태 둘 다 처리 |
| `write.ts` | **원자적 쓰기.** 전체 해석 성공 전엔 기존 산출물을 덮어쓰지 않는다 |
| `errors.ts` | `TokenBuildError`. `error[CODE]: msg` + 상세 + hint + exit 1 형식 |

**검사 도구**

| 파일 | 역할 |
| --- | --- |
| `src/contrast/color.ts` | WCAG 2.1 상대 휘도, alpha 합성, 대비율 |
| `src/contrast/check.ts` | 쌍별 검사, 임계값(body 4.5 / large 3 / nonText 3), `decorative` 제외 |
| `src/contrast/report.ts` | `dist/contrast-report.json` 생성 (W-030이 소비 예정) |
| `src/lint/rules.ts` | 색·px·ms·z-index·font-size 리터럴 검출 + **`text.faint` on `surface.elevated` 금지**(FR-THM-005 AC-3) |
| `src/lint/source.ts` | `/* cdt-allow-literal: <사유> */` 허용 주석 처리 |
| `src/theme-contract.ts` | 테마 간 semantic·component 키 대칭 차집합 검사(FR-QA-001) |

**생성 파일 — 직접 편집 금지**

- `src/tokens.ts`, `src/breakpoints.ts` (gitignore됨)
- `dist/tokens.{css,js,d.ts,json}`, `dist/breakpoints.{js,d.ts}`, `dist/contrast-report.json`
- `dist/cli.js`, `dist/contrast-cli.js`, `dist/lint-cli.js`

**공개 표면**

```json
exports: [".", "./tokens.css", "./tokens.json", "./contrast-report.json", "./breakpoints", "./package.json"]
bin:     ["conductor-build-tokens", "conductor-check-contrast", "conductor-lint-tokens"]
sideEffects: ["*.css"]
```

### `packages/css/`, `packages/react/`, `apps/docs/`

WP-001의 최소 골격만 존재한다. `package.json` + `tsconfig.json` + 자리표시 진입점 + 스모크 테스트. **실제 구현은 WP-008 이후.**

## 참고 — 소스 저장소 (읽기 전용)

| 경로 | 역할 |
| --- | --- |
| `/home/roqkf/agent-ai-platform/packages/web/src/styles/tokens.css` | 94줄. 다크 팔레트의 **유일한 근거**. 별도 디자인 산출물(Figma) 없음 |
| `/home/roqkf/agent-ai-platform/packages/web/src/styles/app.css` | 1324줄. 레이아웃·컴포넌트 클래스·브레이크포인트·모션의 근거 |
| `.../src/components/{badges,forms,meters,states}.tsx` | 추출 대상 프리미티브 |
| `.../src/components/StepTimeline.tsx`, `pages/StepDrawer.tsx` | 도메인 결합. **이식하지 않는다**(F-X-009) |
