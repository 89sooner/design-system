# Conductor Design System 화면 QA 체크리스트

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 0. 사용 방법

이 문서는 `srs_final.md`, `requirements_screen_traceability_matrix.md`, `conductor_screen_state_matrix.md`가 확정한 범위를 검증 항목으로 번역한다. 이 문서는 범위를 추가하지 않는다. 모든 항목에 `QA-###` ID가 있으며, 작업 패키지(WP)의 완료 기준(DoD)은 이 ID를 인용한다. 항목 텍스트 자체가 아니라 ID로 인용한다 — 텍스트가 수정되어도 ID는 유지한다. ID 범위는 QA-001 ~ QA-211이다.

각 항목은 pass/fail로 판정한다. fail 항목은 관련 FR ID 또는 화면 ID와 함께 CR을 개설한다.

## 1. 공통 QA (모든 화면)

### 1.1 항목 정의

| QA ID | 항목 | 관련 FR |
| --- | --- | --- |
| QA-001 | 다크 테마에서 렌더 시 시각 결함(요소 겹침, 잘림, 깨진 레이아웃)이 없다 | FR-THM-001 |
| QA-002 | 라이트 테마에서 렌더 시 시각 결함(요소 겹침, 잘림, 깨진 레이아웃)이 없다 | FR-THM-002 |
| QA-003 | 모든 대화형 요소가 `:focus-visible`에서 `--cdt-focus-ring` 토큰의 `box-shadow` 표시를 받으며, 두 테마 모두에서 배경 대비 3:1 이상이다 | FR-A11Y-001 AC-1, AC-3 |
| QA-004 | 키보드만으로 화면의 모든 대화형 요소에 도달·조작·이탈할 수 있고, Tab 순서가 시각적 순서와 일치한다 | FR-A11Y-002 AC-1 |
| QA-005 | 콘텐츠가 뷰포트 높이를 넘으면 화면이 세로 스크롤되고, 표·코드 블록 등은 화면 전체가 아니라 자체 컨테이너 안에서 가로 스크롤된다 | FR-CMP-005 AC-1 |
| QA-006 | 뷰포트 폭 560px에서 레이아웃 요소가 겹치거나 잘리지 않는다 | FR-TOK-009 AC-1 |
| QA-007 | 뷰포트 폭 800px에서 레이아웃 요소가 겹치거나 잘리지 않는다 | FR-TOK-009 AC-1 |
| QA-008 | 뷰포트 폭 1080px에서 레이아웃 요소가 겹치거나 잘리지 않는다 | FR-TOK-009 AC-1 |

### 1.2 화면별 실행 기록

각 QA ID는 화면 12개 전체(W-001 ~ W-050)에 대해 개별적으로 pass/fail을 기록한다. QA 기록 시 ID와 화면 ID를 함께 표기한다(예: `QA-001/W-010`).

| QA ID | W-001 | W-002 | W-010 | W-011 | W-012 | W-013 | W-014 | W-020 | W-021 | W-030 | W-040 | W-050 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QA-001 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-002 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-003 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-004 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-005 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-006 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-007 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| QA-008 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## 2. 화면별 QA

### W-001 Overview

- [ ] QA-009 `data-cdt-theme` 속성이 없을 때, OS가 `prefers-color-scheme: dark`이면 다크 팔레트가, 그 외에는 라이트 팔레트가 적용된다 (FR-THM-003 AC-2)
- [ ] QA-010 `data-cdt-theme="light"`이고 OS가 다크일 때 라이트 팔레트가 적용된다 (FR-THM-003 AC-1)
- [ ] QA-011 테마 전환 시 컴포넌트가 재마운트되지 않고 CSS 커스텀 프로퍼티 값만 바뀐다 (FR-THM-003 AC-4)
- [x] QA-012 뷰포트 800px 미만에서 사이드 내비게이션이 오프캔버스로 전환되고, 오버레이 클릭 또는 Escape로 닫힌다 (FR-CMP-009 AC-3)
- [x] QA-013 skip-link가 렌더되고 활성화 시 본문 영역으로 포커스가 이동한다 (FR-CMP-009 AC-4)
- [ ] QA-014 문서 사이트가 `@conductor/react`와 `@conductor/css`를 소비자로서 설치해 사용하며, 소스 상대경로 import가 0건이다 (FR-DOC-001 AC-1)

### W-002 Getting Started

- [ ] QA-015 설치 절차가 패키지 설치 → CSS import → `data-cdt-theme` 지정 → `Button` 렌더 순서로 기술되어 있다 (SCN-001 기본 흐름)
- [ ] QA-016 `@conductor/css`를 import하지 않고 컴포넌트를 렌더하면 개발 빌드 콘솔 경고가 1회 출력됨을 안내 문구로 명시한다 (SCN-001 예외 흐름)
- [ ] QA-017 레이어 선언 순서가 산출물 최상단 한 줄에 고정되어 있음을 코드 예시로 보여준다 (FR-CSS-001 AC-4)
- [ ] QA-018 서버 렌더링 시 브라우저 전역 접근이 발생하지 않는다는 설명과, 첫 페인트 테마 결정을 위한 인라인 스니펫 예시를 제공한다 (FR-DX-004, FR-THM-003 예외처리)

### W-010 Foundations · Color

- [ ] QA-019 색상 값이 `tokens.json`에서 읽히며 화면에 하드코딩된 토큰 값이 0건이다 (FR-DOC-002 AC-1)
- [ ] QA-020 토큰 소스에 색상 토큰을 추가하고 재빌드하면 화면에 자동으로 나타난다 (FR-DOC-002 AC-2)
- [ ] QA-021 각 토큰 행이 토큰 키, 계층, 현재 테마 값, 용도 설명을 표시한다 (FR-DOC-002 AC-3)
- [ ] QA-022 상태 7종·심각도 4종·미터 3종 토큰이 두 테마 모두에 표시된다 (FR-TOK-005 AC-4)
- [ ] QA-023 primitive 토큰이 화면에 노출되지 않는다 (FR-TOK-002 AC-5)

### W-011 Foundations · Typography

- [ ] QA-024 타이포 값이 `tokens.json`에서 읽히며 화면에 하드코딩된 토큰 값이 0건이다 (FR-DOC-002 AC-1)
- [ ] QA-025 `font.size` 7단계(2xs~xl)와 대응하는 `font.lineHeight`가 표시된다 (FR-TOK-007 AC-1, AC-2)
- [ ] QA-026 제목 예시가 `font.size.xl` 이상과 `clamp()` 기반 값을 사용한다 (FR-TOK-007 AC-4)

### W-012 Foundations · Spacing & Layout

- [ ] QA-027 레이아웃 값이 `tokens.json`에서 읽히며 화면에 하드코딩된 토큰 값이 0건이다 (FR-DOC-002 AC-1)
- [ ] QA-028 `breakpoint` 3단계(sm/md/lg) 값이 표시된다 (FR-TOK-009 AC-1)
- [ ] QA-029 `cdt-split-layout` 예시가 뷰포트 800px 미만에서 단일 컬럼으로 전환된다 (FR-CSS-003 AC-2)
- [ ] QA-030 `cdt-card-grid` 예시가 뷰포트 560px 미만에서 단일 컬럼으로 전환된다 (FR-CSS-003 AC-3)

### W-013 Foundations · Radius & Elevation

- [ ] QA-031 반경/고도 값이 `tokens.json`에서 읽히며 화면에 하드코딩된 토큰 값이 0건이다 (FR-DOC-002 AC-1)
- [ ] QA-032 `elevation.*` 토큰의 그림자 alpha 값이 다크 테마와 라이트 테마에서 다른 값으로 표시된다 (FR-THM-002 AC-4)

### W-014 Foundations · Motion

- [ ] QA-033 모션 값이 `tokens.json`에서 읽히며 화면에 하드코딩된 토큰 값이 0건이다 (FR-DOC-002 AC-1)
- [ ] QA-034 `prefers-reduced-motion: reduce` 상태에서 전환/애니메이션 지속 시간이 0s로 표시된다 (FR-CSS-005 AC-1)
- [ ] QA-035 감소 모드에서도 hover/focus/selected 상태 변화의 최종 시각 결과가 감소 모드가 아닐 때와 동일하다 (FR-CSS-005 AC-2)

### W-020 Components Index

- [ ] QA-036 공개 진입점에 export된 모든 컴포넌트가 카탈로그에 화면으로 존재한다 (FR-DOC-003 AC-5)
- [ ] QA-037 각 카탈로그 항목이 실제 DOM으로 마운트되어 렌더된다(스크린샷 이미지 0건) (FR-DOC-003 AC-1)
- [ ] QA-038 `cdt-` 접두사 클래스만으로 React 없이도 `Button variant="primary"`와 동일한 계산된 스타일이 재현됨을 코드 예시로 확인한다 (FR-CSS-004 AC-3)

### W-021 Component Detail

- [ ] QA-039 선택한 컴포넌트의 모든 `variant`와 `tone` 조합이 프리뷰에 렌더된다 (FR-DOC-003 AC-3)
- [ ] QA-040 props 표가 `@conductor/react` 타입 정의에서 생성되며 수동 작성 행이 0건이다 (FR-DOC-003 AC-2)
- [ ] QA-041 프리뷰가 현재 선택된 테마를 따른다 (FR-DOC-003 AC-4)
- [ ] QA-042 코드 스니펫 복사 버튼 클릭 시 2초 이내 `복사됨` 상태가 표시되고 이후 원래 상태로 복귀한다 (FR-DOC-006 AC-1)
- [ ] QA-043 복사 완료가 `aria-live="polite"` 영역으로 알려진다 (FR-DOC-006 AC-2)
- [ ] QA-044 선택한 컴포넌트에 대해 ref 전달, className 병합, data-*/aria-* 통과, 네이티브 props 확장이 검증된다 — 개별 판정은 3절 컴포넌트 QA의 해당 행을 인용한다 (FR-CMP-001 AC-1~AC-4)

### W-030 Tokens Reference

- [ ] QA-045 토큰 키 문자열로 필터하면 일치하는 행만 남는다 (FR-DOC-004 AC-1)
- [ ] QA-046 색상 토큰 행이 다크 값과 라이트 값을 나란히 표시한다 (FR-DOC-004 AC-2)
- [ ] QA-047 대비 검사 대상 토큰 쌍에 대비율 수치와 pass/fail 판정이 표시된다 (FR-DOC-004 AC-3)
- [ ] QA-048 대비 검사 제외 토큰에 `장식 전용` 표식과 제외 사유가 표시된다 (FR-DOC-004 AC-4)
- [ ] QA-049 테마 토글이 `role="switch"` 또는 `aria-pressed`를 노출하고 키보드로 조작 가능하다 (FR-DOC-005 AC-5)

### W-040 Patterns

- [ ] QA-050 각 규칙이 권장 예와 금지 예를 실제 렌더된 컴포넌트로 나란히 보여준다 (FR-DOC-007 AC-1)
- [ ] QA-051 금지 예에 금지 사유가 문장으로 기재된다 (FR-DOC-007 AC-2)
- [ ] QA-052 상태 7종과 심각도 4종 각각의 사용 시점이 기술된다 (FR-DOC-007 AC-3)
- [ ] QA-053 `Dialog`와 `Drawer`의 선택 기준이 기술된다 (FR-DOC-007 AC-4)

### W-050 Accessibility

- [ ] QA-054 `pnpm check:contrast` 결과에서 두 테마 전체 대비 미달이 0건으로 보고된다 (FR-A11Y-004 AC-1)
- [ ] QA-055 axe-core 허용 목록이 규칙 ID와 사유와 함께 노출된다 (FR-A11Y-005 예외처리)
- [ ] QA-056 포커스 링이 두 테마 모두에서 배경 대비 3:1 이상임을 명시한다 (FR-A11Y-001 AC-3)

## 3. 컴포넌트 QA — 공통 계약(FR-CMP-001) 4항목 × 컴포넌트 전수

FR-CMP-001은 공개 컴포넌트 전수가 ref 전달(AC-1), className 병합(AC-2), data-*/aria-* 통과(AC-3), 네이티브 props 확장(AC-4)을 만족하도록 요구한다. 아래 표는 `srs_final.md` FR-CMP-002 ~ FR-CMP-009가 열거한 공개 컴포넌트 30개 전수에 대해 4항목을 각각 개별 ID로 부여한다.

| 컴포넌트 | 소속 FR | ref 전달 (AC-1) | className 병합 (AC-2) | data-*/aria-* 통과 (AC-3) | 네이티브 props 확장 (AC-4) |
| --- | --- | --- | --- | --- | --- |
| Button | FR-CMP-002 | [x] QA-057 | [x] QA-058 | [x] QA-059 | [x] QA-060 |
| IconButton | FR-CMP-002 | [x] QA-061 | [x] QA-062 | [x] QA-063 | [x] QA-064 |
| Card | FR-CMP-003 | [x] QA-065 | [x] QA-066 | [x] QA-067 | [x] QA-068 |
| CardGrid | FR-CMP-003 | [x] QA-069 | [x] QA-070 | [x] QA-071 | [x] QA-072 |
| Panel | FR-CMP-003 | [x] QA-073 | [x] QA-074 | [x] QA-075 | [x] QA-076 |
| Badge | FR-CMP-004 | [x] QA-077 | [x] QA-078 | [x] QA-079 | [x] QA-080 |
| StatusBadge | FR-CMP-004 | [x] QA-081 | [x] QA-082 | [x] QA-083 | [x] QA-084 |
| SeverityTag | FR-CMP-004 | [x] QA-085 | [x] QA-086 | [x] QA-087 | [x] QA-088 |
| Table | FR-CMP-005 | [x] QA-089 | [x] QA-090 | [x] QA-091 | [x] QA-092 |
| Timeline | FR-CMP-005 | [x] QA-093 | [x] QA-094 | [x] QA-095 | [x] QA-096 |
| CodeBlock | FR-CMP-005 | [x] QA-097 | [x] QA-098 | [x] QA-099 | [x] QA-100 |
| Kbd | FR-CMP-005 | [x] QA-101 | [x] QA-102 | [x] QA-103 | [x] QA-104 |
| Dialog | FR-CMP-006 | [x] QA-105 | [x] QA-106 | [x] QA-107 | [x] QA-108 |
| Drawer | FR-CMP-006 | [x] QA-109 | [x] QA-110 | [x] QA-111 | [x] QA-112 |
| Tooltip | FR-CMP-006 | [x] QA-113 | [x] QA-114 | [x] QA-115 | [x] QA-116 |
| DropdownMenu | FR-CMP-006 | [x] QA-117 | [x] QA-118 | [x] QA-119 | [x] QA-120 |
| Field | FR-CMP-007 | [x] QA-121 | [x] QA-122 | [x] QA-123 | [x] QA-124 |
| TextField | FR-CMP-007 | [x] QA-125 | [x] QA-126 | [x] QA-127 | [x] QA-128 |
| TextArea | FR-CMP-007 | [x] QA-129 | [x] QA-130 | [x] QA-131 | [x] QA-132 |
| Select | FR-CMP-007 | [x] QA-133 | [x] QA-134 | [x] QA-135 | [x] QA-136 |
| Switch | FR-CMP-007 | [x] QA-137 | [x] QA-138 | [x] QA-139 | [x] QA-140 |
| Checkbox | FR-CMP-007 | [x] QA-141 | [x] QA-142 | [x] QA-143 | [x] QA-144 |
| Banner | FR-CMP-008 | [x] QA-145 | [x] QA-146 | [x] QA-147 | [x] QA-148 |
| EmptyState | FR-CMP-008 | [x] QA-149 | [x] QA-150 | [x] QA-151 | [x] QA-152 |
| Meter | FR-CMP-008 | [x] QA-153 | [x] QA-154 | [x] QA-155 | [x] QA-156 |
| ProgressRing | FR-CMP-008 | [x] QA-157 | [x] QA-158 | [x] QA-159 | [x] QA-160 |
| Spinner | FR-CMP-008 | [x] QA-161 | [x] QA-162 | [x] QA-163 | [x] QA-164 |
| AppShell † | FR-CMP-009 | [x] QA-165 | [x] QA-166 | [x] QA-167 | [x] QA-168 |
| NavList † | FR-CMP-009 | [x] QA-169 | [x] QA-170 | [x] QA-171 | [x] QA-172 |
| TopBar † | FR-CMP-009 | [x] QA-173 | [x] QA-174 | [x] QA-175 | [x] QA-176 |

† FR-CMP-009는 Should 우선순위이며 OD-004에 조건부다. OD-004가 "패키지에 포함"으로 해소되는 경우에만 QA-165 ~ QA-176을 `@conductor/react`의 공개 컴포넌트로 실행한다. "문서 사이트 내부 컴포넌트로 강등"으로 해소되면 이 3개 행은 공개 컴포넌트 QA 대상에서 제외하고, 문서 사이트 자체 구현 코드에 대한 QA로 이관한다(SRS FR-CMP-009 예외처리).

## 4. 접근성 QA

- [ ] QA-177 WCAG 2.1 AA 1.4.1(색상 외 정보 전달) 충족을 확인한다 (FR-A11Y-003)
- [x] QA-178 WCAG 2.1 AA 1.4.3/1.4.11(대비) 충족을 확인한다 (FR-A11Y-004)
- [x] QA-179 WCAG 2.1 AA 2.1.1(키보드 접근성) 충족을 확인한다 (FR-A11Y-002)
- [x] QA-180 WCAG 2.1 AA 2.4.7(포커스 표시) 충족을 확인한다 (FR-A11Y-001)
- [x] QA-181 WCAG 2.1 AA 4.1.2(이름·역할·값) 충족을 확인한다 (FR-A11Y-005)
- [x] QA-182 axe-core 검사에서 컴포넌트 전수 × 주요 상태(기본, disabled, 오류, 열림) × 테마 2종 조합에 serious 이상 위반이 0건이다 (FR-QA-003 AC-1 ~ AC-3)
- [ ] QA-183 컴포넌트 전수를 그레이스케일로 렌더한 스냅샷에서 상태 7종의 구분이 유지된다 (FR-A11Y-003 AC-4)
- [x] QA-184 본문 텍스트 대비율이 두 테마 모두 4.5:1 이상이다 (FR-A11Y-004)
- [x] QA-185 대형 텍스트·비텍스트 요소(포커스 링, 경계 토큰 포함)의 대비율이 두 테마 모두 3:1 이상이다 (FR-A11Y-004 AC-4)

## 5. 회귀 QA

- [ ] QA-186 다크/라이트 테마의 semantic 토큰 키 집합 대칭 차집합이 공집합이다 (FR-QA-001 AC-1)
- [ ] QA-187 한 테마에만 존재하는 component 토큰이 0건이다 (FR-QA-001 AC-2)
- [ ] QA-188 토큰 계약 검사가 `pnpm test`와 CI 모두에서 실행된다 (FR-QA-001 AC-3)
- [x] QA-189 기준 컴포넌트 12개 × 테마 2종 = 24개 스냅샷이 기준 이미지와 비교된다 (FR-QA-004 AC-1)
- [x] QA-190 픽셀 차이가 1%를 초과하면 CI가 실패하고 차이 이미지가 아티팩트로 남는다 (FR-QA-004 AC-2) — 36% 차이 픽스처 exit 1, actual/expected/diff 생성
- [x] QA-191 기준 이미지 갱신이 `pnpm test:visual --update` 명시적 커맨드로만 가능하다 (FR-QA-004 AC-3)
- [x] QA-192 `Button` 단독 import gzip 크기가 4KB 이하다(React 제외) (FR-DX-003 AC-3) — `size-limit` 실측 527바이트

QA-189 ~ QA-191은 OD-002(REL-003 착수 시점 결정)에 조건부인 Should 우선순위 항목이다. OD-002가 "REL-004로 이월"로 해소되면 이 3개 항목은 v1 릴리스 게이트에서 제외하고 수동 시각 확인으로 대체한다(FR-QA-004 예외처리).

## 6. 이상 흐름 QA

이 절은 이 제품이 런타임 인증/권한/서버 없이 정적 산출물만 배포한다는 사실에서 도출되는 고유 상태를 다룬다(`conductor_screen_state_matrix.md` 3절과 동일한 정의를 인용한다).

- [ ] QA-193 `tokens.json`이 없는 환경에서 W-010 ~ W-014, W-030에 접근할 때 화면이 크래시하지 않고 `토큰 산출물 없음` 안내를 표시한다 (FR-DOC-002 예외처리)
- [ ] QA-194 대비 검사 결과 파일이 없을 때 W-030, W-050의 대비율 관련 영역이 `측정되지 않음`으로 표시되고 화면 상단에 경고 배너가 노출된다 (FR-DOC-004 예외처리)
- [ ] QA-195 컴포넌트 프리뷰 렌더 중 예외가 발생해도 해당 프리뷰 영역만 오류 경계로 격리되고 나머지 화면은 계속 렌더된다 (FR-DOC-003 예외처리)
- [ ] QA-196 Clipboard API가 없는 환경에서 코드 블록 텍스트가 선택 가능한 상태로 유지되고 복사 버튼이 `disabled`로 렌더된다 (FR-DOC-006 AC-3)
- [ ] QA-197 클립보드 쓰기가 거부되면 복사 버튼에 `복사할 수 없음` 상태가 표시되고 오류 배너는 노출되지 않는다 (FR-DOC-006 예외처리)
- [ ] QA-198 `localStorage` 접근이 차단된 환경에서 예외가 삼켜지고 `prefers-color-scheme`으로 대체되며 화면 렌더가 막히지 않는다 (FR-DOC-005 예외처리)
- [ ] QA-199 `prefers-reduced-motion: reduce` 활성 시 `Spinner`와 `ProgressRing`이 애니메이션 대신 정적 진행률 텍스트를 노출한다 (FR-CSS-005 예외처리)
- [ ] QA-200 화면 어디에도 권한 없음 안내나 인증 만료 안내가 존재하지 않는다 — 존재하면 결함으로 기록한다(해당 없음: 런타임 인증/서버 부재, SRS 6절 권한 경계)

## 7. 릴리스 게이트 체크리스트

작업 패키지(WP)의 완료 기준(DoD)은 아래 ID를 인용한다.

- [x] QA-201 M-1: 다크 테마 시각 회귀 픽셀 차이가 기준 컴포넌트 12개에서 1% 이하다 — 3회 연속 diff 0건
- [ ] QA-202 M-2: 다크/라이트 시맨틱 토큰 키 집합 차이가 0개다
- [ ] QA-203 M-3: WCAG 2.1 AA 대비 미달 쌍이 두 테마 본문 용도 토큰 기준 0건이다
- [ ] QA-204 M-4: axe-core serious 이상 위반이 컴포넌트 전수 기준 0건이다
- [ ] QA-205 M-5: Getting Started 절차 실행 시 신규 앱 적용 명령 수가 3개 이하다
- [ ] QA-206 M-6: 공개 API의 `any` 노출이 0건이다
- [x] QA-207 M-7: `Button` 단독 import gzip 크기가 4KB 이하다(React 제외) — `size-limit` 실측 527바이트
- [ ] QA-208 의존성 취약점 severity high 이상이 0건이다(`pnpm audit --audit-level high`)
- [ ] QA-209 배포 산출물의 런타임 외부 네트워크 요청이 0건이다
- [ ] QA-210 OD-001(대비율 검사 대상 정의)이 해소되어 있다 — 미해소 시 SRS 14절에 따라 baseline 승격과 릴리스 게이트를 차단한다
- [ ] QA-211 파괴 변경이 포함된 릴리스에 마이그레이션 노트가 동반된다 (FR-DX-005 AC-4)

## 8. QA 기록 템플릿

| QA ID | 화면/컴포넌트 | 테마 | 뷰포트 | 결과(pass/fail) | 테스터 | 일시 | 연결 CR/DEV |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

기록 규칙:

1. 화면 QA는 `QA-ID/화면ID` 형식으로, 컴포넌트 QA는 `QA-ID/컴포넌트명` 형식으로 기재한다.
2. fail 항목은 연결 CR/DEV 열을 비워두지 않는다.
3. 동일 QA ID를 두 테마 모두에서 실행해야 하는 항목(1절, 4절)은 행을 테마별로 분리해 기록한다.
