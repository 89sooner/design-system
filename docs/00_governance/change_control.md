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
| 핸드오프 게이트 | — | pending | OD-001·OD-002·OD-004가 CR-005로 종결되어 Must FR을 차단하는 open OD가 0건이다. 남은 조건: 사용자가 `srs_final.md`를 `baseline`으로 승인하고 `validate --strict`가 통과해야 한다 |

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

## 6. 미해소 오픈 결정

| 결정 ID | 차단 대상 | baseline 차단 여부 | 담당 | 기한 |
| --- | --- | --- | --- | --- |
| OD-003 | FR 미부여 (F-CMP-010 필터/칩 컴포넌트군) | 아니오 | Product | REL-003 종료 |

OD-001·OD-002·OD-004는 2026-07-10 CR-005로 종결되었다. **Must 우선순위 FR을 차단하는 open OD가 0건이다.** `srs_final.md`의 `baseline` 승격은 사용자만 승인할 수 있다.
