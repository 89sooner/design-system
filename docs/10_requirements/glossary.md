# Conductor Design System 용어집

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-17

## 1. 목적

이 문서는 Conductor Design System 도메인 용어의 단일 정의를 제공한다. 요구사항 문장, UI 라벨, 공개 API 이름, 토큰 이름, 패키지 이름은 모두 이 문서의 표준 용어에서 파생된다. 문서 간 용어가 어긋나면 이 문서를 먼저 고치고 cascade한다.

## 2. 용어 표

### 2.1 토큰 도메인

| 용어(한글 표준) | 영문/코드 표준 | 정의 | 금지 동의어 | 관련 ID |
| --- | --- | --- | --- | --- |
| 디자인 토큰 | `design token` | 시각적 결정을 이름-값 쌍으로 고정한 단일 단위. 색·타이포·간격·반경·고도·모션 값을 코드와 문서가 공유하는 유일한 출처 | 변수, 스타일값, 컬러 코드 | FR-TOK-001 |
| 토큰 소스 | `token source` | 사람이 편집하는 토큰 원본 파일. 빌드 산출물이 아니라 입력물 | 원본 CSS, 소스 스타일 | FR-TOK-001, ENT-TOK-001 |
| 프리미티브 토큰 | `primitive token` | 의미를 갖지 않는 원시 값. 예: `blue-500`, `space-4`. 소비자가 직접 참조하지 않는다 | raw token, base token, core token | FR-TOK-002 |
| 시맨틱 토큰 | `semantic token` | 제품 의미를 갖는 토큰. 프리미티브 토큰을 참조한다. 예: `surface.base`, `status.danger` | alias token, 의미 토큰 | FR-TOK-002 |
| dataviz 토큰 | `dataviz token` | 차트 계열 구분에 쓰는 시맨틱 색 토큰. 범주형(`dataviz.series.*`)은 계열 정체성만 나타내고 순서형(`dataviz.sequential.*`)은 단일 색조 명도 램프다. 모두 `nonText`이며 색 단독으로 정보를 전달하지 않는다 | 차트색, 시리즈 컬러, 팔레트 | FR-TOK-005 |
| 컴포넌트 토큰 | `component token` | 특정 컴포넌트에만 적용되는 토큰. 시맨틱 토큰을 참조한다. 예: `button.primary.background` | 로컬 토큰, private token | FR-TOK-002 |
| 토큰 참조 | `token alias` | 한 토큰이 다른 토큰의 값을 가리키는 관계. 순환 참조는 빌드 오류다 | 별칭, 링크, 포인터 | FR-TOK-003 |
| 토큰 계층 | `token tier` | 프리미티브 → 시맨틱 → 컴포넌트로 이어지는 3단계 참조 방향 | 레벨, 티어 | FR-TOK-002 |
| 토큰 접두사 | `token prefix` | 모든 CSS 커스텀 프로퍼티에 붙는 고정 접두사 `--cdt-` | 네임스페이스, prefix | FR-TOK-004 |
| 토큰 빌드 | `token build` | 토큰 소스를 CSS·TypeScript·JSON 산출물로 변환하는 실행 | 트랜스파일, 컴파일 | JOB-BUILD-001 |

### 2.2 테마 도메인

| 용어(한글 표준) | 영문/코드 표준 | 정의 | 금지 동의어 | 관련 ID |
| --- | --- | --- | --- | --- |
| 테마 | `theme` | 동일한 시맨틱 토큰 집합에 대해 서로 다른 값을 제공하는 팔레트 묶음 | 스킨, 모드, 컬러셋 | FR-THM-001 |
| 다크 테마 | `dark theme` | 기준(canonical) 테마. 모든 시맨틱 토큰의 정의 기준이 된다 | 나이트 모드, 어두운 모드 | FR-THM-001 |
| 라이트 테마 | `light theme` | 다크 테마와 동일한 시맨틱 토큰 키를 갖는 두 번째 팔레트 | 화이트 모드, 밝은 모드 | FR-THM-002 |
| 테마 속성 | `theme attribute` | 테마를 선택하는 DOM 속성 `data-cdt-theme` | 클래스, 플래그 | FR-THM-003 |
| 대비율 | `contrast ratio` | WCAG 2.1이 정의한 두 색상 간 상대 휘도 비율 | 명암비, 컨트라스트 | FR-A11Y-004 |

### 2.3 스타일·컴포넌트 도메인

| 용어(한글 표준) | 영문/코드 표준 | 정의 | 금지 동의어 | 관련 ID |
| --- | --- | --- | --- | --- |
| 스타일 레이어 | `style layer` | CSS `@layer`로 구분된 캐스케이드 구간. `reset` → `base` → `layout` → `component` → `utility` 순서 | 스타일 계층, 스택 | FR-CSS-001 |
| 표면 | `surface` | 콘텐츠가 놓이는 배경 평면. 깊이에 따라 base/canvas/subtle/raised/elevated로 나뉜다 | 배경, 백그라운드 | FR-TOK-002 |
| 고도 | `elevation` | 표면이 배경에서 떠 있는 정도를 그림자로 표현한 값 | 그림자, 쉐도우, depth | FR-TOK-002 |
| 강조색 | `accent` | 제품의 주 브랜드 색. 기본 액션과 선택 상태에 쓰인다 | primary, 메인 컬러, 포인트 컬러 | FR-TOK-002 |
| 상태색 | `status color` | 실행 상태(대기·진행·보류·성공·부분성공·위험·종료)를 표현하는 색 | 스테이터스, 상태 컬러 | FR-TOK-005 |
| 심각도 | `severity` | 동작이 외부에 미치는 영향 등급(read·write·destructive·blocked) | 위험도, 레벨, 등급 | FR-TOK-005 |
| 밀도 | `density` | 단위 면적당 정보량. Conductor는 본문 14px·행 높이 1.5 기준의 조밀한 운영 화면을 기준 밀도로 삼는다 | 컴팩트니스, 촘촘함 | FR-CSS-002 |
| 포커스 링 | `focus ring` | 키보드 포커스를 표시하는 외곽선. 모든 대화형 요소에 동일한 토큰이 적용된다 | 아웃라인, 포커스 테두리 | FR-A11Y-001 |
| 헤드리스 프리미티브 | `headless primitive` | 접근성 동작만 제공하고 시각 스타일을 갖지 않는 외부 컴포넌트. Conductor는 Radix UI를 사용한다 | 언스타일드 컴포넌트, 베이스 컴포넌트 | ADR-004 |
| 프리미티브 컴포넌트 | `primitive component` | 도메인 지식을 갖지 않는 재사용 컴포넌트. Conductor가 배포하는 단위 | 공통 컴포넌트, 아톰 | FR-CMP-001 |
| 컴포넌트 계약 | `component contract` | 컴포넌트의 props, variant, 이벤트, 접근성 책임을 고정한 공개 규격 | 인터페이스, 스펙, API | API-CMP-001 |
| variant | `variant` | 컴포넌트의 시각적 변종을 선택하는 props 값. 예: `Button variant="primary"` | 타입, 스타일, 종류 | FR-CMP-002 |
| tone | `tone` | 의미 색상을 선택하는 props 값. 예: `Badge tone="danger"` | 컬러, 색상, intent | FR-CMP-004 |

### 2.4 배포·문서 도메인

| 용어(한글 표준) | 영문/코드 표준 | 정의 | 금지 동의어 | 관련 ID |
| --- | --- | --- | --- | --- |
| 소비자 | `consumer` | Conductor 패키지를 설치해 제품을 만드는 애플리케이션 또는 그 개발자 | 사용처, 클라이언트 앱, 유저 | FR-DX-001 |
| 진입점 | `entry point` | 패키지가 공개하는 import 경로. `package.json`의 `exports`에 선언된 경로만 공개 API다 | export, 엔트리, 임포트 경로 | API-PKG-001 |
| 문서 사이트 | `docs site` | 토큰·컴포넌트·패턴을 조회하고 실행 예제를 확인하는 웹 애플리케이션 | 스토리북, 가이드, 포털 | FR-DOC-001 |
| 라이브 프리뷰 | `live preview` | 문서 사이트에서 컴포넌트를 실제 DOM으로 렌더링해 보여주는 영역 | 데모, 샌드박스, 플레이그라운드 | FR-DOC-003 |
| 토큰 참조 페이지 | `token reference` | 모든 토큰의 이름·값·테마별 값·용도를 조회하는 문서 사이트 화면 | 토큰 목록, 컬러 시트 | FR-DOC-004 |
| 시각 회귀 검사 | `visual regression test` | 컴포넌트 렌더 결과 이미지를 기준 이미지와 비교해 차이를 검출하는 자동 검사 | 스냅샷 테스트, VRT | FR-QA-004 |
| 릴리스 | `release` | 버전이 부여된 패키지 묶음이 레지스트리에 배포되는 사건 | 배포, 퍼블리시, 출시 | JOB-REL-001 |

## 3. 네이밍 규칙

1. **CSS 커스텀 프로퍼티**: `--cdt-<카테고리>-<의미>[-<변형>]`. 모두 소문자 kebab-case. 예: `--cdt-surface-raised`, `--cdt-status-running`, `--cdt-motion-fast`.
2. **토큰 소스 키**: 점 표기 계층. 예: `surface.raised`, `status.running`, `motion.fast`. CSS 이름은 점을 하이픈으로 치환해 기계적으로 생성한다.
3. **TypeScript export**: 토큰 소스 키를 camelCase 중첩 객체로 노출한다. 예: `tokens.surface.raised`.
4. **CSS 클래스**: `cdt-<블록>[__<요소>][--<변형>]`. 예: `cdt-btn`, `cdt-btn--primary`, `cdt-card__header`.
5. **React 컴포넌트**: PascalCase 단수형. 파일명은 컴포넌트명과 동일. 예: `Button.tsx` → `export function Button`.
6. **패키지**: `@conductor-by-89soone/<역할>` 소문자 단수형. `@conductor-by-89soone/tokens`, `@conductor-by-89soone/css`, `@conductor-by-89soone/react`.
7. **props**: 시각 변종은 `variant`, 의미 색상은 `tone`, 크기는 `size`. 다른 이름을 새로 만들지 않는다.
8. **금지**: 축약형 식별자(`btn` 대신 `Button`), 동의어 혼용, 테마 이름을 값에 하드코딩하는 토큰(`--cdt-dark-surface`).

## 4. 운영 원칙

1. FR에 등장하는 모든 도메인 명사는 이 표에 존재해야 한다.
2. 용어 변경은 CR을 통해 진행하고 요구사항 → UI → 토큰 → 컴포넌트 → 문서 순으로 cascade한다.
3. 금지 동의어를 발견하면 표준 용어로 치환한다. 코드 리뷰에서 금지 동의어는 변경 요청 사유가 된다.
4. `primary`는 `accent`의 금지 동의어지만, `Button variant="primary"`는 컴포넌트 variant 이름으로 예외 허용한다. 색상 토큰 이름에는 `primary`를 쓰지 않는다.
