# Conductor Design System 제품 IA 문서

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-17

## 1. 문서 범위와 상위 문서

이 문서는 `docs/20_derived_ui_specs/`의 최상위 IA 기준 문서다. `../10_requirements/srs_final.md`가 승인한 범위를 화면 구조로 번역한다. 범위를 추가하지 않는다. 이 문서와 SRS가 충돌하면 SRS가 우선한다.

| 항목 | 소유 문서 |
| --- | --- |
| 기능 범위, FR ID, 수용 기준 | `../10_requirements/srs_final.md` |
| 용어, 네이밍 규칙 | `../10_requirements/glossary.md` |
| 요구사항 ↔ 화면 매핑 | `../10_requirements/requirements_screen_traceability_matrix.md` |
| 제품 표면, 화면 ID, 내비게이션, 우선순위 | 이 문서 |
| 화면별 레이아웃·섹션·상태·이벤트 | `conductor_wireframe_spec.md` |
| 화면 간 전이 | `conductor_screen_flow_spec.md` |
| 상태별 필수 UI와 복구 경로 | `conductor_screen_state_matrix.md` |
| 컴포넌트 ID(C-###)와 계약 | `conductor_ui_component_spec.md` |

## 2. IA 설계 원칙

1. **토큰 산출물이 유일한 데이터원이다.** 모든 Foundations·Tokens 화면은 `@conductor-by-89soone/tokens/tokens.json`을 읽어 렌더하며 화면에 하드코딩된 토큰 값이 0건이다(FR-DOC-002 AC-1). 따라서 IA는 "토큰 카테고리"를 화면 경계로 삼는다.
2. **문서 사이트는 Conductor의 첫 번째 소비자다.** 문서 사이트는 `@conductor-by-89soone/react`와 `@conductor-by-89soone/css`를 설치해 사용하고 소스 상대경로를 import하지 않는다(FR-DOC-001 AC-1). 문서 사이트가 필요로 하는 구조는 곧 소비자가 필요로 하는 구조다.
3. **공개 export 전수가 카탈로그에 대응한다.** 공개 진입점에 export되었으나 카탈로그에 화면이 없는 컴포넌트가 0건이며 위반 시 빌드가 실패한다(FR-DOC-003 AC-5). 컴포넌트 화면 집합은 사람이 관리하는 목록이 아니라 빌드가 강제하는 집합이다.
4. **런타임 권한 경계가 없다.** 이 제품에는 런타임 인증/인가가 없다(SRS 6절). 진입 게이트 화면, 권한 없음 화면, 인증 만료 화면을 정의하지 않는다.
5. **키보드 경로가 IA의 구성 요소다.** 모든 대화형 요소는 키보드만으로 도달·조작·이탈 가능해야 하고(FR-A11Y-002), 셸은 skip-link로 본문에 포커스를 이동시킨다(FR-CMP-009 AC-4). 내비게이션 순서는 Tab 순서와 일치한다.

## 3. 제품 표면 정의

Conductor가 배포하는 것은 npm 패키지 3종과 정적 문서 사이트 1종이다. 백엔드 서비스, 데이터베이스, 인증 서버가 존재하지 않는다(SRS 4.3). 사용자 인터페이스를 갖는 표면은 문서 사이트 하나다.

```text
Product Surface
├─ npm 패키지 (UI 없음 · 표면 ID: SFC-PKG)
│  ├─ @conductor-by-89soone/tokens   토큰 소스 → CSS / TypeScript / JSON 산출물
│  ├─ @conductor-by-89soone/css      캐스케이드 레이어 기반 스타일시트
│  └─ @conductor-by-89soone/react    React 프리미티브 컴포넌트
│
└─ 문서 사이트 (유일한 UI 표면 · 정적 빌드 · 서버 런타임 없음)
   ├─ Overview        W-001, W-002
   ├─ Foundations     W-010, W-011, W-012, W-013, W-014
   ├─ Components      W-020, W-021
   ├─ Tokens          W-030
   ├─ Patterns        W-040
   └─ Accessibility   W-050
```

패키지 의존 방향은 `tokens → css → react → docs` 단방향이며 역방향 참조는 빌드 오류다(SRS 5.2, FR-DX-001 AC-1). 문서 사이트는 이 사슬의 마지막 노드다.

## 4. 화면 ID 체계

Conductor의 유일한 사용자 인터페이스는 문서 사이트다. 화면 ID는 웹 표면을 뜻하는 `W-###`를 사용한다. `D-###`(주 앱)와 `A-###`(관리 콘솔)는 이 제품에 존재하지 않는다.

| 대역 | 의미 | 할당 |
| --- | --- | --- |
| W-00# | 진입과 도입 | W-001, W-002 |
| W-01# | Foundations (토큰 카테고리별 1화면) | W-010 ~ W-014 |
| W-02# | Components (카탈로그와 상세) | W-020, W-021 |
| W-03# | Tokens 참조 | W-030 |
| W-04# | Patterns | W-040 |
| W-05# | Accessibility | W-050 |

신규 화면 ID는 새 FR이 승인될 때만 부여한다. 화면 ID는 재사용하지 않으며, 화면이 삭제되어도 ID는 회수하지 않는다.

## 5. 화면 계층 트리

```text
/                                   W-001  Overview
├─ /getting-started                 W-002  Getting Started
├─ /foundations
│  ├─ /foundations/color            W-010  Color
│  ├─ /foundations/typography       W-011  Typography
│  ├─ /foundations/spacing          W-012  Spacing & Layout
│  ├─ /foundations/elevation        W-013  Radius & Elevation
│  └─ /foundations/motion           W-014  Motion
├─ /components                      W-020  Components Index
│  └─ /components/:componentId      W-021  Component Detail (동적 · 공개 export 전수)
├─ /tokens                          W-030  Tokens Reference
├─ /patterns                        W-040  Patterns
└─ /accessibility                   W-050  Accessibility
```

`/foundations`는 라우트가 아니라 내비게이션 그룹 라벨이다. 이 경로로 직접 진입하면 W-010으로 이동한다. 그룹 자체에 화면 ID를 부여하지 않는 이유는, 그룹에 대응하는 FR이 없고 FR-DOC-002가 다섯 개 화면만 요구하기 때문이다.

`/components/:componentId`는 단일 화면 ID(W-021)를 갖는 동적 라우트다. 빌드가 컴포넌트 메타데이터(`ENT-CMP-001`)에서 경로를 전수 생성하므로 라우트 인스턴스 수는 `@conductor-by-89soone/react` 공개 export 수와 같다.

## 6. 전역 셸 구조

모든 문서 화면(W-001 ~ W-050)은 하나의 셸 안에서 렌더된다(FR-DOC-001 AC-2). 셸은 사이드 내비게이션, 상단바, 본문 영역으로 구성된다(FR-DOC-001).

```text
뷰포트 ≥ 800px
┌──────────────────────────────────────────────────────────────┐
│ [skip-link: 본문으로 건너뛰기]  (포커스 시에만 노출)          │
├────────────────┬─────────────────────────────────────────────┤
│                │ TopBar (C-072)                              │
│  NavList       │  제품명 · 버전   [테마 토글 (C-054)]        │
│  (C-071)       ├─────────────────────────────────────────────┤
│                │                                             │
│  Overview      │ <main id="content">                         │
│  Foundations   │   화면 본문 (W-001 ~ W-050)                 │
│  Components    │ </main>                                     │
│  Tokens        │                                             │
│  Patterns      │                                             │
│  Accessibility │                                             │
└────────────────┴─────────────────────────────────────────────┘
        AppShell (C-070) 이 위 3영역을 소유한다

뷰포트 < 800px
┌──────────────────────────────────────────────────────────────┐
│ TopBar (C-072)                                               │
│  [☰ 내비 열기 (C-002)]  제품명   [테마 토글 (C-054)]         │
├──────────────────────────────────────────────────────────────┤
│ <main id="content">  화면 본문 (단일 컬럼)                   │
└──────────────────────────────────────────────────────────────┘
  사이드 내비는 오프캔버스로 전환된다. 오버레이 클릭 또는
  Escape로 닫힌다(FR-CMP-009 AC-3). 상세는 FLOW-005.
```

셸 요소와 근거:

| 셸 요소 | 컴포넌트 | 근거 FR |
| --- | --- | --- |
| 셸 골격(사이드 내비 + 상단바 + 본문) | C-070 AppShell | FR-DOC-001, FR-CMP-009 |
| 내비게이션 항목 목록 | C-071 NavList | FR-CMP-009 AC-1 |
| 상단바 | C-072 TopBar | FR-DOC-001, FR-CMP-009 |
| 테마 토글 | C-054 Switch | FR-DOC-005 AC-5 |
| 오프캔버스 내비 | C-041 Drawer | FR-CMP-009 AC-3 |
| skip-link | `cdt.utility` 레이어 유틸리티 클래스 | FR-CSS-002 AC-5, FR-CMP-009 AC-4 |

FR-CMP-009는 우선순위 Should이며 OD-004가 열려 있다. OD-004가 (b) 문서 사이트 내부 컴포넌트로 결정되면 C-070 ~ C-072는 `@conductor-by-89soone/react` 공개 export에서 빠지고 문서 사이트 내부 컴포넌트로 강등된다. 셸의 시각 구조와 이 문서의 IA는 두 결정 중 어느 쪽에서도 바뀌지 않는다. 바뀌는 것은 W-020 카탈로그의 항목 수뿐이다(8절).

## 7. 내비게이션 그룹

사이드 내비는 6개 그룹으로 구성된다. 그룹 순서는 소비자의 학습 순서를 따른다. 제품을 알고(Overview) → 설치하고(Getting Started) → 시각 규칙을 읽고(Foundations) → 컴포넌트를 고르고(Components) → 값을 조회하고(Tokens) → 조합 규칙을 확인하고(Patterns) → 검수한다(Accessibility).

| 순서 | 그룹 | 화면 | 내비 라벨 | 그룹 근거 |
| --- | --- | --- | --- | --- |
| 1 | Overview | W-001, W-002 | Overview, Getting Started | FR-DOC-001 |
| 2 | Foundations | W-010 ~ W-014 | Color, Typography, Spacing & Layout, Radius & Elevation, Motion | FR-DOC-002 (다섯 화면을 명시) |
| 3 | Components | W-020 | Components | FR-DOC-003 |
| 4 | Tokens | W-030 | Tokens | FR-DOC-004 |
| 5 | Patterns | W-040 | Patterns | FR-DOC-007 |
| 6 | Accessibility | W-050 | Accessibility | FR-A11Y-001 ~ FR-A11Y-005 |

내비게이션 규칙:

1. W-021은 사이드 내비에 항목을 갖지 않는다. 컴포넌트 30종을 내비에 나열하면 Tab 순서가 카탈로그의 시각 순서와 이중화된다. W-021 진입은 W-020의 카드 또는 직접 URL로 한정한다.
2. 그룹 헤더는 링크가 아니다. 클릭 대상이 아닌 요소는 Tab 순서에서 제외한다(FR-A11Y-002 AC-1).
3. 현재 화면에 대응하는 내비 항목은 `aria-current="page"`를 갖는다.
4. `NavList`는 링크 렌더를 `renderLink` props로 위임하므로 문서 사이트의 라우팅 선택이 `@conductor-by-89soone/react`로 새지 않는다(FR-CMP-009 AC-1, AC-2).

## 8. 화면 목록과 관련 요구사항

관련 요구사항 열은 `../10_requirements/requirements_screen_traceability_matrix.md` 6절의 역매트릭스와 일치한다.

| 화면 ID | 화면명 | 경로 | 목적 | 우선순위 | 관련 요구사항 |
| --- | --- | --- | --- | --- | --- |
| W-001 | Overview | `/` | 세 패키지의 역할과 다음 단계를 제시하고, 셸과 테마 토글을 노출한다 | P0 | FR-THM-003, FR-CMP-009, FR-DOC-001, FR-DOC-005 |
| W-002 | Getting Started | `/getting-started` | 설치·import·테마 속성·진입점·SSR 스니펫을 제시한다 | P0 | FR-CSS-001, FR-DX-001, FR-DX-003, FR-DX-004 |
| W-010 | Foundations · Color | `/foundations/color` | 시맨틱 색 토큰과 상태·심각도·미터 토큰을 계층과 함께 조회한다 | P1 | FR-TOK-002, FR-TOK-005, FR-THM-001, FR-THM-002, FR-DOC-002 |
| W-011 | Foundations · Typography | `/foundations/typography` | 글자 크기 7단계와 행 높이 토큰을 조회한다 | P1 | FR-TOK-007, FR-DOC-002 |
| W-012 | Foundations · Spacing & Layout | `/foundations/spacing` | 간격 토큰, 브레이크포인트 3단계, 레이아웃 프리미티브 클래스를 조회한다 | P1 | FR-TOK-009, FR-CSS-003, FR-DOC-002 |
| W-013 | Foundations · Radius & Elevation | `/foundations/elevation` | 반경과 고도 토큰을 조회한다 | P1 | FR-DOC-002 |
| W-014 | Foundations · Motion | `/foundations/motion` | 모션 토큰과 모션 감소 설정의 결과를 조회한다 | P1 | FR-CSS-005, FR-DOC-002 |
| W-020 | Components Index | `/components` | 공개 export 전수를 컴포넌트군별로 카탈로그화한다 | P0 | FR-CSS-004, FR-CMP-002 ~ FR-CMP-008, FR-DOC-003 |
| W-021 | Component Detail | `/components/:componentId` | 컴포넌트 1종의 라이브 프리뷰, props 표, 사용 규칙, 코드 스니펫을 제공한다 | P0 | FR-CMP-001 ~ FR-CMP-009, FR-CSS-004, FR-DOC-003, FR-DOC-006, FR-DX-002 |
| W-030 | Tokens Reference | `/tokens` | 전 토큰의 키·두 테마 값·대비율·판정을 필터와 함께 조회한다 | P0 | FR-TOK-004, FR-TOK-008, FR-THM-001 ~ FR-THM-004, FR-DOC-004, FR-DOC-005, FR-A11Y-004, FR-QA-001 |
| W-040 | Patterns | `/patterns` | 상태색·심각도·밀도·오버레이 선택의 사용 규칙을 권장/금지 예로 제시한다 | P2 | FR-TOK-005, FR-CMP-004, FR-DOC-007, FR-A11Y-003 |
| W-050 | Accessibility | `/accessibility` | WCAG 2.1 AA 기준선, 포커스 링, 키보드 경로, 대비 결과, 검사 명령을 제시한다 | P1 | FR-THM-004, FR-A11Y-001 ~ FR-A11Y-005, FR-QA-002, FR-QA-003, FR-QA-004 |

W-020과 W-021의 항목 수는 `@conductor-by-89soone/react` 공개 export 수와 같다(FR-DOC-003 AC-5). `conductor_ui_component_spec.md`가 정의한 컴포넌트 30종(C-001 ~ C-072)이 모두 export되면 카탈로그 항목은 30개, W-021 라우트 인스턴스는 30개다. OD-004가 (b)로 결정되어 C-070 AppShell, C-071 NavList, C-072 TopBar가 문서 사이트 내부 컴포넌트로 강등되면 두 수는 27로 줄어든다. 이 수는 문서가 아니라 빌드가 결정한다.

## 9. 진입 경로

| 진입 유형 | 도달 가능 화면 | 규칙 |
| --- | --- | --- |
| 직접 URL | W-001 ~ W-050 (W-021은 딥링크 포함) | 정적 빌드가 모든 경로를 사전 생성한다. 존재하지 않는 `componentId`는 `404.html`이 W-020의 `not_found` 상태를 셸 안에서 렌더한다 |
| 사이드 내비 (C-071) | W-001, W-002, W-010 ~ W-014, W-020, W-030, W-040, W-050 | W-021은 내비에 없다(7절 규칙 1) |
| 상단바 (C-072) | 없음 (테마 토글만 소유) | 테마 토글은 화면을 이동시키지 않는다 |
| 본문 링크 | W-001 → W-002 / W-020 / W-030, W-002 → W-020, W-020 → W-021, W-010 → W-030, W-021 → W-040 | 각 링크는 해당 화면의 사용 규칙 또는 값 조회로 이어지는 관계만 갖는다 |
| skip-link | 현재 화면의 `<main id="content">` | 셸이 렌더하고 본문 영역에 포커스를 이동시킨다(FR-CMP-009 AC-4) |

기본 진입 화면은 W-001이다. 로그인·온보딩·권한 확인 단계가 없으므로 W-001 이전의 화면은 존재하지 않는다.

## 10. 구현 우선순위

우선순위는 두 기준으로 결정한다. (1) 화면이 노출하는 FR의 SRS 우선순위(Must/Should), (2) 다른 화면이 그 화면을 전제로 삼는지 여부.

| 등급 | 화면 | 판단 근거 |
| --- | --- | --- |
| P0 | W-001, W-002, W-020, W-021, W-030 | 모두 Must FR을 노출하며, 다른 화면의 전제이거나 빌드 게이트다. W-001은 셸을 소유하므로 나머지 화면이 렌더될 수 없다(FR-DOC-001 AC-2). W-020/W-021은 export 전수 대응 검사가 빌드를 실패시킨다(FR-DOC-003 AC-5). W-030은 토큰 JSON 소비 경로를 처음으로 증명하고 SCN-003의 진입점이다. W-002는 소비자의 설치 경로를 노출하는 유일한 화면이다(FR-DX-003) |
| P1 | W-010, W-011, W-012, W-013, W-014, W-050 | Must FR을 노출하지만 다른 화면이 이 화면을 전제하지 않는다. Foundations 다섯 화면은 FR-DOC-002가 요구하는 Must이나, 토큰 값 조회는 W-030으로도 가능하다. W-050은 FR-A11Y-001 ~ 005(Must)의 노출 화면이지만 검사 자체는 SFC-CLI/SFC-CI에서 실행된다 |
| P2 | W-040 | W-040이 유일하게 담당하는 FR은 FR-DOC-007(Should)이다. 이 화면에 함께 매핑된 FR-TOK-005, FR-CMP-004, FR-A11Y-003은 W-010, W-021, W-050에서도 노출된다 |

P0을 완료하기 전에 P1을 시작하지 않는다. P1과 P2 사이에는 선후 의존이 없다.

## 11. 비-UI 표면과 IA의 관계

승인된 FR 49개 중 UI 화면에 직접 노출되지 않는 요구사항은 아래 네 표면에 노출된다. 이 표면들은 화면이 아니므로 W-### ID를 갖지 않으며, 이 문서의 내비게이션 트리에 등장하지 않는다.

| 표면 ID | 표면명 | 문서 사이트와의 접점 |
| --- | --- | --- |
| SFC-PKG | 패키지 공개 API | W-002가 `exports`에 선언된 진입점 목록을 표로 노출한다 |
| SFC-CLI | 빌드/검사 명령 출력 | W-002가 명령을, W-050이 검사 명령과 판정 기준을 노출한다 |
| SFC-CI | CI 파이프라인 리포트 | W-050이 axe 허용 목록과 검사 범위를 노출한다 |
| SFC-REL | 릴리스 산출물 | 문서 사이트에 접점이 없다. CHANGELOG와 semver 태그가 저장소에 존재한다 |

## 12. IA 불변 규칙

1. FR 근거가 없는 화면, 내비게이션 항목, 그룹을 추가하지 않는다. 새 화면은 새 FR의 승인을 전제로 한다.
2. 화면 ID와 경로는 1:1이다. 예외는 W-021 하나이며, 동적 세그먼트 `:componentId`가 라우트 인스턴스를 만든다.
3. 이 제품에는 런타임 권한이 없으므로 `no_permission`, `auth_expired` 상태를 갖는 화면을 정의하지 않는다.
4. 내비게이션 순서가 Tab 순서이며 시각 순서다(FR-A11Y-002 AC-1). 세 순서가 어긋나는 배치를 채택하지 않는다.
5. 문서 사이트는 실행 시 외부 도메인으로 네트워크 요청을 0건 발생시킨다(FR-DOC-001 AC-4). 외부 임베드, 원격 폰트, 원격 스크립트에 의존하는 IA 요소를 만들지 않는다.
6. 변경은 cascade 순서를 따른다: IA → 와이어프레임 → 플로우/상태 → 컴포넌트 → 토큰 → QA → 에이전트 브리프.
