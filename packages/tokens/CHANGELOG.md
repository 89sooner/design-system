# @conductor-by-89soone/tokens

## 0.3.0

### Minor Changes

- 72d5a27: `Spinner`가 실제로 회전한다. `animation: cdt-spin var(--cdt-motion-standard) linear infinite`는 토큰 치환 뒤 이징이 둘이 되어 선언 전체가 무효였고(`animation-name: none`), 모든 로딩 표시가 정지된 호로 보였다. 상수 운동 전용 토큰 `motion.spin`(`1000ms linear`)과 프리미티브 `ease.linear`를 추가하고 스피너가 그 토큰만 읽게 했다. 감소 모드에서는 다른 모션 토큰과 같이 `0s`가 된다.

  Refs: FR-CMP-008 FR-CSS-005

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

- e988003: `lint:tokens`에 `rem-literal` 규칙을 추가한다. `2rem`과 `32px`는 같은 간격 단계이므로
  단위를 바꿔 스케일을 피해 가지 못한다. 스캐너는 `generated`·`dist-server` 디렉터리를 건너뛴다.
  문서 사이트(`apps/docs/src`)가 새 린트 대상에 들어간다.

  Refs: WP-006 FR-TOK-001 CR-033

- e988003: `status.neutralEnd`를 `slate.400` 링 마커로 바꿔 `badge.marker.background` 위 6.61:1을 확보하고
  CR-006의 대비 검사 예외를 폐기한다(`usage`가 `decorative` → `nonText`, 새 쌍 CP-042).
  금지 조합 FP-001·FP-002를 토큰 그래프 위에 선언해 별칭으로 도달하는 경로까지 `checkContrast`가
  차단하고 매 실행마다 재측정한다. 라이트 팔레트 파생은 base에 없는 override 키를 빌드 오류로 만든다.

  Refs: WP-007 WP-010 WP-013 FR-THM-004 FR-THM-005 FR-QA-001 CR-035

- e988003: 상태·심각도 아이콘 이름 맵(`STATUS_ICONS`, `SEVERITY_ICONS`)과 그 타입을 배포한다.
  이름은 이미 `tokens.json`의 `icon` 메타데이터에 있었지만 타입이 붙은 형태가 없어
  소비자마다 `running → loader` 표를 따로 하드코딩했다. `StatusBadge`·`SeverityTag`의
  아이콘 슬롯은 요구된 이름을 `data-cdt-icon`으로 노출한다.

  Refs: WP-005 WP-013 FR-TOK-005 FR-CMP-004

### Patch Changes

- fe5bdc4: Add AppShell ambient background and surface tint tokens, with matching glass navigation styling.

  Refs: WP-008 WP-023 FR-THM-001 FR-CSS-003

## 0.1.0

### Minor Changes

- daddce8: 컴포넌트의 심미성·시인성·가독성을 개선한다. Card와 Overlay의 깊이, Button의 variant/tone 위계, Table·Form·Banner·Feedback의 정보 구조를 정제하고 다크·라이트 시각 기준선을 갱신한다.

  완전 원형 기하를 위한 additive `radius.pill` 토큰을 공개하고, `Select.Content`가 항목을 Viewport에 전달하지 않던 결함을 수정한다.

  재질 그림자가 공통 포커스 링을 덮던 결함을 수정하고, Button 라벨과 Field 라벨의 판독 위계를 높인다. 문서 카탈로그는 정적 Panel·명시적 링크·가시 폼 라벨을 사용해 live control을 중첩 대화형 Card 밖에 둔다.

  개발 환경에서 `@conductor-by-89soone/css` 누락을 한 번만 경고해 스타일시트 연결 오류를 즉시 진단할 수 있게 한다.

  원시 `Dialog.Close`와 `Drawer.Close`에 Conductor의 보조 compact 버튼 스타일을 적용해 라이트 테마의 브라우저 기본 버튼 대비 위반을 제거하고, `asChild`로 전달한 소비자 Button의 variant와 size는 보존한다.

  Refs: WP-005 WP-008 WP-012 WP-014 WP-015 WP-016 WP-017 WP-020 WP-024 WP-026 FR-CSS-002 FR-CSS-004 FR-CMP-002 FR-CMP-003 FR-CMP-005 FR-CMP-006 FR-CMP-007 FR-CMP-008 FR-A11Y-001 FR-A11Y-004 FR-DOC-003 FR-QA-003 FR-QA-004

### Patch Changes

- 4411aa1: npm 게시 메타데이터를 추가한다: provenance 검증에 필요한 `repository` 필드와 스코프 패키지 공개 게시를 위한 `publishConfig.access: "public"`.

  Refs: WP-027 FR-DX-005 NFR-002
