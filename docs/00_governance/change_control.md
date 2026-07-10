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

## 6. 미해소 오픈 결정

| 결정 ID | 차단 대상 | baseline 차단 여부 | 담당 | 기한 |
| --- | --- | --- | --- | --- |
| OD-003 | FR 미부여 (F-CMP-010 필터/칩 컴포넌트군) | 아니오 | Product | REL-003 종료 |

OD-001·OD-002·OD-004는 2026-07-10 CR-005로 종결되었다. **Must 우선순위 FR을 차단하는 open OD가 0건이다.** `srs_final.md`의 `baseline` 승격은 사용자만 승인할 수 있다.
