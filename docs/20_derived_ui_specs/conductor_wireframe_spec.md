# Conductor Design System 와이어프레임 사양서

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 문서 위치와 책임

이 문서는 `conductor_product_ia.md`가 선언한 화면 12개 각각의 목적, 진입 경로, 레이아웃, 섹션, 사용 컴포넌트, 상태, 이벤트, 권한/정책, 구현 노트를 정의한다. 범위를 추가하지 않는다. 모든 화면 요소는 `../10_requirements/srs_final.md`의 FR을 근거로 인용한다.

이 문서가 소유하지 않는 것:

- 컴포넌트 ID(C-###)의 props, variant, 접근성 계약 → `conductor_ui_component_spec.md`
- 상태별 필수 UI와 복구 경로 → `conductor_screen_state_matrix.md`
- 화면 간 전이와 딥링크 → `conductor_screen_flow_spec.md`

## 2. 공통 화면 사양 형식

각 화면은 다음 아홉 항목을 이 순서로 기술한다.

1. 화면 목적
2. 진입 경로
3. 레이아웃 구조 (텍스트 다이어그램)
4. 섹션 정의
5. 사용 컴포넌트
6. 상태 정의
7. 이벤트 정의
8. 권한/정책
9. 구현 노트

## 3. 컴포넌트 인용 규칙

와이어프레임은 컴포넌트를 정의하지 않고 인용한다. C-### ID의 정의는 `conductor_ui_component_spec.md`가 소유한다.

| ID | 이름 | ID | 이름 | ID | 이름 |
| --- | --- | --- | --- | --- | --- |
| C-001 | Button | C-030 | Table | C-053 | Select |
| C-002 | IconButton | C-031 | Timeline | C-054 | Switch |
| C-010 | Card | C-032 | CodeBlock | C-055 | Checkbox |
| C-011 | CardGrid | C-033 | Kbd | C-060 | Banner |
| C-012 | Panel | C-040 | Dialog | C-061 | EmptyState |
| C-020 | Badge | C-041 | Drawer | C-062 | Meter |
| C-021 | StatusBadge | C-042 | Tooltip | C-063 | ProgressRing |
| C-022 | SeverityTag | C-043 | DropdownMenu | C-064 | Spinner |
| C-050 | Field | C-070 | AppShell | | |
| C-051 | TextField | C-071 | NavList | | |
| C-052 | TextArea | C-072 | TopBar | | |

## 4. 전역 셸

모든 화면(W-001 ~ W-050)은 셸 안에서 렌더된다(FR-DOC-001 AC-2). 셸 구조는 `conductor_product_ia.md` 6절이 소유한다. 각 화면의 레이아웃 다이어그램은 `<main id="content">` 내부만 기술한다.

셸이 고정으로 제공하는 것:

| 요소 | 컴포넌트 | 근거 |
| --- | --- | --- |
| skip-link | `cdt.utility` 유틸리티 클래스 | FR-CSS-002 AC-5, FR-CMP-009 AC-4 |
| 사이드 내비 (≥800px 고정, <800px 오프캔버스) | C-070, C-071, C-041 | FR-DOC-001, FR-CMP-009 AC-3 |
| 상단바 + 테마 토글 | C-072, C-054 | FR-DOC-001, FR-DOC-005 AC-5 |

브레이크포인트는 `breakpoint.sm`(560px), **breakpoint.md**(800px), `breakpoint.lg`(1080px)이며 빌드 시 미디어쿼리 조건에 리터럴로 치환된다(FR-TOK-009 AC-1, AC-2).

## 5. 상태 어휘

이 문서는 화면별 상태의 **발생 조건**만 기술한다. 각 상태의 필수 UI와 복구 경로는 `conductor_screen_state_matrix.md`가 소유한다.

문서 사이트는 정적 빌드 산출물이며 런타임 데이터 소스가 없다. 토큰 값과 컴포넌트 메타데이터는 빌드 시각에 번들에 고정된다. 따라서 네트워크 실패에서 비롯되는 상태(`offline`, `stale`)와 인증에서 비롯되는 상태(`unauthenticated`, `no_permission`, `auth_expired`)는 이 제품의 어떤 화면에도 존재하지 않는다.

| 상태 | 발생 조건 | 근거 |
| --- | --- | --- |
| `loading_initial` | 라우트 청크가 아직 평가되지 않았다 | FR-DOC-001 AC-3 (정적 빌드) |
| `ready` | 화면이 렌더를 완료했다 | — |
| `empty` | 필터 결과가 0건이다 | FR-DOC-004 AC-1 |
| `not_found` | 존재하지 않는 `componentId` 경로로 진입했다 | FR-DOC-003 AC-5 |
| `partial_failure` | 라이브 프리뷰 한 개가 오류 경계로 격리되고 나머지 화면은 계속 렌더된다 | FR-DOC-003 예외/실패 처리 |
| `metrics_unavailable` | 대비 검사 결과 파일이 없다 | FR-DOC-004 예외/실패 처리 |
| `copy_unavailable` | Clipboard API를 사용할 수 없거나 클립보드 쓰기가 거부되었다 | FR-DOC-006 AC-3, 예외/실패 처리 |
| `reduced_motion` | `prefers-reduced-motion: reduce`가 설정되어 있다 | FR-CSS-005 |

## 6. 이벤트 명명 규칙

이벤트 이름은 `<대상>.<동작>` 형식이다. FR 근거가 없는 이벤트를 정의하지 않는다.

| 이벤트 | 의미 | 근거 |
| --- | --- | --- |
| `nav.select` | 내비 항목을 선택해 화면을 이동한다 | FR-CMP-009 AC-1 |
| `nav.open` / `nav.close` | 오프캔버스 내비를 열고 닫는다 | FR-CMP-009 AC-3 |
| `skipLink.activate` | 본문 영역으로 포커스를 이동한다 | FR-CMP-009 AC-4 |
| `theme.toggle` | 루트의 `data-cdt-theme` 값을 바꾼다 | FR-DOC-005 |
| `component.open` | 카탈로그 카드에서 컴포넌트 상세로 이동한다 | FR-DOC-003 |
| `token.filter` | 토큰 키 문자열로 표 행을 필터한다 | FR-DOC-004 AC-1 |
| `snippet.copy` | 예제 소스 코드를 클립보드에 기록한다 | FR-DOC-006 |
| `overlay.open` / `overlay.close` | 라이브 프리뷰 안의 오버레이를 열고 닫는다 | FR-CMP-006 AC-1 |

---

## W-001 Overview

경로: `/` · 우선순위: P0 · 관련 요구사항: FR-THM-003, FR-CMP-009, FR-DOC-001, FR-DOC-005

### 화면 목적

세 패키지의 역할과 다음 단계를 제시한다. 셸(FR-DOC-001)과 테마 토글(FR-DOC-005)이 처음으로 렌더되는 화면이며, 테마 결정 우선순위(FR-THM-003)가 최초 페인트에서 관찰되는 지점이다.

### 진입 경로

- 직접 URL `/` (기본 진입 화면)
- 사이드 내비 `Overview`
- 상단바의 제품명 클릭

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Conductor Design System                                │
│ 요약 문단 (패키지 3종 + 정적 문서 사이트)                  │
├────────────────────────────────────────────────────────────┤
│ CardGrid (C-011) · auto-fill · 최소 컬럼 320px             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Card (C-010) │ │ Card (C-010) │ │ Card (C-010) │         │
│ │ @conductor/  │ │ @conductor/  │ │ @conductor/  │         │
│ │   tokens     │ │   css        │ │   react      │         │
│ │ → W-030      │ │ → W-002      │ │ → W-020      │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
├────────────────────────────────────────────────────────────┤
│ Panel (C-012)  다음 단계                                   │
│  [Button primary → W-002]  [Button secondary → W-020]      │
└────────────────────────────────────────────────────────────┘
  뷰포트 <560px: CardGrid가 단일 컬럼으로 전환 (FR-CSS-003 AC-3)
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 제품 요약 | Conductor가 배포하는 것은 npm 패키지 3종과 정적 문서 사이트다 | FR-DOC-001 |
| 패키지 카드 3종 | 각 패키지의 역할과 대응 화면 링크 | FR-DOC-001 AC-1 (문서 사이트가 이 패키지들의 소비자다) |
| 다음 단계 | W-002 설치 경로, W-020 컴포넌트 카탈로그 | FR-DOC-001 |

### 사용 컴포넌트

C-010 Card(대화형, `href` 지정), C-011 CardGrid, C-012 Panel, C-001 Button. 셸이 제공하는 C-070, C-071, C-072, C-054는 이 화면이 소유하지 않는다.

패키지 카드는 `href`를 받으므로 `a` 요소로 렌더되고 키보드 포커스를 받는다(FR-CMP-003 AC-1). 카드 내부에 중첩 대화형 요소를 넣지 않는다(FR-CMP-003 예외/실패 처리).

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 최초 진입 시 루트 라우트 청크 평가 전 |
| `ready` | 셸과 본문 렌더 완료 |

`empty`, `partial_failure`, `not_found`는 이 화면에서 발생하지 않는다. 본문 콘텐츠가 빌드 시 고정된 정적 마크업이기 때문이다.

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 조작 | 루트 `data-cdt-theme`가 `dark` ↔ `light`로 바뀐다. FLOW-002 참조 |
| `nav.select` | 사이드 내비 항목 | 대상 화면으로 이동 |
| `component.open` | 패키지 카드 또는 다음 단계 버튼 | W-002 / W-020 / W-030으로 이동 |
| `skipLink.activate` | skip-link 활성화 | `<main id="content">`로 포커스 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). 이 화면은 인증 상태를 확인하지 않으며 권한 게이트를 갖지 않는다.

### 구현 노트

1. 최초 페인트 시 테마가 뒤바뀌어 보이는 깜빡임이 발생하지 않아야 한다(FR-DOC-005 AC-4). 문서 사이트는 `<head>`에 인라인 테마 결정 스니펫을 삽입한다. 스니펫은 `@conductor/css`가 자동 주입하지 않으며 W-002가 그 소스를 노출한다(FR-THM-003 예외/실패 처리). FLOW-002 참조.
2. 저장된 선택이 없으면 `prefers-color-scheme`을 따른다(FR-DOC-005 AC-3). 속성값이 `dark`/`light` 이외이면 다크 팔레트를 적용한다(FR-THM-003 AC-3).
3. NFR-001의 LCP 목표(p75 2.5초 이하)를 측정하는 화면이 W-001이다. 원격 폰트와 원격 스크립트를 로드하지 않는다(SRS 5.2, FR-DOC-001 AC-4).

---

## W-002 Getting Started

경로: `/getting-started` · 우선순위: P0 · 관련 요구사항: FR-CSS-001, FR-DX-001, FR-DX-003, FR-DX-004

### 화면 목적

소비자가 빈 React 앱에 Conductor를 적용하는 경로를 제시한다(SCN-001). 명령 수는 3개 이하다(목표 M-5).

### 진입 경로

- 직접 URL `/getting-started`
- 사이드 내비 `Getting Started`
- W-001의 다음 단계 버튼

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Getting Started                                        │
├────────────────────────────────────────────────────────────┤
│ § 요구 환경        Table (C-030)                           │
│   Node ≥ 20 · pnpm ≥ 10 · React 18 | 19 (peer)             │
├────────────────────────────────────────────────────────────┤
│ § 설치             CodeBlock (C-032)   [복사 (C-002)]      │
├────────────────────────────────────────────────────────────┤
│ § 스타일 import    CodeBlock (C-032)   [복사 (C-002)]      │
├────────────────────────────────────────────────────────────┤
│ § 테마 속성 지정   CodeBlock (C-032)   [복사 (C-002)]      │
├────────────────────────────────────────────────────────────┤
│ § 공개 진입점      Table (C-030)  경로 · 부수효과 · 타입   │
├────────────────────────────────────────────────────────────┤
│ § 캐스케이드 레이어 순서   CodeBlock (C-032)               │
│   Banner tone="info" (C-060)  Radix 인라인 스타일 예외     │
├────────────────────────────────────────────────────────────┤
│ § 서버 렌더링      CodeBlock (C-032)  인라인 테마 스니펫   │
│   Banner tone="warning" (C-060)  스니펫 미삽입 시 결과     │
├────────────────────────────────────────────────────────────┤
│ § 빌드 순서        tokens → css → react → docs             │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 요구 환경 | Node 20 이상, pnpm 10 이상, React 18 또는 19 | SRS 5.1, NFR-005 |
| 설치 | 패키지 3종 설치 명령 | SCN-001, M-5 |
| 스타일 import | `import "@conductor/css"` | SCN-001, FR-CSS-001 |
| 테마 속성 지정 | 루트에 `data-cdt-theme="dark"` | FR-THM-003 |
| 공개 진입점 | `exports`에 선언된 경로, `sideEffects` 선언, 부분 진입점 `./component.css` | FR-DX-003 AC-2, AC-3, AC-4 |
| 캐스케이드 레이어 순서 | `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility` 한 줄과 소비자 오버라이드 규칙 | FR-CSS-001 AC-1, AC-3, AC-4 |
| Radix 인라인 스타일 예외 | `--radix-*` 속성은 레이어 대상이 아니다 | FR-CSS-001 예외/실패 처리 |
| 서버 렌더링 | `<head>` 인라인 테마 결정 스니펫과 삽입 위치 | FR-THM-003 예외/실패 처리, FR-DX-004 예외/실패 처리 |
| 빌드 순서 | `tokens → css → react → docs` 단방향 | FR-DX-001 |

### 사용 컴포넌트

C-032 CodeBlock, C-002 IconButton(복사 버튼), C-030 Table, C-060 Banner, C-012 Panel.

`Table`에는 `caption` 또는 `aria-label`이 있어야 한다. 없으면 개발 빌드가 콘솔 경고를 출력한다(FR-CMP-005 AC-5).

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 렌더 완료 |
| `copy_unavailable` | Clipboard API를 사용할 수 없다. 복사 버튼이 `disabled`로 렌더되고 코드 블록 텍스트는 선택 가능한 상태로 유지된다(FR-DOC-006 AC-3) |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `snippet.copy` | 코드 블록의 복사 버튼 | 소스를 클립보드에 기록하고 2초 이내에 `복사됨` 상태를 표시한 뒤 원래 상태로 복귀한다(FR-DOC-006 AC-1). FLOW-006 참조 |
| `nav.select` | 사이드 내비 항목 | 대상 화면으로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). 설치 명령의 실행 권한은 소비자의 로컬 환경에 속하며 문서 사이트가 관여하지 않는다.

### 구현 노트

1. 진입점 표는 각 패키지의 `package.json` `exports`에서 읽는다. 선언되지 않은 내부 경로 import는 런타임 해석 오류가 된다(FR-DX-003 AC-1). 표에 `@conductor/react/src/Button` 같은 금지 경로를 예시로 포함하고 금지 사유를 함께 표시한다.
2. 인라인 테마 스니펫은 문서 사이트가 자신의 `<head>`에서 실제로 사용하는 코드와 동일해야 한다. 문서 사이트가 Conductor의 첫 번째 소비자이기 때문이다(FR-DOC-001 AC-1).
3. `@conductor/css`를 import하지 않으면 개발 빌드가 콘솔 경고를 1회 출력하고 컴포넌트는 스타일 없이 렌더된다(SCN-001 예외 흐름). 이 사실을 스타일 import 섹션에 명시한다.
4. 리셋 제외가 필요한 소비자는 `@conductor/css/component.css`만 import한다(FR-CSS-002 예외/실패 처리).

---

## W-010 Foundations · Color

경로: `/foundations/color` · 우선순위: P1 · 관련 요구사항: FR-TOK-002, FR-TOK-005, FR-THM-001, FR-THM-002, FR-DOC-002

### 화면 목적

시맨틱 색 토큰과 상태·심각도·미터 토큰군을 계층 정보와 함께 조회한다. 값은 `@conductor/tokens/tokens.json`에서 읽으며 화면에 하드코딩된 토큰 값이 0건이다(FR-DOC-002 AC-1).

### 진입 경로

- 직접 URL `/foundations/color`
- 사이드 내비 `Foundations › Color`

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Color                                                  │
│ 다크 테마가 기준 팔레트다 (FR-THM-001)                     │
├────────────────────────────────────────────────────────────┤
│ § 표면 (surface.*)                                         │
│ ┌─ Table (C-030) ──────────────────────────────────────┐   │
│ │ 스와치 │ 토큰 키 │ 계층 │ 현재 테마 값 │ 용도       │   │
│ │  ▉     │ surface.base   │ semantic │ #080b12 │ ... │   │
│ └──────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ § 텍스트 (text.*)        Table (C-030)                     │
│ § 경계 (border.*)        Table (C-030)                     │
│ § 강조색 (accent.*)      Table (C-030)                     │
├────────────────────────────────────────────────────────────┤
│ § 상태색 7종                                               │
│  StatusBadge (C-021) × 7  queued running waiting success   │
│                           partial danger neutralEnd        │
│  + Table (C-030) 토큰 키 · 계층 · 값 · 아이콘 · 용도      │
├────────────────────────────────────────────────────────────┤
│ § 심각도 4종                                               │
│  SeverityTag (C-022) × 4  read write destructive blocked   │
├────────────────────────────────────────────────────────────┤
│ § 미터 3종                                                 │
│  Meter (C-062) × 3  normal warning exceeded                │
├────────────────────────────────────────────────────────────┤
│ Panel (C-012)  대비율과 판정은 W-030에서 조회한다 → /tokens│
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 표면 / 텍스트 / 경계 / 강조색 | 각 토큰 행이 토큰 키, 계층, 현재 테마 값, 용도 설명을 표시한다 | FR-DOC-002 AC-3, FR-TOK-002 |
| 상태색 7종 | `status.queued`, `status.running`, `status.waiting`, `status.success`, `status.partial`, `status.danger`, `status.neutralEnd` | FR-TOK-005 AC-1 |
| 심각도 4종 | `severity.read`, `severity.write`, `severity.destructive`, `severity.blocked` | FR-TOK-005 AC-2 |
| 미터 3종 | `meter.normal`, `meter.warning`, `meter.exceeded` | FR-TOK-005 AC-3 |
| W-030 링크 | 대비율과 pass/fail 판정의 소유 화면은 W-030이다 | FR-DOC-004 AC-3 |

### 사용 컴포넌트

C-030 Table, C-021 StatusBadge, C-022 SeverityTag, C-062 Meter, C-012 Panel.

`StatusBadge`와 `SeverityTag`는 색·아이콘·텍스트를 동시에 렌더한다(FR-CMP-004 AC-1, AC-4). 이 화면은 색상 스와치를 함께 보여주므로 색 이외의 전달 수단이 실제로 렌더되는지 육안 확인이 가능하다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 토큰 JSON을 읽어 표를 렌더한 뒤 |

`empty`는 발생하지 않는다. `tokens.json`이 비어 있으면 토큰 빌드가 이미 실패했기 때문이다(FR-TOK-003 예외/실패 처리).

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 | 스와치와 값 열이 선택된 테마 값으로 갱신된다. 컴포넌트는 재마운트되지 않는다(FR-THM-003 AC-4) |
| `nav.select` | Panel의 W-030 링크 | `/tokens`로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절).

### 구현 노트

1. 프리미티브 토큰은 화면에 표시하지 않는다. `@conductor/tokens`의 공개 진입점으로 export되지 않으며(FR-TOK-002 AC-5) CSS로도 산출되지 않는다(FR-TOK-004 AC-4).
2. 계층 열은 `primitive`가 아닌 `semantic` 또는 `component` 두 값만 갖는다. 시맨틱 토큰은 프리미티브만, 컴포넌트 토큰은 시맨틱만 참조한다(FR-TOK-002 AC-2, AC-3).
3. 용도 설명이 없는 토큰은 `설명 없음`으로 표시하고 빌드가 경고를 출력한다(FR-DOC-002 예외/실패 처리).
4. 토큰 소스에 토큰을 추가하면 재빌드 후 이 화면에 자동으로 나타난다(FR-DOC-002 AC-2). 화면 코드에 토큰 키 목록을 나열하지 않는다.
5. 상태·심각도 토큰의 `icon` 메타데이터 필드는 빈 문자열이 아니다(FR-TOK-005 AC-5). 아이콘은 `lucide-react`가 제공하며 Conductor는 아이콘을 번들하지 않는다(SRS 10절).

---

## W-011 Foundations · Typography

경로: `/foundations/typography` · 우선순위: P1 · 관련 요구사항: FR-TOK-007, FR-DOC-002

### 화면 목적

글자 크기 7단계와 대응 행 높이 토큰을 조회한다. 스케일 밖 크기는 존재하지 않는다(FR-TOK-007).

### 진입 경로

- 직접 URL `/foundations/typography`
- 사이드 내비 `Foundations › Typography`

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Typography                                             │
├────────────────────────────────────────────────────────────┤
│ § 크기 스케일 7단계                                        │
│ ┌─ Table (C-030) ──────────────────────────────────────┐   │
│ │ 미리보기 │ 토큰 키 │ 계층 │ 값 │ lineHeight │ 용도  │   │
│ │  Aa      │ font.size.2xs  │ semantic │ 10px │ ... │   │
│ │  Aa      │ font.size.xs   │ semantic │ 11px │ ... │   │
│ │  Aa      │ font.size.sm   │ semantic │ 12px │ ... │   │
│ │  Aa      │ font.size.base │ semantic │ 13px │ ... │   │
│ │  Aa      │ font.size.md   │ semantic │ 14px │ ... │   │
│ │  Aa      │ font.size.lg   │ semantic │ 16px │ ... │   │
│ │  Aa      │ font.size.xl   │ semantic │ 20px │ ... │   │
│ └──────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ § 제목 반응형                                              │
│  Panel (C-012)  제목은 font.size.xl 이상과 clamp() 기반    │
│  뷰포트를 좁히면 계산값이 바뀌는 실물 제목 3종             │
├────────────────────────────────────────────────────────────┤
│ § 기준 밀도                                                │
│  본문 14px · 행 높이 1.5                                   │
├────────────────────────────────────────────────────────────┤
│ § 숫자 표기        CodeBlock (C-032) + Table (C-030)       │
│  cdt-num → font-variant-numeric: tabular-nums              │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 크기 스케일 7단계 | `2xs`(10px), `xs`(11px), `sm`(12px), `base`(13px), `md`(14px), `lg`(16px), `xl`(20px) | FR-TOK-007 AC-1 |
| 행 높이 | 각 단계에 대응하는 `font.lineHeight.<단계>` | FR-TOK-007 AC-2 |
| 제목 반응형 | 제목은 `font.size.xl` 이상과 `clamp()` 기반 반응형 값을 사용한다 | FR-TOK-007 AC-4 |
| 기준 밀도 | 본문 14px, 행 높이 1.5의 조밀한 운영 화면 | glossary 2.3 밀도 |
| 숫자 표기 | `cdt-num` 클래스의 계산값 | FR-CMP-005 AC-2 |

### 사용 컴포넌트

C-030 Table, C-012 Panel, C-032 CodeBlock.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 토큰 JSON을 읽어 표를 렌더한 뒤 |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 | 텍스트 색이 선택된 테마를 따른다. 크기 값은 테마와 무관하다 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절).

### 구현 노트

1. 미리보기 열은 토큰 값을 CSS 커스텀 프로퍼티로 참조해 실제 크기로 렌더한다. `font-size`의 px 리터럴을 화면 코드에 쓰지 않는다(FR-TOK-007 AC-3).
2. 배포 산출물은 원격 폰트를 로드하지 않는다. 폰트는 시스템 스택을 사용한다(SRS 5.2).
3. 스케일 밖 크기가 필요하면 CR을 열어 스케일을 확장한다. 이 화면은 임의 크기를 예시로도 렌더하지 않는다(FR-TOK-007 예외/실패 처리).

---

## W-012 Foundations · Spacing & Layout

경로: `/foundations/spacing` · 우선순위: P1 · 관련 요구사항: FR-TOK-009, FR-CSS-003, FR-DOC-002

### 화면 목적

간격 토큰, 브레이크포인트 3단계, 레이아웃 프리미티브 클래스 5종을 조회한다.

### 진입 경로

- 직접 URL `/foundations/spacing`
- 사이드 내비 `Foundations › Spacing & Layout`

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Spacing & Layout                                       │
├────────────────────────────────────────────────────────────┤
│ § 간격 스케일      Table (C-030)                           │
│  막대 미리보기 │ 토큰 키 │ 계층 │ 값 │ 용도               │
├────────────────────────────────────────────────────────────┤
│ § 브레이크포인트 3단계   Table (C-030)                     │
│  breakpoint.sm 560px │ breakpoint.md 800px │ .lg 1080px    │
│  Banner tone="info" (C-060)                                │
│   커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않는다.   │
│   빌드가 리터럴 px로 치환한다.                             │
├────────────────────────────────────────────────────────────┤
│ § 레이아웃 프리미티브 5종                                  │
│  각 클래스마다: 실물 데모 + CodeBlock (C-032)              │
│  ┌ cdt-app-shell ───────────────────────────────────┐      │
│  │ ┌────┬──────────────────┐  ← 실물 렌더           │      │
│  │ │nav │ content          │                        │      │
│  │ └────┴──────────────────┘                        │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌ cdt-split-layout ─── 800px 미만에서 단일 컬럼 ───┐      │
│  ┌ cdt-card-grid ────── 최소 컬럼 320px auto-fill ──┐      │
│  │                       560px 미만에서 단일 컬럼    │      │
│  ┌ cdt-page ────────────────────────────────────────┐      │
│  ┌ cdt-content-stack ───────────────────────────────┐      │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 간격 스케일 | 간격 토큰의 키, 계층, 값, 용도 | FR-DOC-002 AC-3 |
| 브레이크포인트 3단계 | `sm`(560px), `md`(800px), `lg`(1080px)와 JS에서 읽는 `breakpoints` 객체 | FR-TOK-009 AC-1, AC-3 |
| 미디어쿼리 치환 안내 | 산출 CSS의 `@media` 조건에 `var(--cdt-breakpoint-*)`가 0건이다 | FR-TOK-009 AC-2, SRS 5.2 제약 3 |
| 레이아웃 프리미티브 5종 | `cdt-app-shell`, `cdt-split-layout`, `cdt-card-grid`, `cdt-page`, `cdt-content-stack` | FR-CSS-003 AC-1 |
| 전환 규칙 | `cdt-split-layout`은 800px 미만 단일 컬럼, `cdt-card-grid`는 최소 컬럼 320px `auto-fill`이며 560px 미만 단일 컬럼 | FR-CSS-003 AC-2, AC-3 |

### 사용 컴포넌트

C-030 Table, C-032 CodeBlock, C-060 Banner, C-012 Panel.

레이아웃 프리미티브는 CSS 클래스이며 React 컴포넌트가 아니다. 데모는 클래스를 직접 적용한 `div`로 렌더한다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 렌더 완료 |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 | 데모 컨테이너의 배경과 경계가 선택된 테마를 따른다. 레이아웃 클래스는 색상 속성을 선언하지 않으므로(FR-CSS-003 AC-4) 데모 컨테이너에만 표면 토큰을 적용한다 |
| `snippet.copy` | 각 CodeBlock의 복사 버튼 | FLOW-006 참조 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절).

### 구현 노트

1. 레이아웃 데모는 뷰포트가 아니라 컨테이너 폭에 반응하는 것처럼 보이면 안 된다. 전환 기준은 뷰포트 폭이다(FR-CSS-003 AC-2, AC-3). 데모 옆에 현재 뷰포트 폭과 활성 브레이크포인트를 표시해 관찰 가능하게 한다.
2. 도메인 전용 레이아웃(`.thread-page`, `.tool-grid`)은 제공하지 않으며 이 화면에 등장하지 않는다(FR-CSS-003 예외/실패 처리).
3. 브레이크포인트 값은 `@conductor/tokens`가 export하는 `breakpoints` 객체에서 읽는다. 화면에 560/800/1080을 리터럴로 쓰지 않는다(FR-TOK-009 AC-3, FR-DOC-002 AC-1).

---

## W-013 Foundations · Radius & Elevation

경로: `/foundations/elevation` · 우선순위: P1 · 관련 요구사항: FR-DOC-002

### 화면 목적

반경 토큰과 고도 토큰을 현재 테마 값으로 조회한다.

### 진입 경로

- 직접 URL `/foundations/elevation`
- 사이드 내비 `Foundations › Radius & Elevation`

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Radius & Elevation                                     │
├────────────────────────────────────────────────────────────┤
│ § 반경 (radius.*)                                          │
│  CardGrid (C-011)                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ ▢      │ │ ▢      │ │ ▢      │ │ ▢      │  실물 모서리 │
│  │ 키/값  │ │ 키/값  │ │ 키/값  │ │ 키/값  │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│  + Table (C-030)  토큰 키 · 계층 · 값 · 용도               │
├────────────────────────────────────────────────────────────┤
│ § 고도 (elevation.*)                                       │
│  CardGrid (C-011)  각 카드가 해당 그림자를 실제로 적용     │
│  + Table (C-030)  토큰 키 · 계층 · 값 · 용도               │
├────────────────────────────────────────────────────────────┤
│ § 겹침 순서 안내                                           │
│  Panel (C-012)  z 스케일은 W-030에서 조회한다 → /tokens    │
└────────────────────────────────────────────────────────────┘
  뷰포트 <560px: CardGrid 단일 컬럼 (FR-CSS-003 AC-3)
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 반경 | 각 `radius.*` 토큰의 키, 계층, 현재 테마 값, 용도. 스와치가 실제 모서리를 렌더한다 | FR-DOC-002 AC-3 |
| 고도 | 각 `elevation.*` 토큰의 키, 계층, 현재 테마 값, 용도. 스와치가 실제 그림자를 렌더한다 | FR-DOC-002 AC-3 |
| 겹침 순서 안내 | `z.*` 스케일의 소유 화면은 W-030이다 | FR-TOK-008 (관련 화면: W-030) |

### 사용 컴포넌트

C-011 CardGrid, C-010 Card(정적, `div`로 렌더), C-030 Table, C-012 Panel.

정적 `Card`는 포커스를 받지 않는다(FR-CMP-003 AC-3). 스와치는 클릭 대상이 아니므로 정적 모드를 사용한다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 토큰 JSON을 읽어 렌더한 뒤 |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 | 고도 스와치의 그림자와 값 열이 선택된 테마 값으로 갱신된다 |
| `nav.select` | Panel의 W-030 링크 | `/tokens`로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절).

### 구현 노트

1. 고도 스와치는 `surface.raised` 위에 놓아 그림자가 관찰 가능하게 한다. 배경 표면 토큰은 화면이 아니라 `tokens.json`에서 읽는다(FR-DOC-002 AC-1).
2. 값 열은 현재 선택된 테마의 값 하나만 표시한다(FR-DOC-002 AC-3). 두 테마 값을 나란히 비교하는 표는 W-030이 소유한다(FR-DOC-004 AC-2).

---

## W-014 Foundations · Motion

경로: `/foundations/motion` · 우선순위: P1 · 관련 요구사항: FR-CSS-005, FR-DOC-002

### 화면 목적

모션 토큰을 조회하고, `prefers-reduced-motion: reduce` 설정이 렌더 결과에 미치는 영향을 관찰한다.

### 진입 경로

- 직접 URL `/foundations/motion`
- 사이드 내비 `Foundations › Motion`

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Motion                                                 │
├────────────────────────────────────────────────────────────┤
│ § 현재 환경                                                │
│  Banner tone="info" (C-060)                                │
│   prefers-reduced-motion: reduce 감지됨 / 감지되지 않음    │
├────────────────────────────────────────────────────────────┤
│ § 지속 시간과 이징      Table (C-030)                      │
│  토큰 키 │ 계층 │ 값 │ 용도 │ 재생 [Button (C-001)]        │
├────────────────────────────────────────────────────────────┤
│ § 모션 감소 규칙                                           │
│  Panel (C-012) + CodeBlock (C-032)                         │
│   감소 모드에서 transition-duration / animation-duration   │
│   계산값이 0s이며 scroll-behavior가 auto다.                │
│   상태 변화의 최종 시각 결과는 동일하다.                   │
├────────────────────────────────────────────────────────────┤
│ § 진행 표시의 감소 모드 대체                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Spinner (C-064)  │  │ ProgressRing     │                │
│  │ 감소 모드: 진행률 │  │ (C-063)          │                │
│  │ 텍스트로 대체     │  │ 감소 모드: 동일  │                │
│  └──────────────────┘  └──────────────────┘                │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 현재 환경 | `prefers-reduced-motion` 감지 결과 | FR-CSS-005 |
| 지속 시간과 이징 | 모션 토큰의 키, 계층, 현재 값, 용도. 각 행에서 전환을 재생한다 | FR-DOC-002 AC-3 |
| 모션 감소 규칙 | 감소 모드에서 지속 시간 계산값 `0s`, `scroll-behavior: auto`, 최종 시각 결과 동일 | FR-CSS-005 AC-1, AC-2, AC-3 |
| 진행 표시의 감소 모드 대체 | `Spinner`와 `ProgressRing`이 애니메이션 대신 정적 진행률 텍스트를 노출한다 | FR-CSS-005 예외/실패 처리 |

### 사용 컴포넌트

C-030 Table, C-060 Banner, C-012 Panel, C-032 CodeBlock, C-001 Button, C-064 Spinner, C-063 ProgressRing.

`Banner tone="info"`는 `role="status"`를 갖는다(FR-CMP-008 AC-1).

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 렌더 완료 |
| `reduced_motion` | `prefers-reduced-motion: reduce`가 설정되어 있다. 재생 버튼은 유지되며 전환이 즉시 완료된 최종 상태를 보여준다 |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 | 데모 요소의 색이 선택된 테마를 따른다 |

재생 버튼은 화면 내부의 데모 전환만 실행한다. 화면 이동과 상태 전이를 발생시키지 않으므로 플로우 이벤트를 정의하지 않는다.

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절).

### 구현 노트

1. 감소 모드 규칙은 `cdt.base` 레이어에 존재하며 전역 `*` 셀렉터 대신 Conductor 스코프 셀렉터를 사용한다(FR-CSS-005 AC-4). 이 화면의 데모는 Conductor 스코프 밖 요소를 사용하지 않는다.
2. 이 화면은 `prefers-reduced-motion`을 화면 내 토글로 덮어쓰지 않는다. 사용자 시스템 설정을 무시하는 장치를 만들면 FR-CSS-005의 검증 의미가 사라진다. 감지 결과만 표시한다.
3. 감소 모드에서도 상태 변화(hover, focus, selected)의 최종 시각 결과는 동일하다(FR-CSS-005 AC-2). 데모는 전환 전후 상태를 정지 화면으로 비교 가능하게 배치한다.

---

## W-020 Components Index

경로: `/components` · 우선순위: P0 · 관련 요구사항: FR-CSS-004, FR-CMP-002, FR-CMP-003, FR-CMP-004, FR-CMP-005, FR-CMP-006, FR-CMP-007, FR-CMP-008, FR-DOC-003

### 화면 목적

`@conductor/react` 공개 진입점에 export된 컴포넌트 전수를 컴포넌트군별로 카탈로그화한다. 공개 진입점에 export되었으나 카탈로그에 화면이 없는 컴포넌트가 0건이며, 위반 시 빌드가 실패한다(FR-DOC-003 AC-5).

### 진입 경로

- 직접 URL `/components`
- 사이드 내비 `Components`
- W-001 패키지 카드(`@conductor/react`) 및 다음 단계 버튼
- W-002 본문 링크
- 존재하지 않는 `componentId` 경로 진입 시 `404.html`이 이 화면의 `not_found` 상태를 렌더한다(FLOW-001 딥링크 규칙)

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Components                                             │
│ 카탈로그 항목 수 = @conductor/react 공개 export 수         │
├────────────────────────────────────────────────────────────┤
│ § 액션 (FR-CMP-002)                                        │
│  CardGrid (C-011)                                          │
│  ┌─ Card (C-010, href) ─┐ ┌─ Card ──────────────┐          │
│  │ Button               │ │ IconButton          │          │
│  │ 축소 프리뷰 (실물)   │ │ 축소 프리뷰 (실물)  │          │
│  │ 요약 한 줄           │ │ 요약 한 줄          │          │
│  └──────────────────────┘ └─────────────────────┘          │
├────────────────────────────────────────────────────────────┤
│ § 표면 (FR-CMP-003)      Card · CardGrid · Panel            │
│ § 상태 표시 (FR-CMP-004) Badge · StatusBadge · SeverityTag  │
│ § 데이터 표시 (FR-CMP-005) Table · Timeline · CodeBlock ·   │
│                            Kbd                              │
│ § 오버레이 (FR-CMP-006)  Dialog · Drawer · Tooltip ·        │
│                          DropdownMenu                       │
│ § 폼 (FR-CMP-007)        Field · TextField · TextArea ·     │
│                          Select · Switch · Checkbox         │
│ § 피드백 (FR-CMP-008)    Banner · EmptyState · Meter ·      │
│                          ProgressRing · Spinner             │
│ § 셸 (FR-CMP-009)        AppShell · NavList · TopBar        │
│    Banner tone="info" (C-060)  OD-004 미해소 시 이 군은     │
│    문서 사이트 내부 컴포넌트로 강등될 수 있다.              │
└────────────────────────────────────────────────────────────┘
  뷰포트 <560px: CardGrid 단일 컬럼 (FR-CSS-003 AC-3)
```

### 섹션 정의

섹션은 컴포넌트군이며, 각 군은 하나의 FR에 대응한다. 군을 임의로 추가하지 않는다.

| 섹션 | 컴포넌트 | 근거 |
| --- | --- | --- |
| 액션 | C-001 Button, C-002 IconButton | FR-CMP-002 |
| 표면 | C-010 Card, C-011 CardGrid, C-012 Panel | FR-CMP-003 |
| 상태 표시 | C-020 Badge, C-021 StatusBadge, C-022 SeverityTag | FR-CMP-004 |
| 데이터 표시 | C-030 Table, C-031 Timeline, C-032 CodeBlock, C-033 Kbd | FR-CMP-005 |
| 오버레이 | C-040 Dialog, C-041 Drawer, C-042 Tooltip, C-043 DropdownMenu | FR-CMP-006 |
| 폼 | C-050 Field, C-051 TextField, C-052 TextArea, C-053 Select, C-054 Switch, C-055 Checkbox | FR-CMP-007 |
| 피드백 | C-060 Banner, C-061 EmptyState, C-062 Meter, C-063 ProgressRing, C-064 Spinner | FR-CMP-008 |
| 셸 | C-070 AppShell, C-071 NavList, C-072 TopBar | FR-CMP-009 (Should, OD-004 조건부) |

### 사용 컴포넌트

C-011 CardGrid, C-010 Card(대화형, `href="/components/:componentId"`), C-060 Banner, C-061 EmptyState(`not_found` 상태에서만).

카드 내부의 축소 프리뷰는 컴포넌트를 실제로 마운트해 렌더한다. 스크린샷 이미지가 0건이다(FR-DOC-003 AC-1). 대화형 `Card` 내부에 중첩 대화형 요소를 넣지 않는다(FR-CMP-003 예외/실패 처리). 따라서 카드 프리뷰의 컴포넌트는 `inert` 처리하고 카드 전체가 단일 링크로 동작한다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 카탈로그 렌더 완료 |
| `partial_failure` | 카드 축소 프리뷰 한 개가 렌더 중 예외를 일으켜 오류 경계로 격리된다. 나머지 카드는 계속 렌더된다(FR-DOC-003 예외/실패 처리) |
| `not_found` | `404.html` 경로로 진입했다. 카탈로그 상단에 `EmptyState`가 존재하지 않는 컴포넌트 경로와 카탈로그 복귀 안내를 표시한다 |

`empty` 상태는 정의하지 않는다. 카탈로그가 비면 export 전수 대응 검사가 이미 빌드를 실패시켰기 때문이다(FR-DOC-003 AC-5).

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `component.open` | 컴포넌트 카드 클릭 또는 Enter | `/components/:componentId`(W-021)로 이동. FLOW-001 참조 |
| `theme.toggle` | 상단바 토글 | 축소 프리뷰가 선택된 테마를 따른다(FR-DOC-003 AC-4) |
| `nav.select` | 사이드 내비 항목 | 대상 화면으로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). 모든 카탈로그 항목이 모든 방문자에게 노출된다.

### 구현 노트

1. 카탈로그 항목은 컴포넌트 메타데이터(`ENT-CMP-001`)에서 생성한다. 화면 코드에 컴포넌트 이름 목록을 하드코딩하지 않는다. 하드코딩하면 FR-DOC-003 AC-5의 검사가 무의미해진다.
2. 항목 수는 30개다. OD-004가 (b)로 결정되어 C-070 ~ C-072가 문서 사이트 내부 컴포넌트로 강등되면 셸 섹션이 카탈로그에서 사라지고 항목 수는 27개가 된다. 이 수는 문서가 아니라 빌드가 결정한다.
3. 축소 프리뷰는 컴포넌트당 대표 조합 한 개만 렌더한다. 모든 `variant`와 `tone` 조합은 W-021이 렌더한다(FR-DOC-003 AC-3).
4. 컴포넌트 클래스는 자식 구조 셀렉터(`>`, `+`, `:nth-child`)에 의존하지 않는다(FR-CSS-004 AC-4). 카드 안에서 중첩 렌더되어도 스타일이 유지되는지가 이 화면에서 관찰된다.

---

## W-021 Component Detail

경로: `/components/:componentId` · 우선순위: P0 · 관련 요구사항: FR-CMP-001 ~ FR-CMP-009, FR-CSS-004, FR-DOC-003, FR-DOC-006, FR-DX-002

### 화면 목적

컴포넌트 1종의 라이브 프리뷰, props 표, 사용 규칙, 코드 스니펫을 제공한다. 이 화면은 동적 라우트이며, 라우트 인스턴스 하나가 컴포넌트 하나에 대응한다.

### 동적 라우트

빌드가 컴포넌트 메타데이터(`ENT-CMP-001`)에서 경로를 전수 생성한다. `componentId`는 컴포넌트명(PascalCase)을 kebab-case로 변환한 값이다. 변환 규칙은 `../10_requirements/glossary.md` 3절의 CSS 클래스 규칙과 동일한 기계적 변환이다.

| C-### | 컴포넌트 | `componentId` | 컴포넌트군 |
| --- | --- | --- | --- |
| C-001 | Button | `button` | 액션 |
| C-002 | IconButton | `icon-button` | 액션 |
| C-010 | Card | `card` | 표면 |
| C-011 | CardGrid | `card-grid` | 표면 |
| C-012 | Panel | `panel` | 표면 |
| C-020 | Badge | `badge` | 상태 표시 |
| C-021 | StatusBadge | `status-badge` | 상태 표시 |
| C-022 | SeverityTag | `severity-tag` | 상태 표시 |
| C-030 | Table | `table` | 데이터 표시 |
| C-031 | Timeline | `timeline` | 데이터 표시 |
| C-032 | CodeBlock | `code-block` | 데이터 표시 |
| C-033 | Kbd | `kbd` | 데이터 표시 |
| C-040 | Dialog | `dialog` | 오버레이 |
| C-041 | Drawer | `drawer` | 오버레이 |
| C-042 | Tooltip | `tooltip` | 오버레이 |
| C-043 | DropdownMenu | `dropdown-menu` | 오버레이 |
| C-050 | Field | `field` | 폼 |
| C-051 | TextField | `text-field` | 폼 |
| C-052 | TextArea | `text-area` | 폼 |
| C-053 | Select | `select` | 폼 |
| C-054 | Switch | `switch` | 폼 |
| C-055 | Checkbox | `checkbox` | 폼 |
| C-060 | Banner | `banner` | 피드백 |
| C-061 | EmptyState | `empty-state` | 피드백 |
| C-062 | Meter | `meter` | 피드백 |
| C-063 | ProgressRing | `progress-ring` | 피드백 |
| C-064 | Spinner | `spinner` | 피드백 |
| C-070 | AppShell | `app-shell` | 셸 |
| C-071 | NavList | `nav-list` | 셸 |
| C-072 | TopBar | `top-bar` | 셸 |

라우트 인스턴스 수는 30이다. OD-004가 (b)로 결정되면 `app-shell`, `nav-list`, `top-bar` 경로가 산출물에서 사라지고 27이 된다. 이 목록은 문서가 아니라 공개 export가 결정한다(FR-DOC-003 AC-5).

### 진입 경로

- W-020 카탈로그 카드 (`component.open`)
- 직접 URL 딥링크 `/components/button` 등 (FLOW-001)
- W-040의 사용 규칙 항목에서 해당 컴포넌트로 이동

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ ← Components (C-001 Button ghost, → W-020)                 │
│ H1  Button                        Badge (C-020) 액션        │
│ 요약 한 줄 · 관련 FR: FR-CMP-002                           │
├────────────────────────────────────────────────────────────┤
│ § 라이브 프리뷰                                            │
│  Panel (C-012)  variant × tone 전수 조합                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ primary   [ Button ] [ Button loading ] [ disabled ] │  │
│  │ secondary [ Button ] [ Button loading ] [ disabled ] │  │
│  │ ghost     [ Button ] [ Button loading ] [ disabled ] │  │
│  └──────────────────────────────────────────────────────┘  │
│  프리뷰는 현재 선택된 테마를 따른다 (FR-DOC-003 AC-4)      │
├────────────────────────────────────────────────────────────┤
│ § 코드 스니펫                                              │
│  CodeBlock (C-032)              [복사 IconButton (C-002)]  │
│  aria-live="polite" 영역 (복사됨)                          │
├────────────────────────────────────────────────────────────┤
│ § props                                                    │
│  Table (C-030)  이름 │ 타입 │ 기본값 │ 필수 │ 설명        │
│  @conductor/react 타입 정의에서 생성 (FR-DOC-003 AC-2)     │
├────────────────────────────────────────────────────────────┤
│ § 공통 계약                                                │
│  Table (C-030)  ref 전달 │ className 병합 │ data-*/aria-*  │
│                 네이티브 props 확장 (FR-CMP-001)           │
├────────────────────────────────────────────────────────────┤
│ § 사용 규칙                                                │
│  권장 예 / 금지 예 + 금지 사유  → 상세는 W-040             │
├────────────────────────────────────────────────────────────┤
│ § CSS 클래스                                               │
│  CodeBlock (C-032)  cdt-btn cdt-btn--primary               │
│  React 없이 동일한 계산된 스타일 (FR-CSS-004 AC-3)         │
└────────────────────────────────────────────────────────────┘
  뷰포트 <800px: Table이 가로 스크롤을 자체 소유 (FR-CMP-005 AC-1)
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 헤더 | 컴포넌트명, 컴포넌트군, 요약, 관련 FR ID, W-020 복귀 링크 | FR-DOC-003 |
| 라이브 프리뷰 | 컴포넌트를 실제 DOM으로 마운트해 모든 `variant`와 `tone` 조합을 렌더한다. 스크린샷 이미지 0건 | FR-DOC-003 AC-1, AC-3, AC-4 |
| 코드 스니펫 | 프리뷰의 소스 코드와 복사 버튼 | FR-DOC-006 |
| props | `@conductor/react` 타입 정의에서 생성한 표. 수동 작성 행 0건 | FR-DOC-003 AC-2, FR-DX-002 |
| 공통 계약 | ref 전달, `className` 병합, `data-*`/`aria-*` 통과, 네이티브 props 확장 | FR-CMP-001 AC-1 ~ AC-4 |
| 사용 규칙 | 권장 예와 금지 예, 금지 사유. 컴포넌트군별 상세 규칙은 W-040 | FR-DOC-003, FR-DOC-007 |
| CSS 클래스 | 대응 `cdt-` 클래스와 React 없이 동일 스타일을 얻는 방법 | FR-CSS-004 AC-2, AC-3 |

오버레이 컴포넌트(C-040, C-041, C-042, C-043)의 프리뷰는 트리거 버튼을 렌더하고, 트리거 조작으로 오버레이를 연다. 오버레이 동작(포커스 트랩, Escape, 포커스 복귀, 배경 스크롤 잠금)은 FLOW-004가 정의한다.

폼 컴포넌트(C-050 ~ C-055)의 프리뷰는 기본, 오류, `disabled` 세 상태를 렌더한다. 오류 상태는 `aria-invalid="true"`와 오류 메시지 텍스트를 함께 갖는다(FR-CMP-007 AC-2, FR-A11Y-003 AC-2).

### 사용 컴포넌트

C-012 Panel, C-032 CodeBlock, C-002 IconButton, C-030 Table, C-020 Badge, C-001 Button, C-060 Banner(`partial_failure` 상태), C-061 EmptyState(`not_found` 상태 안내).

프리뷰 대상 컴포넌트 자체는 `componentId`에 따라 결정된다. 30종 전수가 최소 한 번은 프리뷰 대상으로 마운트된다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 프리뷰, props 표, 스니펫 렌더 완료 |
| `partial_failure` | 프리뷰 한 개가 렌더 중 예외를 일으켜 오류 경계로 격리된다. 해당 프리뷰 영역만 `Banner tone="danger"`로 대체되고 나머지 섹션은 계속 렌더된다(FR-DOC-003 예외/실패 처리) |
| `copy_unavailable` | Clipboard API를 사용할 수 없거나 클립보드 쓰기가 거부되었다. 복사 버튼이 `disabled`이거나 `복사할 수 없음`을 표시하고, 코드 블록 텍스트는 선택 가능한 상태로 유지된다(FR-DOC-006 AC-3, 예외/실패 처리) |
| `reduced_motion` | `prefers-reduced-motion: reduce`가 설정되어 있다. `spinner`, `progress-ring` 프리뷰가 진행률 텍스트를 노출한다(FR-CMP-008 AC-5) |

`not_found`는 이 화면에서 발생하지 않는다. 존재하지 않는 `componentId` 경로는 산출물에 없으므로 `404.html`이 W-020의 `not_found` 상태를 렌더한다.

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `snippet.copy` | 복사 버튼 | 소스를 클립보드에 기록하고 2초 이내 `복사됨`을 표시한 뒤 복귀한다. 완료는 `aria-live="polite"` 영역으로 알려진다(FR-DOC-006 AC-1, AC-2). FLOW-006 참조 |
| `overlay.open` | 오버레이 프리뷰의 트리거 | 포커스가 오버레이 내부에 갇히고 배경 스크롤이 잠긴다(FR-CMP-006 AC-1, AC-2). FLOW-004 참조 |
| `overlay.close` | Escape 또는 닫기 버튼 | 오버레이가 닫히고 포커스가 트리거로 복귀한다(FR-A11Y-002 AC-3). FLOW-004 참조 |
| `theme.toggle` | 상단바 토글 | 프리뷰가 선택된 테마를 따른다(FR-DOC-003 AC-4) |
| `component.open` | 헤더의 W-020 복귀 링크 | `/components`로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). `Button`의 `disabled` 상태와 차단 사유 표시(FR-CMP-002 AC-5)는 소비자 애플리케이션의 정책을 표현하는 시각 장치이며, 문서 사이트 자신의 권한 검사가 아니다. 프리뷰는 이 시각 장치를 예시로 렌더한다.

### 구현 노트

1. props 표는 타입 정의에서 생성한다. 수동으로 작성한 props 행이 0건이다(FR-DOC-003 AC-2). 산출된 `.d.ts`에 `any` 타입이 0건이므로(FR-DX-002 AC-2) 표의 타입 열에 `any`가 등장하지 않는다.
2. 프리뷰는 오류 경계로 격리한다. 한 프리뷰의 예외가 화면 전체를 내리지 않는다(FR-DOC-003 예외/실패 처리).
3. `IconButton` 프리뷰는 `aria-label`을 필수로 전달한다. 누락 시 TypeScript 컴파일 오류가 발생하므로(FR-CMP-002 AC-3) 누락 사례를 코드로 렌더할 수 없다. 누락 사례는 문장으로만 기술한다.
4. `Table` 프리뷰에 `caption` 또는 `aria-label`을 부여한다(FR-CMP-005 AC-5).
5. `Banner tone="danger"` 프리뷰는 `action` 슬롯을 채운다. 슬롯이 비면 개발 빌드가 콘솔 경고를 출력한다(FR-CMP-008 AC-2).
6. 오버레이의 `z-index`는 `z.overlay`와 `z.popover` 토큰을 사용한다(FR-CMP-006 AC-4). 프리뷰가 문서 사이트 셸 위에 렌더되어도 셸의 `z.sticky` 상단바를 덮는다.
7. Radix가 소유하는 DOM 구조에는 `data-*` 속성 셀렉터만 사용한다(FR-CSS-004 예외/실패 처리, FR-CMP-006 예외/실패 처리).

---

## W-030 Tokens Reference

경로: `/tokens` · 우선순위: P0 · 관련 요구사항: FR-TOK-004, FR-TOK-008, FR-THM-001, FR-THM-002, FR-THM-003, FR-THM-004, FR-DOC-004, FR-DOC-005, FR-A11Y-004, FR-QA-001

### 화면 목적

모든 semantic 및 component 토큰의 키, 두 테마의 값, 대비율, 판정 결과를 한 표에서 조회한다. SCN-003(접근성 검토자의 라이트 테마 승인)의 진입 화면이다.

### 진입 경로

- 직접 URL `/tokens`
- 사이드 내비 `Tokens`
- W-001 패키지 카드(`@conductor/tokens`)
- W-010의 대비율 안내 Panel, W-013의 겹침 순서 안내 Panel

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Tokens                                                 │
│ [Banner tone="warning" (C-060)] ← metrics_unavailable 시   │
│   대비 검사 결과 파일이 없습니다. 대비율 열은 측정되지     │
│   않음으로 표시됩니다.                                     │
├────────────────────────────────────────────────────────────┤
│ TextField (C-051)  🔎 토큰 키 필터                          │
│  일치하는 행만 남는다 (FR-DOC-004 AC-1)                    │
├────────────────────────────────────────────────────────────┤
│ Table (C-030)                                              │
│ ┌────────────┬────────┬──────┬───────┬───────┬──────────┐  │
│ │ 토큰 키    │ 계층   │ 다크 │ 라이트│ 대비율│ 판정     │  │
│ ├────────────┼────────┼──────┼───────┼───────┼──────────┤  │
│ │ surface.base│semantic│ ▉ #..│ ▉ #.. │  —    │ 대상 아님│  │
│ │ text.default│semantic│ ▉ #..│ ▉ #.. │ 12.4:1│ pass ✓   │  │
│ │ text.faint  │semantic│ ▉ #..│ ▉ #.. │  3.1:1│ 장식 전용│  │
│ │ status.danger│semantic│▉ #..│ ▉ #.. │  4.8:1│ pass ✓   │  │
│ └────────────┴────────┴──────┴───────┴───────┴──────────┘  │
│  뷰포트 <800px: 가로 스크롤 (FR-CMP-005 AC-1)              │
├────────────────────────────────────────────────────────────┤
│ § 겹침 순서 (z.*)   Table (C-030)                          │
│  base 0 · raised 10 · sticky 20 · drawer 30 ·              │
│  overlay 40 · popover 50                                   │
│  Panel (C-012)  소비자가 Conductor 오버레이 위에 자체      │
│  레이어를 쌓아야 하면 z.popover 초과 값을 직접 지정한다.   │
├────────────────────────────────────────────────────────────┤
│ § 산출 형식      CodeBlock (C-032)                         │
│  토큰 키 surface.raised → CSS --cdt-surface-raised          │
│                        → TS tokens.surface.raised           │
├────────────────────────────────────────────────────────────┤
│ § 제외 목록      Table (C-030)                             │
│  usage: "decorative" 토큰과 제외 사유                      │
├────────────────────────────────────────────────────────────┤
│ [EmptyState (C-061)] ← empty 상태: 필터 결과 0건           │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 필터 | 토큰 키 문자열로 필터하면 일치하는 행만 남는다 | FR-DOC-004 AC-1 |
| 토큰 표 | 색상 토큰 행이 다크 값과 라이트 값을 나란히 표시한다 | FR-DOC-004 AC-2 |
| 대비율과 판정 | FR-THM-004의 검사 대상 쌍에 속한 토큰은 대비율 수치와 pass/fail 판정을 표시한다 | FR-DOC-004 AC-3, FR-A11Y-004 |
| 장식 전용 표식 | 대비 검사 제외 토큰은 `장식 전용` 표식과 제외 사유를 표시한다 | FR-DOC-004 AC-4, FR-A11Y-004 AC-3 |
| 겹침 순서 | `z.base`(0), `z.raised`(10), `z.sticky`(20), `z.drawer`(30), `z.overlay`(40), `z.popover`(50) | FR-TOK-008 AC-1 |
| 소비자 레이어 안내 | `z.popover` 초과 값은 소비자가 직접 지정한다 | FR-TOK-008 예외/실패 처리 |
| 산출 형식 | 토큰 키 → CSS 커스텀 프로퍼티 → TypeScript 경로의 기계적 변환 | FR-TOK-004 AC-2 |
| 제외 목록 | `usage: "decorative"` 메타데이터를 가진 토큰과 제외 사유 | FR-THM-004 예외/실패 처리 |

### 사용 컴포넌트

C-030 Table, C-051 TextField(필터), C-060 Banner(`metrics_unavailable`), C-061 EmptyState(`empty`), C-012 Panel, C-032 CodeBlock, C-020 Badge(판정 표식).

`TextField`에는 라벨이 있어야 한다. 없으면 개발 빌드가 콘솔 경고를 출력한다(FR-CMP-007 AC-3). 시각적으로 라벨을 숨기려면 `cdt.utility` 레이어의 `sr-only` 클래스를 사용한다(FR-CSS-002 AC-5).

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 토큰 표 렌더 완료 |
| `empty` | 필터 문자열과 일치하는 토큰 키가 0건이다. `EmptyState`가 필터 문자열과 필터 해제 액션을 표시한다 |
| `metrics_unavailable` | 대비 검사 결과 파일이 없다. 대비율 열을 `측정되지 않음`으로 표시하고 화면 상단에 경고 배너를 노출한다(FR-DOC-004 예외/실패 처리) |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `token.filter` | 필터 입력 변경 | 일치하는 행만 남는다. 0건이면 `empty` 상태로 전이한다 |
| `theme.toggle` | 상단바 토글 | 스와치의 렌더 테마가 바뀐다. 다크·라이트 값 열은 두 테마 값을 항상 함께 표시하므로 토글과 무관하다. 재페인트 완료 100ms 이하(NFR-001). FLOW-002 참조 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). 접근성 검토자가 릴리스 게이트를 차단하는 권한은 저장소 승인 권한이며 이 화면이 검사하지 않는다.

### 구현 노트

1. 두 테마 값 열은 현재 선택된 테마와 무관하게 항상 함께 표시한다(FR-DOC-004 AC-2). 테마 토글은 스와치의 렌더 컨텍스트만 바꾼다.
2. 대비율 계산은 빌드가 수행하고 이 화면은 결과 파일을 읽는다. 화면에서 대비율을 다시 계산하지 않는다. 계산은 WCAG 2.1의 상대 휘도 공식을 사용하고 alpha가 있는 색은 배경과 합성한 뒤 계산한다(FR-THM-004 AC-4).
3. 판정 기준은 쌍마다 `body`(4.5:1), `large`(3:1), `nonText`(3:1) 중 하나다(FR-THM-004 AC-2). 판정 열에 기준값을 함께 표시한다.
4. 검사 대상이 아닌 토큰의 대비율 열은 `대상 아님`으로 표시한다. `장식 전용`(제외)과 `대상 아님`(쌍 미선언)은 다른 표식이다.
5. OD-001이 미해소 상태다. `text.faint`와 `text.muted`의 판정은 OD-001의 결정에 따라 확정되며, 이 화면은 결과 파일이 보고한 판정을 그대로 표시한다. 화면이 판정을 근사하지 않는다(FR-A11Y-004 예외/실패 처리).
6. 두 테마의 semantic 토큰 키 집합은 동일하다(FR-QA-001). 한 테마에만 존재하는 키가 있으면 테스트가 이미 실패했으므로 이 표에 한쪽 값이 빈 행은 나타나지 않는다.
7. primitive 토큰은 표에 나타나지 않는다(FR-TOK-004 AC-4).

---

## W-040 Patterns

경로: `/patterns` · 우선순위: P2 · 관련 요구사항: FR-TOK-005, FR-CMP-004, FR-DOC-007, FR-A11Y-003

### 화면 목적

상태색, 심각도, 밀도, 오버레이 선택에 대한 사용 규칙을 권장 예와 금지 예로 제시한다. 각 예는 실제 렌더된 컴포넌트다(FR-DOC-007 AC-1).

### 진입 경로

- 직접 URL `/patterns`
- 사이드 내비 `Patterns`
- W-021 사용 규칙 섹션의 상세 링크

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Patterns                                               │
├────────────────────────────────────────────────────────────┤
│ § 상태색 7종의 사용 시점                                   │
│  Table (C-030)  상태 │ 의미 │ 사용 시점 │ StatusBadge      │
│                 queued  … neutralEnd                       │
├────────────────────────────────────────────────────────────┤
│ § 심각도 4종의 사용 시점                                   │
│  Table (C-030)  read · write · destructive · blocked       │
│                 SeverityTag (C-022) 실물                   │
├────────────────────────────────────────────────────────────┤
│ § 규칙: 색만으로 상태를 전달하지 않는다                    │
│  split-layout (800px 미만 단일 컬럼)                       │
│  ┌ 권장 ─────────────────┐ ┌ 금지 ─────────────────┐       │
│  │ ✓ StatusBadge         │ │ ✗ 색 점만 있는 배지   │       │
│  │   색 + 아이콘 + 텍스트│ │   금지 사유: 그레이스 │       │
│  │                       │ │   케일에서 7종이 구분 │       │
│  │                       │ │   되지 않는다.        │       │
│  └───────────────────────┘ └───────────────────────┘       │
├────────────────────────────────────────────────────────────┤
│ § 규칙: 폼 오류를 색만으로 표시하지 않는다                 │
│  권장(오류 메시지 + aria-invalid) / 금지(경계 색만)        │
├────────────────────────────────────────────────────────────┤
│ § 규칙: 임계 초과 Meter는 수치 텍스트를 표시한다           │
│  권장 / 금지                                               │
├────────────────────────────────────────────────────────────┤
│ § 밀도                                                     │
│  본문 14px · 행 높이 1.5 · 폼 컨트롤 최소 높이 40px        │
│  뷰포트 560px 미만에서 42px                                │
├────────────────────────────────────────────────────────────┤
│ § Dialog와 Drawer의 선택 기준                              │
│  Table (C-030) + 두 오버레이의 실물 트리거                 │
├────────────────────────────────────────────────────────────┤
│ § 생략된 컴포넌트군                                        │
│  Panel (C-012)  규칙이 없는 컴포넌트군과 생략 사실         │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 상태색 7종의 사용 시점 | 각 상태의 의미와 사용 시점 | FR-DOC-007 AC-3, FR-TOK-005 AC-1 |
| 심각도 4종의 사용 시점 | 각 심각도의 의미와 사용 시점 | FR-DOC-007 AC-3, FR-TOK-005 AC-2 |
| 색 비의존 규칙 (상태) | `StatusBadge`와 `SeverityTag`는 아이콘과 텍스트를 함께 렌더한다 | FR-A11Y-003 AC-1, FR-CMP-004 AC-1, AC-5 |
| 색 비의존 규칙 (폼 오류) | 오류 상태는 색상 외에 오류 메시지 텍스트와 `aria-invalid`를 갖는다 | FR-A11Y-003 AC-2 |
| 색 비의존 규칙 (Meter) | 임계 초과 상태는 색상 외에 수치 텍스트를 표시한다 | FR-A11Y-003 AC-3 |
| 밀도 | 본문 14px, 행 높이 1.5, 폼 컨트롤 최소 높이 40px(560px 미만 42px) | glossary 2.3, FR-CMP-007 AC-5 |
| Dialog와 Drawer의 선택 기준 | 두 오버레이 중 무엇을 언제 쓰는지 | FR-DOC-007 AC-4 |
| 생략된 컴포넌트군 | 규칙이 없는 컴포넌트군을 화면에서 생략하고, 생략 사실을 화면 하단에 명시한다 | FR-DOC-007 예외/실패 처리 |

각 규칙의 금지 예에는 금지 사유가 문장으로 기재된다(FR-DOC-007 AC-2).

### 사용 컴포넌트

C-030 Table, C-021 StatusBadge, C-022 SeverityTag, C-062 Meter, C-050 Field, C-051 TextField, C-040 Dialog, C-041 Drawer, C-001 Button, C-012 Panel, C-020 Badge.

`StatusBadge`와 `SeverityTag`에는 텍스트를 숨기는 `iconOnly` 모드가 없다. 공간이 부족하면 소비자가 `Tooltip`으로 감싼다(FR-CMP-004 예외/실패 처리). 이 사실을 금지 예 옆에 기술한다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 렌더 완료 |
| `partial_failure` | 권장/금지 예 한 쌍이 렌더 중 예외를 일으켜 오류 경계로 격리된다(FR-DOC-003 예외/실패 처리와 동일 규칙) |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `overlay.open` / `overlay.close` | Dialog·Drawer 선택 기준 섹션의 트리거 | FLOW-004 참조 |
| `theme.toggle` | 상단바 토글 | 권장/금지 예가 선택된 테마를 따른다 |
| `component.open` | 규칙 항목의 컴포넌트 링크 | 해당 W-021로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). 심각도(`read`, `write`, `destructive`, `blocked`)는 소비자 애플리케이션의 동작 영향 등급을 표현하는 시각 어휘이며 문서 사이트의 접근 제어가 아니다.

### 구현 노트

1. 금지 예는 Conductor 컴포넌트를 오용한 결과여야 하며, 존재하지 않는 props를 사용해서는 안 된다. `iconOnly` 모드가 없으므로 색 점만 있는 배지는 소비자가 직접 만든 마크업으로 렌더한다.
2. 그레이스케일 판정은 스냅샷 검사가 소유한다(FR-A11Y-003 AC-4). 이 화면은 그레이스케일 렌더를 강제하는 토글을 제공하지 않는다. 검사 방법은 W-050이 기술한다.
3. 규칙이 없는 컴포넌트군을 빈 섹션으로 렌더하지 않는다. 생략하고 화면 하단에 생략 사실을 명시한다(FR-DOC-007 예외/실패 처리).
4. 이 화면의 검증 방법은 `inspection`이다(FR-DOC-007). 자동 테스트가 규칙 문장의 정확성을 판정하지 않는다.

---

## W-050 Accessibility

경로: `/accessibility` · 우선순위: P1 · 관련 요구사항: FR-THM-004, FR-A11Y-001, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-QA-002, FR-QA-003, FR-QA-004

### 화면 목적

WCAG 2.1 AA 기준선, 포커스 링 규칙, 키보드 경로, 대비 결과, 검사 명령과 허용 목록을 제시한다.

### 진입 경로

- 직접 URL `/accessibility`
- 사이드 내비 `Accessibility`

### 레이아웃 구조

```text
<main id="content">
┌────────────────────────────────────────────────────────────┐
│ H1  Accessibility                                          │
│ 기준선: WCAG 2.1 AA · 두 테마 모두                         │
├────────────────────────────────────────────────────────────┤
│ § 대비 결과 요약                                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 본문 4.5:1   │ │ 대형 3:1     │ │ 비텍스트 3:1 │        │
│  │ 미달 0건     │ │ 미달 0건     │ │ 미달 0건     │        │
│  │ Badge pass   │ │ Badge pass   │ │ Badge pass   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  상세 표는 W-030 → /tokens                                 │
├────────────────────────────────────────────────────────────┤
│ § 포커스 링                                                │
│  실물 데모: Tab으로 순회하는 대화형 요소 5종               │
│  마우스 클릭 시 포커스 링이 표시되지 않는다                │
├────────────────────────────────────────────────────────────┤
│ § 키보드 경로      Table (C-030)                           │
│  컴포넌트 │ 도달 키 │ 조작 키 │ 이탈 키                    │
│  Dialog   │ Tab     │ Tab     │ Esc → 트리거로 복귀        │
│  Timeline │ Tab/방향│ Enter   │ Tab                        │
│  Kbd (C-033)로 키를 표기한다                               │
├────────────────────────────────────────────────────────────┤
│ § 색상 비의존 정보 전달                                    │
│  상태 7종의 그레이스케일 구분 근거 → 상세 규칙은 W-040     │
├────────────────────────────────────────────────────────────┤
│ § 검사 명령과 판정      Table (C-030) + CodeBlock (C-032)  │
│  pnpm check:contrast │ pnpm test │ pnpm test:a11y          │
│  pnpm test:visual                                          │
├────────────────────────────────────────────────────────────┤
│ § axe 허용 목록      Table (C-030)                         │
│  규칙 ID │ 사유 │ 승인자                                   │
├────────────────────────────────────────────────────────────┤
│ [Banner tone="info" (C-060)]                               │
│  시각 회귀 검사는 OD-002 결정에 따라 상태가 바뀐다.        │
└────────────────────────────────────────────────────────────┘
```

### 섹션 정의

| 섹션 | 내용 | 근거 |
| --- | --- | --- |
| 대비 결과 요약 | 본문 4.5:1, 대형 3:1, 비텍스트 3:1 기준의 미달 건수. 두 테마 모두 | FR-A11Y-004 AC-1, FR-THM-004 |
| 포커스 링 | 모든 대화형 요소가 `:focus-visible`에서 동일한 `box-shadow` 계산값을 갖고, 두 테마에서 배경 대비 3:1 이상이며, 마우스 클릭으로 얻은 포커스에는 링이 표시되지 않는다 | FR-A11Y-001 AC-1, AC-3, AC-4 |
| 키보드 경로 | 컴포넌트별 도달·조작·이탈 키. `Dialog`, `Drawer`, `DropdownMenu`, `Select`에서 Escape가 오버레이를 닫고 포커스를 트리거로 되돌린다 | FR-A11Y-002 AC-3, AC-4 |
| 색상 비의존 정보 전달 | 상태·심각도·유효성 정보가 색상 외에 아이콘 또는 텍스트로 동시에 전달된다 | FR-A11Y-003 |
| 검사 명령과 판정 | `pnpm check:contrast`, `pnpm test`, `pnpm test:a11y`, `pnpm test:visual`의 대상과 실패 조건 | FR-QA-002, FR-QA-003, FR-QA-004 |
| axe 허용 목록 | 규칙 ID와 사유. 허용 목록 추가는 접근성 검토자 승인을 필요로 한다 | FR-A11Y-005 예외/실패 처리, FR-QA-003 AC-4 |

### 사용 컴포넌트

C-030 Table, C-033 Kbd, C-020 Badge, C-010 Card, C-011 CardGrid, C-060 Banner, C-032 CodeBlock, C-012 Panel. 포커스 링 데모는 C-001 Button, C-051 TextField, C-054 Switch, C-055 Checkbox, C-053 Select를 대화형 요소로 사용한다.

### 상태 정의

| 상태 | 이 화면에서의 발생 조건 |
| --- | --- |
| `loading_initial` | 라우트 청크 평가 전 |
| `ready` | 렌더 완료 |
| `metrics_unavailable` | 대비 검사 결과 파일이 없다. 대비 결과 요약 카드가 `측정되지 않음`을 표시한다 |

### 이벤트 정의

| 이벤트 | 트리거 | 결과 |
| --- | --- | --- |
| `theme.toggle` | 상단바 토글 | 포커스 링 데모가 선택된 테마를 따른다. 두 테마에서 링 대비가 3:1 이상임을 육안 확인 가능하다(FR-A11Y-001 AC-3) |
| `nav.select` | W-030 링크 | `/tokens`로 이동 |

### 권한/정책

이 제품에는 런타임 권한이 없다(SRS 6절). 접근성 검토자의 릴리스 게이트 차단 권한은 저장소 승인 권한이며(SRS 6절), 이 화면은 검사 결과를 표시할 뿐 게이트를 실행하지 않는다.

### 구현 노트

1. 대비 결과 요약과 axe 허용 목록은 빌드 산출물에서 읽는다. 화면에 판정을 하드코딩하지 않는다.
2. 상세 대비율 표는 W-030이 소유한다(FR-DOC-004). 이 화면은 요약과 링크만 갖는다.
3. FR-QA-004(시각 회귀)는 우선순위 Should이며 OD-002가 열려 있다. OD-002가 (b)로 결정되면 FR-QA-004의 상태가 `deferred`가 되고 v1은 수동 시각 확인으로 대체한다(FR-QA-004 예외/실패 처리). 검사 명령 표의 해당 행은 결과 파일이 없으면 `이월됨`으로 표시한다.
4. 포커스 링이 부모의 `overflow: hidden`에 잘리는 경우 해당 컴포넌트에 `z-index` 상승 규칙을 적용한다(FR-A11Y-001 예외/실패 처리). 데모 컨테이너는 `overflow: hidden`을 선언하지 않는다.
5. 키보드 경로 표는 FR-A11Y-002 AC-5의 컴포넌트별 키보드 경로 테스트와 같은 목록을 인용한다. 표에만 존재하고 테스트에 없는 경로를 기술하지 않는다.
