# @conductor-by-89soone/react

## 0.3.1

### Patch Changes

- Updated dependencies [ca29e40]
- Updated dependencies [ca29e40]
  - @conductor-by-89soone/css@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [64ecc42]
- Updated dependencies [64ecc42]
- Updated dependencies [72d5a27]
- Updated dependencies [72d5a27]
- Updated dependencies [72d5a27]
- Updated dependencies [72d5a27]
- Updated dependencies [64ecc42]
  - @conductor-by-89soone/css@0.3.0
  - @conductor-by-89soone/tokens@0.3.0

## 0.2.1

### Patch Changes

- 173e2b7: 머지된 PR에 남아 있던 리뷰 지적 여섯을 닫는다.

  - `Select.Root`가 `Field`의 `required`를 Radix까지 나른다. 트리거의 `aria-required`는 상태를 알릴 뿐이라 폼이 선택 없이 제출됐다
  - `IconButton`이 아이콘을 `iconStart`로 넘겨 로딩 스피너가 그것을 **대체한다**. 그전에는 두 글리프가 나란히 그려져 고정 폭을 넘쳤다
  - 금지 대비 쌍에 `usages` 한정자를 두어 `FP-002`가 본문 사용만 막는다. SRS가 허용하는 large·nonText 쌍까지 거절하고 있었다
  - 단위 리터럴 규칙이 `.5rem` 같은 선행 점 소수를 잡는다. `px`·`ms`도 같은 우회를 갖고 있어 함께 고쳤다
  - 릴리스 태그 검증기가 **태그 대상과 릴리스 HEAD 사이에 그 패키지가 바뀌었는지** 본다. 조상 관계만 물으면 게시된 산출물과 태그가 다른 소스를 가리킬 수 있다
  - 릴리스 워크플로가 마지막 태그 이후의 버전 커밋이 소비한 범위를 제외한다. 버전 커밋이 `HEAD`가 아니게 되면 없는 누락을 신고했다

  Refs: WP-027 FR-CMP-002 FR-CMP-004 FR-TOK-001 FR-THM-005 FR-DX-005

- Updated dependencies [173e2b7]
  - @conductor-by-89soone/tokens@0.2.1
  - @conductor-by-89soone/css@0.2.1

## 0.2.0

### Minor Changes

- e988003: Button loading 상태에 스피너를 그린다. AppShell 모바일 스크림을 닫기 버튼으로 되돌리고
  `navCloseLabel`을 받는다. Field는 자식에게 `required`를 주입하지 않고, `Select.Trigger`가
  Field 컨텍스트에서 직접 `aria-required`를 읽는다. `Select.Item`은 체크 글리프를
  `indicator` prop으로 교체할 수 있다.

  Refs: WP-011 FR-CMP-002 FR-CMP-007 FR-CMP-009 FR-A11Y-003

### Patch Changes

- e988003: cdt- 클래스 계약 테스트를 추가하고 CSS와 React 사이의 드리프트 5건을 해소한다.
  `cdt-empty-state__action`과 `cdt-select__indicator`에 규칙을 부여하고, 아무것도 선택하지 않던
  `cdt-panel__header`·`cdt-panel__body` 규칙과 규칙이 없던 `cdt-btn--icon-sm` 클래스를 제거한다.

  Refs: WP-008 WP-011 FR-CSS-004 FR-CMP-001

- e988003: 상태·심각도 아이콘 이름 맵(`STATUS_ICONS`, `SEVERITY_ICONS`)과 그 타입을 배포한다.
  이름은 이미 `tokens.json`의 `icon` 메타데이터에 있었지만 타입이 붙은 형태가 없어
  소비자마다 `running → loader` 표를 따로 하드코딩했다. `StatusBadge`·`SeverityTag`의
  아이콘 슬롯은 요구된 이름을 `data-cdt-icon`으로 노출한다.

  Refs: WP-005 WP-013 FR-TOK-005 FR-CMP-004

- Updated dependencies [fe5bdc4]
- Updated dependencies [e988003]
- Updated dependencies [e988003]
- Updated dependencies [756b4e5]
- Updated dependencies [e988003]
- Updated dependencies [e988003]
- Updated dependencies [e988003]
- Updated dependencies [e988003]
  - @conductor-by-89soone/tokens@0.2.0
  - @conductor-by-89soone/css@0.2.0

## 0.1.1

### Patch Changes

- c35b0f9: Accept supported `lucide-react` releases from 0.400.0 through the current 1.x line. The previous caret range unintentionally admitted only the 0.400.x line.

  Refs: WP-011 FR-CMP-004 FR-DX-004

## 0.1.0

### Patch Changes

- daddce8: 컴포넌트의 심미성·시인성·가독성을 개선한다. Card와 Overlay의 깊이, Button의 variant/tone 위계, Table·Form·Banner·Feedback의 정보 구조를 정제하고 다크·라이트 시각 기준선을 갱신한다.

  완전 원형 기하를 위한 additive `radius.pill` 토큰을 공개하고, `Select.Content`가 항목을 Viewport에 전달하지 않던 결함을 수정한다.

  재질 그림자가 공통 포커스 링을 덮던 결함을 수정하고, Button 라벨과 Field 라벨의 판독 위계를 높인다. 문서 카탈로그는 정적 Panel·명시적 링크·가시 폼 라벨을 사용해 live control을 중첩 대화형 Card 밖에 둔다.

  개발 환경에서 `@conductor-by-89soone/css` 누락을 한 번만 경고해 스타일시트 연결 오류를 즉시 진단할 수 있게 한다.

  원시 `Dialog.Close`와 `Drawer.Close`에 Conductor의 보조 compact 버튼 스타일을 적용해 라이트 테마의 브라우저 기본 버튼 대비 위반을 제거하고, `asChild`로 전달한 소비자 Button의 variant와 size는 보존한다.

  Refs: WP-005 WP-008 WP-012 WP-014 WP-015 WP-016 WP-017 WP-020 WP-024 WP-026 FR-CSS-002 FR-CSS-004 FR-CMP-002 FR-CMP-003 FR-CMP-005 FR-CMP-006 FR-CMP-007 FR-CMP-008 FR-A11Y-001 FR-A11Y-004 FR-DOC-003 FR-QA-003 FR-QA-004

- 705410e: `Table`의 스크롤 컨테이너가 기본 `tabIndex=0`을 갖는다. 스크롤 가능 영역이 키보드로 도달 가능해야 한다는 axe `scrollable-region-focusable`을 충족한다. 소비자가 `scrollContainerProps.tabIndex` 또는 `tabIndex`로 재정의할 수 있다.

  Refs: WP-024 FR-CMP-005 FR-A11Y-002

- 4411aa1: npm 게시 메타데이터를 추가한다: provenance 검증에 필요한 `repository` 필드와 스코프 패키지 공개 게시를 위한 `publishConfig.access: "public"`.

  Refs: WP-027 FR-DX-005 NFR-002

- Updated dependencies [daddce8]
- Updated dependencies [4411aa1]
  - @conductor-by-89soone/tokens@0.1.0
  - @conductor-by-89soone/css@0.1.0
