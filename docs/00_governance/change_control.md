# 변경 관리 대장

## 1. 목적

이 문서는 Conductor Design System 문서 세트의 변경 요청(CR), 게이트 통과 기록, cascade 수행 기록을 남긴다. 기준선(`baseline`) 이후의 모든 범위·설계 변경은 여기서 시작한다. 이 문서는 기록 문서이며 범위 우선순위 사다리 밖에 있다.

## 2. 변경 절차

1. CR 등록(아래 표): 유형, 트리거, 영향 ID/문서를 적는다.
2. 영향 분석: 요구사항, 화면, API, 데이터, WP 중 어디까지 번지는지 확인한다.
3. cascade 갱신: `srs_final.md`부터 `docs/README.md`의 순서대로 갱신한다.
4. validator 실행 결과를 기록한다.
5. CR을 종료한다. 영향받은 WP는 원장에서 상태를 재설정한다.

## 3. 변경 요청(CR) 대장

| CR ID | 날짜 | 유형 | 트리거 | 요약 | 영향 ID | 영향 문서 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CR-001 | 2026-07-10 | correction | 초기 scaffold | 문서 세트 생성 | - | 전체 | closed |
| CR-002 | 2026-07-10 | scope | 사용자 결정 (제품 정의 인터뷰) | 제품을 "Conductor Design System"으로 확정. 산출물 = `@conductor/tokens` + `@conductor/css` + `@conductor/react` + 정적 문서 사이트. 다크 기준 + 라이트 테마. 스타일 엔진은 Vanilla CSS + CSS 커스텀 프로퍼티. CSS 변수 접두사 `--cdt-` | F-TOK-\*, F-THM-\*, F-CSS-\*, F-CMP-\*, F-DOC-\*, F-A11Y-\*, F-DX-\*, F-QA-\*, FR 48개, OD-001~004, ADR-002 | `feature.md`, `prd.md`, `glossary.md`, `srs_final.md`, `requirements_screen_traceability_matrix.md` | closed |
| CR-003 | 2026-07-10 | design | 소스 저장소 실측 분석 (`agent-ai-platform/packages/web`) | 화면 ID 체계를 `W-###`(문서 사이트)로 확정. `D-###`/`A-###`는 이 제품에 존재하지 않음. 컴포넌트 ID `C-001`~`C-072`, 플로우 `FLOW-001`~`FLOW-006`, API/ENT/JOB/EVT/ADR/REL ID 레지스트리 고정 | W-001~W-050, C-001~C-072, FLOW-001~006, API-PKG/TOK/THM/CMP/DOC, ENT-TOK/THM/CMP/DOC, JOB-BUILD/CI/REL, ADR-001~010, REL-001~004 | `20_derived_ui_specs/*`, `30_technical_architecture/*`, `40_delivery/*` | closed |
| CR-004 | 2026-07-10 | design | 아키텍처 문서군의 제품 형태 불일치 | Conductor에는 서버 런타임·DB·큐·인증이 없다. `backend_architecture.md`는 빌드 파이프라인, `api_contracts.md`는 패키지 공개 API, `data_model.md`는 토큰/메타데이터 스키마, `async_events_jobs.md`는 CI 잡과 릴리스 파이프라인으로 재해석한다 | JOB-BUILD-001~004, JOB-CI-001~004, JOB-REL-001, ENT-TOK-001~003, ENT-THM-001, ENT-CMP-001, ENT-DOC-001 | `prd.md` §9, `srs_final.md` §10·§11, `30_technical_architecture/*` | closed |
| CR-005 | 2026-07-10 | scope | OD-001·OD-002·OD-004 종결 (사용자 결정) | 소스 팔레트 실측 결과 WCAG 2.1 AA 미달 5건 확인. **OD-001 = 최소 수정**: `focusRing` alpha 0.30→0.80, 신규 `border.control`(slate alpha 0.60) 교정. `text.faint`·`border.*` → `decorative`, `status.queued`·`status.neutralEnd` → `nonText` 분류로 값 보존. 신규 요구사항 **FR-THM-005** 추가. **OD-002 = REL-004로 이월**: FR-QA-004 상태를 `deferred`로. **OD-004 = 패키지에 포함**: FR-CMP-009 유지, WP-023 실행 | FR-THM-005(신규), FR-THM-004, FR-A11Y-004, FR-A11Y-001, FR-QA-004, FR-CMP-009, WP-007, WP-023, WP-026, REL-001, REL-004, OD-001, OD-002, OD-004 | `srs_final.md`(§4.1·§4.2·§9.2·§12.1·§13·§14), `prd.md`(§12·§12.1), `requirements_screen_traceability_matrix.md`, `conductor_design_system_tokens.md`, `conductor_implementation_roadmap.md`, `conductor_work_packages.md` | closed |

| CR-006 | 2026-07-10 | correction | `conductor_design_system_tokens.md` §8.5가 `srs_final.md` §12.1의 내부 모순을 발견 (baseline 이후 최초 CR) | §12.1이 `status.neutralEnd`(`#475569`)에 `usage: nonText`(3:1 요구)를 부여하면서 값을 보존하도록 지시했으나, 실측 대비율은 표면 6종에서 2.04 ~ 2.60으로 3:1을 만족하지 못한다. 두 지시가 동시에 성립하지 않아 `pnpm check:contrast`가 다크 테마에서 종료 코드 1을 반환하고 M-3·FR-A11Y-004 AC-1이 충족되지 않는다. **해소안 A 채택(사용자 결정)**: 값 `#475569`를 보존하고 `usage`를 `decorative`로 낮춘다. 근거는 (1) FR-THM-005 AC-5가 아이콘·텍스트 병기를 이미 강제해 WCAG 1.4.1이 충족되고, (2) 소스의 `.timeline-marker`가 표면색 링(`app.css:585`)으로 도형 경계를 만들어 점의 식별이 채움 대비에 의존하지 않으며, (3) `border.subtle`·`border.default`·`border.strong`에 적용한 WCAG 1.4.11 예외와 동일한 논리이기 때문이다. `status.queued`(`#64748b`)는 3.25 ~ 3.56으로 통과하므로 `nonText`를 유지한다 | FR-THM-005 AC-5, FR-A11Y-004, `srs_final.md` §12.1, CP-025 | `srs_final.md`(§9.2 FR-THM-005, §12.1), `conductor_design_system_tokens.md`(§8.2·§8.4·§8.5·§8.6), `conductor_work_packages.md`(WP-007), `conductor_release_validation_plan.md`, `conductor_implementation_traceability.md` | closed |

| CR-007 | 2026-07-10 | correction | 소스 저장소 컴포넌트 인벤토리 재분석 결과, `feature.md`의 후보 풀에 누락된 시각 패턴 3건 발견 | `feature.md`는 `SRC-AAP` 실측을 근거로 삼는데, 다음 3건을 후보로 등록하지 않았다: (1) `StatCard`(IncidentDashboardPage)와 `Meta`(ArtifactPage)가 사실상 동일한 "라벨 위 값" 통계 타일을 각 페이지에서 중복 정의, (2) `CircularProgress`·`LinearProgress`·`Gauge`(UsageCostPage) 세 개의 독립 미터 구현이 같은 "비율 → 색상 막대/링" 개념을 재구현, (3) `MaskedPayloadViewer`의 코드 뷰어 셸(파일명 툴바 + 복사 버튼 + 스크롤 `<pre>`). **FR을 추가하지 않는다.** (1)은 후보 `F-CMP-011`로 보류 등록, (2)는 FR-CMP-008의 `Meter`·`ProgressRing`이 이미 통합 해소함을 명시, (3)은 C-032 `CodeBlock`이 셸을 담당하고 마스킹 하이라이팅은 도메인 결합이므로 `F-X-010`으로 명시 제외 | F-CMP-011(신규 후보, 보류), F-X-010(신규 제외), FR-CMP-008(근거 보강) | `feature.md`(§2.4, §3, §4) | closed |

| CR-008 | 2026-07-10 | implementation | `DEV-001` (WP-002 구현 착수 시 발견) | FR-TOK-002 AC-2("semantic은 primitive만 참조")가 토큰 설계의 semantic → semantic 참조 4건과 충돌한다. 그중 `surface.2` → `{surface.subtle}`와 `border` → `{border.default}`는 FR-THM-001 AC-2가 명시적으로 **요구**하는 별칭이므로, AC-2를 문자 그대로 구현하면 두 Must FR을 동시에 만족할 수 없다. **분류: 문서 오류.** FR-TOK-002의 설계 의도는 §2.1 제목이 밝히듯 참조 *방향*의 제약("역방향 참조가 하나라도 존재하면 실패")이지 동일 계층 별칭 금지가 아니다. **해소**: AC-2를 "primitive 또는 다른 semantic 토큰만 참조한다. component 토큰 참조는 빌드 오류다"로, AC-3을 "semantic 또는 다른 component 토큰만 참조한다. 상위 계층 참조는 빌드 오류다"로 정정한다. 불변식은 "토큰은 자기 계층 또는 하위 계층만 참조한다"로 통일된다. 동일 계층 내 순환은 FR-TOK-003 AC-3의 순환 검출이 잡는다. 값·범위 변경 없음 | DEV-001, FR-TOK-002 AC-2·AC-3·AC-6(신규), FR-THM-001 AC-2, ENT-TOK-001 | `srs_final.md`(§9.1 FR-TOK-002), `conductor_design_system_tokens.md`(§2.1, §2.3), `conductor_data_model.md`(ENT-TOK-001 불변식 2·3·4), `conductor_work_packages.md`(WP-002 DoD) | closed |

| CR-009 | 2026-07-10 | implementation | `DEV-002` (WP-003/WP-004 완료 후 발견) | 토큰 빌드가 `packages/tokens/src/tokens.ts`와 `src/breakpoints.ts`를 생성하는데, WP-001의 CI 순서가 `typecheck`를 `build`보다 먼저 실행한다. 생성 파일을 지우고 `pnpm typecheck`를 돌려 종료 코드 2와 `TS2307: Cannot find module './tokens'`를 재현했다. **분류: 기술 제약.** 생성된 타입 표면은 생성 전에 검사할 수 없다. **해소**: (1) CI 순서를 `install → lint → lint:deps → build → typecheck → test`로 바꾼다. (2) 생성 파일을 `.gitignore`에 추가해 소스 트리에서 배제한다 — 커밋된 생성물은 토큰 소스와 어긋날 수 있고 FR-TOK-001의 "토큰 소스가 유일한 입력"을 무력화한다. (3) 루트 `typecheck` 스크립트가 `build`를 전제한다는 사실을 `AGENTS.md`·`CLAUDE.md`의 명령 표에 명시한다. 범위·요구사항 변경 없음 | DEV-002, FR-TOK-006, FR-DX-001 AC-2, FR-TOK-001, WP-001 | `.github/workflows/ci.yml`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `conductor_work_packages.md`(WP-001 구현 범위), `conductor_infrastructure_operations.md` | closed |
| CR-010 | 2026-07-11 | implementation | `DEV-003` (WP-008 착수 시 발견) | WP-008의 검증 방법이 실행 불가능한 명령(`pnpm size`, WP-025 소유)과 무의미하게 통과하는 명령(`pnpm --filter @conductor/css test`, 스크립트 부재로 no-op exit 0)을 포함한다. WP-008 검증 방법을 `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test`로 정정하고, NFR-001의 `@conductor/css` gzip 20KB 예산은 `packages/css/test/bundle.test.ts`가 실제 gzip 측정으로 단언하도록 한다. `pnpm size`(Button 단독 4KB + css 20KB, JOB-CI-004)의 구현은 WP-025에 그대로 남는다. `packages/css`에 `"test": "vitest run --project css"`를 추가해 필터 실행이 실제로 테스트를 돌리게 한다. 요구사항(SRS)은 변경하지 않는다 | WP-008, WP-025, FR-DX-003 AC-3, NFR-001 | `conductor_work_packages.md`, `conductor_implementation_traceability.md`, `packages/css/package.json` | closed |
| CR-011 | 2026-07-11 | implementation | `DEV-004` (WP-008 검증 중 발견) | CR-009가 추가한 CI의 "토큰 빌드 재현성" 단계가 깨끗한 체크아웃에서도 항상 실패한다. `pnpm install`이 `bin` 항목을 0755로 chmod하기 때문에 `git status --porcelain`이 토큰 빌드와 무관하게 3줄을 출력한다. 해당 단계를 `git -c core.fileMode=false status --porcelain --untracked-files=all`로 정정한다. 파일 모드 비트만 무시하며, CR-009가 의도한 두 검사(재빌드가 추적 파일을 바꾸지 않는다 / gitignore를 빠져나간 미추적 파일이 없다)는 그대로 유지된다 | WP-001, CR-009, FR-TOK-001 | `.github/workflows/ci.yml`, `conductor_implementation_traceability.md` | closed |
| CR-012 | 2026-07-11 | implementation | `DEV-005` (WP-009 완료 검증 시 발견) | WP-009의 검증 방법이 `pnpm --filter @conductor/css test`만 실행한다. CSS 테스트는 기존 `dist/`를 읽으므로 소스를 변경한 뒤 빌드하지 않아도 과거 산출물을 검사할 수 있다. 검증 방법을 `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test`로 정정해 현재 소스에서 산출물을 만든 뒤 검사하도록 한다. 요구사항과 구현 범위는 변경하지 않는다 | DEV-005, WP-009, FR-CSS-003, FR-TOK-009 | `conductor_work_packages.md`, `conductor_implementation_traceability.md` | closed |
| CR-013 | 2026-07-11 | correction | `DEV-006` (WP-017 착수 시 발견) | 사용자 결정으로 C-062의 component token 네임스페이스를 `feedbackMeter.*`로 분리하고, 원본 진행 트랙을 semantic `surface.track`으로 추가했다. FR-TOK-005의 semantic `meter` 3개 그룹과 렌더링 슬롯이 분리되어 `TOK-GROUP-SIZE` 없이 빌드된다 | DEV-006, WP-017, C-062, FR-CMP-008, FR-TOK-005 | UI component/token specs, token source, CSS, React, delivery ledger | closed |
| CR-014 | 2026-07-12 | implementation | `DEV-007` (WP-026 standalone Chromium 검증) | `prefers-reduced-motion: reduce`가 true여도 Button의 계산된 transition이 0.14s인 결함을 확인했다. component transition alias가 토큰 빌드에서 리터럴로 완전 해석되고 `cdt.component`가 base의 직접 duration 규칙보다 우선했다. 컴포넌트 전환이 live `--cdt-motion-*`를 직접 읽도록 바꾸고, base 감소 모드 토큰 selector가 생성된 테마 selector보다 높은 명시도를 갖게 했다. 요구사항·토큰 값·공개 API 변경 없음 | DEV-007, FR-CSS-005 AC-1, WP-008, WP-026 | `packages/css/src/base.css`, `components.css`, CSS/Playwright 테스트, delivery ledger | closed |
| CR-015 | 2026-07-13 | implementation | `DEV-008` (WP-027 구현 검증) | 인프라 운영 문서 §6의 "버전 상승 PR 병합 → 릴리스 워크플로가 태그 생성 → 태그가 배포 잡 트리거" 순서는 GitHub Actions에서 성립하지 않는다. `GITHUB_TOKEN`이 push한 태그는 재귀 방지 정책으로 워크플로를 트리거하지 않는다. 수동 승인을 maintainer의 workflow_dispatch 또는 태그 push로 정의하고, 릴리스 태그 생성·push는 배포 잡이 게시 후 수행하도록 정정한다. 배포 명령도 `pnpm publish -r --provenance`에서 재실행이 안전한 `pnpm changeset publish`(+`NPM_CONFIG_PROVENANCE=true`)로 정정한다. 요구사항·토큰 값·공개 API 변경 없음 | DEV-008, WP-027, FR-DX-005, NFR-002, JOB-REL-001 | `conductor_infrastructure_operations.md`, `.github/workflows/release.yml`, delivery ledger | closed |
| CR-016 | 2026-07-13 | implementation | `DEV-009` (WP-028 구현) | 인프라 운영 문서 §8은 문서 사이트 배포를 "커밋 SHA 디렉터리 업로드 → 별칭(pointer) 전환 → 직전 5개 버전 보존"으로 규정한다. GitHub Pages는 배포 단위가 사이트 스냅샷 전체이며 버전 디렉터리와 별칭 전환 API를 제공하지 않는다. 대신 각 배포가 원자적 스냅샷 교체이므로 §8의 실제 불변식(방문자가 신·구 자산이 섞인 상태를 받지 않는다)은 그대로 성립한다. 롤백은 별칭 되돌리기 대신 "직전 정상 커밋 ref 재배포"로 정정한다. lockfile 고정 재빌드는 결정적이며 10분 예산(NFR-004) 안에 끝난다 | DEV-009, WP-028, FR-DOC-001, NFR-004, JOB-BUILD-004 | `conductor_infrastructure_operations.md`, `.github/workflows/deploy-docs.yml`, delivery ledger | closed |
| CR-017 | 2026-07-13 | implementation | `DEV-010` (WP-028 LCP 측정) | NFR-001의 문서 사이트 LCP 지표를 Lighthouse 기본 스로틀(lantern 시뮬레이션)로 재면 프리렌더된 첫 페인트를 모델링하지 못해 3,002ms로 나오고, 같은 스로틀 계수를 실제 브라우저에 적용해 관측하면 1,793ms다. 두 값이 예산 2.5초의 양쪽에 놓여 판정을 뒤집는다. SRS가 명시한 측정 조건은 "로컬 프로덕션 빌드, Fast 3G 스로틀"이므로, 시뮬레이션 예측이 아니라 DevTools Fast 3G 프리셋(RTT 150ms, 1.6Mbps, CPU 4x)을 실제로 적용해 관측한 값을 지표로 삼는다. 두 값을 모두 원장에 기록한다. 목표치·요구사항은 변경하지 않는다 | DEV-010, WP-028, NFR-001, FR-DOC-001 | `scripts/check-lighthouse.mjs`, delivery ledger | closed |
| CR-018 | 2026-07-15 | design | 사용자 요청 (컴포넌트 심미성·시인성·가독성 개선) + `DEV-011` | 공개 API와 Radix 접근성 책임은 유지하면서 컴포넌트의 시각 언어를 "차분한 깊이 + 명확한 정보 위계"로 정비한다. 검증된 단색 Primary 액션과 대비 교정값은 보존하고, Card·Overlay의 글래스/고도 표현, Button·Form의 상호작용 피드백, Table의 구조적 위계, Banner의 중립 표면 + 상태색 가장자리, Feedback의 트랙/레이블 판독성을 강화한다. 문서 카탈로그 예시는 실제 구성 계층이 보이도록 현실적인 콘텐츠로 교체하고, 다크·라이트 시각 기준선을 갱신한다. 시각 검수에서 발견한 `DEV-011`을 함께 해소한다: 명세에만 있고 소스에 빠진 additive `radius.pill` 토큰을 복구하고, `Select.Content`가 자식을 버리던 결함과 Button의 variant×tone 우선순위 오류를 수정한다. 요구사항·공개 React API의 삭제/변경 없음 | DEV-011, FR-CSS-004, FR-CMP-002~008, FR-THM-002, FR-THM-005, FR-QA-003, FR-QA-004, WP-005, WP-008, WP-012~017, WP-020, WP-024, WP-026 | `conductor_ui_component_spec.md`, `conductor_design_system_tokens.md`, token/CSS/React source, docs catalog, unit/CSS tests, visual baselines, delivery ledger | closed |
| CR-019 | 2026-07-15 | design | 사용자 요청 (만족도가 높은 UI 컴포넌트 조사 기반 재정제) + `DEV-012` | Radix Themes·Primer·Atlassian Design System·Spectrum·Carbon·shadcn/ui·W3C 문서와 채택 신호를 교차 조사해 "강조의 희소성, 명확한 포커스, 가시 라벨, 실제 구성 맥락"을 2차 정제 원칙으로 채택한다. 실제 Chromium에서 `:focus-visible`이 참이어도 `cdt.component`의 장식용 `box-shadow`가 `cdt.reset`의 포커스 링을 덮는 결함과 이를 놓치는 테스트를 확인했다. shadow를 가진 핵심 컨트롤이 포커스 시 전체 `focusRing` 계산값을 복원하도록 하고, Button 라벨을 14px로 높이며 Field 라벨 위계를 강화한다. 대화형 Card에 pressed 피드백을 추가하고, 문서 카탈로그의 대화형 Card 안에 live control을 중첩하던 구성을 정적 Panel + 명시적 링크로 바꾼다. 폼 예시는 가시 라벨·설명과 해결 지향 문구를 사용한다. 요구사항 범위와 공개 React API 변경 없음 | DEV-012, FR-CSS-002, FR-CSS-004, FR-CMP-002, FR-CMP-003, FR-CMP-007, FR-A11Y-001, FR-A11Y-003, FR-DOC-003, FR-QA-003, FR-QA-004, WP-005, WP-008, WP-012, WP-016, WP-020, WP-024, WP-026 | `conductor_ui_component_spec.md`, `conductor_design_system_tokens.md`, token/CSS source, docs catalog, CSS/a11y/E2E tests, visual baselines, delivery ledger | closed |
| CR-020 | 2026-07-15 | correction | 남은 문서 작업 감사 + `DEV-013` | 파생 화면 상태 매트릭스와 QA-193이 최상위 SRS에 없는 `tokens.json` 부재 런타임 폴백을 FR-DOC-002의 예외로 추가했다. FR-DOC-002는 토큰 산출물을 Foundations의 필수 빌드 입력으로 규정하고 예외는 용도 설명 누락만 정의한다. 정적 사이트는 토큰 JSON을 번들에 포함하므로 빌드 입력 부재는 화면 상태가 아니라 빌드 실패다. 범위를 발명한 상태 행을 제거하고 안정 ID인 QA-193은 폐기 표시한다. 요구사항·코드·공개 API 변경 없음 | DEV-013, FR-DOC-002, QA-193, W-010~W-014, W-030 | `conductor_screen_state_matrix.md`, `conductor_screen_qa_checklist.md`, delivery ledger | closed |
| CR-021 | 2026-07-15 | correction | 남은 QA 순차 실행 + `DEV-014` | 승인된 화면 QA를 실제 소스와 대조해 SCN-001 CSS 누락 경고, Getting Started 전체 흐름, Foundations 타이포·레이아웃·모션 실물 예시, React 없는 CSS 예시, 이상 흐름 테스트를 완성한다. 루트 전용 프리렌더 HTML을 딥링크에서도 hydration해 셸을 교체하던 결함은 루트만 hydrate하고 딥링크는 client mount하도록 경계를 분리한다. 12개 화면의 두 테마·세 폭 레이아웃과 두 테마 Tab/focus 경로를 브라우저에서 검증하고, WP·REL·QA 체크리스트의 과거 미동기화 상태를 실제 증거와 일치시킨다. 요구사항 범위와 공개 React API의 삭제/변경 없음 | DEV-014, SCN-001, FR-DOC-001~007, FR-DX-004, FR-CSS-003~005, FR-A11Y-001~005, FR-QA-001~004, QA-001~QA-200, WP-001~WP-028, REL-001~REL-004 | docs app/source/tests, 화면 QA, WP, 릴리스 계획, delivery ledger | closed |
| CR-022 | 2026-07-15 | implementation | 실제 릴리스 권한 감사 + `DEV-015`·`DEV-016` | npm의 현재 Trusted Publishing 요구사항을 실제 워크플로와 대조했다. release job의 Node 20은 최소 Node 22.14.0/npm 11.5.1을 충족하지 못하고, private GitHub 저장소에서는 public npm 패키지라도 provenance가 생성되지 않는다. 또한 미게시 패키지는 Trusted Publisher를 등록할 수 없어 `@conductor/*` 3종을 `bootstrap` dist-tag로 최초 1회 생성한 뒤 패키지별 신뢰 관계를 등록해야 한다. release job을 Node 22.14.0/npm 11.18.0으로 고정하고 private repository를 provenance preflight에서 차단한다. 최초 namespace bootstrap은 npm 2FA 대화형 인증으로만 수행하며 장기 토큰을 저장하지 않는다. 공개 전 secret scan이 현재 추적 파일만 검사하던 편차도 작업 트리 전체와 Git 이력 검사로 해소한다. 요구사항·공개 API 변경 없음 | DEV-015, DEV-016, WP-027, FR-DX-005, NFR-002, NFR-004, JOB-REL-001 | release workflow, secret scanner, infrastructure/security/ADR, release plan, delivery ledger | closed |
| CR-023 | 2026-07-17 | scope | 사용자 결정 (공개 npm organization 확정) | 제3자가 소유한 `@conductor` 대신 사용자가 생성한 npm organization `conductor-by-89soone`을 공개 배포 namespace로 확정한다. 세 패키지와 모든 소비자 import·의존성·Changesets·릴리스 태그 계약을 `@conductor-by-89soone/*`로 일괄 전환한다. 첫 공개 릴리스 전 변경이므로 기존 게시 소비자 마이그레이션은 없으며, 제품명 Conductor와 CSS 계약 `--cdt-*`·`cdt-*`는 변경하지 않는다. 저장소는 MIT로 배포하고 패키지별 설치·사용 README를 포함한다 | SCN-001, FR-DX-001~005, FR-DOC-001~007, API-PKG-001~003, JOB-BUILD-001~004, JOB-CI-001~004, JOB-REL-001, WP-001~028, REL-001~004 | SRS, PRD, glossary, traceability, derived UI, architecture, delivery, agent briefs, repository source/config/workflows | closed |
| CR-024 | 2026-07-17 | implementation | CR-023 릴리스 게이트 + `DEV-017` | 라이트 테마의 열린 Dialog에서 axe `color-contrast` serious 위반 1건을 재현했다. 명세는 `Dialog.Close`의 `cdt-dialog__close` 클래스를 요구하지만 구현은 Radix 원시 버튼을 그대로 노출해 브라우저 기본 ButtonFace/텍스트 색을 사용했다. `asChild` 소비자 스타일은 보존하고 원시 `Dialog.Close`·`Drawer.Close`에만 기존 Conductor secondary compact Button 클래스를 기본 적용한다. Radix의 닫기 동작·포커스 복귀·role 책임과 공개 props 타입은 변경하지 않는다 | DEV-017, FR-CMP-006, FR-A11Y-004, FR-QA-003, C-040, C-041, WP-015, WP-024, WP-026 | overlay source/unit/a11y tests, component spec, delivery ledger | closed |

유형: `scope`(범위 변경), `design`(설계 변경), `implementation`(구현 편차 DEV-### 처리), `correction`(문서 오류 수정)

## 4. 게이트 통과 기록

| 게이트 | 날짜 | 결과 | 근거 |
| --- | --- | --- | --- |
| Intake 게이트 | 2026-07-10 | pass | 제품명·slug·대상 사용자·목표·제외 범위·제약·OD-001~004·초기 용어집 확정. 사용자 인터뷰 4문항 응답으로 이름/산출물/테마/스타일 엔진 결정 |
| SRS 게이트 | 2026-07-10 | pass | FR 49개 전부 전체 블록(EARS·AC·검증 방법·관련 ID·예외 처리). `validate_srs_prd_env.py` vague-term 경고 0건, 중복 ID 0건. In/Conditional/Out of Scope 모두 비어 있지 않음. NFR-001~005 정량화 완료. 상태를 `review`로 승격 |
| 추적성 게이트 | 2026-07-10 | pass | 승인 FR 49개 전부가 매트릭스에 등장. UI 직접 노출이 없는 FR은 `SFC-PKG`/`SFC-CLI`/`SFC-CI`/`SFC-REL` 비-UI 표면 지정. 매트릭스의 화면 ID W-001~W-050이 IA에 선언됨 |
| 파생 UI 게이트 | 2026-07-10 | pass | IA가 화면 ID 12개를 선언한 뒤 wireframe/flow/state/component/tokens/QA가 이를 참조. 상태 매트릭스가 이 제품에 존재하지 않는 상태(no_permission, auth_expired)를 사유와 함께 `해당 없음`으로 처리. 토큰 문서가 시맨틱 값만 사용 |
| 아키텍처 게이트 | 2026-07-10 | pass | 고위험 FR(FR-THM-004, FR-A11Y-004, FR-DX-003)이 빌드 파이프라인·CI 잡·패키지 계약에 매핑. 스택 결정 ADR-001~010 기록. 안정화된 API(API-PKG-001~003, API-TOK-001~003)에 구체적 JSON/TS 예시 포함 |
| 딜리버리 게이트 | 2026-07-10 | pass | REL-001~004 전부가 WP로 분해됨. 각 WP가 FR을 참조하고 체크 가능한 DoD와 검증 명령을 보유. 의존 순환 0건 |
| 핸드오프 게이트 | 2026-07-10 | pass | 사용자가 `srs_final.md`의 `baseline` 승격을 승인했다(v1.0). OD-001·OD-002·OD-004가 CR-005로 종결되어 Must FR을 차단하는 open OD가 0건이다. `validate_srs_prd_env.py --root . --strict`가 오류·경고 0건으로 통과한다. 브리프와 작업 패키지 상태가 SRS baseline과 정합적이다. WP-001은 브리프와 그것이 지목하는 문서만으로 실행 가능하다 |

### baseline 승격 기록

| 문서 | 이전 상태 | 승격 후 | 승인자 | 날짜 |
| --- | --- | --- | --- | --- |
| `docs/10_requirements/srs_final.md` | review (v0.2) | **baseline (v1.0)** | 사용자 | 2026-07-10 |

baseline 이후 `srs_final.md`를 변경하려면 이 문서에 CR을 먼저 등록해야 한다.

## 5. Cascade 기록

CR별로 실제 갱신한 문서 체크리스트를 남긴다.

### CR-001 cascade

- [x] 초기 생성이므로 해당 없음

### CR-002 cascade

- [x] `docs/10_requirements/feature.md` — 기능 후보 44개 + 제외 후보 9개 등록
- [x] `docs/10_requirements/prd.md` — 목표 G-1~G-5, 비목표 NG-1~NG-6, 성공 지표 M-1~M-7, 리스크 R-1~R-7, OD-001~004
- [x] `docs/10_requirements/glossary.md` — 토큰/테마/스타일·컴포넌트/배포·문서 4개 도메인 용어 + 네이밍 규칙 8조
- [x] `docs/10_requirements/srs_final.md` — FR 48개(CR-005의 FR-THM-005 추가로 최종 49개), NFR-001~005, 시나리오 SCN-001~004
- [x] `docs/10_requirements/requirements_screen_traceability_matrix.md` — 정/역 매트릭스
- [x] validator: 구조·추적성 오류 0건, vague-term 경고 0건

### CR-003 cascade

- [x] `docs/20_derived_ui_specs/conductor_product_ia.md`
- [x] `docs/20_derived_ui_specs/conductor_wireframe_spec.md`
- [x] `docs/20_derived_ui_specs/conductor_screen_flow_spec.md`
- [x] `docs/20_derived_ui_specs/conductor_screen_state_matrix.md`
- [x] `docs/20_derived_ui_specs/conductor_ui_component_spec.md`
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md`
- [x] `docs/20_derived_ui_specs/conductor_screen_qa_checklist.md`

### CR-004 cascade

- [x] `docs/30_technical_architecture/conductor_system_architecture.md`
- [x] `docs/30_technical_architecture/conductor_frontend_architecture.md`
- [x] `docs/30_technical_architecture/conductor_backend_architecture.md` (빌드 파이프라인으로 재해석)
- [x] `docs/30_technical_architecture/conductor_api_contracts.md` (패키지 공개 API로 재해석)
- [x] `docs/30_technical_architecture/conductor_data_model.md` (토큰 스키마로 재해석)
- [x] `docs/30_technical_architecture/conductor_async_events_jobs.md` (CI 잡으로 재해석)
- [x] `docs/30_technical_architecture/conductor_security_privacy_architecture.md` (공급망 보안으로 재해석)
- [x] `docs/30_technical_architecture/conductor_infrastructure_operations.md`
- [x] `docs/30_technical_architecture/conductor_observability_reliability.md`
- [x] `docs/30_technical_architecture/conductor_architecture_decision_records.md` (ADR-001~010)
- [x] `docs/40_delivery/*` — REL-001~004, WP 분해, 릴리스 검증 계획, 추적 원장

### CR-005 cascade

- [x] `docs/10_requirements/srs_final.md` — §4.1 In Scope(FR-THM-005 포함), §4.2 Conditional Scope 축소, §9.2 FR-THM-005 신규 블록 + FR-THM-004 예외 처리 갱신, §9.4 FR-CMP-009 상태, §9.8 FR-QA-004 `deferred`, §12.1 대비 검사 정책과 교정 표 신설, §13 우선순위, §14 OD 대장 종결 + §14.1/§14.2
- [x] `docs/10_requirements/prd.md` — §12 OD 대장 종결, §12.1 OD-001이 드러낸 사실
- [x] `docs/10_requirements/requirements_screen_traceability_matrix.md` — FR-THM-005 행 추가, §5.1 NFR → 표면 매트릭스 신설
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md` — `focusRing` 교정, `border.control` 신규, `usage` 분류 확정, 대비 검사 쌍 명세 갱신
- [x] `docs/40_delivery/conductor_implementation_roadmap.md` — REL-001 exit criteria, 의존성 지도, 알려진 제약
- [x] `docs/40_delivery/conductor_work_packages.md` — WP-007 차단 해제 + DoD 확장, WP-023 차단 해제, WP-026 이월 확정
- [x] validator: 구조·추적성 오류 0건

### CR-006 cascade

`srs_final.md`가 `baseline`인 상태에서 수행한 최초의 변경이다. CR을 먼저 등록한 뒤 편집했다.

- [x] `docs/10_requirements/srs_final.md` — §9.2 FR-THM-005 AC-5 분리(`status.queued` = `nonText`, `status.neutralEnd` = `decorative`), §12.1 용도 분류 표 갱신. 버전 v1.0 → v1.1, 상태는 `baseline` 유지
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md` — §8.2 CP-025 제거, §8.4 제외 목록에 `status.neutralEnd` 추가, §8.5 해소 기록, §8.6 요약 갱신
- [x] `docs/40_delivery/conductor_work_packages.md` — WP-007 DoD의 `usage` 분류 항목 갱신
- [x] `docs/40_delivery/conductor_release_validation_plan.md` — REL-001 게이트 항목 갱신
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — 알려진 제약에 다크 종료 상태 점의 시인성 항목 추가
- [x] validator: 구조·추적성 오류 0건, `--strict` 통과

### CR-008 cascade

`baseline` SRS에 대한 두 번째 변경이며, **구현 착수 시점에 발견된 최초의 편차(DEV-001)** 처리다.

- [x] `docs/10_requirements/srs_final.md` — §9.1 FR-TOK-002의 요구사항 문장과 AC-2·AC-3 정정, AC-6 신설, 예외 처리에 동일 계층 별칭 근거 추가. 버전 v1.1 → v1.2, 상태는 `baseline` 유지
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md` — §2.1 계층 표와 규칙 문장 정정 + CR-008 주석, §2.3 참조 목록을 4개 → 5개로 확장하고 각 참조의 방향을 명시
- [x] `docs/30_technical_architecture/conductor_data_model.md` — ENT-TOK-001 불변식 2·3 정정, 불변식 4를 단일 문장으로 통합. 이전 판의 "semantic → semantic 별칭을 component로 재분류한다" 규칙이 `elevation.overlay` / `overlay.shadow`에서 자기모순을 일으킨다는 사실을 기록
- [x] `docs/40_delivery/conductor_work_packages.md` — WP-002 DoD에 동일 계층 별칭 4개의 통과 확인 항목 추가
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-001 등록 및 종결
- [x] validator: 구조·추적성 오류 0건, `--strict` 통과

**발견 경위.** WP-002 구현 착수 시 코딩 에이전트가 계층 검사기를 작성하며 FR-TOK-002 AC-2를 문자 그대로 구현하려다 FR-THM-001 AC-2가 요구하는 별칭 2개를 만들 수 없음을 발견했다. `conductor_data_model.md`의 재분류 회피안이 `elevation.overlay` / `overlay.shadow` 쌍에서 무너진다는 사실도 같은 과정에서 드러났다. 문서만으로는 잡히지 않고 구현이 시작되어야 드러나는 종류의 결함이다.

### CR-009 cascade

`baseline` 이후 두 번째 편차 처리이자, 요구사항이 아니라 **빌드 인프라**를 고친 최초의 CR이다.

- [x] `.github/workflows/ci.yml` — 단계 순서를 `install → lint → lint:deps → build → typecheck → test`로 변경. 생성된 타입 표면은 생성 전에 검사할 수 없다는 사실을 주석으로 기록. 토큰 빌드가 gitignore되지 않은 파일을 남기지 않는지 확인하는 단계 추가
- [x] `.gitignore` — `packages/tokens/src/tokens.ts`, `packages/tokens/src/breakpoints.ts` 추가. 커밋된 생성물은 두 번째 진실 공급원이 되어 FR-TOK-001을 무력화한다
- [x] `AGENTS.md`, `CLAUDE.md` — 명령 표에 "`typecheck`는 `build` 이후에 실행한다" 명시. 생성 파일을 직접 편집하지 말라는 경고 추가
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-002 등록 및 종결, FR-DX-001 행 갱신
- [x] 재현 검증: 생성 파일과 전체 `dist/`를 삭제한 상태에서 새 순서의 5개 단계가 전부 exit 0 (빌드 6.5초, 테스트 200/200)
- [x] validator: 구조·추적성 오류 0건, `--strict` 통과

**버려진 첫 번째 해소안.** 처음에는 "생성물 최신성" CI 검사로 `git diff --exit-code -- packages/tokens/dist`를 넣었다. `dist/`가 `.gitignore`에 있으므로 이 검사는 **어떤 경우에도 실패할 수 없다.** 통과가 보장된 검사는 없는 것보다 나쁘다 — 안전하다는 신호를 거짓으로 준다. 실제로 확인할 수 있는 것(재빌드가 gitignore되지 않은 파일을 남기지 않는다)으로 교체했다.

### CR-010 cascade

`baseline` 이후 세 번째 편차 처리다. 요구사항이 아니라 **작업 패키지의 검증 명령**을 고쳤다. `srs_final.md`는 손대지 않았다.

- [x] `docs/40_delivery/conductor_work_packages.md` — WP-008 검증 방법에서 `pnpm size`를 제거하고 `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test`로 정정. gzip 20KB 게이트의 수행 주체를 DoD 항목에 명시. WP-025는 손대지 않았다(`pnpm size`의 구현 범위는 계속 WP-025가 소유한다)
- [x] `packages/css/package.json` — `"test": "vitest run --project css"` 추가. 이 스크립트가 없어서 `pnpm --filter @conductor/css test`가 아무것도 실행하지 않고 exit 0을 반환했다
- [x] `packages/css/test/bundle.test.ts` — `zlib.gzipSync(level 9)`로 `dist/index.css`를 실제 압축해 20,480바이트 이하를 단언. 예산을 넘기면 실패한다
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-003 등록 및 종결, WP-008 행과 FR-CSS-001·FR-CSS-002·FR-CSS-005·FR-DX-003·FR-DX-001 행 갱신
- [x] validator: 구조·추적성 오류 0건, `--strict` 통과

**왜 `pnpm size`를 지금 만들지 않았는가.** `pnpm size`의 구현 범위(Button 단독 import gzip 측정, 초과 모듈 목록 출력)는 WP-025가 명시적으로 소유하고, WP-025의 선행 WP는 WP-017이다. WP-008에서 css 전용 축소판을 만들면 브리프 7절 3항("구현 범위 안에서만 작성한다")을 어기고 WP-025를 반쯤 구현한 상태로 남긴다. 대신 같은 예산(NFR-001, 20KB)을 패키지 테스트가 강제한다. WP-025는 이 예산을 CI 게이트(JOB-CI-004)로 승격시키면 된다.

**DEV-003 (2)가 중요한 이유.** `pnpm --filter @conductor/css test`는 스크립트가 없어도 **실패하지 않는다.** pnpm은 없는 lifecycle 스크립트를 조용히 no-op 처리하고 종료 코드 0을 준다. WP-008을 그대로 실행했다면 "테스트 통과"라는 거짓 신호를 얻었을 것이다. CR-009에서 지운 `git diff --exit-code -- packages/tokens/dist`와 정확히 같은 결함이다: **통과가 보장된 검사는 없는 것보다 나쁘다.**

### CR-011 cascade

WP-008을 검증하던 중 발견한, WP-008과 무관한 CI 결함이다. 요구사항은 손대지 않았다.

- [x] `.github/workflows/ci.yml` — 재현성 검사를 `git -c core.fileMode=false status --porcelain --untracked-files=all`로 정정하고, 이유를 주석으로 남겼다
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-004 등록 및 종결
- [x] 재현 검증: `chmod 644 packages/tokens/bin/*.mjs` 후 트리가 깨끗함을 확인 → `pnpm install --frozen-lockfile` 실행 → `git status --porcelain packages/tokens/bin/`이 ` M` 3줄 출력(재현). `-c core.fileMode=false`를 붙이면 0줄
- [x] validator: 구조·추적성 오류 0건, `--strict` 통과

**왜 모드 비트를 커밋하지 않았는가.** `bin` 파일을 0755로 커밋하면 이번 증상은 사라지지만, `pnpm install`이 앞으로 추가될 모든 `bin` 항목에 같은 일을 한다. 검사가 파일 모드에 의존하지 않게 만드는 편이 근본적이다. CR-009의 원래 의도("재빌드가 gitignore되지 않은 파일을 남기지 않는다")는 모드 비트와 아무 상관이 없다.

**CR-009의 교훈이 다시 확인됐다.** CR-009는 *절대 실패할 수 없는 검사*를 지웠다. 그 자리에 들어온 검사는 반대 방향으로 고장나 있었다 — **절대 통과할 수 없는 검사**였다. 두 결함의 뿌리는 같다: 검사를 작성한 뒤 그것이 통과하는 것도 실패하는 것도 관찰하지 않았다.

### CR-012 cascade

WP-009 완료 검증에서 발견한 작업 패키지 검증 명령의 문서 오류다. 요구사항과 구현 범위는 손대지 않았다.

- [x] `docs/40_delivery/conductor_work_packages.md` — WP-009 검증 방법을 `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test`로 정정하고 DoD를 실제 검증 결과로 닫음
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-005 등록 및 종결, WP-009·FR-CSS-003·FR-TOK-009 매핑 갱신
- [x] validator: 구조·추적성 오류 0건, `--strict` 통과

**왜 빌드가 필요한가.** `packages/css/test/bundle.test.ts`는 `dist/index.css`와 `dist/component.css`를 읽는다. 테스트 명령 자체는 이 산출물을 만들지 않으므로, 빌드 없는 검증은 변경 전 산출물을 검사할 수 있다. CR-010이 테스트 스크립트의 no-op을 제거했다면 CR-012는 테스트 입력의 stale 가능성을 제거한다.

### CR-013 cascade

- [x] `docs/20_derived_ui_specs/conductor_ui_component_spec.md` — C-062 component CSS variable을 `feedbackMeter.*` 산출 이름으로 정정
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md` — `feedbackMeter.*`와 semantic `surface.track`의 역할·값을 기록
- [x] `docs/20_derived_ui_specs/conductor_screen_qa_checklist.md` — C-060~064 공통 계약 QA를 완료 처리
- [x] `docs/40_delivery/conductor_work_packages.md` / `conductor_implementation_traceability.md` — WP-017, FR-CMP-008, DEV-006을 완료 처리
- [x] `packages/tokens/src/palette.dark.ts` / `palette.light.ts` / `components.ts` — `surface.track`과 `feedbackMeter.*` 구현
- [x] `packages/css/src/base.css` / `components.css`, `packages/react/src/feedback.tsx` — feedback primitives 및 reduced-motion 규칙 구현
- [x] 검증: build/typecheck/test 467개/CSS 72개/lint:tokens/check:contrast 통과

### CR-014 cascade

- [x] `packages/css/src/base.css` — 감소 모드 토큰 재정의가 생성된 테마 selector보다 높은 명시도를 갖도록 수정
- [x] `packages/css/src/components.css` — component transition 리터럴 alias 대신 live `--cdt-motion-*`를 소비
- [x] `packages/css/test/bundle.test.ts`, `apps/docs/visual/visual.spec.ts` — 산출물 연결과 standalone Chromium 계산값 검증
- [x] `docs/40_delivery/conductor_work_packages.md`, `conductor_implementation_traceability.md` — WP-026, FR-CSS-005, DEV-007 근거 갱신
- [x] SRS/PRD/화면/API/토큰 값/공개 API 영향 없음
- [x] 검증: CSS 78/78, 시각 회귀 3회 각 25/25, 음성 픽스처 36% diff·exit 1

### CR-015 cascade

- [x] `docs/30_technical_architecture/conductor_infrastructure_operations.md` §6 — 수동 승인 정의, 태그 생성 주체, 배포 명령 정정 (v0.3)
- [x] `.github/workflows/release.yml` — 자격증명 없는 version PR 잡과 OIDC publish 잡 분리, `changeset publish` + provenance
- [x] `docs/40_delivery/conductor_work_packages.md`, `conductor_implementation_traceability.md` — WP-027, FR-DX-005, FR-DX-002, DEV-008 갱신
- [x] SRS/PRD/화면/토큰 값/공개 API 영향 없음
- [x] 검증: check:api·check:changesets·check:secrets 음성 픽스처 각 exit 1, `changeset version` 실험(react만 0.1.0), 3패키지 dry-run 배포 성공, audit high 0건

### CR-016 cascade

- [x] `docs/30_technical_architecture/conductor_infrastructure_operations.md` §8 — 배포 단위를 원자적 스냅샷 교체로, 롤백을 커밋 ref 재배포로 정정 (v0.4)
- [x] `.github/workflows/deploy-docs.yml` — `ref` 입력으로 임의 커밋 배포·롤백, Pages 원자적 스냅샷 교체
- [x] `docs/40_delivery/conductor_work_packages.md`, `conductor_implementation_traceability.md` — WP-028, FR-DOC-001, DEV-009 갱신
- [x] SRS/PRD/화면/토큰/공개 API 영향 없음

### CR-017 cascade

- [x] `scripts/check-lighthouse.mjs` — DevTools Fast 3G 스로틀 실측, 5회 p75, 예산 초과 시 exit 1
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — NFR-001 측정 방법과 두 측정값(1,793ms 관측 / 3,002ms 시뮬레이션) 기록
- [x] 목표치(2.5초)와 요구사항 문구는 변경하지 않음
- [x] 검증: 프리렌더 격리 A/B 6회 교차 실행 — 프리렌더 1,793ms vs 클라이언트 전용 3,580ms(동일 번들, 마크업만 제거), 1바이트 예산 음성 픽스처 exit 1

### CR-018 cascade

- [x] `docs/20_derived_ui_specs/conductor_ui_component_spec.md` — 차분한 깊이·정보 위계 원칙, Button variant×tone, Card 재질, Menu/Select 하이라이트, Banner 표현 계약 갱신(v0.3)
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md` — `radius.pill` 복구 근거와 Banner component 토큰 참조 갱신(v0.5)
- [x] `packages/tokens/src/scales.ts`, `components.ts` — additive `radius.pill`, 중립 Banner 표면/본문 토큰 구현
- [x] `packages/css/src/components.css` — Button·Card·Table·Timeline·Overlay·Form·Banner·Feedback 시각 정제, Radix 상태 셀렉터 유지
- [x] `packages/react/src/form.tsx` — `Select.Content` 자식을 `RadixSelect.Viewport`에 전달(DEV-011)
- [x] `apps/docs/src/catalog.tsx`, `docs.css` — 실제 정보 위계가 드러나는 30개 라이브 예시와 접근 가능한 Dialog/폼 맥락 갱신
- [x] 단위/CSS/API — Vitest 488/488, CSS 78/78, typecheck·lint·lint:tokens·check:api·check:changesets 통과
- [x] 접근성/브라우저 — axe/keyboard 134 passed + 1 skipped, 문서 E2E 16/16, 시각 회귀 25/25(diff 0), 기준 이미지 24장 갱신
- [x] 대비/예산 — 다크·라이트 80/80, Button 527B/4KB, CSS 8.11KiB/20KiB
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-011 종결과 교차 WP 검증 근거 기록(v0.5)
- [x] validator: 구조·추적성 오류 0건, `--report`·`--strict` 통과

### CR-019 cascade

- [x] `docs/20_derived_ui_specs/conductor_ui_component_spec.md` — 강조 희소성·즉시 포커스·가시 라벨·카탈로그 합성 규칙 추가(v0.4)
- [x] `docs/20_derived_ui_specs/conductor_design_system_tokens.md` — `button.fontSize`를 14px로, `input.label.text`를 `text.secondary`로 정제(v0.6)
- [x] `packages/tokens/src/components.ts`, `packages/css/src/components.css` — 라벨 위계, Card pressed 상태, shadow-bearing control의 즉시 `focusRing` 복원 구현
- [x] `apps/docs/src/catalog.tsx`, `docs.css` — 정적 Panel + 명시적 제목 링크, compact Button, 가시 Field 라벨·설명, 행동 문구 예제 구현
- [x] CSS/React/브라우저 — CSS 78/78, React 142/142, 전체 Vitest 488/488, axe/keyboard 134 passed + 1 skipped, 문서 E2E 16/16
- [x] 시각/대비/예산 — 고정 Chromium 25/25(diff 0), 다크·라이트 80/80, Button 527B/4KB, CSS 8.15KiB/20KiB
- [x] 정적 게이트 — build·typecheck·lint·lint:deps·lint:tokens(42파일, 위반 0)·check:api(3리포트, `any` 0)·check:changesets·check:secrets 통과
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-012 종결과 교차 WP 검증 근거 기록(v0.6)
- [x] validator: 구조·추적성 오류 0건, `--report`·`--strict` 통과

### CR-020 cascade

- [x] `docs/10_requirements/srs_final.md` — FR-DOC-002의 승인 범위와 예외를 재확인했으며 변경 없음
- [x] `docs/20_derived_ui_specs/conductor_screen_state_matrix.md` — SRS에 없는 `토큰 빌드 산출물 누락` 화면 상태 제거(v0.3)
- [x] `docs/20_derived_ui_specs/conductor_screen_qa_checklist.md` — QA-193 ID를 보존한 채 `deprecated` 처리(v0.3)
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-013 문서 편차 종결 기록(v0.7)
- [x] validator: 최종 문서 동기화 후 `--report`·`--strict` 실행

### CR-021 cascade

- [x] `packages/react/src/stylesheet-warning.ts`, `cx.ts` — 개발 빌드에서 `@conductor/css` 누락을 1회 경고하고 단위 테스트로 고정
- [x] `apps/docs/src/App.tsx`, `foundation-page.tsx`, `catalog.tsx`, `guides.tsx`, `docs.css` — Getting Started·Foundation 실물 예시·framework-agnostic CSS·대비 리포트 예외 화면 완성
- [x] `apps/docs/src/main.tsx` — 루트 프리렌더 hydration과 딥링크 client mount 경계를 분리하고 경로 전환 시 스크롤을 복원
- [x] `apps/docs/e2e/*`, `apps/docs/visual/visual.spec.ts` — 화면 12개×테마 2×폭 3, 화면별 Tab/focus, hydration, 이상 흐름, 그레이스케일 전수 검증 추가
- [x] `docs/20_derived_ui_specs/conductor_screen_qa_checklist.md` — QA-001~QA-200을 실제 브라우저·단위·계약 증거와 동기화(v0.4)
- [x] `docs/40_delivery/conductor_work_packages.md`, `conductor_release_validation_plan.md` — WP-001~028의 완료 상태를 원장과 일치시키고 실게시·OIDC·롤백 3항목만 미완료로 보존
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-014 및 최종 게이트 결과 기록(v0.8)
- [x] 전체 로컬 게이트와 validator `--report`·`--strict` 통과 — Vitest 489/489, E2E 37/37, axe/hydration 164 passed + 1 skipped, 시각 회귀 27/27, LCP p75 1,917ms

### CR-022 cascade

- [x] `docs/10_requirements/srs_final.md` — NFR-002의 OIDC·장기 토큰 금지와 FR-DX-005의 정식 릴리스 요구사항을 재확인했으며 변경 없음
- [x] `.github/workflows/release.yml` — publish job을 Node 22.14.0/npm 11.18.0으로 고정하고 private source repository의 provenance 누락을 preflight로 차단
- [x] `scripts/scan-secrets.mjs` — 추적·미추적 작업 트리 247개 파일과 전체 Git 이력을 검사하고 합성 PAT 음성 픽스처 exit 1 확인
- [x] `docs/30_technical_architecture/conductor_infrastructure_operations.md`, `conductor_security_privacy_architecture.md`, `conductor_architecture_decision_records.md` — 최초 namespace bootstrap과 현재 npm OIDC/provenance 제약 기록
- [x] `docs/40_delivery/conductor_release_validation_plan.md`, `conductor_implementation_traceability.md` — 사용자 권한 경계·DEV-015·외부 잔여 게이트 기록(v0.9)
- [x] 세 패키지 `bootstrap` publish dry-run, workspace 의존성 `0.0.0` 치환, release YAML parse/Prettier, lint·secret positive/negative·validator `--report`·`--strict` 통과

### CR-023 cascade

- [x] `docs/10_requirements/srs_final.md` — 공개 패키지 3종을 `@conductor-by-89soone/*`로 전환(v1.3), 사용자 승인에 따라 `baseline` 상태 유지
- [x] PRD·feature·glossary·요구사항 추적성 → 파생 UI → 기술 아키텍처 → delivery → AI agent brief 순서로 설치/import/패키지/릴리스 태그 계약을 cascade
- [x] workspace manifests·lockfile·TypeScript 경로·Vitest·소스 import·테스트·Changesets·CI/release workflow·API reports·롤백 스크립트를 새 namespace로 전환
- [x] 루트와 세 패키지에 동일한 MIT `LICENSE`를 포함하고, 패키지별 설치·사용·요구 런타임 README와 npm description/homepage/license 메타데이터 추가
- [x] 활성 저장소에서 과거 변경 기록과 handoff/session archive를 제외한 기존 `@conductor/` 참조 0건. 제품명 Conductor와 `--cdt-*`·`cdt-*` 계약은 보존
- [x] 세 실제 tarball에 README/LICENSE가 포함되고 CSS/React의 `workspace:*`가 `0.0.0`으로 치환됨을 검사. tokens → css → react `bootstrap` publish dry-run 통과
- [x] build·typecheck·lint·lint:tokens(45파일)·test(490개)·contrast(80쌍)·API(3리포트, `any` 0)·changesets·secrets(254파일+Git 이력)·size·E2E(37개)·visual(27개)·Lighthouse(LCP p75 1,952ms, CLS 0) 통과
- [x] validator `--report`·`--strict`: 구조·추적성 오류 0건, FR 49개·매트릭스/아키텍처/WP 매핑 각 100%

### CR-024 cascade

- [x] `packages/react/src/overlay.tsx` — 원시 Dialog/Drawer Close에 marker + secondary compact Button 클래스를 적용하고 `asChild` variant/size를 보존
- [x] `packages/react/src/testing/overlay.test.tsx` — 기본 Close 클래스, `asChild` Primary 보존, Drawer marker 계약을 단위 테스트로 고정(React 144/144)
- [x] `docs/20_derived_ui_specs/conductor_ui_component_spec.md` — C-040/C-041 Close 기본 스타일과 `asChild` 예외를 명시
- [x] `docs/40_delivery/conductor_implementation_traceability.md` — DEV-017 원인·해소·검증 증거 기록
- [x] Chromium 전체 접근성 게이트 164 passed + 음성 fixture 1 skipped, 두 테마 Dialog 개별 시각 기준선과 전체 visual 27/27 통과
- [x] Radix 원본 `DialogCloseProps`를 직접 사용해 공개 API 리포트 드리프트 0건 유지

## 6. 미해소 오픈 결정

| 결정 ID | 차단 대상 | baseline 차단 여부 | 담당 | 기한 |
| --- | --- | --- | --- | --- |
| OD-003 | FR 미부여 (F-CMP-010 필터/칩 컴포넌트군) | 아니오 | Product | REL-003 종료 |

OD-001·OD-002·OD-004는 2026-07-10 CR-005로 종결되었다. **Must 우선순위 FR을 차단하는 open OD가 0건이다.** `srs_final.md`의 `baseline` 승격은 사용자만 승인할 수 있다.
