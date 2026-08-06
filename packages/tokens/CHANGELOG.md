# @conductor-by-89soone/tokens

## 0.2.0

### Minor Changes

- e988003: `border.width` 3단(`hairline`/`emphasis`/`rail`)과 `h2`·`h3` 헤딩 토큰을 추가한다.
  스타일시트의 경계 리터럴 22건이 토큰을 읽고, 짝지어 있던 `cdt-allow-literal` 주석은 사라진다.
  `font.size` 7단 타입 스케일은 그대로다 — 헤딩 토큰은 컴포넌트 층에서 `font.size.xl`을 파생시킨다.

  Refs: WP-002 WP-005 WP-008 FR-TOK-007 FR-CSS-002 CR-034

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
