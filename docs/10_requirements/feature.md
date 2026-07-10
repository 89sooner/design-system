# Conductor Design System 기능 후보 문서

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 목적

이 문서는 Conductor Design System의 후보 기능을 수집하고 정규화한다. 이 문서는 승인된 범위가 아니며, `srs_final.md` 또는 `prd.md`에 반영된 항목만 구현 범위가 된다. 후보가 승인되면 상태를 갱신하고 관련 FR ID를 기록한다.

출처 표기:
- `SRC-AAP`: `/home/roqkf/agent-ai-platform` 저장소의 `packages/web/src/styles/tokens.css` 및 `app.css` 실측 분석
- `SRC-USER`: 2026-07-10 사용자 결정 (이름 Conductor, 산출물 3종, 다크 우선 + 라이트, Vanilla CSS + 커스텀 프로퍼티)
- `SRC-WCAG`: WCAG 2.1 AA 기준

## 2. 기능 후보

### 2.1 TOK — 토큰

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-TOK-001 | 토큰 소스 단일화 | 시각 값을 한 곳에서 정의한다 | SRC-AAP tokens.css 전체 | `packages/tokens/src/tokens.ts` | 소스가 모든 산출물의 유일한 입력이 된다 | 소스 외 위치의 하드코딩 값은 빌드 검사에서 실패 | Type A | P0 | 승인 | FR-TOK-001 |
| F-TOK-002 | 3계층 토큰 구조 | 원시 값과 의미를 분리해 테마를 교체한다 | SRC-AAP는 시맨틱 계층만 존재 | 토큰 소스 | primitive → semantic → component 참조 방향 강제 | 역방향/순환 참조는 빌드 오류 | Type C | P0 | 승인 | FR-TOK-002 |
| F-TOK-003 | 토큰 참조(alias) 해석 | 값 중복 없이 토큰을 재사용한다 | SRC-AAP `--surface-2: var(--surface-subtle)` | 토큰 빌드 | 참조를 해석해 최종 값을 산출 | 순환 참조 검출 시 빌드 중단 | Type B | P0 | 승인 | FR-TOK-003 |
| F-TOK-004 | CSS 커스텀 프로퍼티 산출 | 어떤 스택에서도 토큰을 쓴다 | SRC-USER Vanilla CSS 결정 | `@conductor/tokens/tokens.css` | `--cdt-*` 변수 선언 파일 생성 | 접두사 없는 변수 산출 금지 | Type A | P0 | 승인 | FR-TOK-004 |
| F-TOK-005 | 상태/심각도 토큰군 | 실행 상태와 부작용 등급을 색으로 구분한다 | SRC-AAP `--status-*`, `--severity-*`, `--meter-*` | 토큰 소스 | 7종 상태색, 4종 심각도색, 3종 미터색 제공 | 색상 단독 전달 금지(FR-A11Y-003) | Type A | P0 | 승인 | FR-TOK-005 |
| F-TOK-006 | TypeScript/JSON 산출 | 런타임과 도구에서 토큰을 읽는다 | SRC-AAP에 없음 (신규) | `@conductor/tokens` import | 타입이 붙은 중첩 객체와 JSON 파일 생성 | 타입 생성 실패 시 빌드 중단 | Type B | P0 | 승인 | FR-TOK-006 |
| F-TOK-007 | 타이포 스케일 토큰화 | 글자 크기를 값이 아닌 이름으로 쓴다 | SRC-AAP는 14/13/12/11/10px 하드코딩 | 토큰 소스 | 7단계 타입 스케일 토큰 제공 | 스케일 밖 크기 사용 시 린트 경고 | Type C | P0 | 승인 | FR-TOK-007 |
| F-TOK-008 | z-index 스케일 토큰화 | 겹침 순서를 예측 가능하게 만든다 | SRC-AAP는 20/25/30/40/50/60/100/200 하드코딩 | 토큰 소스 | 6단계 z-index 토큰 제공 | 토큰 밖 z-index 사용 시 린트 경고 | Type C | P1 | 승인 | FR-TOK-008 |
| F-TOK-009 | 브레이크포인트 토큰화 | 반응형 기준점을 공유한다 | SRC-AAP는 1080/800/560px 하드코딩 | 토큰 소스 | 3단계 브레이크포인트 토큰 제공 | CSS 변수는 미디어쿼리에서 동작하지 않음 → 빌드 시 치환 | Type C | P1 | 승인 | FR-TOK-009 |

### 2.2 THM — 테마

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-THM-001 | 다크 테마(기준) | 소스 프로젝트의 시각을 그대로 보존한다 | SRC-AAP `color-scheme: dark` | `[data-cdt-theme="dark"]` | 다크 팔레트 값 적용 | 기준 테마이므로 시맨틱 키 정의의 출처 | Type A | P0 | 승인 | FR-THM-001 |
| F-THM-002 | 라이트 테마 | 밝은 환경에서도 같은 제품을 쓴다 | SRC-USER 결정 | `[data-cdt-theme="light"]` | 동일 시맨틱 키에 라이트 값 적용 | 다크에만 존재하는 토큰 키가 있으면 빌드 오류 | Type C | P0 | 승인 | FR-THM-002 |
| F-THM-003 | 테마 선택과 시스템 연동 | OS 설정을 따르거나 수동 고정한다 | SRC-AAP에 없음 (신규) | `data-cdt-theme` 속성 / `prefers-color-scheme` | 속성이 있으면 속성 우선, 없으면 시스템 설정 | 서버 렌더링 시 최초 페인트 깜빡임 방지 필요 | Type C | P0 | 승인 | FR-THM-003 |
| F-THM-004 | 테마 대비 검증 | 두 테마 모두 판독 가능함을 보장한다 | SRC-WCAG | 토큰 빌드 후 검사 | 정의된 전경/배경 쌍의 대비율을 계산해 리포트 | 기준 미달 쌍이 있으면 빌드 실패 | Type B | P0 | 승인 | FR-THM-004, FR-A11Y-004 |

### 2.3 CSS — 스타일 레이어

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-CSS-001 | 캐스케이드 레이어 정의 | 소비자 CSS가 항상 이길 수 있게 한다 | SRC-AAP는 `!important` 사용(`app.css:956`) | `@conductor/css/index.css` | `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility` 선언 | 라이브러리 CSS에 `!important` 금지 | Type C | P0 | 승인 | FR-CSS-001 |
| F-CSS-002 | 베이스/리셋 레이어 | 브라우저 기본값을 정규화한다 | SRC-AAP `app.css:2-128` | 스타일시트 import | box-sizing, 폰트, 포커스, 스크롤바, 선택 영역 정규화 | 폰트는 원격 로드하지 않음 | Type A | P0 | 승인 | FR-CSS-002 |
| F-CSS-003 | 레이아웃 프리미티브 | 화면 골격을 재사용한다 | SRC-AAP `.app-shell`, `.split-layout`, `.card-grid`, `.page` | CSS 클래스 | 셸/스플릿/그리드/페이지 클래스 제공 | 도메인 전용 레이아웃(`.thread-page` 등)은 제외 | Type C | P0 | 승인 | FR-CSS-003 |
| F-CSS-004 | 컴포넌트 클래스 레이어 | React 없이도 같은 시각을 얻는다 | SRC-AAP `.btn`, `.card`, `.badge`, `.table`, `.timeline` | CSS 클래스 | 프리미티브 컴포넌트별 클래스 제공 | 클래스는 `cdt-` 접두사 필수 | Type C | P0 | 승인 | FR-CSS-004 |
| F-CSS-005 | 모션과 감소 모드 | 움직임 민감 사용자를 보호한다 | SRC-AAP `tokens.css:88-93`, `app.css:1150-1153` | 전역 CSS | `prefers-reduced-motion` 시 전환/애니메이션 0ms | 전역 `*` 셀렉터 사용은 성능 검토 대상 | Type A | P0 | 승인 | FR-CSS-005 |

### 2.4 CMP — React 컴포넌트

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-CMP-001 | 컴포넌트 공통 계약 | 모든 컴포넌트가 같은 규칙을 따른다 | SRC-AAP 컴포넌트별 규칙 불일치 | `@conductor/react` | ref 전달, `className` 병합, `data-*` 통과, 네이티브 props 확장 | 계약 위반 컴포넌트는 배포 차단 | Type C | P0 | 승인 | FR-CMP-001 |
| F-CMP-002 | 액션 컴포넌트군 | 사용자가 동작을 실행한다 | SRC-AAP `.btn`, `.btn-primary`, `.btn-icon`, `.btn.policy-disabled` | `Button`, `IconButton` | variant/tone/size/loading/disabled 지원 | 정책 차단 상태는 사유 텍스트 동반 필수 | Type C | P0 | 승인 | FR-CMP-002 |
| F-CMP-003 | 표면 컴포넌트군 | 콘텐츠를 묶어 배치한다 | SRC-AAP `.card`, `.interactive-card`, `.card-grid` | `Card`, `CardGrid`, `Panel` | 정적/대화형 카드, 그리드 배치 | 대화형 카드는 키보드 도달 필수 | Type C | P0 | 승인 | FR-CMP-003 |
| F-CMP-004 | 상태 표시 컴포넌트군 | 상태와 심각도를 읽는다 | SRC-AAP `.badge`, `--status-*`, `--severity-*` | `Badge`, `StatusBadge`, `SeverityTag` | tone별 색 + 아이콘 + 텍스트 동시 제공 | 색상 단독 전달 금지 | Type C | P0 | 승인 | FR-CMP-004, FR-A11Y-003 |
| F-CMP-005 | 데이터 표시 컴포넌트군 | 목록과 이력을 조회한다 | SRC-AAP `.table`, `.timeline`, `.num`, `.mono` | `Table`, `Timeline`, `CodeBlock`, `Kbd` | 조밀 표, 이력 타임라인, 숫자 정렬, 코드 블록 | 표는 가로 스크롤 컨테이너를 자체 소유 | Type C | P0 | 승인 | FR-CMP-005 |
| F-CMP-006 | 오버레이 컴포넌트군 | 맥락을 잃지 않고 부가 작업을 한다 | SRC-AAP `.drawer`, `.radix-overlay`, `.TooltipContent` | `Dialog`, `Drawer`, `Tooltip`, `DropdownMenu` | Radix 기반 포커스 트랩·ESC 닫기·스크롤 잠금 | 자체 포커스 트랩을 새로 구현하지 않는다 | Type C | P0 | 승인 | FR-CMP-006 |
| F-CMP-007 | 폼 컴포넌트군 | 값을 입력하고 선택한다 | SRC-AAP `input`, `.input-glass`, `.SelectTrigger`, `.SwitchRoot`, `.form-label` | `TextField`, `TextArea`, `Select`, `Switch`, `Checkbox`, `Field` | 라벨·설명·오류를 `aria-describedby`로 연결 | 라벨 없는 입력 요소 렌더 금지 | Type C | P0 | 승인 | FR-CMP-007 |
| F-CMP-008 | 피드백 컴포넌트군 | 진행·비어있음·오류를 인지한다 | SRC-AAP `.banner-error`, `.warn-box`, `.empty-state`, `.progress-ring`, `.linear-progress-*` | `Banner`, `EmptyState`, `Meter`, `ProgressRing`, `Spinner` | 5종 상태 표현 제공 | 오류 배너는 복구 액션 슬롯 필수 | Type C | P0 | 승인 | FR-CMP-008 |
| F-CMP-009 | 셸 컴포넌트군 | 앱 골격을 세운다 | SRC-AAP `.app-shell`, `.app-nav`, `.app-topbar` | `AppShell`, `NavList`, `TopBar` | 사이드 내비 + 상단바 + 본문 영역 | 라우팅 라이브러리를 강제하지 않는다 | Type C | P1 | 승인 | FR-CMP-009 |
| F-CMP-010 | 필터/칩 컴포넌트군 | 목록을 좁힌다 | SRC-AAP `.filter-bar`, `.suggestion-chip` | `FilterBar`, `Chip` | `aria-pressed` 토글 칩 제공 | — | Type C | P2 | 보류 | — |

### 2.5 DOC — 문서 사이트

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-DOC-001 | 문서 사이트 셸 | 문서를 탐색한다 | SRC-USER 산출물 결정 | `apps/docs` | 사이드 내비 + 본문 + 테마 토글 | 문서 사이트는 `@conductor/react`를 소비자로서 사용 | Type C | P0 | 승인 | FR-DOC-001 |
| F-DOC-002 | Foundations 페이지 | 토큰의 의미를 배운다 | SRC-AAP 토큰 구조 | `/foundations/*` | 색·타이포·간격·반경·고도·모션 페이지 | 값은 토큰 빌드 산출물에서 읽어 렌더 | Type C | P0 | 승인 | FR-DOC-002 |
| F-DOC-003 | 컴포넌트 카탈로그 | 컴포넌트를 실제로 본다 | SRC-USER 산출물 결정 | `/components/:id` | 라이브 프리뷰 + props 표 + 사용 규칙 | 데코레이션용 가짜 스크린샷 금지 | Type C | P0 | 승인 | FR-DOC-003 |
| F-DOC-004 | 토큰 참조 페이지 | 토큰 이름을 검색한다 | SRC-AAP에 없음 (신규) | `/tokens` | 이름·값·테마별 값·대비율 표 | 값은 빌드 산출물에서 생성 | Type C | P0 | 승인 | FR-DOC-004 |
| F-DOC-005 | 테마 토글 | 두 테마를 나란히 확인한다 | SRC-USER 결정 | 문서 사이트 상단바 | `data-cdt-theme` 전환, 선택 유지 | localStorage 사용 시 SSR 안전성 확보 | Type C | P0 | 승인 | FR-DOC-005 |
| F-DOC-006 | 코드 스니펫 복사 | 예제를 코드에 옮긴다 | SRC-AAP에 없음 (신규) | 프리뷰 하단 | 클립보드 복사와 복사 완료 알림 | 클립보드 API 미지원 시 선택 가능한 텍스트로 대체 | Type A | P1 | 승인 | FR-DOC-006 |
| F-DOC-007 | 사용 규칙 페이지 | 오용을 피한다 | SRC-AAP 상태/심각도 규칙 | `/patterns/*` | 상태·심각도·밀도·오버레이 사용 규칙 | — | Type C | P1 | 승인 | FR-DOC-007 |

### 2.6 A11Y — 접근성

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-A11Y-001 | 포커스 링 일관성 | 키보드 위치를 항상 안다 | SRC-AAP `app.css:39-42` | `:focus-visible` | 모든 대화형 요소에 동일 포커스 링 | `outline: none` 단독 사용 금지 | Type A | P0 | 승인 | FR-A11Y-001 |
| F-A11Y-002 | 키보드 도달성 | 마우스 없이 조작한다 | SRC-WCAG 2.1.1 | 모든 컴포넌트 | Tab/Shift+Tab/Enter/Space/Escape/방향키 처리 | 키보드 트랩 금지(오버레이 제외) | Type C | P0 | 승인 | FR-A11Y-002 |
| F-A11Y-003 | 색상 비의존 정보 전달 | 색각 이상 사용자도 상태를 읽는다 | SRC-WCAG 1.4.1 | 상태/심각도 컴포넌트 | 색 + 아이콘 + 텍스트 라벨 동시 제공 | 색만으로 구분하는 시각 금지 | Type C | P0 | 승인 | FR-A11Y-003 |
| F-A11Y-004 | 대비율 준수 | 저시력 사용자도 읽는다 | SRC-WCAG 1.4.3, 1.4.11 | 토큰 빌드 검사 | 본문 4.5:1, 대형/비텍스트 3:1 이상 | 두 테마 모두 통과해야 릴리스 | Type B | P0 | 승인 | FR-A11Y-004 |
| F-A11Y-005 | 스크린리더 지원 | 비시각 사용자가 조작한다 | SRC-WCAG 4.1.2 | 모든 컴포넌트 | role/name/state 노출, 라이브 리전 제공 | Radix가 제공하는 것을 덮어쓰지 않는다 | Type C | P0 | 승인 | FR-A11Y-005 |

### 2.7 DX — 개발자 경험 / 배포

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-DX-001 | 모노레포 빌드 | 패키지를 한 번에 빌드한다 | SRC-AAP pnpm workspace 구조 | `pnpm build` | tokens → css → react → docs 순서 빌드 | 순환 의존 금지 | Type A | P0 | 승인 | FR-DX-001 |
| F-DX-002 | 타입 정의 배포 | 타입 오류를 컴파일 시 잡는다 | SRC-AAP TypeScript 사용 | `.d.ts` 산출물 | 모든 공개 API에 타입 제공 | `any` 노출 금지 | Type A | P0 | 승인 | FR-DX-002 |
| F-DX-003 | 진입점과 부수효과 선언 | 번들 크기를 통제한다 | SRC-AAP에 없음 (신규) | `package.json` `exports`, `sideEffects` | 선언된 경로만 import 가능 | CSS는 `sideEffects`에 포함 | Type A | P0 | 승인 | FR-DX-003 |
| F-DX-004 | SSR 안전성 | 서버 렌더링 환경에서 동작한다 | SRC-USER 문서 사이트 요구 | 모든 컴포넌트 | 모듈 최상위에서 `window`/`document` 접근 금지 | 브라우저 API는 effect 내부에서만 | Type C | P0 | 승인 | FR-DX-004 |
| F-DX-005 | 버저닝과 변경 이력 | 업그레이드 영향을 예측한다 | SRC-AAP에 없음 (신규) | Changesets | semver + 변경 이력 자동 생성 | 공개 API 파괴 변경은 major | Type A | P1 | 승인 | FR-DX-005 |

### 2.8 QA — 품질 검사

| 기능 ID | 기능명 | 사용자 목표 | 출처/근거 | 진입점 | 시스템 반응 | 예외/제약 | 실현 방식 | 릴리스 후보 | 상태 | 관련 FR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-QA-001 | 토큰 계약 검사 | 테마 간 키 누락을 막는다 | SRC-USER 라이트 테마 추가 결정 | `pnpm test` | 두 테마의 시맨틱 키 집합 동일성 검사 | 불일치 시 실패 | Type B | P0 | 승인 | FR-QA-001 |
| F-QA-002 | 컴포넌트 단위 검사 | 회귀를 막는다 | SRC-AAP에 컴포넌트 테스트 없음 | `pnpm test` | 렌더·상호작용·계약 테스트 | 각 FR의 AC를 테스트 이름에 인용 | Type B | P0 | 승인 | FR-QA-002 |
| F-QA-003 | 자동 접근성 검사 | 접근성 위반을 조기에 잡는다 | SRC-WCAG | CI | axe-core로 컴포넌트별 위반 0건 검증 | 예외는 사유와 함께 허용 목록에 기록 | Type B | P0 | 승인 | FR-QA-003 |
| F-QA-004 | 시각 회귀 검사 | 의도치 않은 시각 변경을 잡는다 | SRC-AAP에 없음 (신규) | CI | 컴포넌트×테마 렌더 이미지 비교 | 기준 이미지 갱신은 리뷰 필요 | Type B | P1 | 승인 | FR-QA-004 |

## 3. 제외 후보

명시적 제외는 구현 에이전트의 과잉 구현을 막는다.

| 후보 ID | 후보명 | 제외 사유 | 재검토 조건 |
| --- | --- | --- | --- |
| F-X-001 | Figma 양방향 동기화 | 사용자가 2026-07-10에 산출물 범위에서 제외. 외부 도구 의존성과 W3C DTCG 포맷 채택이 선행되어야 함 | 토큰 소스가 DTCG 포맷으로 안정화된 이후 | 
| F-X-002 | Vue / Svelte / Web Components 어댑터 | 소비자가 React 단일. `@conductor/css`가 프레임워크 비종속 대안을 이미 제공 | React 외 소비자 애플리케이션이 실재할 때 |
| F-X-003 | Tailwind preset 제공 | 사용자가 Vanilla CSS + 커스텀 프로퍼티를 스타일 엔진으로 확정(ADR-002). preset은 소비자를 Tailwind에 결속 | 소비자가 Tailwind를 채택하고 `--cdt-*` 변수 직접 참조로 부족할 때 |
| F-X-004 | 자체 아이콘 세트 제작 | 아이콘 디자인은 디자인 시스템 v1 목표가 아님. `lucide-react`를 peer dependency로 둔다 | 브랜드 아이콘 요구가 생길 때 |
| F-X-005 | 차트/데이터 시각화 컴포넌트 | 범위가 독립적이고 크다. `ProgressRing`/`Meter`까지만 포함 | 별도 패키지 `@conductor/charts`로 분리 검토 |
| F-X-006 | 고대비(High Contrast) 테마 | 사용자가 다크 + 라이트 2종으로 확정. 팔레트 3벌 유지 비용 회피 | WCAG AAA 요구가 생길 때 |
| F-X-007 | 다국어(i18n) 문자열 시스템 | 컴포넌트는 문자열을 props로 받는다. 번역은 소비자 책임 | 컴포넌트 내부 고정 문자열이 생길 때 |
| F-X-008 | 런타임 테마 편집기 | 문서 사이트의 테마 토글(F-DOC-005)까지만 포함. 임의 토큰 값을 런타임에 바꾸는 편집기는 제외 | 디자이너가 직접 팔레트를 실험할 필요가 확인될 때 |
| F-X-009 | 도메인 컴포넌트 이식 | `.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid` 등은 agent-ai-platform 도메인 전용. 디자인 시스템에 올리면 재사용되지 않는 결합이 생긴다 | 두 번째 제품이 같은 패턴을 요구할 때 |

## 4. 기능군 요약

| 기능군 | 후보 수 | 승인 | 보류 | 제외 |
| --- | --- | --- | --- | --- |
| TOK 토큰 | 9 | 9 | 0 | 0 |
| THM 테마 | 4 | 4 | 0 | 0 |
| CSS 스타일 레이어 | 5 | 5 | 0 | 0 |
| CMP 컴포넌트 | 10 | 9 | 1 | 0 |
| DOC 문서 사이트 | 7 | 7 | 0 | 0 |
| A11Y 접근성 | 5 | 5 | 0 | 0 |
| DX 개발자 경험 | 5 | 5 | 0 | 0 |
| QA 품질 검사 | 4 | 4 | 0 | 0 |
| 제외 후보 | 9 | 0 | 0 | 9 |
