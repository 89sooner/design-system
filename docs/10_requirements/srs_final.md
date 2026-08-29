# Conductor Design System 최종 요구사항 정의서

> 상태: baseline | 버전: v1.5 | 갱신일: 2026-08-29

## 1. 문서 개요

- 문서명: Conductor Design System 최종 요구사항 정의서
- 문서 성격: 최종 SRS 겸 구현 기준 문서. 하위 문서와 충돌하면 이 문서가 우선한다.
- 기준 문서: `feature.md`, `prd.md`, `workflow.md`, `glossary.md`

## 2. 통합 결론

Conductor는 `agent-ai-platform/packages/web`의 시각 언어를 3개 npm 패키지(`@conductor-by-89soone/tokens`, `@conductor-by-89soone/css`, `@conductor-by-89soone/react`)와 1개 정적 문서 사이트로 추출한다. 다크 테마는 기준 팔레트로 보존하고, 라이트 테마를 두 번째 팔레트로 추가해 토큰 계층이 실제로 테마를 분리함을 증명한다. 접근성 기준선은 WCAG 2.1 AA다. 백엔드 런타임은 존재하지 않으며, 이 제품이 배포하는 것은 패키지와 정적 사이트다.

## 3. 제품 비전과 목표

### 3.1 제품 비전

한 제품에서 검증된 조밀한 운영용 인터페이스 언어를, 다음 제품이 설치 한 번으로 물려받을 수 있는 형태로 고정한다.

### 3.2 정량 목표

| 목표 ID | 지표 | 목표값 | 측정 방법 |
| --- | --- | --- | --- |
| M-1 | 다크 테마 시각 회귀 픽셀 차이 | 1% 이하 (12개 기준 컴포넌트) | `pnpm test:visual` diff 비율 |
| M-2 | 다크/라이트 시맨틱 토큰 키 집합 차이 | 0개 | `pnpm test` 토큰 계약 테스트 |
| M-3 | WCAG 2.1 AA 대비 미달 쌍 | 0건 (두 테마, 본문 용도 토큰) | `pnpm check:contrast` |
| M-4 | axe-core serious 이상 위반 | 0건 (컴포넌트 전수) | `pnpm test:a11y` |
| M-5 | 신규 앱 적용 명령 수 | 3개 이하 | Getting Started 절차 실행 |
| M-6 | 공개 API의 `any` 노출 | 0건 | `pnpm typecheck` + API 추출 리포트 |
| M-7 | `Button` 단독 import gzip 크기 | 4KB 이하 (React 제외) | 번들 분석 리포트 |

## 4. 범위 정의

### 4.1 In Scope

1. 3계층 디자인 토큰 소스와 CSS/TypeScript/JSON 산출 빌드 — FR-TOK-001 ~ FR-TOK-009
2. 다크(기준) 및 라이트 테마, 시스템 설정 연동, 테마별 대비 검증, 소스 계승 토큰의 접근성 교정 — FR-THM-001 ~ FR-THM-005
3. 캐스케이드 레이어 기반 프레임워크 비종속 스타일시트 — FR-CSS-001 ~ FR-CSS-005
4. React 프리미티브 컴포넌트 (공통 계약 + 8개 컴포넌트군) — FR-CMP-001 ~ FR-CMP-009
5. 정적 문서 사이트 — FR-DOC-001 ~ FR-DOC-007
6. WCAG 2.1 AA 접근성 기준선 — FR-A11Y-001 ~ FR-A11Y-005
7. 모노레포 빌드, 타입 배포, 진입점 선언, SSR 안전성, 버저닝 — FR-DX-001 ~ FR-DX-005
8. 토큰 계약·단위·접근성·시각 회귀 검사 — FR-QA-001 ~ FR-QA-004

### 4.2 Conditional Scope

| 항목 | 조건 | 결정 기한 | 관련 |
| --- | --- | --- | --- |
| F-CMP-010 필터/칩 컴포넌트군 | REL-003 종료 시점에 잔여 용량이 있을 때. 현재 승인되지 않았으므로 FR을 부여하지 않는다 | REL-003 종료 | OD-003 (open) |

FR-QA-004(시각 회귀)와 FR-CMP-009(셸 컴포넌트군)는 2026-07-10에 OD-002·OD-004가 종결되어 조건부 범위에서 빠졌다. FR-QA-004는 REL-004로 이월된 `deferred` 항목이고, FR-CMP-009는 `@conductor-by-89soone/react`에 포함되는 승인 항목이다. 14.1절 참조.

### 4.3 Out of Scope

| 제외 항목 | 제외 사유 |
| --- | --- |
| Figma 양방향 동기화 | 외부 도구 의존과 DTCG 포맷 채택이 선행되어야 한다. v1의 토큰 소스는 코드가 유일한 출처다 |
| Vue / Svelte / Web Components 어댑터 | 소비자가 React 단일이다. 비-React 소비자는 `@conductor-by-89soone/css`를 직접 사용한다 |
| Tailwind preset | ADR-002가 Vanilla CSS + 커스텀 프로퍼티를 확정했다. preset은 소비자를 Tailwind에 결속한다 |
| 자체 아이콘 세트 제작 | `lucide-react`를 peer dependency로 둔다 |
| 차트/데이터 시각화 컴포넌트 | 범위가 독립적이고 크다. `Meter`, `ProgressRing`까지만 포함한다 |
| 고대비(High Contrast) 테마 | 팔레트 3벌 유지 비용을 회피한다 |
| 다국어 문자열 시스템 | 컴포넌트는 문자열을 props로 받는다 |
| 런타임 토큰 편집기 | 문서 사이트의 테마 토글까지만 포함한다 |
| agent-ai-platform 도메인 컴포넌트 이식 | `.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`는 도메인 결합이다 |
| agent-ai-platform 저장소 마이그레이션 | Conductor v1은 독립 저장소로만 성립한다 |
| 백엔드 서비스, 데이터베이스, 인증 서버, 메시지 큐 | 이 제품은 npm 패키지와 정적 사이트를 배포한다. 서버 런타임이 존재하지 않는다 |

## 5. 가정과 제약

### 5.1 기본 가정

1. 소비자는 Node 20 이상, pnpm 10 이상 환경에서 개발한다.
2. 소비자는 React 18 또는 19를 사용한다. React는 peer dependency다.
3. 소비자 애플리케이션은 번들러(Vite, Next.js, Rspack 등)를 통해 CSS import를 처리할 수 있다.
4. `agent-ai-platform`의 `tokens.css`와 `app.css` 실측값이 다크 테마 시각의 유일한 근거다. 별도의 디자인 산출물(Figma 파일)은 존재하지 않는다.
5. 문서 사이트는 인증 없이 공개되거나 사내 정적 호스팅에 배포된다. 사용자 계정 개념이 없다.

### 5.2 기술 제약

1. 스타일 엔진은 Vanilla CSS + CSS 커스텀 프로퍼티로 고정한다(ADR-002). CSS-in-JS, Tailwind, Sass를 도입하지 않는다.
2. 접근성 동작은 Radix UI에 위임한다(ADR-004). 포커스 트랩, 롤 관리, 키보드 내비게이션을 자체 구현하지 않는다.
3. CSS 커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않는다. 브레이크포인트는 빌드 시 리터럴로 치환한다.
4. 배포 산출물은 원격 폰트를 로드하지 않는다. 폰트는 시스템 스택 또는 소비자가 제공한다.
5. 패키지 의존 방향은 `tokens → css → react → docs` 단방향이며 역방향 참조는 빌드 오류다.

### 5.3 보안/운영 제약

1. 배포 산출물은 실행 시 네트워크 요청을 발생시키지 않는다.
2. 의존성 취약점 심각도 high 이상 0건을 릴리스 전제로 한다.
3. 릴리스 롤백은 이전 버전 재배포(deprecate + 이전 태그 승격)로 10분 이내에 수행한다.
4. 공개 API의 파괴 변경은 semver major와 마이그레이션 노트를 동반한다.

## 6. 사용자와 권한 모델

| 사용자 유형 | 권한 | 주요 목표 |
| --- | --- | --- |
| 소비자 개발자 (Consumer Developer) | 공개 진입점 읽기, 문서 사이트 조회 | 새 제품 화면을 Conductor 시각으로 구현한다 |
| 디자인 시스템 관리자 (System Maintainer) | 토큰 소스 편집, 컴포넌트 추가, 릴리스 실행 | 시각 언어를 변경하고 배포한다 |
| 코딩 에이전트 (Coding Agent) | 작업 패키지 범위 내 코드 작성, 추적 원장 갱신 | 문서만 읽고 구현·검증한다 |
| 접근성 검토자 (Accessibility Reviewer) | 릴리스 게이트 차단, CR 개설 | 두 테마의 접근성 준수를 확인한다 |

권한 경계: 이 제품에는 런타임 인증/인가가 없다. 위 권한은 저장소 접근 권한과 릴리스 승인 권한으로 구현된다.

## 7. 대표 사용자 시나리오

### SCN-001 소비자 개발자가 새 앱에 Conductor를 적용한다

- 목표: 빈 React 앱에 Conductor의 시각을 입힌다.
- 시작 조건: Vite + React + TypeScript 프로젝트가 존재한다.
- 기본 흐름: 패키지 설치 → `import "@conductor-by-89soone/css"` → 루트에 `data-cdt-theme="dark"` 지정 → `Button` 렌더.
- 예외 흐름: `@conductor-by-89soone/css`를 import하지 않으면 개발 빌드가 콘솔 경고 1회를 출력하고, 컴포넌트는 스타일 없이 렌더된다.
- 관련 요구사항: FR-DX-003, FR-CSS-001, FR-THM-003, FR-CMP-001

### SCN-002 관리자가 상태색을 변경한다

- 목표: `status.waiting` 값을 바꾸고 안전하게 배포한다.
- 시작 조건: 두 테마의 팔레트 파일이 존재한다.
- 기본 흐름: 프리미티브 값 수정 → `pnpm build` 재생성 → `pnpm check:contrast` 통과 → `pnpm test:visual` 차이 확인.
- 예외 흐름: 대비율 미달 시 빌드가 실패하고 위반 쌍의 이름·측정값·기준값을 출력한다.
- 관련 요구사항: FR-TOK-003, FR-THM-004, FR-A11Y-004, FR-QA-004

### SCN-003 접근성 검토자가 라이트 테마를 승인한다

- 목표: 라이트 팔레트가 릴리스 가능한지 판정한다.
- 시작 조건: 라이트 팔레트 초안이 병합되었다.
- 기본 흐름: `/tokens`에서 테마 전환 → 대비율·판정 확인 → `/components/*`에서 상태 배지의 아이콘·텍스트 확인 → 키보드 도달 확인.
- 예외 흐름: 위반 발견 시 릴리스 게이트를 차단하고 CR을 연다.
- 관련 요구사항: FR-DOC-004, FR-DOC-005, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004

### SCN-004 코딩 에이전트가 작업 패키지를 완료한다

- 목표: 한 세션에서 WP 하나를 구현하고 검증한다.
- 시작 조건: 선행 WP가 모두 `done`이다.
- 기본 흐름: WP 선택 → 참조 ID의 문서만 재독 → 구현 범위 내 코드 작성 → DoD 검증 명령 실행 → 추적 원장 갱신.
- 예외 흐름: 문서와 현실이 충돌하면 `DEV-###` 등록 후 `CR-###`를 열고 정지한다.
- 관련 요구사항: FR-DX-001, FR-QA-002

## 8. 기능 실현 방식 분류

- Type A: 기존 도구/설정 조합으로 구현 가능
- Type B: 빌드/검사 실행 계층(스크립트, CI 잡) 필요
- Type C: 구조 재설계 필요 (소스에 없는 계층을 새로 만든다)
- Type D: 정책상 제외 또는 후순위

## 9. 기능 요구사항

작성 규칙 요약:

- 요구사항 문장은 EARS 패턴 중 하나를 따른다: 상시 / 이벤트 / 상태 / 예외 / 선택.
- 하나의 FR에는 하나의 검증 가능한 행위만 담는다.
- 수치 없는 형용사/부사를 쓰지 않는다. 수용 기준(AC)은 pass/fail 판정이 가능해야 한다.
- 검증 방법: test / demo / inspection / analysis 중 하나.

### 9.1 FR-TOK 토큰

#### FR-TOK-001 토큰 소스 단일화

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-001 / SCN-002 |
| 요구사항 | 시스템은 항상 모든 디자인 토큰 값을 `packages/tokens/src/` 아래의 토큰 소스에서만 읽어야 한다. |
| 수용 기준 | AC-1: `packages/css`와 `packages/react`의 CSS 및 TS 파일에 색상 리터럴(`#rrggbb`, `rgb()`, `hsl()`)이 0건이다. AC-2: 간격·반경·모션 값이 리터럴 px/ms로 등장하는 건수가 0건이다(토큰 소스 및 브레이크포인트 치환 결과 제외). AC-3: 위반 시 `pnpm lint:tokens`가 위반 파일 경로와 라인 번호를 출력하고 종료 코드 1을 반환한다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-030 토큰 참조 페이지) |
| 관련 API/데이터 | API-TOK-002 / ENT-TOK-001 |
| 예외/실패 처리 | 소스 외 리터럴이 발견되면 빌드를 중단하고 위반 목록을 출력한다. 예외가 필요하면 파일 상단에 `/* cdt-allow-literal: <사유> */` 주석을 요구하고, 허용 목록을 `pnpm lint:tokens --report`로 조회 가능하게 한다. |

#### FR-TOK-002 3계층 토큰 구조와 참조 방향

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-002 |
| 요구사항 | 시스템은 항상 토큰을 primitive, semantic, component 3계층으로 분류하고, 토큰이 자기 계층 또는 하위 계층의 토큰만 참조하도록 강제하여야 한다. |
| 수용 기준 | AC-1: primitive 토큰은 다른 토큰을 참조하지 않는다. AC-2: semantic 토큰은 primitive 토큰 또는 다른 semantic 토큰만 참조한다. component 토큰을 참조하면 빌드 오류다(CR-008). AC-3: component 토큰은 semantic 토큰 또는 다른 component 토큰만 참조한다. 상위 계층 참조는 빌드 오류다(CR-008). AC-4: 상위 계층으로의 역방향 참조가 존재하면 빌드가 종료 코드 1로 실패하고 위반 토큰 키 쌍을 출력한다. AC-5: primitive 토큰은 `@conductor-by-89soone/tokens`의 공개 진입점으로 export되지 않는다. AC-6: 동일 계층 내 참조가 순환을 이루면 FR-TOK-003 AC-3의 순환 검출이 빌드를 실패시킨다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-010 색상 페이지의 계층 표시) |
| 관련 API/데이터 | API-TOK-002 / ENT-TOK-001, ENT-TOK-002 |
| 예외/실패 처리 | 계층 분류가 없는 토큰은 빌드 시 오류로 처리하고 해당 키를 출력한다. 동일 계층 별칭(`surface.2` → `surface.subtle`, `border` → `border.default`)은 FR-THM-001 AC-2가 요구하는 정상 참조다. DEV-001·CR-008 참조. |

#### FR-TOK-003 토큰 참조 해석과 순환 참조 차단

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-003 / SCN-002 |
| 요구사항 | 토큰 빌드가 실행되면, 시스템은 모든 토큰 참조를 최종 값으로 해석하고 순환 참조를 검출하여야 한다. |
| 수용 기준 | AC-1: `{ "surface.2": "{surface.subtle}" }` 형태의 참조가 최종 CSS에서 실제 값으로 치환된다. AC-2: 참조 깊이 10단계까지 해석한다. AC-3: 순환 참조가 존재하면 빌드가 종료 코드 1로 실패하고 순환 경로를 `a → b → c → a` 형태로 출력한다. AC-4: 존재하지 않는 키를 참조하면 빌드가 실패하고 참조원과 대상 키를 출력한다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-030) |
| 관련 API/데이터 | API-TOK-001 / ENT-TOK-003 |
| 예외/실패 처리 | 참조 해석 실패 시 부분 산출물을 남기지 않는다. 기존 산출물을 덮어쓰기 전에 전체 해석을 완료한다. |

#### FR-TOK-004 CSS 커스텀 프로퍼티 산출

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-004 / SCN-001 |
| 요구사항 | 토큰 빌드가 실행되면, 시스템은 모든 semantic 및 component 토큰을 `--cdt-` 접두사의 CSS 커스텀 프로퍼티로 산출하여야 한다. |
| 수용 기준 | AC-1: 산출된 `tokens.css`의 모든 커스텀 프로퍼티 선언이 `--cdt-`로 시작한다. AC-2: 토큰 키 `surface.raised`가 `--cdt-surface-raised`로 변환된다(점 → 하이픈, 소문자 kebab-case). AC-3: 접두사 없는 커스텀 프로퍼티가 산출되면 빌드가 종료 코드 1로 실패한다. AC-4: primitive 토큰은 CSS로 산출되지 않는다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-030) |
| 관련 API/데이터 | API-PKG-001, API-TOK-001 / ENT-TOK-001 |
| 예외/실패 처리 | 이름 충돌(두 키가 같은 CSS 이름으로 변환)이 발생하면 빌드가 실패하고 충돌한 두 키를 출력한다. |

#### FR-TOK-005 상태·심각도·미터·dataviz 토큰군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-005 |
| 요구사항 | 시스템은 항상 실행 상태 7종, 심각도 4종, 미터 3종에 대응하는 semantic 색상 토큰을 제공하여야 한다. 또한 차트 계열 구분을 위한 dataviz 색 계열로 범주형 `dataviz.series` 20종과 순서형 `dataviz.sequential` 5종을 제공하여야 한다. |
| 수용 기준 | AC-1: 상태 토큰 키가 `status.queued`, `status.running`, `status.waiting`, `status.success`, `status.partial`, `status.danger`, `status.neutralEnd` 7개로 존재한다. AC-2: 심각도 토큰 키가 `severity.read`, `severity.write`, `severity.destructive`, `severity.blocked` 4개로 존재한다. AC-3: 미터 토큰 키가 `meter.normal`, `meter.warning`, `meter.exceeded` 3개로 존재한다. AC-4: 14개 키 모두가 다크·라이트 두 테마에 정의된다. AC-5: 각 상태·심각도 토큰은 `icon` 메타데이터 필드를 가지며 값이 빈 문자열이 아니다. AC-6: dataviz 토큰 키가 `dataviz.series.1`~`dataviz.series.20`(범주형 20개)과 `dataviz.sequential.1`~`dataviz.sequential.5`(순서형 5개)로 존재하고, 25개 키 모두 다크·라이트 두 테마에 정의되며 `usage`가 `nonText`다. 각 키는 차트가 놓이는 세 표면(`surface.base`·`surface.canvas`·`surface.raised`)에 대해 두 테마 모두 3:1 이상이며 CP-043~CP-117로 검사한다(CR-036, PR Search DEV-380). 범주형 색은 계열 정체성만 나타내고 크기를 색으로 표현하지 않으며, 색 상호 간 대비는 요구하지 않는다. |
| 검증 방법 | test |
| 관련 화면 | W-010, W-040 |
| 관련 API/데이터 | API-TOK-002 / ENT-TOK-001, ENT-THM-001 |
| 예외/실패 처리 | 한 테마에만 존재하는 키가 발견되면 FR-QA-001의 계약 테스트가 실패한다. |

#### FR-TOK-006 TypeScript 및 JSON 산출

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-006 |
| 요구사항 | 토큰 빌드가 실행되면, 시스템은 semantic 및 component 토큰을 타입이 부여된 TypeScript 중첩 객체와 JSON 파일로 산출하여야 한다. |
| 수용 기준 | AC-1: `import { tokens } from "@conductor-by-89soone/tokens"` 후 `tokens.surface.raised`가 문자열 리터럴 타입으로 추론된다. AC-2: 존재하지 않는 키 접근 `tokens.surface.nonexistent`가 TypeScript 컴파일 오류를 발생시킨다. AC-3: `@conductor-by-89soone/tokens/tokens.json`이 토큰 키·값·계층·용도 메타데이터를 포함한다. AC-4: 산출된 `.d.ts`에 `any` 타입이 0건이다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-030이 이 JSON을 읽어 렌더한다) |
| 관련 API/데이터 | API-PKG-001, API-TOK-002 / ENT-TOK-001 |
| 예외/실패 처리 | 타입 생성 실패 시 빌드를 중단한다. 이전 산출물을 남기지 않는다. |

#### FR-TOK-007 타이포 스케일 토큰화

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-TOK-007 |
| 요구사항 | 시스템은 항상 글자 크기를 `font.size.<단계>` 토큰 7단계로만 제공하여야 한다. |
| 수용 기준 | AC-1: `font.size` 하위 키가 `2xs`(10px), `xs`(11px), `sm`(12px), `base`(13px), `md`(14px), `lg`(16px), `xl`(20px) 7개로 존재한다. AC-2: 각 단계에 대응하는 `font.lineHeight.<단계>` 토큰이 존재한다. AC-3: `packages/css`와 `packages/react`에 `font-size`의 px 리터럴이 0건이다. AC-4: 제목은 `font.size.xl` 이상과 `clamp()` 기반 반응형 값을 사용한다. |
| 검증 방법 | test |
| 관련 화면 | W-011 |
| 관련 API/데이터 | API-TOK-002 / ENT-TOK-001 |
| 예외/실패 처리 | 스케일 밖 크기가 필요하면 CR을 열어 스케일을 확장한다. 컴포넌트가 임의 크기를 선언하면 `pnpm lint:tokens`가 실패한다. |

#### FR-TOK-008 z-index 스케일 토큰화

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Should |
| 출처 | F-TOK-008 |
| 요구사항 | 시스템은 항상 겹침 순서를 `z.<레이어>` 토큰 6단계로만 제공하여야 한다. |
| 수용 기준 | AC-1: `z` 하위 키가 `base`(0), `raised`(10), `sticky`(20), `drawer`(30), `overlay`(40), `popover`(50) 6개로 존재한다. AC-2: `packages/css`와 `packages/react`에 `z-index`의 숫자 리터럴이 0건이다. AC-3: 두 레이어가 같은 값을 갖지 않는다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-030) |
| 관련 API/데이터 | API-TOK-002 / ENT-TOK-001 |
| 예외/실패 처리 | 소비자가 Conductor 오버레이 위에 자체 레이어를 쌓아야 하면 `z.popover` 초과 값을 소비자가 직접 지정한다. 이 사실을 W-030에 문서화한다. |

#### FR-TOK-009 브레이크포인트 토큰화

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Should |
| 출처 | F-TOK-009 |
| 요구사항 | 시스템은 항상 반응형 기준점을 `breakpoint.<이름>` 토큰 3단계로 제공하고, 빌드 시 미디어쿼리 조건에 리터럴로 치환하여야 한다. |
| 수용 기준 | AC-1: `breakpoint` 하위 키가 `sm`(560px), `md`(800px), `lg`(1080px) 3개로 존재한다. AC-2: 산출된 CSS의 `@media` 조건에 `var(--cdt-breakpoint-*)`가 0건이며 리터럴 px가 사용된다. AC-3: `@conductor-by-89soone/tokens`가 `breakpoints` 객체를 export하여 JS에서 동일 값을 읽을 수 있다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-012) |
| 관련 API/데이터 | API-TOK-001, API-TOK-002 / ENT-TOK-001 |
| 예외/실패 처리 | CSS 커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않는다(5.2 기술 제약 3). 치환 누락 시 빌드 검사가 실패한다. |

### 9.2 FR-THM 테마

#### FR-THM-001 다크 테마 기준 팔레트

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-THM-001 / SRC-AAP `tokens.css` |
| 요구사항 | 시스템은 항상 다크 테마를 기준(canonical) 팔레트로 두고, 모든 semantic 토큰 키의 정의를 다크 팔레트에서 확정하여야 한다. |
| 수용 기준 | AC-1: `agent-ai-platform/packages/web/src/styles/tokens.css`의 `:root` 블록에 선언된 커스텀 프로퍼티 중, `--surface-2`(별칭)와 `--border`(별칭)를 제외한 값이 모두 다크 팔레트에 1:1로 존재한다. AC-2: 별칭 2개는 FR-TOK-003의 토큰 참조로 표현된다. AC-3: 다크 팔레트에만 존재하고 라이트 팔레트에 없는 semantic 키가 0개다. AC-4: 다크 테마 적용 시 루트 요소의 계산된 `color-scheme`이 `dark`다. |
| 검증 방법 | test |
| 관련 화면 | W-010, W-030 |
| 관련 API/데이터 | API-THM-001 / ENT-THM-001 |
| 예외/실패 처리 | 소스에 존재하는 값을 재현하지 못하면 DEV를 등록하고 CR로 승격한다. 값을 임의로 근사하지 않는다. |

#### FR-THM-002 라이트 테마 팔레트

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-THM-002 / SRC-USER |
| 요구사항 | 시스템은 항상 라이트 테마를 다크 테마와 동일한 semantic 토큰 키 집합으로 제공하여야 한다. |
| 수용 기준 | AC-1: 두 테마의 semantic 토큰 키 집합의 대칭 차집합이 공집합이다. AC-2: 라이트 테마 적용 시 루트 요소의 계산된 `color-scheme`이 `light`다. AC-3: 다크 테마에서 alpha 값으로 정의된 경계 토큰(`border.subtle`, `border.default`, `border.strong`)이 라이트 테마에서도 동일 키로 존재하며, 라이트 배경 위에서 FR-A11Y-004의 비텍스트 대비 3:1을 만족한다. AC-4: 라이트 테마에서 `elevation.*` 토큰의 그림자 alpha가 다크 테마와 다른 값을 갖는다(동일 값 재사용 금지). |
| 검증 방법 | test |
| 관련 화면 | W-010, W-030 |
| 관련 API/데이터 | API-THM-001 / ENT-THM-001 |
| 예외/실패 처리 | 다크 전용 시각 장치(글래스 배경, 글로우)가 라이트에서 판독 불가하면, 해당 컴포넌트 토큰을 라이트 팔레트에서 solid 대안 값으로 재정의한다. 컴포넌트 코드는 수정하지 않는다. |

#### FR-THM-003 테마 결정 우선순위

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-THM-003 / SCN-001 |
| 요구사항 | 문서 루트 요소에 `data-cdt-theme` 속성이 존재하면, 시스템은 해당 속성값의 테마를 적용하고 `prefers-color-scheme`을 무시하여야 한다. |
| 수용 기준 | AC-1: `data-cdt-theme="light"`이고 OS가 다크일 때 라이트 팔레트가 적용된다. AC-2: 속성이 없으면 `prefers-color-scheme: dark`일 때 다크, 그 외 라이트가 적용된다. AC-3: 속성값이 `dark`/`light` 이외이면 다크 팔레트가 적용된다. AC-4: 테마 전환 시 CSS 커스텀 프로퍼티 값만 바뀌며 컴포넌트가 재마운트되지 않는다. |
| 검증 방법 | test |
| 관련 화면 | W-001, W-030 |
| 관련 API/데이터 | API-THM-001 / ENT-THM-001 |
| 예외/실패 처리 | 서버 렌더링 환경에서 최초 페인트 시 테마 불일치 깜빡임을 막기 위해, `@conductor-by-89soone/css`는 `<head>`에 인라인으로 삽입 가능한 테마 결정 스니펫을 문서 사이트 W-002에 제공한다. 스니펫은 패키지가 자동 주입하지 않는다. |

#### FR-THM-004 테마별 대비 검증

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-THM-004 / SCN-002 |
| 요구사항 | 토큰 빌드가 완료되면, 시스템은 두 테마 각각에 대해 정의된 전경/배경 토큰 쌍의 대비율을 계산하고 기준 미달 쌍을 보고하여야 한다. |
| 수용 기준 | AC-1: 검사 대상 쌍은 `packages/tokens/src/contrast-pairs.ts`에 명시적으로 선언된다. AC-2: 각 쌍은 `body`(4.5:1) 또는 `large`(3:1) 또는 `nonText`(3:1) 기준 중 하나를 갖는다. AC-3: 미달 쌍이 1건 이상이면 `pnpm check:contrast`가 종료 코드 1을 반환하고, 쌍 이름·테마·측정 대비율·기준값을 출력한다. AC-4: 대비율 계산은 WCAG 2.1의 상대 휘도 공식을 사용하고, alpha가 있는 색은 배경과 합성한 뒤 계산한다. |
| 검증 방법 | test |
| 관련 화면 | W-030, W-050 |
| 관련 API/데이터 | API-TOK-003 / ENT-THM-001, JOB-CI-001 |
| 예외/실패 처리 | 장식 전용 토큰은 `usage: "decorative"` 메타데이터를 부여해 검사 대상에서 제외한다. 제외 사유를 토큰 소스 주석에 기록한다. 제외 목록은 `pnpm check:contrast --report`로 조회 가능하다. 제외 정책은 OD-001(2026-07-10 종결)이 확정했다: 12.1절 참조. |

#### FR-THM-005 소스 계승 토큰의 접근성 교정

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | OD-001 (2026-07-10 종결) / SRC-WCAG 1.4.11, 2.4.11 |
| 요구사항 | 시스템은 항상 12.1절 표에 명시된 교정 값을 소스 계승 값 대신 사용하여야 한다. |
| 수용 기준 | AC-1: `focusRing`이 accent 색을 alpha 0.80으로 합성한 값을 사용하며, `surface.base`와 `surface.raised` 위에서 각각 3:1 이상이다. AC-2: `border.control` 토큰이 존재하고 `surface.raised` 위에서 3:1 이상이며, `TextField`·`TextArea`·`Select`·`Switch`·`Checkbox`의 경계에 적용된다. AC-3: `text.faint`는 `usage: "decorative"`이며 `surface.elevated` 위에서 사용되면 `pnpm lint:tokens`가 실패한다. AC-4: `border.subtle`·`border.default`·`border.strong`은 `usage: "decorative"`이며 대비 검사 대상이 아니다. AC-5: `status.queued`는 `usage: "nonText"`다. AC-6: `status.neutralEnd`는 `usage: "nonText"`이며 `badge.marker.background` 위에서 3:1 이상이다(CR-035가 CR-006의 예외를 폐기했다). AC-7: `status.queued`와 `status.neutralEnd`를 쓰는 컴포넌트는 색 외에 아이콘과 텍스트를 함께 렌더한다. |
| 검증 방법 | test |
| 관련 화면 | W-030, W-050 |
| 관련 API/데이터 | API-TOK-003 / ENT-THM-001, ENT-TOK-001 |
| 예외/실패 처리 | 교정 값이 시각 회귀 기준 이미지와 1%를 초과해 어긋나면 기준 이미지를 갱신하고 그 사유를 `conductor_implementation_traceability.md`에 기록한다. 소스 값으로 되돌리지 않는다. |

### 9.3 FR-CSS 스타일 레이어

#### FR-CSS-001 캐스케이드 레이어 선언

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CSS-001 / R-4 |
| 요구사항 | 시스템은 항상 자체 스타일 전부를 `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility` 안에 선언하고 `!important`를 사용하지 않아야 한다. |
| 수용 기준 | AC-1: `@conductor-by-89soone/css` 산출물의 모든 규칙이 위 5개 레이어 중 하나에 속한다. AC-2: 산출물의 `!important` 출현 횟수가 0건이다. AC-3: 레이어 밖에서 선언된 소비자 규칙이 동일 명시도에서 Conductor 규칙을 덮어쓴다. AC-4: 레이어 선언 순서가 산출물 최상단 한 줄에 고정된다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-002 설치 안내) |
| 관련 API/데이터 | API-PKG-002 / — |
| 예외/실패 처리 | Radix가 인라인 스타일을 주입하는 속성(예: `--radix-*`)은 레이어 대상이 아니다. 이 예외를 W-002에 문서화한다. |

#### FR-CSS-002 리셋 및 베이스 레이어

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CSS-002 / SRC-AAP `app.css:2-128` |
| 요구사항 | 시스템은 항상 `cdt.reset` 레이어에서 박스 모델, 폼 요소 폰트 상속, 포커스 표시, 스크롤바, 선택 영역 스타일을 정규화하여야 한다. |
| 수용 기준 | AC-1: `box-sizing: border-box`가 전역 적용된다. AC-2: `button`, `input`, `textarea`, `select`가 `font: inherit`를 받는다. AC-3: `:focus-visible`이 `--cdt-focus-ring` 토큰의 그림자를 받고 `outline`은 제거된다. AC-4: 산출물에 `@import url()` 또는 `src: url(http...)` 형태의 원격 폰트 참조가 0건이다. AC-5: `sr-only` 및 `skip-link` 유틸리티 클래스가 `cdt.utility` 레이어에 존재한다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: 모든 문서 사이트 화면) |
| 관련 API/데이터 | API-PKG-002 / — |
| 예외/실패 처리 | 리셋이 소비자의 기존 전역 스타일과 충돌하면, 소비자는 `@conductor-by-89soone/css/component.css`만 import해 리셋을 제외할 수 있다. 이 진입점을 FR-DX-003의 `exports`에 선언한다. |

#### FR-CSS-003 레이아웃 프리미티브 클래스

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CSS-003 / SRC-AAP `.app-shell`, `.split-layout`, `.card-grid`, `.page` |
| 요구사항 | 시스템은 항상 `cdt.layout` 레이어에서 앱 셸, 스플릿 레이아웃, 카드 그리드, 페이지 스택 클래스를 제공하여야 한다. |
| 수용 기준 | AC-1: `cdt-app-shell`, `cdt-split-layout`, `cdt-card-grid`, `cdt-page`, `cdt-content-stack` 클래스가 존재한다. AC-2: `cdt-split-layout`이 뷰포트 800px 미만에서 단일 컬럼으로 전환된다. AC-3: `cdt-card-grid`가 최소 컬럼 폭 320px의 `auto-fill` 그리드이며, 560px 미만에서 단일 컬럼으로 전환된다. AC-4: 레이아웃 클래스가 색상 속성을 선언하지 않는다. |
| 검증 방법 | test |
| 관련 화면 | W-012 |
| 관련 API/데이터 | API-PKG-002 / — |
| 예외/실패 처리 | 도메인 전용 레이아웃(`.thread-page`, `.tool-grid` 등)은 제공하지 않는다(F-X-009). 소비자가 직접 정의한다. |

#### FR-CSS-004 컴포넌트 클래스 레이어

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CSS-004 / SRC-AAP `.btn`, `.card`, `.badge`, `.table`, `.timeline` |
| 요구사항 | 시스템은 항상 `cdt.component` 레이어에서 각 프리미티브 컴포넌트에 대응하는 CSS 클래스를 `cdt-` 접두사로 제공하여야 한다. |
| 수용 기준 | AC-1: 산출물의 모든 클래스 셀렉터가 `cdt-`로 시작한다. AC-2: 클래스 이름이 `cdt-<블록>[__<요소>][--<변형>]` 규칙을 따른다. AC-3: React 없이 `cdt-btn cdt-btn--primary` 클래스만으로 `Button variant="primary"`와 동일한 계산된 스타일이 적용된다. AC-4: 컴포넌트 클래스가 자식 구조 셀렉터(`>`, `+`, `:nth-child`)에 의존하지 않는다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-PKG-002 / — |
| 예외/실패 처리 | Radix가 소유하는 DOM 구조에는 `data-*` 속성 셀렉터만 사용한다(R-3). 구조 셀렉터 사용 시 CSS 린트가 실패한다. |

#### FR-CSS-005 모션 감소 설정 존중

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CSS-005 / SRC-AAP `tokens.css:88-93` |
| 요구사항 | `prefers-reduced-motion: reduce`가 설정된 동안, 시스템은 모든 전환과 애니메이션의 지속 시간을 0ms로 적용하여야 한다. |
| 수용 기준 | AC-1: 감소 모드에서 `transition-duration`과 `animation-duration`의 계산값이 모든 Conductor 요소에서 `0s`다. AC-2: 감소 모드에서도 상태 변화(hover, focus, selected)의 최종 시각 결과는 동일하다. AC-3: 감소 모드에서 `scroll-behavior`가 `auto`다. AC-4: 감소 모드 규칙이 `cdt.base` 레이어에 존재하며 전역 `*` 셀렉터 대신 Conductor 스코프 셀렉터를 사용한다. |
| 검증 방법 | test |
| 관련 화면 | W-014 |
| 관련 API/데이터 | API-PKG-002 / — |
| 예외/실패 처리 | 진행 표시(`Spinner`, `ProgressRing`)는 감소 모드에서 애니메이션 대신 정적 진행률 텍스트를 노출한다. |

### 9.4 FR-CMP 컴포넌트

#### FR-CMP-001 컴포넌트 공통 계약

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-001 / SCN-001 |
| 요구사항 | 시스템은 항상 모든 공개 컴포넌트가 ref 전달, `className` 병합, `data-*`/`aria-*` 속성 통과, 대응 네이티브 요소 props 확장을 지원하도록 하여야 한다. |
| 수용 기준 | AC-1: 각 컴포넌트에 `ref`를 전달하면 최상위 DOM 노드를 받는다. AC-2: `className="x"`를 전달하면 컴포넌트 기본 클래스와 `x`가 함께 적용된다. AC-3: `data-testid`와 `aria-label`이 최상위 DOM 노드에 그대로 전달된다. AC-4: 컴포넌트 props 타입이 대응 네이티브 요소의 props를 확장한다(예: `ButtonProps extends React.ComponentPropsWithoutRef<"button">`). AC-5: 공개 컴포넌트 전수에 대해 위 4개 항목을 검증하는 공유 테스트 스위트가 실행된다. |
| 검증 방법 | test |
| 관련 화면 | W-021 |
| 관련 API/데이터 | API-PKG-003, API-CMP-001 / ENT-CMP-001 |
| 예외/실패 처리 | 계약을 만족하지 않는 컴포넌트는 공개 진입점에서 export하지 않는다. 공유 테스트 스위트가 실패하면 빌드가 실패한다. |

#### FR-CMP-002 액션 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-002 / SRC-AAP `.btn`, `.btn-primary`, `.btn-icon`, `.btn.policy-disabled` |
| 요구사항 | 시스템은 항상 `Button`과 `IconButton`을 제공하고 `variant`, `tone`, `size`, `loading`, `disabled` props를 지원하여야 한다. |
| 수용 기준 | AC-1: `variant`가 `primary`, `secondary`, `ghost` 3종을 지원한다. AC-2: `loading`이 참인 동안 버튼이 `aria-busy="true"`를 갖고 클릭 핸들러가 호출되지 않는다. AC-3: `IconButton`은 `aria-label` props를 필수로 요구하며, 누락 시 TypeScript 컴파일 오류가 발생한다. AC-4: `disabled` 상태에서 `cursor: not-allowed`가 적용되고 hover 시각 변화가 없다. AC-5: 정책상 차단된 버튼은 `disabled`와 함께 차단 사유 문자열을 `title` 또는 `aria-describedby`로 노출한다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-CMP-002 / ENT-CMP-001 |
| 예외/실패 처리 | `loading`과 `disabled`가 동시에 참이면 `disabled` 시각이 우선하고 `aria-busy`는 유지한다. |

#### FR-CMP-003 표면 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-003 / SRC-AAP `.card`, `.interactive-card`, `.card-grid` |
| 요구사항 | 시스템은 항상 `Card`, `CardGrid`, `Panel`을 제공하고, `Card`가 정적 표면과 대화형 표면 두 모드를 지원하여야 한다. |
| 수용 기준 | AC-1: `Card`에 `onClick` 또는 `href`가 주어지면 `button` 또는 `a` 요소로 렌더되고 키보드 포커스를 받는다. AC-2: 대화형 `Card`가 hover 시 2px 상승 변형과 강조 경계를 적용한다. AC-3: 정적 `Card`는 `div`로 렌더되고 포커스를 받지 않는다. AC-4: `Card` 내부에 `Table`을 넣으면 가로 스크롤이 `Card` 경계 안에서 발생한다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-CMP-003 / ENT-CMP-001 |
| 예외/실패 처리 | 대화형 `Card` 내부에 중첩 대화형 요소가 있으면 개발 빌드에서 콘솔 경고를 출력한다(중첩 대화형 요소는 접근성 위반이다). |

#### FR-CMP-004 상태 표시 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-004 / SRC-AAP `.badge` |
| 요구사항 | 시스템은 항상 `Badge`, `StatusBadge`, `SeverityTag`를 제공하고, 상태와 심각도를 색·아이콘·텍스트 세 가지로 동시에 전달하여야 한다. |
| 수용 기준 | AC-1: `StatusBadge status="running"`이 상태색 배경, 상태 아이콘, 상태 텍스트를 모두 렌더한다. AC-2: 아이콘 요소가 `aria-hidden="true"`를 갖고 텍스트가 접근 가능한 이름을 제공한다. AC-3: `status` props가 FR-TOK-005의 7개 값으로 타입 제한되며, 그 외 값은 TypeScript 컴파일 오류다. AC-4: `SeverityTag severity="destructive"`가 심각도색과 경고 아이콘, `destructive` 텍스트를 렌더한다. AC-5: 그레이스케일 렌더 시 상태 7종이 텍스트로 구분 가능하다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021, W-040 |
| 관련 API/데이터 | API-CMP-004 / ENT-CMP-001 |
| 예외/실패 처리 | 텍스트를 숨기는 `iconOnly` 모드를 제공하지 않는다. 공간이 부족하면 소비자가 `Tooltip`으로 감싼다. |

#### FR-CMP-005 데이터 표시 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-005 / SRC-AAP `.table`, `.timeline`, `.num`, `.mono`, `kbd` |
| 요구사항 | 시스템은 항상 `Table`, `Timeline`, `CodeBlock`, `Kbd`를 제공하여야 한다. |
| 수용 기준 | AC-1: `Table`이 가로 스크롤 컨테이너를 자체 소유하고, 뷰포트 800px 미만에서 스크롤이 활성화된다. AC-2: 숫자 셀에 `cdt-num` 클래스가 적용되면 `font-variant-numeric: tabular-nums`가 계산값으로 확인된다. AC-3: `Timeline`의 각 단계가 `button` 또는 `div` 중 `onSelect` 여부에 따라 렌더되고, 대화형일 때 키보드로 도달한다. AC-4: `CodeBlock`이 JSON 페이로드를 모노스페이스 폰트로 렌더하고 가로 스크롤을 제공한다. AC-5: `Table`에 `caption` 또는 `aria-label`이 없으면 개발 빌드에서 콘솔 경고를 출력한다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-CMP-005 / ENT-CMP-001 |
| 예외/실패 처리 | 정렬, 페이지네이션, 가상 스크롤은 제공하지 않는다. `Table`은 시각 계층만 담당하고 데이터 로직은 소비자가 소유한다. |

#### FR-CMP-006 오버레이 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-006 / SRC-AAP `.drawer`, `.radix-overlay`, `.TooltipContent` |
| 요구사항 | 시스템은 항상 `Dialog`, `Drawer`, `Tooltip`, `DropdownMenu`를 Radix UI 프리미티브 위에 구현하여야 한다. |
| 수용 기준 | AC-1: `Dialog`와 `Drawer`가 열린 동안 포커스가 오버레이 내부에 갇히고, Escape 키로 닫히며, 닫힌 후 포커스가 트리거로 복귀한다. AC-2: `Dialog`와 `Drawer`가 열린 동안 배경 스크롤이 잠긴다. AC-3: `Tooltip`이 포커스와 hover 양쪽에서 열리고, Escape로 닫힌다. AC-4: 오버레이의 `z-index`가 FR-TOK-008의 `z.overlay` 및 `z.popover` 토큰을 사용한다. AC-5: 포커스 트랩, 롤 관리, 키보드 내비게이션 코드를 Conductor가 자체 구현한 건수가 0건이다(Radix에 위임). |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-CMP-006 / ENT-CMP-001 |
| 예외/실패 처리 | Radix 버전 업그레이드로 DOM 구조가 바뀌면 `data-*` 속성 셀렉터만 사용하므로 스타일이 유지된다. 구조 변경이 감지되면 DEV를 등록한다(R-3). |

#### FR-CMP-007 폼 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-007 / SRC-AAP `input`, `.input-glass`, `.SelectTrigger`, `.SwitchRoot`, `.form-label` |
| 요구사항 | 시스템은 항상 `Field`, `TextField`, `TextArea`, `Select`, `Switch`, `Checkbox`를 제공하고, 라벨·설명·오류 메시지를 입력 요소에 프로그램적으로 연결하여야 한다. |
| 수용 기준 | AC-1: `Field`가 라벨을 `htmlFor`/`id`로, 설명과 오류를 `aria-describedby`로 입력 요소에 연결한다. AC-2: 오류 상태에서 입력 요소가 `aria-invalid="true"`를 갖는다. AC-3: 라벨 없이 `TextField`를 렌더하면 개발 빌드에서 콘솔 경고를 출력한다. AC-4: `Switch`와 `Checkbox`가 Space 키로 토글되고 `role`과 `aria-checked`를 노출한다. AC-5: 모든 폼 컨트롤의 최소 높이가 40px이며, 뷰포트 560px 미만에서 42px로 증가한다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-CMP-007 / ENT-CMP-001 |
| 예외/실패 처리 | 폼 상태 관리와 유효성 검사 로직은 제공하지 않는다. 소비자가 react-hook-form 등을 사용하고 Conductor는 표시 계층만 담당한다. |

#### FR-CMP-008 피드백 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-CMP-008 / SRC-AAP `.banner-error`, `.warn-box`, `.empty-state`, `.progress-ring`, `.linear-progress-*` |
| 요구사항 | 시스템은 항상 `Banner`, `EmptyState`, `Meter`, `ProgressRing`, `Spinner`를 제공하여야 한다. |
| 수용 기준 | AC-1: `Banner tone="danger"`가 `role="alert"`를 갖고, `tone="info"`는 `role="status"`를 갖는다. AC-2: `Banner tone="danger"`가 복구 액션 슬롯(`action` props)을 제공하며, 슬롯이 비어 있으면 개발 빌드에서 콘솔 경고를 출력한다. AC-3: `EmptyState`가 제목, 설명, 액션 슬롯을 받는다. AC-4: `Meter value`가 임계값을 넘으면 `meter.warning` 또는 `meter.exceeded` 토큰 색으로 전환되고, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`를 노출한다. AC-5: `prefers-reduced-motion: reduce`에서 `Spinner`와 `ProgressRing`이 애니메이션 대신 진행률 텍스트를 노출한다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-CMP-008 / ENT-CMP-001 |
| 예외/실패 처리 | 토스트/스낵바는 제공하지 않는다. 알림 큐 관리는 소비자 책임이다. |

#### FR-CMP-009 셸 컴포넌트군

| 항목 | 내용 |
| --- | --- |
| 상태 | approved (OD-004, 2026-07-10 종결: `@conductor-by-89soone/react`에 포함한다) |
| 우선순위 | Should |
| 출처 | F-CMP-009 / SRC-AAP `.app-shell`, `.app-nav`, `.app-topbar` |
| 요구사항 | 라우팅 비종속 API가 성립하는 경우, 시스템은 `AppShell`, `NavList`, `TopBar`를 제공하여야 한다. |
| 수용 기준 | AC-1: `NavList`가 링크 렌더를 `renderLink` props로 위임해 라우팅 라이브러리에 의존하지 않는다. AC-2: `@conductor-by-89soone/react`의 의존성 목록에 라우팅 라이브러리가 0건이다. AC-3: 뷰포트 800px 미만에서 사이드 내비가 오프캔버스로 전환되고, 오버레이 클릭 또는 Escape로 닫힌다. AC-4: `AppShell`이 `skip-link`를 렌더하고 본문 영역에 포커스를 이동시킨다. |
| 검증 방법 | test |
| 관련 화면 | W-001, W-021 |
| 관련 API/데이터 | API-CMP-009 / ENT-CMP-001 |
| 예외/실패 처리 | AC-2를 만족하는 API가 성립하지 않으면 이 FR을 `deprecated`로 표시하고 셸을 문서 사이트 내부 컴포넌트로 강등한다. OD-004 참조. |

### 9.5 FR-DOC 문서 사이트

#### FR-DOC-001 문서 사이트 셸

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DOC-001 / SRC-USER |
| 요구사항 | 시스템은 항상 문서 사이트에 사이드 내비게이션, 상단바, 본문 영역으로 구성된 셸을 제공하여야 한다. |
| 수용 기준 | AC-1: 문서 사이트가 `@conductor-by-89soone/react`와 `@conductor-by-89soone/css`를 소비자로서 설치해 사용한다(소스 상대경로 import 0건). AC-2: 모든 문서 화면(W-001 ~ W-050)이 셸 안에서 렌더된다. AC-3: 사이트가 정적 파일로 빌드되며 서버 런타임 없이 동작한다. AC-4: 빌드 산출물이 실행 시 외부 도메인으로 네트워크 요청을 0건 발생시킨다. |
| 검증 방법 | test |
| 관련 화면 | W-001 |
| 관련 API/데이터 | API-DOC-001 / ENT-DOC-001, JOB-BUILD-004 |
| 예외/실패 처리 | 문서 사이트는 Conductor의 첫 번째 소비자다. 문서 사이트가 소스 내부 경로를 import하면 FR-DX-003 검사가 실패한다. |

#### FR-DOC-002 Foundations 페이지

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DOC-002 |
| 요구사항 | 시스템은 항상 색상, 타이포그래피, 간격/레이아웃, 반경/고도, 모션 다섯 개의 Foundations 화면을 토큰 빌드 산출물로부터 생성하여야 한다. |
| 수용 기준 | AC-1: 각 화면의 값이 `@conductor-by-89soone/tokens/tokens.json`에서 읽히며 화면에 하드코딩된 토큰 값이 0건이다. AC-2: 토큰 소스에 토큰을 추가하면 재빌드 후 해당 Foundations 화면에 자동으로 나타난다. AC-3: 각 토큰 행이 토큰 키, 계층, 현재 테마 값, 용도 설명을 표시한다. |
| 검증 방법 | test |
| 관련 화면 | W-010, W-011, W-012, W-013, W-014 |
| 관련 API/데이터 | API-TOK-002 / ENT-TOK-001, ENT-DOC-001 |
| 예외/실패 처리 | 용도 설명이 없는 토큰은 화면에 `설명 없음`으로 표시하고, 빌드 시 경고를 출력한다. |

#### FR-DOC-003 컴포넌트 카탈로그와 라이브 프리뷰

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DOC-003 / SCN-003 |
| 요구사항 | 시스템은 항상 각 공개 컴포넌트에 대해 실제 DOM으로 렌더되는 라이브 프리뷰, props 표, 사용 규칙을 제공하여야 한다. |
| 수용 기준 | AC-1: 각 컴포넌트 화면이 해당 컴포넌트를 실제로 마운트해 렌더한다(스크린샷 이미지 0건). AC-2: props 표가 `@conductor-by-89soone/react`의 타입 정의에서 생성되며, 수동으로 작성한 props 행이 0건이다. AC-3: 각 컴포넌트의 모든 `variant`와 `tone` 조합이 프리뷰에 렌더된다. AC-4: 프리뷰가 현재 선택된 테마를 따른다. AC-5: 공개 진입점에 export되었으나 카탈로그에 화면이 없는 컴포넌트가 0건이며, 위반 시 빌드가 실패한다. |
| 검증 방법 | test |
| 관련 화면 | W-020, W-021 |
| 관련 API/데이터 | API-PKG-003, API-DOC-001 / ENT-CMP-001, ENT-DOC-001 |
| 예외/실패 처리 | 프리뷰 렌더 중 예외가 발생하면 해당 프리뷰 영역만 오류 경계로 격리하고 나머지 화면을 계속 렌더한다. |

#### FR-DOC-004 토큰 참조 페이지

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DOC-004 / SCN-003 |
| 요구사항 | 시스템은 항상 토큰 참조 화면에서 모든 semantic 및 component 토큰의 키, 두 테마의 값, 대비율, 판정 결과를 표시하여야 한다. |
| 수용 기준 | AC-1: 토큰 키 문자열로 필터하면 일치하는 행만 남는다. AC-2: 색상 토큰 행이 다크 값과 라이트 값을 나란히 표시한다. AC-3: FR-THM-004의 검사 대상 쌍에 속한 토큰은 대비율 수치와 pass/fail 판정을 표시한다. AC-4: 대비 검사 제외 토큰은 `장식 전용` 표식과 제외 사유를 표시한다. |
| 검증 방법 | test |
| 관련 화면 | W-030 |
| 관련 API/데이터 | API-TOK-002, API-TOK-003 / ENT-TOK-001, ENT-THM-001 |
| 예외/실패 처리 | 대비 검사 결과 파일이 없으면 대비율 열을 `측정되지 않음`으로 표시하고 화면 상단에 경고 배너를 노출한다. |

#### FR-DOC-005 테마 토글

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DOC-005 / SCN-003 |
| 요구사항 | 사용자가 테마 토글을 조작하면, 시스템은 문서 루트의 `data-cdt-theme` 속성을 변경하고 선택을 브라우저에 유지하여야 한다. |
| 수용 기준 | AC-1: 토글 조작 후 루트 요소의 `data-cdt-theme` 값이 `dark` 또는 `light`로 바뀐다. AC-2: 새로고침 후에도 마지막 선택이 유지된다. AC-3: 저장된 선택이 없으면 `prefers-color-scheme`을 따른다. AC-4: 최초 페인트 시 테마가 뒤바뀌어 보이는 깜빡임이 발생하지 않는다. AC-5: 토글이 `role="switch"` 또는 `aria-pressed`를 노출하고 키보드로 조작 가능하다. |
| 검증 방법 | test |
| 관련 화면 | W-001, W-030 |
| 관련 API/데이터 | API-THM-001, API-DOC-001 / ENT-THM-001 |
| 예외/실패 처리 | `localStorage` 접근이 차단된 환경(프라이빗 모드, SSR)에서는 예외를 삼키고 `prefers-color-scheme`으로 대체한다. 저장 실패가 화면 렌더를 막지 않는다. |

#### FR-DOC-006 코드 스니펫 복사

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Should |
| 출처 | F-DOC-006 |
| 요구사항 | 사용자가 복사 버튼을 누르면, 시스템은 해당 예제의 소스 코드를 클립보드에 기록하고 복사 완료를 알려야 한다. |
| 수용 기준 | AC-1: 복사 후 2초 이내에 `복사됨` 상태가 표시되고 이후 원래 상태로 복귀한다. AC-2: 복사 완료가 `aria-live="polite"` 영역으로 알려진다. AC-3: Clipboard API를 사용할 수 없으면 코드 블록의 텍스트가 선택 가능한 상태로 유지되고, 복사 버튼이 `disabled`로 렌더된다. |
| 검증 방법 | test |
| 관련 화면 | W-021 |
| 관련 API/데이터 | API-DOC-001 / ENT-DOC-001 |
| 예외/실패 처리 | 클립보드 쓰기가 거부되면 오류 배너 대신 `복사할 수 없음` 상태를 버튼에 표시한다. |

#### FR-DOC-007 사용 규칙 페이지

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Should |
| 출처 | F-DOC-007 |
| 요구사항 | 시스템은 항상 상태색, 심각도, 밀도, 오버레이 선택에 대한 사용 규칙 화면을 제공하여야 한다. |
| 수용 기준 | AC-1: 각 규칙이 권장 예와 금지 예를 실제 렌더된 컴포넌트로 나란히 보여준다. AC-2: 금지 예에 금지 사유가 문장으로 기재된다. AC-3: 상태 7종과 심각도 4종 각각의 사용 시점이 기술된다. AC-4: `Dialog`와 `Drawer`의 선택 기준이 기술된다. |
| 검증 방법 | inspection |
| 관련 화면 | W-040 |
| 관련 API/데이터 | API-DOC-001 / ENT-DOC-001 |
| 예외/실패 처리 | 규칙이 없는 컴포넌트군은 화면에서 생략하고, 생략 사실을 화면 하단에 명시한다. |

### 9.6 FR-A11Y 접근성

#### FR-A11Y-001 포커스 링 일관성

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-A11Y-001 / SRC-AAP `app.css:39-42` |
| 요구사항 | 대화형 요소가 키보드 포커스를 받으면, 시스템은 `--cdt-focus-ring` 토큰의 시각 표시를 적용하여야 한다. |
| 수용 기준 | AC-1: 모든 공개 컴포넌트의 대화형 요소가 `:focus-visible`에서 동일한 `box-shadow` 계산값을 갖는다. AC-2: `outline: none`이 `:focus-visible` 대체 표시 없이 선언된 규칙이 0건이다. AC-3: 포커스 링이 두 테마 모두에서 배경 대비 3:1 이상이다. AC-4: 마우스 클릭으로 포커스를 얻은 경우 포커스 링이 표시되지 않는다. |
| 검증 방법 | test |
| 관련 화면 | W-050 |
| 관련 API/데이터 | API-PKG-002 / ENT-THM-001 |
| 예외/실패 처리 | 포커스 링이 부모의 `overflow: hidden`에 잘리면 해당 컴포넌트에 `z-index` 상승 규칙을 적용한다(SRC-AAP `.timeline-step:focus-visible` 패턴). |

#### FR-A11Y-002 키보드 도달성

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-A11Y-002 / SCN-003 |
| 요구사항 | 시스템은 항상 모든 대화형 요소를 키보드만으로 도달·조작·이탈 가능하게 하여야 한다. |
| 수용 기준 | AC-1: Tab 순서가 시각적 순서와 일치한다. AC-2: 오버레이가 닫힌 상태에서 키보드 트랩이 0건이다. AC-3: `Dialog`, `Drawer`, `DropdownMenu`, `Select`에서 Escape가 오버레이를 닫고 포커스를 트리거로 되돌린다. AC-4: `Table`, `Timeline`, `FilterBar`의 대화형 항목이 Tab 또는 방향키로 도달 가능하다. AC-5: 컴포넌트 전수에 대해 키보드 경로 테스트가 존재한다. |
| 검증 방법 | test |
| 관련 화면 | W-050 |
| 관련 API/데이터 | API-CMP-006 / — |
| 예외/실패 처리 | 오버레이 내부의 의도된 포커스 트랩은 AC-2의 예외다. Escape 또는 닫기 버튼으로 항상 이탈 경로를 제공한다. |

#### FR-A11Y-003 색상 비의존 정보 전달

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-A11Y-003 / SRC-WCAG 1.4.1 |
| 요구사항 | 시스템은 항상 상태, 심각도, 유효성 정보를 색상 외에 아이콘 또는 텍스트로 동시에 전달하여야 한다. |
| 수용 기준 | AC-1: `StatusBadge`와 `SeverityTag`가 아이콘과 텍스트를 함께 렌더한다. AC-2: 폼 오류 상태가 색상 외에 오류 메시지 텍스트와 `aria-invalid`를 갖는다. AC-3: `Meter`의 임계 초과 상태가 색상 외에 수치 텍스트를 표시한다. AC-4: 컴포넌트 전수를 그레이스케일로 렌더한 스냅샷에서 상태 구분이 유지된다. |
| 검증 방법 | test |
| 관련 화면 | W-040, W-050 |
| 관련 API/데이터 | API-CMP-004, API-CMP-008 / — |
| 예외/실패 처리 | 색상만으로 구분되는 시각이 필요하면 CR을 열고 대체 전달 수단을 함께 설계한다. |

#### FR-A11Y-004 대비율 준수

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-A11Y-004 / SRC-WCAG 1.4.3, 1.4.11 |
| 요구사항 | 시스템은 항상 본문 텍스트 4.5:1, 대형 텍스트 3:1, 비텍스트 요소 3:1 이상의 대비율을 두 테마 모두에서 만족하여야 한다. |
| 수용 기준 | AC-1: `pnpm check:contrast`가 두 테마 전체에 대해 미달 0건을 보고한다. AC-2: 미달 1건 이상이면 CI가 실패한다. AC-3: 검사 제외 토큰은 `usage: "decorative"` 메타데이터를 갖고, 제외 목록이 리포트에 출력된다. AC-4: 포커스 링과 경계 토큰이 비텍스트 3:1 기준으로 검사된다. |
| 검증 방법 | test |
| 관련 화면 | W-030, W-050 |
| 관련 API/데이터 | API-TOK-003 / ENT-THM-001, JOB-CI-001 |
| 예외/실패 처리 | 소스에서 계승한 값이 기준에 미달하면 12.1절의 교정 표에 따른다. FR-THM-005가 교정 대상을 확정한다. 표에 없는 새 위반이 발견되면 CR을 열고 값을 조정한다. |

#### FR-A11Y-005 스크린리더 지원

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-A11Y-005 / SRC-WCAG 4.1.2 |
| 요구사항 | 시스템은 항상 모든 컴포넌트가 보조기술에 role, accessible name, state를 노출하도록 하여야 한다. |
| 수용 기준 | AC-1: axe-core 검사에서 serious 이상 위반이 0건이다. AC-2: `Banner tone="danger"`가 `role="alert"`로 즉시 알려진다. AC-3: 장식용 아이콘이 `aria-hidden="true"`를 갖는다. AC-4: Radix가 제공하는 role/aria 속성을 Conductor가 덮어쓴 건수가 0건이다. AC-5: 비동기 상태 변화(`loading` → 완료)가 `aria-live` 영역 또는 `aria-busy` 전환으로 전달된다. |
| 검증 방법 | test |
| 관련 화면 | W-050 |
| 관련 API/데이터 | API-CMP-001 / JOB-CI-002 |
| 예외/실패 처리 | axe 규칙 예외가 필요하면 규칙 ID와 사유를 허용 목록 파일에 기록하고, 허용 목록을 W-050에 노출한다. |

### 9.7 FR-DX 개발자 경험과 배포

#### FR-DX-001 모노레포 빌드 순서

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DX-001 / SCN-004 |
| 요구사항 | `pnpm build`가 실행되면, 시스템은 `tokens → css → react → docs` 순서로 패키지를 빌드하여야 한다. |
| 수용 기준 | AC-1: 역방향 의존(예: `tokens`가 `react`를 참조)이 존재하면 빌드가 종료 코드 1로 실패한다. AC-2: 클린 체크아웃에서 `pnpm install && pnpm build`가 성공한다. AC-3: 전체 빌드가 3분 이내에 완료된다(4코어 기준). AC-4: 각 패키지 빌드가 선행 패키지의 산출물을 소비한다(소스 상대경로 참조 0건). |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-002) |
| 관련 API/데이터 | — / JOB-BUILD-001, JOB-BUILD-002, JOB-BUILD-003, JOB-BUILD-004 |
| 예외/실패 처리 | 한 패키지 빌드가 실패하면 후속 패키지를 실행하지 않고 실패한 패키지 이름과 로그를 출력한다. |

#### FR-DX-002 타입 정의 배포

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DX-002 |
| 요구사항 | 시스템은 항상 모든 공개 진입점에 대응하는 TypeScript 선언 파일을 배포하여야 한다. |
| 수용 기준 | AC-1: 각 패키지의 `package.json`이 `types` 또는 `exports.types` 필드를 갖는다. AC-2: 산출된 `.d.ts`에 `any` 타입이 0건이다. AC-3: 소비자 프로젝트에서 `tsc --noEmit`이 Conductor 관련 오류 0건으로 통과한다. AC-4: 내부 타입이 공개 선언 파일로 누출되지 않는다(공개 API 추출 리포트로 확인). |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-021 props 표) |
| 관련 API/데이터 | API-PKG-001, API-PKG-002, API-PKG-003 / — |
| 예외/실패 처리 | 타입 생성 실패 시 해당 패키지 배포를 중단한다. |

#### FR-DX-003 공개 진입점과 부수효과 선언

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DX-003 / SCN-001 |
| 요구사항 | 시스템은 항상 각 패키지의 `package.json` `exports` 필드에 선언된 경로로만 import를 허용하여야 한다. |
| 수용 기준 | AC-1: `@conductor-by-89soone/react/src/Button`처럼 선언되지 않은 내부 경로 import가 런타임 해석 오류를 발생시킨다. AC-2: `@conductor-by-89soone/css`가 `sideEffects: ["*.css"]`를 선언한다. AC-3: `@conductor-by-89soone/react`가 `sideEffects: false`를 선언하고, `Button` 단독 import 시 gzip 4KB 이하(React 제외)다. AC-4: `@conductor-by-89soone/css`의 부분 진입점(`./component.css`)이 `exports`에 선언된다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-002) |
| 관련 API/데이터 | API-PKG-001, API-PKG-002, API-PKG-003 / — |
| 예외/실패 처리 | 번들 크기가 기준을 초과하면 CI가 실패하고 초과 모듈 목록을 출력한다. |

#### FR-DX-004 서버 렌더링 안전성

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-DX-004 |
| 요구사항 | 시스템은 항상 모듈 최상위 실행 경로에서 `window`, `document`, `localStorage`에 접근하지 않아야 한다. |
| 수용 기준 | AC-1: Node 환경에서 `@conductor-by-89soone/react`의 모든 컴포넌트를 `renderToString`으로 렌더할 때 예외가 0건이다. AC-2: 브라우저 전역 접근이 `useEffect` 또는 이벤트 핸들러 내부에서만 발생한다. AC-3: 서버와 클라이언트의 첫 렌더 결과가 일치해 hydration 경고가 0건이다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-002) |
| 관련 API/데이터 | API-PKG-003 / — |
| 예외/실패 처리 | 테마 결정처럼 첫 페인트 전 브라우저 정보가 필요한 경우, 패키지가 전역에 접근하는 대신 소비자가 인라인 스니펫을 삽입한다(FR-THM-003 예외 처리 참조). |

#### FR-DX-005 버저닝과 변경 이력

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Should |
| 출처 | F-DX-005 |
| 요구사항 | 릴리스가 실행되면, 시스템은 semver 버전을 부여하고 변경 이력을 생성하여야 한다. |
| 수용 기준 | AC-1: 공개 API의 파괴 변경이 포함된 릴리스가 major 버전을 올린다. AC-2: 각 릴리스에 변경 항목과 관련 FR/WP ID가 기재된 변경 이력이 생성된다. AC-3: 변경 이력 항목이 없는 패키지는 버전이 오르지 않는다. AC-4: 파괴 변경 릴리스에 마이그레이션 노트가 포함된다. |
| 검증 방법 | inspection |
| 관련 화면 | 없음(간접 노출: 저장소 CHANGELOG) |
| 관련 API/데이터 | — / JOB-REL-001 |
| 예외/실패 처리 | 변경 이력 없이 병합된 변경이 발견되면 릴리스를 중단하고 누락된 변경 목록을 출력한다. |

### 9.8 FR-QA 품질 검사

#### FR-QA-001 테마 간 토큰 계약 검사

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-QA-001 / M-2 |
| 요구사항 | 시스템은 항상 다크 테마와 라이트 테마의 semantic 토큰 키 집합이 동일함을 검사하여야 한다. |
| 수용 기준 | AC-1: 두 테마 키 집합의 대칭 차집합이 비어 있지 않으면 테스트가 실패하고 누락 키를 테마별로 출력한다. AC-2: 한 테마에만 존재하는 component 토큰도 동일하게 검출된다. AC-3: 이 검사가 `pnpm test`와 CI 모두에서 실행된다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-030) |
| 관련 API/데이터 | API-TOK-002 / ENT-THM-001 |
| 예외/실패 처리 | 테마 전용 토큰이 정당하면 `themeSpecific: true` 메타데이터를 부여하고 검사에서 제외한다. 제외 목록을 리포트에 출력한다. |

#### FR-QA-002 컴포넌트 단위 검사와 AC 인용

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-QA-002 / SCN-004 |
| 요구사항 | 시스템은 항상 각 공개 컴포넌트에 대해 렌더·상호작용·공통 계약을 검증하는 단위 테스트를 보유하여야 한다. |
| 수용 기준 | AC-1: 공개 진입점에 export되었으나 테스트 파일이 없는 컴포넌트가 0건이다. AC-2: 각 FR의 AC를 검증하는 테스트 이름이 `FR-<AREA>-<번호> AC-<번호>: <설명>` 형식을 포함한다. AC-3: FR-CMP-001의 공유 계약 스위트가 공개 컴포넌트 전수에 대해 실행된다. AC-4: `pnpm test`가 종료 코드 0으로 통과한다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-050) |
| 관련 API/데이터 | API-PKG-003 / — |
| 예외/실패 처리 | 테스트 없는 컴포넌트가 export되면 빌드 전 검사가 실패하고 컴포넌트 이름을 출력한다. |

#### FR-QA-003 자동 접근성 검사

| 항목 | 내용 |
| --- | --- |
| 상태 | approved |
| 우선순위 | Must |
| 출처 | F-QA-003 / M-4 |
| 요구사항 | CI 파이프라인이 실행되면, 시스템은 공개 컴포넌트 전수에 대해 axe-core 검사를 수행하고 serious 이상 위반이 있으면 실패하여야 한다. |
| 수용 기준 | AC-1: 각 컴포넌트의 주요 상태(기본, hover 불가 상태, disabled, 오류, 열림)에 대해 검사가 실행된다. AC-2: serious 또는 critical 위반이 1건 이상이면 CI가 종료 코드 1을 반환한다. AC-3: 검사가 다크 테마와 라이트 테마 모두에서 실행된다. AC-4: 허용된 예외가 규칙 ID와 사유와 함께 파일로 관리된다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-050) |
| 관련 API/데이터 | — / JOB-CI-002 |
| 예외/실패 처리 | 허용 목록에 없는 새 위반이 나타나면 CI를 실패시킨다. 허용 목록 추가는 접근성 검토자 승인을 필요로 한다. |

#### FR-QA-004 시각 회귀 검사

| 항목 | 내용 |
| --- | --- |
| 상태 | deferred (OD-002, 2026-07-10 종결: REL-004로 이월. v1 릴리스 게이트에 포함하지 않는다) |
| 우선순위 | Should |
| 출처 | F-QA-004 / M-1 |
| 요구사항 | 시각 회귀 검사가 활성화된 경우, 시스템은 기준 컴포넌트 12개를 두 테마로 렌더해 기준 이미지와 비교하고 픽셀 차이 1%를 초과하면 실패하여야 한다. |
| 수용 기준 | AC-1: 비교 대상이 컴포넌트 12개 × 테마 2종 = 24개 스냅샷이다. AC-2: 픽셀 차이 1% 초과 시 CI가 실패하고 차이 이미지를 아티팩트로 남긴다. AC-3: 기준 이미지 갱신이 명시적 커맨드(`pnpm test:visual --update`)로만 가능하다. AC-4: 렌더 환경(브라우저 버전, 폰트)이 컨테이너 이미지로 고정된다. |
| 검증 방법 | test |
| 관련 화면 | 없음(간접 노출: W-050) |
| 관련 API/데이터 | — / JOB-CI-003 |
| 예외/실패 처리 | 폰트 렌더 차이로 diff가 불안정하면 OD-002에 따라 이 FR을 REL-004로 이월하고, v1은 수동 시각 확인으로 대체한다. 이월 시 이 FR의 상태를 `deferred`로 표시한다. |

## 10. 외부 인터페이스 요구사항

이 제품에는 런타임 외부 시스템 연동이 없다. 외부 인터페이스는 다음 세 가지 경계로 한정된다.

| 경계 | 상대 | 계약 | 관련 FR |
| --- | --- | --- | --- |
| npm 레지스트리 | 패키지 배포 대상 | `package.json`의 `name`, `version`, `exports`, `sideEffects`, `peerDependencies` | FR-DX-003, FR-DX-005 |
| React peer dependency | 소비자 애플리케이션 | React 18 또는 19의 `^18.0.0 \|\| ^19.0.0` 범위 | FR-CMP-001, FR-DX-004 |
| Radix UI | 헤드리스 접근성 프리미티브 | 정확한 버전 고정. `data-*` 속성 셀렉터만 사용 | FR-CMP-006, ADR-004 |
| lucide-react peer dependency | 아이콘 제공자 | 아이콘 컴포넌트를 props로 주입받는다. Conductor는 아이콘을 번들하지 않는다 | FR-CMP-004 |

## 11. 데이터 및 추적성 요구사항

이 제품에는 데이터베이스가 없다. "데이터"는 토큰 스키마와 문서 사이트가 소비하는 빌드 산출물을 의미한다.

1. 토큰 소스(`ENT-TOK-001`)는 키, 계층, 값 또는 참조, 용도(`usage`), 설명 필드를 갖는다.
2. 테마 팔레트(`ENT-THM-001`)는 테마 이름과 semantic 키 → 값 매핑을 갖는다.
3. 컴포넌트 메타데이터(`ENT-CMP-001`)는 컴포넌트 이름, props 타입, variant/tone 목록, 관련 FR ID를 갖는다.
4. 모든 커밋과 PR 본문은 관련 `WP-###`와 `FR-<AREA>-###`를 `Refs:` 줄에 기재한다.
5. 각 테스트 이름은 검증하는 FR과 AC를 인용한다(FR-QA-002 AC-2).
6. 구현 완료 시 `docs/40_delivery/conductor_implementation_traceability.md`의 WP 상태와 요구사항-코드 매핑을 갱신한다.

## 12. 비기능 요구사항

### NFR-001 성능

| 지표 | 목표 | 측정 방법 | 관련 화면/API |
| --- | --- | --- | --- |
| `Button` 단독 import gzip 크기 (React 제외) | 4KB 이하 | 번들 분석 리포트 (`pnpm size`) | API-PKG-003 |
| `@conductor-by-89soone/css` 전체 gzip 크기 | 20KB 이하 | 빌드 산출물 측정 | API-PKG-002 |
| 문서 사이트 LCP (p75, 로컬 프로덕션 빌드, Fast 3G 스로틀) | 2.5초 이하 | Lighthouse CI | W-001 |
| `pnpm build` 전체 소요 시간 (4코어) | 3분 이하 | CI 잡 소요 시간 | JOB-BUILD-001~004 |
| 테마 전환 후 재페인트 완료 시간 | 100ms 이하 | Performance API 측정 | W-030 |

### NFR-002 보안

| 지표 | 목표 | 측정 방법 | 비고 |
| --- | --- | --- | --- |
| 배포 산출물의 런타임 외부 네트워크 요청 | 0건 | 문서 사이트 프로덕션 빌드의 네트워크 패널 관찰 | 원격 폰트·원격 스크립트 금지 |
| 의존성 취약점 (severity high 이상) | 0건 | `pnpm audit --audit-level high` | 릴리스 전제 조건 |
| 산출물에 포함된 비밀값 | 0건 | 시크릿 스캐너 CI 잡 | — |
| npm 배포 인증 | OIDC 기반 토큰. 장기 토큰 미사용 | 릴리스 워크플로 검사 | JOB-REL-001 |

### NFR-003 접근성

| 지표 | 목표 | 측정 방법 | 비고 |
| --- | --- | --- | --- |
| WCAG 준수 레벨 | 2.1 AA | 대비 검사 + axe-core + 수동 키보드 검증 | 두 테마 모두 |
| 본문 텍스트 대비율 | 4.5:1 이상 | `pnpm check:contrast` | FR-A11Y-004 |
| 대형 텍스트 및 비텍스트 대비율 | 3:1 이상 | `pnpm check:contrast` | 포커스 링·경계 포함 |
| axe-core serious 이상 위반 | 0건 | `pnpm test:a11y` | 컴포넌트 전수 × 테마 2종 |
| 키보드 도달 가능한 대화형 요소 비율 | 100% | 컴포넌트별 키보드 경로 테스트 | FR-A11Y-002 |

### NFR-004 운영성

| 지표 | 목표 | 측정 방법 | 비고 |
| --- | --- | --- | --- |
| 릴리스 롤백 소요 시간 | 10분 이내 | 이전 태그 승격 절차 실행 시간 측정 | npm dist-tag 조작 |
| 파괴 변경 시 마이그레이션 노트 동반률 | 100% | 릴리스 검사 | FR-DX-005 AC-4 |
| CI 전체 소요 시간 | 10분 이하 | CI 잡 소요 시간 | 빌드 + 테스트 + 검사 |
| 공개 API의 `any` 노출 | 0건 | API 추출 리포트 | FR-DX-002 AC-2 |
| 순환 패키지 의존 | 0건 | 의존성 그래프 검사 | FR-DX-001 AC-1 |

### 12.1 대비 검사 정책과 소스 계승 토큰 교정 표

OD-001(2026-07-10 종결)이 확정한 정책이다. 소스 팔레트를 실측한 결과 WCAG 2.1 AA 기준 미달 5건이 발견되었다. **최소 수정** 방침을 적용한다: 접근성 결함인 두 항목의 값을 교정하고, 나머지는 `usage` 메타데이터로 검사 대상을 정확히 분류하되 값을 보존한다.

교정 대상 (값을 바꾼다) — FR-THM-005가 강제한다:

| 토큰 | 소스 값 | 교정 값 | 다크 대비율 (교정 전 → 후) | 근거 |
| --- | --- | --- | --- | --- |
| `focusRing` | accent alpha 0.30 | accent alpha 0.80 | `surface.base` 1.50 → 3.93 / `surface.raised` 2.58(0.6 기준) → 3.56 | WCAG 2.4.11 포커스 표시자는 3:1을 만족해야 한다. 장식으로 분류할 수 없다 |
| `border.control` (신규) | 없음 (소스는 `border.default` 사용) | slate `#94a3b8` alpha 0.60 | `surface.raised` 1.30 → 3.23 | WCAG 1.4.11. 폼 컨트롤 경계는 컴포넌트 식별에 필수다 |

용도 분류 (값을 보존한다):

| 토큰 | 값 | `usage` | 다크 대비율 | 사용 제약 |
| --- | --- | --- | --- | --- |
| `text.primary` | `#f4f7fb` | `body` | 14.40 ~ 18.32 | 제약 없음 |
| `text.secondary` | `#c5cfdd` | `body` | 9.83 ~ 12.51 | 제약 없음 |
| `text.muted` | `#8290a3` | `body` | 4.76 ~ 6.06 | 제약 없음 |
| `text.faint` | `#5f6d80` | `decorative` | 2.94 ~ 3.74 | 본문 금지. `surface.elevated` 위 사용 금지(2.94). 메타·타임스탬프·플레이스홀더 전용 |
| `border.subtle` | slate alpha 0.10 | `decorative` | 1.13 | WCAG 1.4.11 예외: 카드/패널 경계는 표면색 차이로 이미 식별 가능하다 |
| `border.default` | slate alpha 0.18 | `decorative` | 1.30 | 위와 같다. 폼 컨트롤에는 `border.control`을 쓴다 |
| `border.strong` | slate alpha 0.30 | `decorative` | 1.69 | 위와 같다 |
| `accent` | `#6d7cff` | `body` | 4.40 ~ 5.60 | `surface.elevated` 위 본문 사용 금지(4.40). 대형 텍스트와 비텍스트는 허용 |
| `status.queued` | `#64748b` | `nonText` | 3.25 ~ 3.56 | 아이콘과 텍스트 병기 필수(FR-A11Y-003). `surface.raised` 3.56, `surface.elevated` 3.25로 기준 충족 |
| `status.neutralEnd` | `#94a3b8` | `nonText` (CR-035) | 6.61 (`badge.marker.background`) | 아이콘과 텍스트 병기 필수. 점/마커 전용, 텍스트 전경 금지. CP-042로 검사한다. CR-006은 소스 값 `#475569`(2.04 ~ 2.60)를 보존하는 대가로 `decorative` 분류와 WCAG 1.4.11 예외를 택했고, 그 대가는 "다크 테마에서 종료 상태 점이 흐리게 읽힌다"는 승인된 제약이었다. CR-035가 값을 `slate.400`으로 올려 그 예외를 폐기했다. 마커는 채움이 아니라 링으로 그려 queued의 채운 점과 형태로도 구분된다 |
| `status.running` / `waiting` / `success` / `partial` / `danger` | — | `body` | 4.50 ~ 8.84 | 제약 없음 |
| `meter.normal` / `warning` / `exceeded` | — | `body` | 6.13 ~ 10.15 | 제약 없음 |
| `severity.read` / `write` / `destructive` / `blocked` | — | `body` (배경 용도) | 전경으로 쓴 흰 텍스트 기준 4.67 ~ 9.32 | 배경 전용. 전경색으로 쓰면 `surface.raised` 위에서 1.69 ~ 3.38으로 미달한다 |

| `dataviz.series.*` / `dataviz.sequential.*` (5.14절) | 25키 | `nonText` | 다크 6.27 ~ 12.58 / 라이트 3.28 ~ 10.25 | 차트 채움 전용(그래픽 객체). 색 단독으로 정보를 전달하지 않는다 — 범례·직접 라벨·표 대체를 병기한다(WCAG 1.4.1; 표 대체는 소비 제품 몫). 범주형 색끼리의 대비는 요구하지 않는다. 세 표면(`base`·`canvas`·`raised`)에 대해 CP-043~CP-117로 검사한다(CR-036) |
라이트 테마의 동일 토큰도 같은 `usage` 분류를 상속하며, 각 기준을 독립적으로 만족해야 한다(FR-THM-002 AC-3, FR-A11Y-004 AC-1).

### NFR-005 호환성

| 지표 | 목표 | 측정 방법 | 비고 |
| --- | --- | --- | --- |
| 브라우저 지원 | Chrome/Firefox/Safari/Edge 최근 2개 메이저 | Browserslist + CI 매트릭스 | `@layer`와 `:focus-visible` 지원 필요 |
| React 버전 | 18 및 19 | peer dependency 범위 + CI 매트릭스 | — |
| Node 버전 | 20 이상 | `engines` 필드 + CI 매트릭스 | 빌드 환경 |

## 13. 우선순위와 릴리스 전략

- **Must**: FR-TOK-001 ~ FR-TOK-007, FR-THM-001 ~ FR-THM-005, FR-CSS-001 ~ FR-CSS-005, FR-CMP-001 ~ FR-CMP-008, FR-DOC-001 ~ FR-DOC-005, FR-A11Y-001 ~ FR-A11Y-005, FR-DX-001 ~ FR-DX-004, FR-QA-001 ~ FR-QA-003
- **Should**: FR-TOK-008, FR-TOK-009, FR-CMP-009, FR-DOC-006, FR-DOC-007, FR-DX-005
- **Deferred (REL-004)**: FR-QA-004 — OD-002에 따라 v1 릴리스 게이트에서 제외
- **Could**: 없음
- **Won't (이번 범위)**: 4.3 Out of Scope 표 전체

## 14. 오픈 결정 사항

| 결정 ID | 질문 | 차단하는 FR | 담당 | 기한 | 상태 |
| --- | --- | --- | --- | --- | --- |
| OD-001 | 대비율 검사 대상 전경/배경 쌍을 어떻게 정의하는가? 소스 팔레트에서 WCAG 2.1 AA 미달 5건이 실측되었다 | FR-THM-004, FR-A11Y-004 | Accessibility Reviewer | REL-001 착수 전 | **closed (2026-07-10)** |
| OD-002 | 시각 회귀 검사를 v1 릴리스 게이트에 포함하는가? | FR-QA-004 (Should) | QA | REL-003 착수 시점 | **closed (2026-07-10)** |
| OD-003 | 필터/칩 컴포넌트군(F-CMP-010)을 v1에 넣는가? | 없음 (FR 미부여) | Product | REL-003 종료 | open |
| OD-004 | 셸 컴포넌트군을 `@conductor-by-89soone/react`에 넣는가, 문서 사이트 내부 컴포넌트로 두는가? | FR-CMP-009 (Should) | System Maintainer | REL-003 착수 시점 | **closed (2026-07-10)** |

### 14.1 종결된 결정

- **OD-001 → 최소 수정**: 접근성 결함인 `focusRing`과 폼 컨트롤 경계만 값을 교정하고, 나머지는 `usage` 메타데이터로 분류하되 값을 보존한다. 12.1절 표가 결정 내용이며 FR-THM-005가 이를 강제한다. 근거: 포커스 표시자(WCAG 2.4.11)는 장식으로 분류할 수 없어 값 보존이 불가능하고, 카드 경계는 표면색 차이로 식별되므로 WCAG 1.4.11 예외에 해당한다. 전면 조정은 `text.faint`를 `text.muted`와 구분 불가능하게 만들고 제품 목표 G-1(시각 보존)과 M-1(시각 회귀 1%)을 동시에 깨뜨린다.
- **OD-002 → REL-004로 이월**: 시각 회귀 검사(FR-QA-004)를 v1 릴리스 게이트에서 제외한다. 폰트 렌더 차이로 diff가 불안정해질 위험(R-2)이 v1 일정 위험보다 크다. v1은 수동 시각 확인으로 대체한다. FR-QA-004의 상태를 `deferred`로 표시한다. 결과: M-1은 v1에서 자동 측정되지 않으며, REL-004 완료 시점에 처음 측정된다.
- **OD-004 → 패키지에 포함**: 셸 컴포넌트군(C-070 ~ C-072)을 `@conductor-by-89soone/react`에 포함한다. `renderLink` props로 링크 렌더를 위임하면 라우팅 비종속 API가 성립한다(FR-CMP-009 AC-1, AC-2). 소스의 사이드 내비와 상단바는 Conductor 시각 언어에서 가장 특징적인 표면이다. WP-023을 실행한다.

### 14.2 baseline 전 확인

- **OD-001이 종결되어 Must FR인 FR-THM-004와 FR-A11Y-004를 더 이상 차단하지 않는다.** 모든 Must 우선순위 FR에 차단하는 open OD가 없다.
- OD-003은 FR이 부여되지 않은 후보(F-CMP-010)에만 관련되므로 baseline을 막지 않는다. REL-003 종료 시점에 결정한다.
- 이 문서의 `baseline` 승격은 사용자 승인으로만 이루어진다.
