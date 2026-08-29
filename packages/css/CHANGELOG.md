# @conductor-by-89soone/css

## 0.2.0

### Minor Changes

- e988003: `border.width` 3단(`hairline`/`emphasis`/`rail`)과 `h2`·`h3` 헤딩 토큰을 추가한다.
  스타일시트의 경계 리터럴 22건이 토큰을 읽고, 짝지어 있던 `cdt-allow-literal` 주석은 사라진다.
  `font.size` 7단 타입 스케일은 그대로다 — 헤딩 토큰은 컴포넌트 층에서 `font.size.xl`을 파생시킨다.

  Refs: WP-002 WP-005 WP-008 FR-TOK-007 FR-CSS-002 CR-034

- 756b4e5: `dataviz` semantic 색 계열을 추가한다: 범주형 `dataviz.series.1`~`20`과 순서형
  `dataviz.sequential.1`~`5`이며, 두 테마에 각각 정의된다. Conductor에는 차트 프리미티브가
  없으므로(ADR-006) 차트는 semantic 토큰으로 구현되는데, 그동안 계열을 구분할 색 토큰만
  없었다. 25개 키 모두 `usage`가 `nonText`이고, 차트가 놓이는 세 표면(`surface.base`·`canvas`·
  `raised`)에 대해 두 테마 모두 3:1 이상을 만족하도록 새 대비 쌍 CP-043~CP-117로 검사한다
  (그래픽 객체, WCAG 1.4.11). 범주형 색은 서로 간 대비를 요구하지 않으며, 소비 제품이
  범례·직접 라벨·표 대체로 계열 정보를 중복 전달한다(WCAG 1.4.1; 표 대체는 소비 제품 몫). 순서형은 인덱스가 오를수록
  두 테마 모두 더 뚜렷해지는 단일 색조 명도 램프다. 기존 색·대비 쌍·공개 React API는 바꾸지
  않는다.

  Refs: WP-002 WP-007 WP-010 FR-TOK-005 FR-THM-002 FR-THM-004 FR-A11Y-004 CR-036

### Patch Changes

- fe5bdc4: Add AppShell ambient background and surface tint tokens, with matching glass navigation styling.

  Refs: WP-008 WP-023 FR-THM-001 FR-CSS-003

- e988003: cdt- 클래스 계약 테스트를 추가하고 CSS와 React 사이의 드리프트 5건을 해소한다.
  `cdt-empty-state__action`과 `cdt-select__indicator`에 규칙을 부여하고, 아무것도 선택하지 않던
  `cdt-panel__header`·`cdt-panel__body` 규칙과 규칙이 없던 `cdt-btn--icon-sm` 클래스를 제거한다.

  Refs: WP-008 WP-011 FR-CSS-004 FR-CMP-001

- e988003: Button loading 상태에 스피너를 그린다. AppShell 모바일 스크림을 닫기 버튼으로 되돌리고
  `navCloseLabel`을 받는다. Field는 자식에게 `required`를 주입하지 않고, `Select.Trigger`가
  Field 컨텍스트에서 직접 `aria-required`를 읽는다. `Select.Item`은 체크 글리프를
  `indicator` prop으로 교체할 수 있다.

  Refs: WP-011 FR-CMP-002 FR-CMP-007 FR-CMP-009 FR-A11Y-003

- e988003: `status.neutralEnd`를 `slate.400` 링 마커로 바꿔 `badge.marker.background` 위 6.61:1을 확보하고
  CR-006의 대비 검사 예외를 폐기한다(`usage`가 `decorative` → `nonText`, 새 쌍 CP-042).
  금지 조합 FP-001·FP-002를 토큰 그래프 위에 선언해 별칭으로 도달하는 경로까지 `checkContrast`가
  차단하고 매 실행마다 재측정한다. 라이트 팔레트 파생은 base에 없는 override 키를 빌드 오류로 만든다.

  Refs: WP-007 WP-010 WP-013 FR-THM-004 FR-THM-005 FR-QA-001 CR-035

- Updated dependencies [fe5bdc4]
- Updated dependencies [e988003]
- Updated dependencies [756b4e5]
- Updated dependencies [e988003]
- Updated dependencies [e988003]
- Updated dependencies [e988003]
  - @conductor-by-89soone/tokens@0.2.0

## 0.1.0

### Patch Changes

- daddce8: 컴포넌트의 심미성·시인성·가독성을 개선한다. Card와 Overlay의 깊이, Button의 variant/tone 위계, Table·Form·Banner·Feedback의 정보 구조를 정제하고 다크·라이트 시각 기준선을 갱신한다.

  완전 원형 기하를 위한 additive `radius.pill` 토큰을 공개하고, `Select.Content`가 항목을 Viewport에 전달하지 않던 결함을 수정한다.

  재질 그림자가 공통 포커스 링을 덮던 결함을 수정하고, Button 라벨과 Field 라벨의 판독 위계를 높인다. 문서 카탈로그는 정적 Panel·명시적 링크·가시 폼 라벨을 사용해 live control을 중첩 대화형 Card 밖에 둔다.

  개발 환경에서 `@conductor-by-89soone/css` 누락을 한 번만 경고해 스타일시트 연결 오류를 즉시 진단할 수 있게 한다.

  원시 `Dialog.Close`와 `Drawer.Close`에 Conductor의 보조 compact 버튼 스타일을 적용해 라이트 테마의 브라우저 기본 버튼 대비 위반을 제거하고, `asChild`로 전달한 소비자 Button의 variant와 size는 보존한다.

  Refs: WP-005 WP-008 WP-012 WP-014 WP-015 WP-016 WP-017 WP-020 WP-024 WP-026 FR-CSS-002 FR-CSS-004 FR-CMP-002 FR-CMP-003 FR-CMP-005 FR-CMP-006 FR-CMP-007 FR-CMP-008 FR-A11Y-001 FR-A11Y-004 FR-DOC-003 FR-QA-003 FR-QA-004

- 4411aa1: npm 게시 메타데이터를 추가한다: provenance 검증에 필요한 `repository` 필드와 스코프 패키지 공개 게시를 위한 `publishConfig.access: "public"`.

  Refs: WP-027 FR-DX-005 NFR-002

- Updated dependencies [daddce8]
- Updated dependencies [4411aa1]
  - @conductor-by-89soone/tokens@0.1.0
