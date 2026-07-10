# 문서 인덱스

## 1. 목적

이 문서는 Conductor Design System의 SRS/PRD 기반 제품 계획 문서 전체를 안내하는 최상위 인덱스다. 목표는 요구사항, UX/UI, 시스템 아키텍처, 빌드 파이프라인, 패키지 공개 API, 토큰 스키마, CI, 공급망 보안, 운영, 릴리스 검증, 작업 패키지, 구현 추적을 하나의 추적 가능한 문서 체계로 묶는 것이다.

## 1.1 이 제품의 형태

Conductor는 실행되는 서버 애플리케이션이 아니다. 배포 산출물은 **npm 패키지 3종과 정적 문서 사이트**다. 백엔드 런타임·데이터베이스·큐·인증 서버가 존재하지 않는다. 따라서 `30_technical_architecture`의 네 문서는 CR-004에 따라 재해석되었다.

| 문서 | 원래 의미 | 이 제품에서의 의미 |
| --- | --- | --- |
| `conductor_backend_architecture.md` | 서버 모듈/서비스 | 빌드 파이프라인 |
| `conductor_api_contracts.md` | HTTP/RPC 계약 | 패키지 공개 API (`exports`, CLI, TS 시그니처, 컴포넌트 props) |
| `conductor_data_model.md` | 데이터베이스 스키마 | 토큰·메타데이터 스키마 |
| `conductor_async_events_jobs.md` | 큐/워커 | CI 잡과 릴리스 파이프라인 |
| `conductor_security_privacy_architecture.md` | 런타임 인증/인가 | 공급망 보안 |

화면 ID는 문서 사이트를 뜻하는 `W-###`만 사용한다. `D-###`(주 앱)와 `A-###`(관리 콘솔)는 이 제품에 존재하지 않는다.

코드 레이아웃(WP-001부터 생성):

```text
packages/tokens/   # @conductor/tokens
packages/css/      # @conductor/css
packages/react/    # @conductor/react
apps/docs/         # 정적 문서 사이트 (Conductor의 첫 소비자)
docs/              # 이 계획 문서 세트 (코드 아님)
```

패키지 의존 방향은 `tokens → css → react → docs` 단방향이며, 역방향 참조는 빌드 오류다(FR-DX-001 AC-1).

## 2. 전체 구조

```text
docs/
  README.md
  00_governance/
    document_definitions.md
    implementation_workflow.md
    change_control.md
  10_requirements/
    feature.md
    prd.md
    workflow.md
    glossary.md
    srs_final.md
    requirements_screen_traceability_matrix.md
  20_derived_ui_specs/
    conductor_product_ia.md
    conductor_wireframe_spec.md
    conductor_screen_flow_spec.md
    conductor_screen_state_matrix.md
    conductor_ui_component_spec.md
    conductor_design_system_tokens.md
    conductor_screen_qa_checklist.md
    conductor_ai_agent_implementation_request.md
    conductor_ai_agent_execution_brief.md
  30_technical_architecture/
    conductor_system_architecture.md
    conductor_frontend_architecture.md
    conductor_backend_architecture.md
    conductor_api_contracts.md
    conductor_data_model.md
    conductor_async_events_jobs.md
    conductor_security_privacy_architecture.md
    conductor_infrastructure_operations.md
    conductor_observability_reliability.md
    conductor_architecture_decision_records.md
  40_delivery/
    conductor_implementation_roadmap.md
    conductor_release_validation_plan.md
    conductor_work_packages.md
    conductor_implementation_traceability.md
```

## 3. 문서군

### 3.1 `00_governance`

문서 체계, 우선순위, 충돌 해결, 갱신 규칙, 구현 워크플로, 변경 관리(CR)를 정의한다.

### 3.2 `10_requirements`

제품 범위, 기능/비기능 요구사항, 용어, 제약, 우선순위, 최종 확정 요구사항을 정의한다.

### 3.3 `20_derived_ui_specs`

승인된 요구사항을 화면 구현 관점으로 번역한다. 이 문서군은 제품 범위를 새로 결정할 수 없다.

### 3.4 `30_technical_architecture`

승인된 요구사항과 UI 명세를 실제 구현 가능한 시스템 구조로 번역한다. 프론트엔드, 백엔드, API, 데이터, 비동기 처리, 보안, 인프라, 관측성 기준을 정의한다.

### 3.5 `40_delivery`

구현 순서(REL), 릴리스 검증, 작업 패키지(WP), 구현 추적 원장을 정의한다. 제품 범위를 새로 결정하지 않는다.

## 4. 문서 우선순위

1. `docs/10_requirements/srs_final.md`
2. `docs/10_requirements/prd.md`
3. `docs/10_requirements/workflow.md`
4. `docs/10_requirements/feature.md`
5. `docs/10_requirements/glossary.md`
6. `docs/10_requirements/requirements_screen_traceability_matrix.md`
7. `docs/20_derived_ui_specs/conductor_product_ia.md`
8. 나머지 파생 UI 문서
9. `docs/30_technical_architecture/*`
10. `docs/40_delivery/*`
11. AI Agent 실행 문서

거버넌스 문서(`00_governance`)는 우선순위 비교 대상이 아니라 위 문서 전체에 적용되는 규칙이다.

## 5. 권장 읽기 순서

1. `docs/00_governance/document_definitions.md`
2. `docs/00_governance/implementation_workflow.md`
3. `docs/10_requirements/srs_final.md`
4. `docs/10_requirements/requirements_screen_traceability_matrix.md`
5. `docs/10_requirements/prd.md`
6. `docs/10_requirements/glossary.md`
7. `docs/20_derived_ui_specs/conductor_product_ia.md`
8. `docs/20_derived_ui_specs/conductor_wireframe_spec.md`
9. 나머지 파생 UI 문서
10. `docs/30_technical_architecture/conductor_system_architecture.md` 이후 아키텍처 문서
11. `docs/40_delivery/conductor_implementation_roadmap.md`
12. `docs/40_delivery/conductor_work_packages.md`
13. `docs/40_delivery/conductor_implementation_traceability.md`

## 6. 요구사항 변경 시 갱신 순서

1. `00_governance/change_control.md`에 CR 등록
2. `srs_final.md`
3. `prd.md`
4. `glossary.md` (용어 영향 시)
5. `requirements_screen_traceability_matrix.md`
6. `conductor_product_ia.md`
7. `conductor_wireframe_spec.md`
8. `conductor_screen_flow_spec.md`
9. `conductor_screen_state_matrix.md`
10. `conductor_ui_component_spec.md`
11. `conductor_design_system_tokens.md`
12. `conductor_screen_qa_checklist.md`
13. `30_technical_architecture/*` (system -> FE -> BE -> API -> data -> async -> security -> infra -> observability -> ADR)
14. `conductor_implementation_roadmap.md`
15. `conductor_release_validation_plan.md`
16. `conductor_work_packages.md`
17. `conductor_implementation_traceability.md` (영향 WP 상태 재설정)
18. `conductor_ai_agent_implementation_request.md`
19. `conductor_ai_agent_execution_brief.md`
20. CR에 cascade 기록 후 종료

화면만 바뀌는 변경은 해당 화면이 이미 요구사항 ID로 정당화되는지 확인한 뒤 6번부터 진행한다. 구현 방식만 바뀌는 변경은 요구사항/화면 영향이 없음을 확인한 뒤 13번부터 진행한다.

## 7. 검증

```bash
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report   # 단계·커버리지·다음 작업
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict   # 핸드오프 게이트
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report --code-root .   # 문서↔코드 태그 커버리지
```

문서 작성자 주의: 검증기는 백틱으로 감싼 `.md`로 끝나는 문자열을 문서 경로로 읽는다. **radius.md**, **font.size.md**, **breakpoint.md** 같은 토큰 이름은 백틱 대신 볼드로 쓴다.

## 8. 종결된 오픈 결정 (2026-07-10, CR-005)

| 결정 | 내용 | 결과 |
| --- | --- | --- |
| OD-001 | 대비 검사 정책 = **최소 수정** | `focusRing` alpha 0.30 → 0.80, 신규 `border.control`. 나머지는 `usage`로 분류하고 값 보존. `srs_final.md` §12.1이 확정 표. FR-THM-005 신설 |
| OD-002 | 시각 회귀 = **REL-004 이월** | FR-QA-004 상태 `deferred`. v1 릴리스 게이트 아님 |
| OD-004 | 셸 컴포넌트군 = **패키지 포함** | C-070 ~ C-072이 `@conductor/react`에 포함. WP-023 실행 |

미해소: OD-003(필터/칩 컴포넌트군). FR이 부여되지 않아 baseline을 막지 않는다.
