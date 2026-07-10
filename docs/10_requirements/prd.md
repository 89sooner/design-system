# Conductor Design System PRD

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 문서 개요

- 문서명: Conductor Design System 제품 요구사항 문서
- 대상 독자: Product, Design, Engineering, QA, Accessibility, Release
- 상위 문서: `srs_final.md` (충돌 시 SRS가 우선한다)
- 근거 문서: `feature.md`, `glossary.md`

## 2. 제품 목표

Conductor Design System(이하 Conductor)은 `agent-ai-platform`의 `packages/web`에서 실증된 "조밀하고 차분한 운영용 다크 인터페이스"를 재사용 가능한 패키지 3종과 문서 사이트로 추출한다.

- **G-1 시각 보존**: agent-ai-platform이 확립한 색·밀도·고도·모션 언어를 손실 없이 옮긴다. 다크 테마의 렌더 결과는 소스와 시각적으로 동일해야 한다.
- **G-2 의미 계층 확보**: 하드코딩된 값을 프리미티브 → 시맨틱 → 컴포넌트 3계층 토큰으로 재구성해, 팔레트를 교체해도 컴포넌트 코드가 바뀌지 않게 한다.
- **G-3 두 번째 테마 증명**: 라이트 테마를 추가해 토큰 계층이 실제로 테마를 분리하는지 검증한다. 라이트 테마는 계층 설계의 테스트 케이스다.
- **G-4 접근성 기준선**: 색상 단독 정보 전달을 제거하고 WCAG 2.1 AA 대비율을 두 테마 모두에서 만족시킨다.
- **G-5 소비 가능성**: 새 애플리케이션이 `pnpm add @conductor/react`만으로 Conductor의 시각을 얻을 수 있게 한다.

### 2.1 비목표 (Non-goals)

- **NG-1**: 디자인 도구(Figma) 연동. 토큰 소스는 코드가 유일한 출처다.
- **NG-2**: React 외 프레임워크 어댑터. 비-React 소비자는 `@conductor/css`를 직접 사용한다.
- **NG-3**: agent-ai-platform의 도메인 컴포넌트(`.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`) 이식. 재사용되지 않는 결합을 만든다.
- **NG-4**: agent-ai-platform 저장소를 Conductor로 마이그레이션하는 작업. Conductor v1은 독립 저장소로만 성립한다. 마이그레이션은 별도 제품 결정이다.
- **NG-5**: 차트/데이터 시각화 라이브러리.
- **NG-6**: 런타임 토큰 편집기, 고대비 테마, 다국어 문자열 시스템.

## 3. 대상 사용자

| 사용자 유형 | 목표 | 주요 작업 | 권한/제약 |
| --- | --- | --- | --- |
| 소비자 개발자 (Consumer Developer) | 새 제품 화면을 Conductor 시각으로 구현한다 | 패키지 설치, 컴포넌트 import, 토큰 참조, 문서 사이트 조회 | 공개 진입점만 사용 가능. 내부 경로 import 불가 |
| 디자인 시스템 관리자 (System Maintainer) | 토큰과 컴포넌트를 변경하고 배포한다 | 토큰 소스 편집, 컴포넌트 추가, 대비 검사 통과, 릴리스 | 파괴 변경은 major 버전과 마이그레이션 노트 필요 |
| 코딩 에이전트 (Coding Agent) | 문서만 읽고 구현·검증한다 | 작업 패키지 실행, DoD 검증, 추적 원장 갱신 | 문서에 없는 범위를 코드로 만들지 않는다 |
| 접근성 검토자 (Accessibility Reviewer) | 두 테마의 접근성 준수를 확인한다 | 대비 리포트 확인, axe 결과 확인, 키보드 경로 확인 | 위반 1건 이상이면 릴리스 게이트를 막을 수 있다 |

## 4. 성공 지표

| 지표 | 목표 | 측정 방법 |
| --- | --- | --- |
| M-1 시각 일치도 | 다크 테마 기준, Conductor로 재구성한 12개 컴포넌트의 시각 회귀 비교 결과 픽셀 차이 1% 이하 | `pnpm test:visual`의 diff 비율 |
| M-2 테마 키 대칭 | 다크/라이트 두 테마의 시맨틱 토큰 키 집합 차이 0개 | `pnpm test`의 토큰 계약 테스트 |
| M-3 대비 준수 | 정의된 전경/배경 쌍 중 WCAG 2.1 AA 미달 0건 (두 테마 모두) | `pnpm check:contrast` 리포트 |
| M-4 접근성 위반 | axe-core 심각도 serious 이상 위반 0건 (컴포넌트 전수) | `pnpm test:a11y` |
| M-5 소비 경로 | 빈 Vite React 앱에서 설치부터 첫 화면 렌더까지 명령 3개 이하 | 문서 사이트 Getting Started 절차 실행 |
| M-6 타입 안전성 | 공개 API의 `any` 노출 0건 | `pnpm typecheck` + API 추출 리포트 |
| M-7 번들 비용 | `@conductor/react`의 `Button` 단독 import 시 gzip 4KB 이하 (React 제외) | 번들 분석 리포트 |

## 5. 범위

### 5.1 In Scope

| 범위 항목 | 관련 FR 그룹 |
| --- | --- |
| 3계층 디자인 토큰 소스와 CSS/TS/JSON 산출 빌드 | FR-TOK-001 ~ FR-TOK-009 |
| 다크(기준) + 라이트 테마, 시스템 설정 연동 | FR-THM-001 ~ FR-THM-004 |
| 캐스케이드 레이어 기반 프레임워크 비종속 스타일시트 | FR-CSS-001 ~ FR-CSS-005 |
| React 프리미티브 컴포넌트 6개 군 (액션·표면·상태·데이터·오버레이·폼) + 피드백 + 셸 | FR-CMP-001 ~ FR-CMP-009 |
| 문서 사이트 (Foundations, 컴포넌트 카탈로그, 토큰 참조, 테마 토글, 사용 규칙) | FR-DOC-001 ~ FR-DOC-007 |
| WCAG 2.1 AA 기준선 (포커스·키보드·색상 비의존·대비·스크린리더) | FR-A11Y-001 ~ FR-A11Y-005 |
| 모노레포 빌드, 타입 배포, 진입점 선언, SSR 안전성, 버저닝 | FR-DX-001 ~ FR-DX-005 |
| 토큰 계약·단위·접근성·시각 회귀 검사 | FR-QA-001 ~ FR-QA-004 |

### 5.2 Conditional Scope

| 범위 항목 | 포함 조건 | 결정 기한 | 관련 ID |
| --- | --- | --- | --- |
| 시각 회귀 검사(FR-QA-004) | CI 러너에서 브라우저 렌더가 결정론적으로 재현될 때. 폰트 렌더 차이로 diff가 불안정하면 REL-004로 이월 | REL-003 착수 시점 | OD-002 |
| 필터/칩 컴포넌트군(F-CMP-010) | REL-003 종료 시점에 잔여 용량이 있을 때 | REL-003 종료 | OD-003 |
| 셸 컴포넌트군(FR-CMP-009) | 라우팅 비종속 API가 성립할 때. 라우터 결합이 불가피하면 문서 사이트 내부 컴포넌트로 강등 | REL-003 착수 시점 | OD-004 |

### 5.3 Out of Scope

| 제외 항목 | 제외 사유 |
| --- | --- |
| Figma 양방향 동기화 | 외부 도구 의존과 DTCG 포맷 채택이 선행되어야 한다. v1의 토큰 소스는 코드다 |
| Vue / Svelte / Web Components 어댑터 | 현재 소비자는 React 단일. `@conductor/css`가 비-React 대안을 제공한다 |
| Tailwind preset | ADR-002가 Vanilla CSS + 커스텀 프로퍼티를 확정했다. preset은 소비자를 Tailwind에 결속한다 |
| 자체 아이콘 세트 | `lucide-react`를 peer dependency로 둔다. 아이콘 디자인은 v1 목표가 아니다 |
| 차트/데이터 시각화 컴포넌트 | 독립적이고 큰 범위. `Meter`/`ProgressRing`까지만 포함한다 |
| 고대비 테마 | 팔레트 3벌 유지 비용을 회피한다. 다크/라이트 2종으로 확정 |
| 다국어 문자열 시스템 | 컴포넌트는 문자열을 props로 받는다. 번역은 소비자 책임이다 |
| 런타임 테마 편집기 | 문서 사이트의 테마 토글까지만 포함한다 |
| agent-ai-platform 도메인 컴포넌트 이식 | 두 번째 제품이 같은 패턴을 요구하기 전까지는 재사용 근거가 없다 |
| agent-ai-platform 저장소 마이그레이션 | Conductor v1은 독립 저장소로만 성립한다 |

## 6. 핵심 사용자 시나리오

### SCN-001 소비자 개발자가 새 앱에 Conductor를 적용한다

- 시작 조건: 빈 Vite + React + TypeScript 프로젝트가 있다.
- 기본 흐름:
  1. `pnpm add @conductor/react @conductor/css @conductor/tokens`
  2. 진입 파일에서 `import "@conductor/css"` 한 줄을 추가한다.
  3. 루트 요소에 `data-cdt-theme="dark"`를 붙인다.
  4. `import { Button } from "@conductor/react"`로 첫 컴포넌트를 렌더한다.
- 대체 흐름: React를 쓰지 않는 경우 `@conductor/css`만 설치하고 `cdt-btn cdt-btn--primary` 클래스를 직접 쓴다.
- 오류 흐름: `@conductor/css`를 import하지 않으면 컴포넌트가 스타일 없이 렌더된다. 개발 빌드에서 토큰 미주입을 감지해 콘솔 경고를 1회 출력한다.
- 관련 요구사항: FR-DX-003, FR-CSS-001, FR-THM-003, FR-CMP-001

### SCN-002 관리자가 상태색 하나를 바꾼다

- 시작 조건: `status.waiting`의 채도를 낮추기로 결정했다.
- 기본 흐름:
  1. `packages/tokens/src/palette.dark.ts`와 `palette.light.ts`에서 해당 프리미티브 값을 수정한다.
  2. `pnpm build`가 CSS/TS/JSON 산출물을 재생성한다.
  3. `pnpm check:contrast`가 두 테마의 대비율을 재계산한다.
  4. `pnpm test:visual`이 영향을 받는 컴포넌트의 시각 차이를 보고한다.
- 오류 흐름: 대비율이 기준 미달이면 빌드가 실패하고, 위반 쌍의 이름·측정값·기준값을 출력한다.
- 관련 요구사항: FR-TOK-003, FR-THM-004, FR-A11Y-004, FR-QA-004

### SCN-003 접근성 검토자가 라이트 테마를 승인한다

- 시작 조건: 라이트 팔레트 초안이 병합되었다.
- 기본 흐름:
  1. 문서 사이트 `/tokens`에서 테마를 라이트로 전환한다.
  2. 각 토큰 행의 대비율과 판정 결과를 확인한다.
  3. `/components/*`에서 상태 배지가 색 외에 아이콘과 텍스트를 갖는지 확인한다.
  4. 키보드만으로 모든 컴포넌트의 대화형 요소에 도달한다.
- 오류 흐름: 위반 발견 시 릴리스 게이트를 차단하고 CR을 연다.
- 관련 요구사항: FR-DOC-004, FR-DOC-005, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004

### SCN-004 코딩 에이전트가 작업 패키지 하나를 완료한다

- 시작 조건: 선행 WP가 모두 `done`이다.
- 기본 흐름:
  1. `conductor_work_packages.md`에서 다음 WP를 고르고, 그 WP가 참조하는 ID의 문서만 읽는다.
  2. 구현 범위 안에서만 코드를 작성한다.
  3. DoD의 검증 명령을 실행한다.
  4. `conductor_implementation_traceability.md`의 WP 상태와 요구사항-코드 매핑을 갱신한다.
- 오류 흐름: 문서와 현실이 충돌하면 `DEV-###`를 등록하고 `CR-###`를 열어 정지한다.
- 관련 요구사항: FR-DX-001, FR-QA-002

## 7. 기능 요구사항 요약

| 요구사항 ID | 요약 | 우선순위 | 근거 |
| --- | --- | --- | --- |
| FR-TOK-001 | 토큰 소스를 단일 위치에 둔다 | Must | F-TOK-001 |
| FR-TOK-002 | 토큰을 3계층으로 나누고 참조 방향을 강제한다 | Must | F-TOK-002 |
| FR-TOK-003 | 토큰 참조를 해석하고 순환 참조를 차단한다 | Must | F-TOK-003 |
| FR-TOK-004 | `--cdt-` 접두사 CSS 커스텀 프로퍼티를 산출한다 | Must | F-TOK-004 |
| FR-TOK-005 | 상태 7종·심각도 4종·미터 3종 토큰을 제공한다 | Must | F-TOK-005 |
| FR-TOK-006 | 타입이 붙은 TypeScript 객체와 JSON을 산출한다 | Must | F-TOK-006 |
| FR-TOK-007 | 7단계 타이포 스케일을 토큰화한다 | Must | F-TOK-007 |
| FR-TOK-008 | 6단계 z-index 스케일을 토큰화한다 | Should | F-TOK-008 |
| FR-TOK-009 | 3단계 브레이크포인트를 토큰화한다 | Should | F-TOK-009 |
| FR-THM-001 | 다크 테마를 기준 팔레트로 정의한다 | Must | F-THM-001 |
| FR-THM-002 | 라이트 테마를 동일 키 집합으로 정의한다 | Must | F-THM-002 |
| FR-THM-003 | 속성 우선·시스템 설정 후순위로 테마를 결정한다 | Must | F-THM-003 |
| FR-THM-004 | 테마별 대비율을 빌드 시 검증한다 | Must | F-THM-004 |
| FR-CSS-001 | 캐스케이드 레이어 5단을 선언하고 `!important`를 쓰지 않는다 | Must | F-CSS-001 |
| FR-CSS-002 | 리셋/베이스 레이어를 제공한다 | Must | F-CSS-002 |
| FR-CSS-003 | 레이아웃 프리미티브 클래스를 제공한다 | Must | F-CSS-003 |
| FR-CSS-004 | 컴포넌트 클래스를 `cdt-` 접두사로 제공한다 | Must | F-CSS-004 |
| FR-CSS-005 | 모션 감소 설정을 존중한다 | Must | F-CSS-005 |
| FR-CMP-001 | 모든 컴포넌트가 공통 계약을 지킨다 | Must | F-CMP-001 |
| FR-CMP-002 | 액션 컴포넌트군을 제공한다 | Must | F-CMP-002 |
| FR-CMP-003 | 표면 컴포넌트군을 제공한다 | Must | F-CMP-003 |
| FR-CMP-004 | 상태 표시 컴포넌트군을 제공한다 | Must | F-CMP-004 |
| FR-CMP-005 | 데이터 표시 컴포넌트군을 제공한다 | Must | F-CMP-005 |
| FR-CMP-006 | 오버레이 컴포넌트군을 Radix 위에 제공한다 | Must | F-CMP-006 |
| FR-CMP-007 | 폼 컴포넌트군을 제공한다 | Must | F-CMP-007 |
| FR-CMP-008 | 피드백 컴포넌트군을 제공한다 | Must | F-CMP-008 |
| FR-CMP-009 | 셸 컴포넌트군을 제공한다 | Should | F-CMP-009 |
| FR-DOC-001 | 문서 사이트 셸을 제공한다 | Must | F-DOC-001 |
| FR-DOC-002 | Foundations 페이지를 빌드 산출물에서 생성한다 | Must | F-DOC-002 |
| FR-DOC-003 | 컴포넌트 카탈로그에 라이브 프리뷰를 제공한다 | Must | F-DOC-003 |
| FR-DOC-004 | 토큰 참조 페이지에 테마별 값과 대비율을 표시한다 | Must | F-DOC-004 |
| FR-DOC-005 | 테마 토글과 선택 유지를 제공한다 | Must | F-DOC-005 |
| FR-DOC-006 | 코드 스니펫을 클립보드로 복사한다 | Should | F-DOC-006 |
| FR-DOC-007 | 상태·심각도·밀도 사용 규칙 페이지를 제공한다 | Should | F-DOC-007 |
| FR-A11Y-001 | 모든 대화형 요소에 동일 포커스 링을 적용한다 | Must | F-A11Y-001 |
| FR-A11Y-002 | 키보드만으로 모든 대화형 요소에 도달한다 | Must | F-A11Y-002 |
| FR-A11Y-003 | 색 외에 아이콘과 텍스트로 상태를 전달한다 | Must | F-A11Y-003 |
| FR-A11Y-004 | WCAG 2.1 AA 대비율을 두 테마에서 만족한다 | Must | F-A11Y-004 |
| FR-A11Y-005 | 스크린리더에 role/name/state를 노출한다 | Must | F-A11Y-005 |
| FR-DX-001 | 모노레포를 의존 순서대로 빌드한다 | Must | F-DX-001 |
| FR-DX-002 | 공개 API에 타입 정의를 배포한다 | Must | F-DX-002 |
| FR-DX-003 | 공개 진입점과 부수효과를 선언한다 | Must | F-DX-003 |
| FR-DX-004 | 서버 렌더링 환경에서 동작한다 | Must | F-DX-004 |
| FR-DX-005 | semver와 변경 이력을 자동 생성한다 | Should | F-DX-005 |
| FR-QA-001 | 테마 간 토큰 키 대칭을 검사한다 | Must | F-QA-001 |
| FR-QA-002 | 컴포넌트 단위 테스트가 AC를 인용한다 | Must | F-QA-002 |
| FR-QA-003 | axe-core 위반 0건을 CI에서 강제한다 | Must | F-QA-003 |
| FR-QA-004 | 시각 회귀 차이를 CI에서 보고한다 | Should | F-QA-004 |

## 8. 비기능 요구사항 요약

- **성능**: `Button` 단독 import gzip 4KB 이하(React 제외). 문서 사이트 첫 화면 LCP p75 2.5초 이하(로컬 프로덕션 빌드, Fast 3G 스로틀). `pnpm build` 전체 3분 이하.
- **접근성**: WCAG 2.1 AA. 본문 대비 4.5:1, 대형 텍스트·비텍스트 3:1. axe-core serious 이상 위반 0건.
- **보안**: 배포 산출물에 원격 폰트·원격 스크립트·네트워크 요청 0건. 의존성 취약점 high 이상 0건.
- **호환성**: 최근 2개 메이저 버전의 Chrome/Firefox/Safari/Edge. React 18 및 19. Node 20 이상.
- **운영성**: 릴리스 롤백 10분 이내. 파괴 변경 시 마이그레이션 노트 동반.
- **유지보수성**: 공개 API의 `any` 노출 0건. 순환 패키지 의존 0건.

## 9. 아키텍처 및 실행 환경 가정

- pnpm workspace 모노레포. 패키지 의존 방향은 `tokens → css → react → docs` 단방향이다.
- 스타일 엔진은 Vanilla CSS + CSS 커스텀 프로퍼티로 확정한다(ADR-002). CSS-in-JS와 Tailwind를 도입하지 않는다.
- 접근성 동작은 Radix UI 헤드리스 프리미티브에 위임한다(ADR-004). 포커스 트랩·키보드 내비게이션을 자체 구현하지 않는다.
- 아이콘은 `lucide-react`를 peer dependency로 둔다.
- 백엔드 런타임·데이터베이스·큐·인증 서버가 없다. 이 제품은 배포되는 것이 애플리케이션이 아니라 npm 패키지와 정적 문서 사이트다. `backend_architecture.md`, `api_contracts.md`, `data_model.md`, `async_events_jobs.md`는 각각 빌드 파이프라인·패키지 공개 API·토큰 스키마·CI 잡으로 재해석해 작성한다.
- 문서 사이트는 정적 사이트로 빌드해 배포한다. 서버 사이드 로직이 없다.

## 10. 리스크

| 리스크 | 영향 | 가능성 | 완화 방안 | 담당 |
| --- | --- | --- | --- | --- |
| R-1 라이트 테마가 다크 전용 시각 장치(글래스, 글로우, 반투명 경계)를 재현하지 못한다 | 높음 | 높음 | 시맨틱 토큰에 alpha 경계 대신 solid 경계 대안 키를 두고, 라이트 팔레트에서 elevation을 그림자 대신 경계 대비로 표현한다. REL-002에서 12개 컴포넌트로 조기 검증한다 | System Maintainer |
| R-2 시각 회귀 검사가 폰트 렌더 차이로 불안정해진다 | 중간 | 높음 | 컨테이너 고정 + 폰트 번들 고정. 불안정하면 OD-002에 따라 REL-004로 이월하고 수동 시각 확인으로 대체한다 | QA |
| R-3 Radix 버전 업그레이드가 DOM 구조를 바꿔 CSS가 깨진다 | 중간 | 중간 | Radix를 정확한 버전으로 고정하고, `data-*` 속성 셀렉터만 사용한다. 구조 셀렉터(`>`, `:nth-child`) 사용을 금지한다 | System Maintainer |
| R-4 소스의 `!important`와 전역 `*` 셀렉터를 그대로 옮기면 소비자 CSS와 충돌한다 | 높음 | 중간 | `@layer`로 캐스케이드를 낮추고 `!important`를 제거한다(FR-CSS-001). 전역 리셋은 `cdt.reset` 레이어에 격리한다 | System Maintainer |
| R-5 토큰 이름을 소스 그대로 쓰면(`--surface-base`) 소비자 변수와 충돌한다 | 중간 | 중간 | `--cdt-` 접두사를 강제하고 빌드 검사로 접두사 없는 산출을 차단한다(FR-TOK-004) | System Maintainer |
| R-6 컴포넌트 범위가 소스의 도메인 컴포넌트로 번진다 | 높음 | 중간 | F-X-009로 명시 제외. 작업 패키지 DoD에 "도메인 결합 없음"을 넣는다 | Product |
| R-7 대비율 검사가 다크 테마의 기존 색을 실패시킨다 (예: `--text-faint: #5f6d80` on `--surface-base: #080b12`) | 높음 | 높음 | 대비 실패 토큰은 "본문 금지, 장식/보조 전용" 용도 제약을 토큰 메타데이터에 기록하고 검사 대상 쌍을 용도별로 정의한다. 용도가 본문이면 값을 조정한다. OD-001로 관리 | Accessibility Reviewer |

## 11. 릴리스 전략

- **P0 (REL-001, REL-002)**: 토큰 소스·빌드·두 테마·스타일 레이어·핵심 컴포넌트 6개 군. 이것 없이는 제품이 성립하지 않는다.
- **P1 (REL-003)**: 문서 사이트 전체, 셸 컴포넌트군, 코드 복사, 사용 규칙 페이지, 자동 접근성 검사.
- **P2 (REL-004)**: 시각 회귀 검사, 릴리스 자동화, 필터/칩 컴포넌트군.

## 12. 오픈 결정 사항

| 결정 ID | 질문 | 결정 | 결정일 | 담당 | 상태 |
| --- | --- | --- | --- | --- | --- |
| OD-001 | 대비율 검사 대상 전경/배경 쌍을 어떻게 정의하는가? 소스 팔레트에서 WCAG 2.1 AA 미달 5건이 실측되었다 | **최소 수정**: `focusRing`(alpha 0.30 → 0.80)과 신규 `border.control`(slate alpha 0.60)만 값을 교정하고, `text.faint`·`border.*`는 `decorative`로, `status.queued`·`status.neutralEnd`는 `nonText`로 분류해 값을 보존한다. `srs_final.md` 12.1절이 확정 표이며 FR-THM-005가 강제한다 | 2026-07-10 | Accessibility Reviewer | closed |
| OD-002 | 시각 회귀 검사를 v1 릴리스 게이트에 포함하는가? | **REL-004로 이월**. FR-QA-004를 `deferred`로 표시한다. v1은 수동 시각 확인으로 대체한다. R-2(폰트 렌더 flake)가 v1 일정 위험보다 크다 | 2026-07-10 | QA | closed |
| OD-003 | 필터/칩 컴포넌트군(F-CMP-010)을 v1에 넣는가? | (a) 포함 (b) v1.1로 이월 | REL-003 종료 | Product | open |
| OD-004 | 셸 컴포넌트군을 배포 패키지에 넣는가, 문서 사이트 내부 컴포넌트로 두는가? | **`@conductor/react`에 포함**. `renderLink` props로 라우팅 비종속 API가 성립한다. WP-023을 실행한다 | 2026-07-10 | System Maintainer | closed |

Must 우선순위 FR을 차단하는 open OD: **없음.** OD-001이 2026-07-10에 종결되어 FR-THM-004와 FR-A11Y-004의 차단이 해제되었다. OD-003은 FR이 부여되지 않은 후보에만 관련되므로 baseline을 막지 않는다.

### 12.1 OD-001이 드러낸 사실

소스 팔레트를 실측한 결과, `agent-ai-platform`의 포커스 링(`rgba(109,124,255,0.3)`)은 `surface.base` 위에서 대비율 1.50으로 WCAG 2.4.11의 3:1 요건을 만족하지 못한다. 이는 계승해서는 안 되는 접근성 결함이다. Conductor는 이 값을 alpha 0.80으로 교정하고(3.93), 폼 컨트롤 경계에 쓰이던 `border.default`(1.30)를 신규 `border.control`(3.23)로 분리한다. 나머지 미달 토큰은 실제 용도(장식, 비텍스트)에 맞게 분류하여 값을 보존한다. G-1(시각 보존)의 의도된 예외이며, 이 예외는 로드맵의 알려진 제약에 기록되었다.
