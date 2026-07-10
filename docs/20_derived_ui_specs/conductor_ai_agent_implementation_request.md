# Conductor Design System 구현 요청서 for AI Agent

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 목적과 이 문서의 지위

이 문서는 코딩 에이전트에게 Conductor Design System 구현을 요청하는 지시서다. 설계 원본이 아니다. 상위 문서가 승인한 범위를 실행 가능한 작업으로 포장할 뿐이며, 여기서 새로운 범위를 만들지 않는다.

Conductor는 `agent-ai-platform/packages/web`의 시각 언어를 npm 패키지 3종과 정적 문서 사이트 1종으로 추출한다. 저장소는 pnpm workspace 모노레포다.

| 산출물 | 워크스페이스 경로 | 성격 |
| --- | --- | --- |
| `@conductor/tokens` | `packages/tokens` | 3계층 디자인 토큰 소스와 빌더 |
| `@conductor/css` | `packages/css` | 프레임워크 비종속 스타일시트 |
| `@conductor/react` | `packages/react` | React 프리미티브 컴포넌트 |
| 문서 사이트 | `apps/docs` | 정적 사이트. Conductor의 첫 번째 소비자 |

패키지 의존 방향은 `tokens → css → react → docs` 단방향이며 역방향 참조는 빌드 오류다. 서버 런타임, 데이터베이스, 인증 서버, 메시지 큐는 이 제품에 존재하지 않는다. 배포되는 것은 npm 패키지와 정적 파일이다.

## 2. 필수 입력 문서와 읽는 순서

아래 순서로 읽는다. 앞 문서가 뒤 문서를 이긴다.

### 2.1 요구사항 계층

1. `../10_requirements/srs_final.md` — 최종 요구사항. FR 정의, 수용 기준, 12.1절 대비 검사 정책, 14.1절 종결된 결정
2. `../10_requirements/requirements_screen_traceability_matrix.md` — FR과 화면의 연결
3. `../10_requirements/glossary.md` — 용어 정의
4. `../10_requirements/prd.md` — 제품 목표와 비목표

### 2.2 UI 스펙 계층

5. `conductor_product_ia.md` — 화면 ID(W-001 ~ W-050)와 정보 구조
6. `conductor_wireframe_spec.md` — 화면별 구조
7. `conductor_screen_flow_spec.md` — 화면 간 이동
8. `conductor_screen_state_matrix.md` — 화면 상태와 예외
9. `conductor_ui_component_spec.md` — 컴포넌트 ID(C-001 ~ C-072)와 props 계약
10. `conductor_design_system_tokens.md` — 다크 시맨틱 표와 라이트 파생 규칙
11. `conductor_screen_qa_checklist.md` — 화면 QA 항목

### 2.3 아키텍처 계층

12. `../30_technical_architecture/conductor_architecture_decision_records.md` — ADR-001 ~ ADR-010 스택 확정
13. `../30_technical_architecture/conductor_system_architecture.md`
14. `../30_technical_architecture/conductor_frontend_architecture.md`
15. `../30_technical_architecture/conductor_api_contracts.md` — `buildTokens`, `checkContrast` CLI 계약과 패키지 진입점 계약
16. `../30_technical_architecture/conductor_data_model.md` — `TokenDefinition` 스키마와 이름 매핑 표
17. `../30_technical_architecture/conductor_async_events_jobs.md` — JOB-BUILD-001~004, JOB-CI-001~004, JOB-REL-001
18. `../30_technical_architecture/conductor_security_privacy_architecture.md`
19. `../30_technical_architecture/conductor_infrastructure_operations.md` — 빌드 파이프라인, 릴리스, 롤백
20. `../30_technical_architecture/conductor_observability_reliability.md`

`../30_technical_architecture/conductor_backend_architecture.md`는 이 제품에 서버가 없다는 사실과 그 귀결을 기록한다. 구현 대상이 아니다.

### 2.4 딜리버리 계층

21. `../40_delivery/conductor_implementation_roadmap.md` — REL-001 ~ REL-004
22. `../40_delivery/conductor_release_validation_plan.md` — 릴리스 게이트
23. `../40_delivery/conductor_work_packages.md` — **WP-001 ~ WP-028. 실제 작업 단위**
24. `../40_delivery/conductor_implementation_traceability.md` — **WP 완료 시 갱신하는 추적 원장**

### 2.5 거버넌스

25. `../00_governance/implementation_workflow.md` — Phase와 게이트
26. `../00_governance/change_control.md` — CR 절차
27. `../00_governance/document_definitions.md` — 문서별 역할

## 3. 문서 권위 순서

1. **`srs_final.md`가 최상위다.** FR과 수용 기준의 최종 판정 근거다.
2. ADR은 스택 결정의 최종 판정 근거다. ADR은 FR을 근거로 인용하며 FR을 바꾸지 않는다.
3. 작업 패키지 문서는 FR을 세션 단위로 분해한 것이다. WP는 범위를 새로 만들 수 없다.
4. UI 스펙, 아키텍처 문서, 딜리버리 문서, 이 구현 요청서, 실행 브리프는 전부 파생 문서다. **파생 문서와 브리프는 SRS를 이길 수 없다.**
5. 추적 원장은 기록 문서다. 범위를 결정하지 않는다.

파생 문서가 SRS와 어긋나면 SRS를 따르고, 그 어긋남을 9절의 편차 프로토콜로 등록한다.

## 4. 범위 단계

각 단계의 목표는 한 문장으로 고정한다. 단계를 건너뛰지 않는다.

| 단계 | 목표 | 포함 WP |
| --- | --- | --- |
| REL-001 | 토큰 소스가 3계층으로 정의되고 빌더가 CSS·TypeScript·JSON 산출물과 대비 리포트를 만든다 | WP-001 ~ WP-007 |
| REL-002 | 두 테마와 스타일 레이어 위에서 8개 컴포넌트군이 공통 계약을 만족하며 렌더된다 | WP-008 ~ WP-017 |
| REL-003 | 문서 사이트가 Conductor를 소비자로서 설치해 전 화면을 렌더하고 접근성·번들 크기 게이트가 병합을 차단한다 | WP-018 ~ WP-025 |
| REL-004 | 시각 회귀 검사, npm 배포 워크플로, 문서 사이트 정적 배포가 성립한다 | WP-026 ~ WP-028 |

## 5. 기대 산출물과 진입점

| 산출물 | 진입점 | 산출 규칙 |
| --- | --- | --- |
| `@conductor/tokens` | `.`(라이브러리), `./tokens.json`, 실행 파일 `buildTokens`·`checkContrast` | semantic·component 토큰만 export한다. primitive 토큰은 공개 진입점에 나타나지 않는다(FR-TOK-002 AC-5) |
| `@conductor/css` | `.`(전체), `./component.css`(리셋 제외) | `sideEffects: ["*.css"]`를 선언한다(FR-DX-003 AC-2) |
| `@conductor/react` | `.` | `sideEffects: false`를 선언한다. `Button` 단독 import gzip 4KB 이하(React 제외, FR-DX-003 AC-3) |
| 문서 사이트 | 정적 파일 산출물 | 서버 런타임 없이 동작하고 실행 시 외부 도메인 네트워크 요청이 0건이다(FR-DOC-001 AC-3, AC-4) |

각 패키지의 `package.json`은 `exports`와 `types`를 선언한다. 선언되지 않은 내부 경로 import는 해석 오류가 되어야 한다(FR-DX-003 AC-1).

## 6. 구현 원칙

### 6.1 토큰이 값의 단일 출처다

모든 색상, 간격, 반경, 모션, 글자 크기, 겹침 순서, 반응형 기준점 값은 `packages/tokens/src/` 아래에서만 정의된다. `packages/css`와 `packages/react`에 색상 리터럴(`#rrggbb`, `rgb()`, `hsl()`)과 리터럴 px/ms가 0건이어야 한다(FR-TOK-001). 예외가 필요하면 파일 상단에 `/* cdt-allow-literal: <사유> */` 주석을 남긴다. 브레이크포인트만 예외다. CSS 커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않으므로 빌드 시 리터럴로 치환한다(FR-TOK-009 AC-2).

### 6.2 3계층 참조 방향은 단방향이다

primitive ← semantic ← component. primitive 토큰은 다른 토큰을 참조하지 않고, semantic은 primitive만, component는 semantic만 참조한다. 역방향 참조가 존재하면 빌드가 종료 코드 1로 실패하고 위반 토큰 키 쌍을 출력한다(FR-TOK-002 AC-4).

빌더의 실행 순서는 파싱 → 계층 검증 → 참조 해석 → 순환 검출 → 이름 충돌 검출 → 전체 성공 후 파일 기록이다. 부분 산출물을 남기지 않는다(ADR-003, FR-TOK-003 예외 처리).

### 6.3 도메인 로직이 없다

Conductor는 시각 계층만 소유한다. `Table`은 정렬·페이지네이션·가상 스크롤을 제공하지 않는다(FR-CMP-005 예외 처리). 폼 상태 관리와 유효성 검사 로직을 제공하지 않는다(FR-CMP-007 예외 처리). 토스트·스낵바와 알림 큐 관리를 제공하지 않는다(FR-CMP-008 예외 처리). 라우팅 라이브러리에 의존하지 않는다. `NavList`는 링크 렌더를 `renderLink` props로 위임한다(FR-CMP-009 AC-1, AC-2).

### 6.4 접근성 동작은 Radix에 위임한다

포커스 트랩, 롤 관리, 키보드 내비게이션을 Conductor가 자체 구현한 건수가 0건이어야 한다(FR-CMP-006 AC-5). Radix가 제공하는 role/aria 속성을 덮어쓴 건수도 0건이다(FR-A11Y-005 AC-4). props 스프레드 순서를 `{...userProps} {...radixProps}`로 두어 사용자 props가 Radix의 role/aria를 이길 수 없게 한다. `className`과 `style`만 명시적으로 병합한다(ADR-004).

Radix에 의존하는 컴포넌트는 7개다: C-040 Dialog, C-041 Drawer, C-042 Tooltip, C-043 DropdownMenu, C-053 Select, C-054 Switch, C-055 Checkbox. Radix에 Drawer 프리미티브가 없으므로 `Drawer`는 `@radix-ui/react-dialog` 위의 측면 고정 콘텐츠 변형으로 구현한다. 나머지 컴포넌트는 Radix에 의존하지 않는다. `Field`(C-050)는 네이티브 `label[for]`로 연결한다.

### 6.5 상태는 소비자가 소유한다

컴포넌트는 제어 상태를 props로 받는다. 문자열은 props로 받는다(다국어 문자열 시스템 없음). 아이콘은 `lucide-react` peer dependency에서 소비자가 주입하거나 컴포넌트가 이름으로 import한다. Conductor는 아이콘을 번들하지 않는다(SRS 10절).

모듈 최상위 실행 경로에서 `window`, `document`, `localStorage`에 접근하지 않는다(FR-DX-004). 테마 결정처럼 첫 페인트 전 브라우저 정보가 필요한 경우, 패키지가 전역에 접근하는 대신 소비자가 인라인 스니펫을 삽입한다(FR-THM-003 예외 처리).

## 7. 금지된 지름길

아래는 전부 구현 실패로 판정한다.

1. **빈 라우트.** 화면 ID가 선언되었는데 라우트가 빈 컴포넌트를 렌더한다.
2. **장식용 목업.** 실제 컴포넌트를 마운트하지 않고 스크린샷 이미지나 정적 HTML로 프리뷰를 대체한다(FR-DOC-003 AC-1).
3. **본문이 비어 있는 컴포넌트.** 공개 진입점에 export되었으나 구현 대신 주석만 남아 있거나 테스트 파일이 없다(FR-QA-002 AC-1).
4. **처리되지 않은 상태.** `conductor_screen_state_matrix.md`가 정의한 상태·예외·복구 흐름 중 하나라도 렌더 경로가 없다.
5. **조용한 범위 변경.** 문서와 어긋나는 코드를 DEV 등록 없이 병합한다.
6. **`!important` 사용.** 산출물의 `!important` 출현 횟수는 0건이다(FR-CSS-001 AC-2).
7. **색상 리터럴 하드코딩.** `packages/css`와 `packages/react`에 `#rrggbb`, `rgb()`, `hsl()`을 직접 쓴다(FR-TOK-001 AC-1).
8. **자체 포커스 트랩 구현.** 포커스 트랩, 롤 관리, 키보드 내비게이션을 직접 작성한다(FR-CMP-006 AC-5).
9. **구조 셀렉터 사용.** CSS에서 `>`, `+`, `:nth-child`로 자식 구조에 의존한다. Radix가 소유하는 DOM에는 `data-*` 속성 셀렉터만 쓴다(FR-CSS-004 AC-4).
10. **primitive 토큰 직접 참조.** 컴포넌트 CSS나 TS가 primitive 토큰을 읽는다. component 토큰은 semantic 토큰만 참조한다(FR-TOK-002 AC-3).
11. **문서 사이트에서 소스 상대경로 import.** `apps/docs`가 `packages/*/src/**`를 상대경로로 읽는다. 문서 사이트는 `workspace:*`로 설치한 소비자다(FR-DOC-001 AC-1).
12. **도메인 컴포넌트 이식.** `.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`를 옮긴다. 이들은 도메인 결합이며 명시적으로 제외되어 있다(SRS 4.3, F-X-009).

추가로 금지되는 것: 원격 폰트 참조(`@import url()`, `src: url(http...)`), 배포 산출물의 런타임 외부 네트워크 요청, 텍스트를 숨기는 `iconOnly` 배지 모드, `z.popover`를 넘는 자체 z-index 리터럴.

## 8. 품질 게이트

WP의 DoD가 지목하는 명령을 실행하고 종료 코드를 확인한다. 아래 명령이 전부 종료 코드 0을 반환하지 않으면 그 WP는 완료가 아니다.

| 명령 | 검증 대상 | 관련 요구사항 |
| --- | --- | --- |
| `pnpm build` | `tokens → css → react → docs` 위상 순서 빌드. 4코어 3분 이내 | FR-DX-001 |
| `pnpm test` | 단위 테스트, 토큰 계약 테스트, 공유 계약 스위트 | FR-QA-001, FR-QA-002 |
| `pnpm typecheck` | 공개 `.d.ts`의 `any` 0건, 내부 타입 누출 0건 | FR-DX-002 |
| `pnpm lint:tokens` | 색상 리터럴, 리터럴 px/ms, `z-index` 숫자, `font-size` px 검출. 위반 시 파일 경로와 라인 번호 출력 | FR-TOK-001, FR-TOK-007, FR-TOK-008 |
| `pnpm check:contrast` | 두 테마 전경/배경 쌍의 WCAG 2.1 대비율. 미달 시 쌍 이름·테마·측정값·기준값 출력 | FR-THM-004, FR-THM-005, FR-A11Y-004 |
| `pnpm test:a11y` | axe-core serious 이상 위반 0건. 컴포넌트 주요 상태 × 테마 2종 | FR-QA-003, FR-A11Y-005 |
| `pnpm size` | `Button` 단독 import gzip 4KB 이하(React 제외), `@conductor/css` 전체 gzip 20KB 이하 | FR-DX-003, NFR-001 |

보조 게이트: `pnpm check:deps`(의존 간선 검사, FR-DX-001 AC-1), `pnpm audit --audit-level high`(취약점 0건, NFR-002), `pnpm changeset status`(변경 이력 누락 검출, FR-DX-005), `pnpm test:visual`(REL-004에서만 활성. FR-QA-004는 `deferred`).

## 9. 코드 추적성 규약

세 지점에서 코드와 요구사항을 잇는다. 세 지점 전부를 채운다.

**커밋과 PR 본문**

```text
Refs: WP-004 FR-TOK-006 FR-DX-002
```

한 WP가 여러 FR을 구현하면 공백으로 나열한다.

**테스트 이름**

```text
FR-CMP-002 AC-2: loading 상태에서 클릭 핸들러가 호출되지 않는다
```

각 테스트 이름 또는 인접 주석이 검증하는 FR과 AC를 `FR-<AREA>-### AC-#: <설명>` 형식으로 포함한다(FR-QA-002 AC-2).

**모듈 파일 상단 FR 범위 주석**

```ts
// FR 범위: FR-CMP-002
```

```css
/* FR 범위: FR-CSS-004 */
```

**추적 원장 갱신.** WP를 완료하면 `../40_delivery/conductor_implementation_traceability.md`에서 다음을 갱신한다.

- §2 WP 상태 표: 상태를 `done`으로, 이름·REL·커밋/PR·검증 결과·갱신일 열을 채운다
- §3 요구사항 매핑 표: 그 WP가 구현한 FR의 상태를 `구현됨` 또는 `검증됨`으로 바꾸고 구현 모듈·테스트 파일·WP 열을 채운다
- §5 알려진 제약: 해소된 항목을 제거하고 새로 발견한 제약을 추가한다

`validate_srs_prd_env.py --root . --report --code-root <repo>`를 실행하고 리포트 결과를 §2의 검증 결과 열에 기록한다.

## 10. 편차 프로토콜

문서와 현실이 충돌하면 코드를 조용히 바꾸지 않는다. 다음 순서로 처리한다.

1. **정지한다.** 충돌 지점을 넘어가는 구현을 계속하지 않는다.
2. **DEV를 등록한다.** `conductor_implementation_traceability.md` §4 편차 로그에 `DEV-###` 행을 추가한다. 발견일, 유형, 내용, 관련 FR/WP ID를 적는다.
3. **CR을 개설한다.** `../00_governance/change_control.md`의 CR 대장에 CR을 등록하고 DEV ID를 연결한다. CR을 `문서 오류` / `범위 공백` / `기술 제약` 중 하나로 분류한다.
4. **보고한다.** 구현을 중단한 상태로 충돌 내용과 등록한 DEV·CR ID를 보고한다.

CR의 cascade 갱신과 종료는 문서 소유자가 수행한다. 코딩 에이전트는 CR이 닫힌 뒤 갱신된 문서를 다시 읽고 구현을 재개한다.

충돌의 대표 사례: 소스 저장소의 실측값을 재현할 수 없다(FR-THM-001 예외 처리), Radix 버전 업그레이드로 DOM 구조가 바뀌었다(FR-CMP-006 예외 처리), 12.1절 표에 없는 새 대비 위반이 발견되었다(FR-A11Y-004 예외 처리), 토큰 스케일 밖의 값이 필요하다(FR-TOK-007 예외 처리).

## 11. 완료 판정

다음이 전부 성립할 때만 구현이 완료된 것으로 본다.

- 착수한 WP의 DoD 항목이 전부 닫혔고 검증 명령이 종료 코드 0을 반환한다
- 커밋·PR·테스트 이름·모듈 주석에 FR/WP ID가 남아 있다
- 추적 원장의 WP 상태와 요구사항 매핑이 커밋 내용과 일치한다
- 열린 DEV가 전부 CR로 연결되어 있다
- `conductor_screen_qa_checklist.md`의 해당 WP 항목이 닫혔다
- `../40_delivery/conductor_release_validation_plan.md`의 해당 릴리스 게이트가 통과한다
- 알려진 제약이 추적 원장 §5에 기록되어 있다
