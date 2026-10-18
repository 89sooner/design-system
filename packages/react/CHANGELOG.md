# @conductor-by-89soone/react

## 0.10.0

### Minor Changes

- fed36d2: Agent interface components, modelled on the AI Elements set but built on Conductor tokens and Radix with plain props that are not tied to any AI SDK. `Conversation` is a `role="log"` transcript that stays pinned to the newest message and offers "Scroll to latest" when the reader scrolls up. `Message` (`from`, `name`, `avatar`, `status="streaming" | "error"`, `actions`) is a group named by its sender. `PromptInput` is an auto-growing composer: Enter sends (never while an IME composition is open), Shift+Enter adds a line, `submitOn="mod-enter"` requires ⌘/Ctrl, and the send button becomes Stop while `status` is `submitted` or `streaming`. `Reasoning` opens while `streaming` and closes once it ends ("Thought for N seconds"). `Tool` shows a tool call's name, a text status badge, JSON parameters, result and error. `Confirmation` collects an approve or reject decision and then shows the outcome. `Sources` lists the links an answer used, `InlineCitation` opens one source in a popover, `Suggestions`/`Suggestion` offer one-click prompts and `Shimmer` marks an in-progress status line. Every built-in string can be replaced through `labels`. Their styles ship in a new opt-in entry point, `@conductor-by-89soone/css/agent.css` (cdt.component layer only, about 2KB gzip); import it after the main stylesheet wherever the agent components render. `index.css` and `component.css` do not grow. No new dependencies.

  Refs: CR-061 FR-CMP-016

### Patch Changes

- Updated dependencies [fed36d2]
  - @conductor-by-89soone/css@0.10.0

## 0.9.0

### Minor Changes

- 93cbd63: Five new components. `AlertDialog` (Root, Trigger, Content, Title, Description, Footer, Cancel, Action with `tone`) wraps Radix AlertDialog for confirmations that cannot be dismissed by clicking outside; it reuses the Dialog surface. `RadioGroup` (Root, Item with `description`) wraps Radix RadioGroup and takes its name, description, error and `required` from `Field`. `ToggleGroup` (Root with `type="single" | "multiple"` and `size`, Item with `icon`) is a segmented control on Radix ToggleGroup. `Avatar` shows an image through Radix Avatar and falls back to initials from `name`, which is also its accessible name; `avatarInitials` is exported. `NumberInput` is a native `type="number"` field with a `suffix` and stepper buttons that fire `onChange` like typing; `labels` renames the buttons. `Field` now gives its label an `id`.

  New dependencies, pinned to the same Radix release train as the existing primitives: `@radix-ui/react-alert-dialog@1.1.23`, `@radix-ui/react-radio-group@1.4.7`, `@radix-ui/react-toggle-group@1.1.19`, `@radix-ui/react-avatar@1.2.6`.

  Refs: CR-060 FR-CMP-015

### Patch Changes

- Updated dependencies [93cbd63]
  - @conductor-by-89soone/css@0.9.0

## 0.8.4

### Patch Changes

- Updated dependencies [da8e920]
  - @conductor-by-89soone/css@0.8.4

## 0.8.3

### Patch Changes

- 7e986b7: Draw `Drawer` above its own scrim: `overlay.drawerZ` now resolves to `z.popover`, the layer `Dialog` already used, instead of `z.drawer`, which sat under the `z.overlay` scrim. Align the Radix primitive pins on one release train (2026-07-24) so consumer bundles carry a single copy of Radix's shared internals.

  Refs: CR-058 FR-CMP-006 FR-TOK-008

- Updated dependencies [7e986b7]
  - @conductor-by-89soone/tokens@0.8.3
  - @conductor-by-89soone/css@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [02d2bbe]
  - @conductor-by-89soone/css@0.8.2

## 0.8.1

### Patch Changes

- 51d33ea: Two focus fixes found by adopting the packages in agent-ai-platform.

  `component.css` now draws the focus ring on its own. The ring used to live only in `cdt.reset`, which that entry point leaves out, so nav items, the skip link, table scroll regions, code blocks, interactive timeline steps and the summaries and links the package renders fell back to the browser's outline. A zero-specificity rule for Conductor elements and their descendants opens the component layer, so any later component rule that sets `box-shadow` still wins as it did over the reset. The table scroll region's inset highlight also covered the ring in the full stylesheet; its focus state now restates the ring. If you layer your own focus styles below `cdt`, they now sit under this rule rather than over the reset.

  A route change made from inside an open `DropdownMenu`, `Popover`, `Dialog` or `Drawer` within `AppShell` now leaves focus on `<main>` instead of the overlay's trigger. Pass your own `onCloseAutoFocus` and call `preventDefault()` to keep choosing where focus goes.

  Refs: CR-056 FR-CSS-002 FR-CMP-009 FR-A11Y-001 FR-A11Y-002

- Updated dependencies [51d33ea]
  - @conductor-by-89soone/css@0.8.1

## 0.8.0

### Minor Changes

- 254c471: Four new components. `Toast` (Provider, Viewport, Root with `tone` and `icon`, Title, Description, Action, Close) wraps Radix Toast. `DatePicker` is a single-date field that opens a react-day-picker calendar in a Radix popover, reads its label, description and error from `Field`, and takes `disabledDays`, `startMonth`/`endMonth`, `locale` and `formatDate`. `CommandPalette` is a Radix dialog over a downshift combobox with grouped commands, keywords and shortcut chips; it returns focus to whatever opened it. `Pagination` renders previous/next and page buttons with `aria-current="page"` and ellipses. Every one takes `labels` with English defaults. `filterCommands` and `paginationRange` are exported as pure helpers. Styles live in the stylesheet's component layer.

  New dependencies, pinned exactly: `@radix-ui/react-toast@1.2.23` and `react-day-picker@10.0.1`.

  Refs: CR-054 FR-CMP-014

- 2fbb0ee: Every string the search, relation and operations components render is now overridable, and the defaults are English. `Combobox`, `MultiSelect`, `DataTable`, `WorkbenchLayout`, `DetailInspector`, `PathList`, `CopyButton`, `ProcessingStatus` and `RelationGraph` take `labels?: Partial<…Labels>`, merged over the English defaults; strings that interpolate a count or a name are functions. The `…Labels` types are exported. `CopyButton`'s default `label` is now `Copy` and `Breadcrumb`'s default `aria-label` is `Breadcrumb`.

  To keep the previous Korean wording, pass it back, for example `labels={{ empty: "검색 결과 없음", loaded: (count) => \`현재 로드된 ${count}개\` }}`on`DataTable`.

  The three `border.width.*` token descriptions are now English.

  Refs: CR-053 FR-CMP-013 FR-DOC-001

### Patch Changes

- Updated dependencies [254c471]
- Updated dependencies [2fbb0ee]
  - @conductor-by-89soone/css@0.8.0
  - @conductor-by-89soone/tokens@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [ca6f161]
  - @conductor-by-89soone/tokens@0.7.0
  - @conductor-by-89soone/css@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [cce0505]
  - @conductor-by-89soone/tokens@0.6.1
  - @conductor-by-89soone/css@0.6.1

## 0.6.0

### Patch Changes

- Updated dependencies [7ccaacc]
  - @conductor-by-89soone/tokens@0.6.0
  - @conductor-by-89soone/css@0.6.0

## 0.5.2

### Patch Changes

- Updated dependencies [7063ba2]
  - @conductor-by-89soone/css@0.5.2

## 0.5.1

### Patch Changes

- Updated dependencies [3296ebc]
  - @conductor-by-89soone/css@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [b100de7]
  - @conductor-by-89soone/tokens@0.5.0
  - @conductor-by-89soone/css@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies [b890d40]
- Updated dependencies [a705e90]
  - @conductor-by-89soone/css@0.4.1

## 0.4.0

### Minor Changes

- 06c66dc: 검색·미리보기, 읽기 전용 관계 탐색, 처리 상태 조합과 Radix Tabs/Popover/Collapsible를 추가한다. 안정 ID·외부 제어 데이터와 콜백을 사용하며 네트워크 요청을 만들지 않는다. AppShell 닫힘 포커스를 복원하고 컴포넌트 모듈의 client 경계를 배포 출력에 보존한다.

  Refs: WP-029 WP-030 WP-031 WP-032 FR-CMP-010 FR-CMP-011 FR-CMP-012 FR-CMP-013

  ## Migration

  세 패키지를 함께 갱신하고 CSS를 앱 루트에서 한 번 import한다. 기존 컴포넌트 기본 스타일은 유지된다. AppShell 고정 ID에 의존하는 경우 mainId="cdt-main"을 명시한다. 새 AppShellNavTrigger를 사용한 뒤 기존 닫힘 requestAnimationFrame 보완을 제거한다. routeKey는 소비자의 기존 탐색 포커스 로직과 중복 사용하지 않는다. Tabs는 기본 수동 활성화이며 activationMode="automatic"으로 변경할 수 있다. 다중 선택은 체크박스 그룹이고 단일 Combobox의 ARIA 계약과 다르다. 관계 컴포넌트는 ./relation 선택 진입점도 제공한다. 소비자의 API·검색 문법·인가·커서 저장·재검증 정책은 그대로 유지한다. 상세 계약과 예시는 React 패키지 README를 따른다.

  CR-041 review 구현이며 별도 baseline 승인이나 npm 게시를 뜻하지 않는다.

### Patch Changes

- Updated dependencies [06c66dc]
  - @conductor-by-89soone/css@0.4.0
  - @conductor-by-89soone/tokens@0.4.0

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
