# @conductor-by-89soone/css

## 0.3.1

### Patch Changes

- ca29e40: 배지 제거 버튼의 조작 대상이 `IconButton`의 compact 계약(34px)을 되찾는다. 보이는 크기를 배지 글자 높이(18px)로 줄인 것은 알약 형태를 지키려는 것인데 조작 영역까지 함께 줄어 있었다. 투명한 의사 요소가 레이아웃을 바꾸지 않고 영역만 넓히며, 인접 배지를 먹지 않는다(gap 8px에서 7px 여유). 정렬 표시기는 이제 값마다 그린다 — `[aria-sort]` 하나로 받으면 이 시스템이 그리지 않는 `other`까지 미정렬 글리프를 받아, 보조 기술과 눈이 서로 다른 사실을 말했다.

  Refs: FR-CMP-004 FR-CMP-005

- ca29e40: RTL 문서에서 방향을 아는 모션. `Meter` 채움이 트랙의 논리 시작 가장자리에서 자란다 — 레이아웃 전환을 피하려고 백분율 `inline-size`를 `scaleX`로 바꾸면서 논리 속성이 해 주던 일이 빠져, RTL에서 채움이 반대 끝에서 자랐다. `Drawer` 진입·퇴장이 자기 안착 가장자리 바깥에서 출발한다 — 배치는 `inset-inline-*`가 정하는데 이동은 `translateX`라 RTL에서 서랍이 보이는 내용을 통째로 가로질러 들어왔다. keyframe에 방향 부호를 변수로 넘겨 규칙 수를 늘리지 않고 두 방향을 맞췄다. LTR 동작은 바뀌지 않는다.

  Refs: FR-CMP-006 FR-CMP-008

## 0.3.0

### Patch Changes

- 64ecc42: 브라우저 기본이 새어 나오던 자리 셋을 막고 정렬 표시기를 더한다. `mark`는 UA 기본 형광 노랑 대신 accent 표면으로, `fieldset`·`legend`는 UA 기본 `2px groove`와 여백 대신 시맨틱만 남기고 그린다. `Table`의 헤더 셀이 `aria-sort` 값에 따라 `↕`·`↑`·`↓` 글리프를 그려 정렬 열과 방향이 눈으로도 읽힌다. 배지 안에 넣을 수 있는 `.cdt-badge__dismiss`를 더해 제거 가능한 칩이 배지 높이를 유지한다.

  Refs: FR-CSS-002 FR-CMP-004 FR-CMP-005

- 64ecc42: 키보드로 포커스한 버튼에 마우스가 겹쳐도 포커스 링이 사라지지 않는다. 버튼의 hover 규칙이 명시성으로 `:focus-visible`을 이겨 링 그림자를 덮고 있었고, `outline`은 `none`이라 대체 표시가 없었다(WCAG 2.4.7 위반). 버튼 셀렉터의 명시성을 hover와 맞춰 소스 순서로 결정되게 했고, 더 높은 명시성을 가진 배지 제거 버튼의 hover 규칙에는 같은 명시성의 링 규칙을 세웠다. 그림자를 칠하는 hover 규칙이 링을 이기지 못하게 막는 구조적 시험을 함께 넣었다. 다른 컨트롤은 영향받지 않는다.

  Refs: NFR-007 FR-A11Y-001 FR-CMP-002

- 72d5a27: `Meter` 채움이 레이아웃 속성 대신 `transform`을 전환한다. `inline-size`를 240ms 전환하면 프레임마다 레이아웃이 다시 돌았다. 채움을 트랙 폭 100%에 두고 `scaleX(var(--cdt-meter-ratio))`로 줄이며, 원점은 시작 변이다. 값 전달 계약(`--cdt-meter-ratio`)과 가시 폭은 그대로다.

  Refs: FR-CMP-008 FR-CSS-005

- 72d5a27: `Dialog`의 스크림과 콘텐츠가 닫힐 때 140ms 동안 사라진다(진입의 역방향, `motion.fast`). 모바일 내비의 스크림은 서랍과 같이 페이드 인한다. 감소 모드에서는 닫힘 상태를 `display: none`으로 두어 Radix Presence가 0s 애니메이션을 기다리지 않고 즉시 언마운트한다.

  Refs: FR-CMP-006 FR-CSS-005

- 72d5a27: `prefers-reduced-motion: reduce`에서 `Spinner`의 `label` 텍스트가 실제로 드러난다. 노출 규칙은 `cdt.base`에 있었지만 화면 밖 숨김 규칙이 더 뒤 레이어 `cdt.component`에 있어 명시도와 무관하게 항상 이겼다. 숨김 규칙을 노출 규칙과 같은 레이어로 옮겼고, 라벨이 들어갈 자리를 만들기 위해 고정 지름을 컨테이너에서 svg로 옮겼다(`.cdt-spinner`가 내용에 맞춰 자란다). 일반 모드의 렌더링은 바뀌지 않으며 `ProgressRing`은 영향받지 않는다.

  Refs: FR-CMP-008 FR-CSS-005

- 72d5a27: `Spinner`가 실제로 회전한다. `animation: cdt-spin var(--cdt-motion-standard) linear infinite`는 토큰 치환 뒤 이징이 둘이 되어 선언 전체가 무효였고(`animation-name: none`), 모든 로딩 표시가 정지된 호로 보였다. 상수 운동 전용 토큰 `motion.spin`(`1000ms linear`)과 프리미티브 `ease.linear`를 추가하고 스피너가 그 토큰만 읽게 했다. 감소 모드에서는 다른 모션 토큰과 같이 `0s`가 된다.

  Refs: FR-CMP-008 FR-CSS-005

- 64ecc42: `Select` 목록·`Tooltip`·`DropdownMenu`·`Drawer`·`Banner`가 등장 모션을 갖는다. 팝오버 셋은 트리거 기준 원점(Radix가 주는 `--radix-*-transform-origin`)에서 `scale(0.97)`로 자라 나오고, `Drawer`는 자기 가장자리에서 밀려 들어오며, `Banner`는 살짝 내려앉는다. `Select`·`DropdownMenu`·`Drawer`는 `motion.standard` 진입에 그보다 빠른 `motion.fast` 퇴장을 갖고, `Tooltip`은 작은 팝오버라 양방향 모두 `motion.fast`다. 감소 모드에서는 즉시 사라진다. 모달은 중앙 등장이라 원점을 주지 않는다.

  Refs: FR-CMP-006 FR-CMP-008 FR-CSS-005

- Updated dependencies [72d5a27]
  - @conductor-by-89soone/tokens@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [173e2b7]
  - @conductor-by-89soone/tokens@0.2.1

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
