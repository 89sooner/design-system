# Conductor Design System 토큰 명세

> 상태: review | 버전: v0.7 | 갱신일: 2026-07-17

## 0. 문서 성격과 범위 경계

- 이 문서는 파생 UI 명세다. `../10_requirements/srs_final.md`에서 승인된 범위를 토큰 값으로 번역할 뿐, 새 범위를 만들지 않는다. 충돌 시 SRS가 우선한다.
- 용어는 `../10_requirements/glossary.md`를 따른다. 금지 동의어(변수, 컬러 코드, alias token, primary 색상명 등)를 쓰지 않는다.
- 다크 팔레트의 근거는 `agent-ai-platform/packages/web/src/styles/tokens.css`의 `:root` 블록 실측값이다(SRS 5.1 가정 4, FR-THM-001 출처). 이 문서는 소스 값을 근사하지 않는다.
- 이 문서에 등장하는 모든 대비율 수치는 WCAG 2.1 상대 휘도 공식으로 계산했고, alpha가 있는 색은 배경과 합성한 뒤 계산했다(FR-THM-004 AC-4). 소수점 둘째 자리에서 버림한 표기다.
- **OD-001은 2026-07-10에 `최소 수정` 방침으로 종결되었다(CR-005).** 결정 내용은 SRS 12.1절의 표이며 FR-THM-005가 이를 강제한다. 이 문서는 그 표를 값과 `usage` 메타데이터로 옮긴다.
  - 값을 바꾸는 대상은 두 개다: `focusRing`(accent alpha 0.30 → 0.80)과 신규 `border.control`(slate alpha 0.60).
  - 나머지 소스 계승 값은 보존하고 `usage` 분류와 사용 제약으로 처리한다.
  - 라이트 팔레트 값은 소스 계승값이 아니라 이 문서가 파생한 값이다. 따라서 `usage` 분류가 요구하는 기준을 만족하지 못하면 파생 규칙에 따라 다시 산출한다(6절).
- 8.5절은 SRS 12.1절을 그대로 적용했을 때 남는 측정상 결함 1건을 기록한다. 이 문서는 그 결함을 임의로 해소하지 않고 CR 대상으로 제시한다(FR-THM-005 예외/실패 처리).

## 1. 디자인 원칙

각 원칙은 소스(`tokens.css`, `app.css`)에서 관찰된 사실을 근거로 한다. 원칙은 토큰 값을 정당화하는 근거이지, 새 요구사항이 아니다.

### P-1. 표면은 깊이 순서를 갖는 이산 단계다

근거: 소스는 배경을 그라데이션이나 opacity로 처리하지 않고 `--surface-base` → `--surface-canvas` → `--surface-subtle` → `--surface-raised` → `--surface-elevated` 다섯 개의 이산 값(`#080b12`, `#0b101a`, `#101722`, `#141d2a`, `#192535`)으로 선언한다. 상대 휘도가 0.00335 → 0.00516 → 0.00838 → 0.01195 → 0.01787로 단조 증가한다. 깊이는 명도 서열로 표현되며, 임의의 중간값이 존재하지 않는다.

시스템 규칙: 표면 값은 이 5단계 서열 안에서만 선택한다. 컴포넌트가 자체 배경 명도를 만들지 않는다.

### P-2. 색은 의미를 실어 나르되, 의미를 혼자 전달하지 않는다

근거: 소스는 실행 상태 7종(`--status-queued` ~ `--status-neutral-end`)과 심각도 4종(`--severity-read` ~ `--severity-blocked`)에 각각 고유 색을 부여하지만, `.badge` 클래스 자체에는 색 선언이 없고 `gap: 6px`로 아이콘 슬롯을 확보한다(`app.css:497-507`). 색은 아이콘·텍스트와 함께 놓이도록 설계되어 있다.

시스템 규칙: 상태·심각도 토큰은 `icon` 메타데이터 필드를 필수로 갖는다(FR-TOK-005 AC-5). 그레이스케일 렌더에서 상태 구분이 유지되어야 한다(FR-A11Y-003 AC-4).

### P-3. 밀도는 타이포 스케일이 아니라 간격 스케일로 조절한다

근거: 소스의 본문은 `font-size: 14px; line-height: 1.5`(`app.css:22-23`) 단일 값이고, 화면 밀도는 `--space-1`~`--space-8`(4, 8, 12, 16, 24, 32, 40, 48px)의 조합과 `.btn { padding: 8px 14px }`, `.table td { padding: var(--space-4) var(--space-3) }` 같은 간격 선택으로 만들어진다. 글자 크기는 10px(`.nav-section-label`), 11px(`kbd`), 12px(`.user-menu-copy strong`), 13px(`.btn`, `.mono`), 14px(본문), 16px(`.app-brand-copy strong`)의 여섯 단계로만 나타난다.

시스템 규칙: 글자 크기는 `font.size` 7단계로 고정한다(FR-TOK-007 AC-1). 밀도 변경은 `space.*` 선택으로 수행한다.

### P-4. 경계선은 표면 위에 얹힌 얇은 반투명 층이다

근거: 소스의 경계 3종은 모두 동일한 slate 색(`rgb(148, 163, 184)`)에 alpha만 다르게 적용한다: `0.1`, `0.18`, `0.3`. 경계는 고유 색을 갖지 않고 아래 표면의 색을 통과시킨다. 그래서 `.card`가 `surface.base` 위에 있든 `.radix-content`가 `surface.raised` 위에 있든 같은 토큰 하나로 동작한다.

시스템 규칙: 경계 토큰은 표면 종속성을 갖지 않는다. 단, 이 설계는 대비율 대가를 치른다 — 8절에서 측정값과 함께 다룬다.

### P-5. 강조색은 하나이고, 링크·진행·선택은 모두 같은 색을 참조한다

근거: 소스에서 `a { color: var(--status-running) }`, `.SwitchRoot[data-state='checked'] { background-color: var(--status-running) }`, `.app-nav a::before { background: var(--status-running) }`이며 `--status-running`은 `--accent`와 동일한 `#6d7cff`다. 선택 상태(`--state-selected`), 포커스 링(`--focus-ring`), 부드러운 배경(`--accent-soft`), 글로우(`--accent-glow`) 모두 `rgb(109, 124, 255)`를 alpha만 바꿔 재사용한다.

시스템 규칙: 강조 계열은 `accent` 하나에서 파생한다. `status.running`은 독립 값이 아니라 `{accent}` 참조로 정의한다(FR-TOK-003 AC-1의 참조 해석 대상).

---

## 2. 토큰 계층과 참조 규칙

### 2.1 3계층

FR-TOK-002는 토큰을 primitive, semantic, component 3계층으로 분류하고, 토큰이 **자기 계층 또는 하위 계층**의 토큰만 참조하도록 강제한다. 상위 계층으로 올라가는 참조는 금지된다(CR-008).

| 계층 | 값의 성격 | 참조 대상 | CSS 산출 | 공개 export |
| --- | --- | --- | --- | --- |
| primitive | 의미 없는 원시 색·수치 (`ink.900`, `indigo.500`) | 없음 (FR-TOK-002 AC-1) | 없음 (FR-TOK-004 AC-4) | 없음 (FR-TOK-002 AC-5) |
| semantic | 제품 의미 (`surface.raised`, `status.danger`) | primitive 또는 다른 semantic (FR-TOK-002 AC-2) | `--cdt-*` | TS·JSON·CSS |
| component | 컴포넌트 국소 규격 (`button.primary.background`) | semantic 또는 다른 component (FR-TOK-002 AC-3) | `--cdt-*` | TS·JSON·CSS |

상위 계층으로의 역방향 참조가 하나라도 존재하면 토큰 빌드는 종료 코드 1로 실패하고 위반 토큰 키 쌍을 출력한다(FR-TOK-002 AC-4). 계층 분류 필드가 없는 토큰도 빌드 오류다. 동일 계층 내 참조는 허용되며, 순환을 이루면 FR-TOK-003 AC-3의 순환 검출이 잡는다(FR-TOK-002 AC-6).

> **CR-008 (DEV-001).** 이전 판의 AC-2는 "semantic은 primitive만 참조한다"였다. 그러나 FR-THM-001 AC-2가 요구하는 별칭 2개(`surface.2`, `border`)는 정의상 semantic → semantic 참조다. 두 Must FR을 동시에 만족할 수 없어 WP-002 구현 착수 시 편차로 등록했다. 설계 의도는 참조 *방향*의 제약이지 동일 계층 별칭 금지가 아니었으므로, AC를 위와 같이 정정했다. 값과 범위는 바뀌지 않았다.

### 2.2 참조 해석 (FR-TOK-003)

- 참조는 `"{다른.토큰.키}"` 형태로 기술한다. 예: `{ "surface.2": "{surface.subtle}" }`.
- 토큰 빌드는 모든 참조를 최종 값으로 해석한다. 최종 CSS에 `var()` 체인이 남지 않는다(FR-TOK-003 AC-1).
- 참조 깊이는 10단계까지 해석한다(AC-2).
- 순환 참조는 빌드 실패이며 순환 경로를 `a → b → c → a` 형태로 출력한다(AC-3).
- 존재하지 않는 키 참조는 빌드 실패이며 참조원과 대상 키를 출력한다(AC-4).
- 해석에 실패하면 부분 산출물을 남기지 않는다. 전체 해석 완료 후에만 기존 산출물을 덮어쓴다.

### 2.3 이 문서에서 참조로 정의되는 semantic 토큰

FR-THM-001 AC-2는 소스의 별칭 2개를 토큰 참조로 표현할 것을 요구한다. 소스 관찰에서 도출된 참조는 아래 5개다. 앞의 4개는 semantic → semantic이며 CR-008이 정정한 AC-2에 따라 허용된다.

| 토큰 키 | 참조 대상 | 참조 방향 | 근거 |
| --- | --- | --- | --- |
| `surface.2` | `{surface.subtle}` | semantic → semantic | `tokens.css:8` `--surface-2: var(--surface-subtle)`. FR-THM-001 AC-2가 요구 |
| `border` | `{border.default}` | semantic → semantic | `tokens.css:25` `--border: var(--border-default)`. FR-THM-001 AC-2가 요구 |
| `status.running` | `{accent}` | semantic → semantic | `tokens.css:27,35` 두 선언의 값이 `#6d7cff`로 동일하고, `app.css`가 링크·스위치·내비 표시자에 `--status-running`을 강조 목적으로 사용한다 |
| `elevation.overlay` | `{border.strong}` | semantic → semantic | `tokens.css:74` 그림자의 1px 링이 경계 토큰을 재사용한다 |
| `meter.exceeded` | `{red.400}` | semantic → primitive | `#f87171`. 하위 계층을 참조하는 정상 방향이다 |

`status.running`을 `{accent}` 참조로 두는 결정은 값 변경이 아니다. 해석 결과는 `#6d7cff`로 소스와 1:1 일치한다(FR-THM-001 AC-1).

---

## 3. 네이밍 규칙과 `--cdt-` 접두사

### 3.1 변환 규칙 (FR-TOK-004)

토큰 소스 키는 점 표기 계층이고, CSS 커스텀 프로퍼티 이름은 여기서 기계적으로 생성한다.

1. 점(`.`)을 하이픈(`-`)으로 치환한다.
2. camelCase 세그먼트를 kebab-case로 분해한다.
3. 접두사 `--cdt-`를 붙인다.
4. 결과는 전부 소문자다.

| 토큰 소스 키 | CSS 커스텀 프로퍼티 | TypeScript 접근 경로 |
| --- | --- | --- |
| `surface.raised` | `--cdt-surface-raised` | `tokens.surface.raised` |
| `surface.2` | `--cdt-surface-2` | `tokens.surface["2"]` |
| `text.monoPayload` | `--cdt-text-mono-payload` | `tokens.text.monoPayload` |
| `status.neutralEnd` | `--cdt-status-neutral-end` | `tokens.status.neutralEnd` |
| `accent.strong` | `--cdt-accent-strong` | `tokens.accent.strong` |
| `focusRing` | `--cdt-focus-ring` | `tokens.focusRing` |
| `font.size.2xs` | `--cdt-font-size-2xs` | `tokens.font.size["2xs"]` |
| `state.disabledPolicy` | `--cdt-state-disabled-policy` | `tokens.state.disabledPolicy` |
| `button.primary.background` | `--cdt-button-primary-background` | `tokens.button.primary.background` |

### 3.2 검사 규칙

- 산출된 `tokens.css`의 모든 커스텀 프로퍼티 선언은 `--cdt-`로 시작한다. 접두사 없는 선언이 산출되면 빌드가 종료 코드 1로 실패한다(FR-TOK-004 AC-1, AC-3).
- 두 토큰 키가 같은 CSS 이름으로 변환되면 빌드가 실패하고 충돌한 두 키를 출력한다(FR-TOK-004 예외 처리). 예: `text.monoPayload`와 `text.mono.payload`는 둘 다 `--cdt-text-mono-payload`가 되므로 공존할 수 없다.
- `accent`는 그 자체로 토큰 키이면서 `accent.strong`의 부모 경로다. 산출 시 `--cdt-accent`와 `--cdt-accent-strong`이 동시에 생성되며 충돌하지 않는다. TypeScript 산출에서는 `tokens.accent`가 문자열이면서 하위 키를 갖는 형태가 불가능하므로, `accent`의 기본값을 `tokens.accent.DEFAULT`로 노출하고 CSS 이름 생성 시 `DEFAULT` 세그먼트를 제거한다. 동일 규칙을 `border`(`border.DEFAULT` → `--cdt-border`)에 적용한다.

### 3.3 금지 이름

- 테마 이름을 값에 하드코딩한 토큰(`--cdt-dark-surface`, `--cdt-light-border`)을 만들지 않는다(용어집 3절 8항).
- 축약형(`--cdt-bg`, `--cdt-fg`, `--cdt-btn-bg`)을 만들지 않는다.
- 색상 토큰 이름에 `primary`를 쓰지 않는다. `text.primary`는 텍스트 서열의 최상위를 뜻하는 예외이며, 강조색은 `accent`다(용어집 4절 4항).

---

## 4. Primitive 팔레트

primitive 토큰은 CSS로 산출되지 않고 `@conductor-by-89soone/tokens` 공개 진입점으로 export되지 않는다(FR-TOK-002 AC-5, FR-TOK-004 AC-4). 소비자가 직접 참조하는 경로는 없다.

아래 ramp는 소스 `tokens.css`와 `app.css`에 실제로 등장하는 원시 색을 계열별로 재구성한 것이다. 라이트 팔레트가 필요로 하는 값은 6절의 파생 규칙으로 산출해 같은 ramp에 편입했다.

### 4.1 `ink.*` — 중립 명도 척추 (제품 고유)

단조 감소하는 상대 휘도 순서로 정렬했다. 다크 테마는 어두운 쪽 끝에서 표면을, 밝은 쪽 끝에서 텍스트를 취한다. 라이트 테마는 정반대로 취한다.

| 키 | 값 | 상대 휘도 | 소스 위치 |
| --- | --- | --- | --- |
| `ink.0` | `#ffffff` | 1.00000 | `app.css:47` `::selection color` |
| `ink.25` | `#fbfcfd` | 0.97222 | 6절 파생 |
| `ink.50` | `#f4f7fb` | 0.92720 | `tokens.css:15` `--text-primary` |
| `ink.75` | `#f3f6f9` | 0.91806 | 6절 파생 |
| `ink.100` | `#f1f4f8` | 0.90179 | 6절 파생 |
| `ink.150` | `#eef1f6` | 0.87742 | 6절 파생 |
| `ink.200` | `#e8ecf2` | 0.83558 | 6절 파생 |
| `ink.250` | `#e2e8f0` | 0.80173 | Tailwind Slate 200 |
| `ink.300` | `#dce6f3` | 0.78280 | `tokens.css:20` `--text-mono-payload` |
| `ink.350` | `#c5cfdd` | 0.61716 | `tokens.css:16` `--text-secondary` |
| `ink.400` | `#8290a3` | 0.27337 | `tokens.css:17` `--text-muted` |
| `ink.500` | `#6b788c` | 0.18452 | 6절 파생 |
| `ink.600` | `#5f6d80` | 0.14929 | `tokens.css:18` `--text-faint` |
| `ink.650` | `#5b6879` | 0.13505 | 6절 파생 |
| `ink.700` | `#4d5a6e` | 0.10016 | 6절 파생 |
| `ink.750` | `#33415a` | 0.05223 | 6절 파생 |
| `ink.800` | `#1b2537` | 0.01832 | 6절 파생 |
| `ink.810` | `#192535` | 0.01787 | `tokens.css:10` `--surface-elevated` |
| `ink.820` | `#18202c` | 0.01409 | `tokens.css:80` `--state-disabled` |
| `ink.840` | `#141d2a` | 0.01195 | `tokens.css:9` `--surface-raised` |
| `ink.860` | `#101722` | 0.00838 | `tokens.css:7` `--surface-subtle` |
| `ink.870` | `#0d141f` | 0.00685 | `tokens.css:13` `--surface-timeline` |
| `ink.880` | `#0c121c` | 0.00595 | 6절 파생 |
| `ink.890` | `#07111f` | 0.00545 | `tokens.css:19` `--text-inverse` |
| `ink.895` | `#0b101a` | 0.00516 | `tokens.css:6` `--surface-canvas` |
| `ink.900` | `#080b12` | 0.00335 | `tokens.css:5` `--surface-base` |
| `ink.950` | `#04070c` | 0.00204 | `tokens.css:11` `--surface-overlay` 기저색 |

### 4.2 `indigo.*` — 강조 계열 (제품 고유, Tailwind Indigo와 다름)

| 키 | 값 | 소스 위치 |
| --- | --- | --- |
| `indigo.300` | `#aab3ff` | `app.css:68` `a:hover` |
| `indigo.400` | `#7b89ff` | `app.css:472` `.btn-primary:hover` 그라데이션 시작점 |
| `indigo.500` | `#6d7cff` | `tokens.css:27` `--accent` |
| `indigo.600` | `#5667f5` | `tokens.css:28` `--accent-strong` |
| `indigo.700` | `#4f5bd5` | 6절 파생 |
| `indigo.800` | `#3f4ac0` | 6절 파생 |

### 4.3 `slate.*` — Tailwind Slate (경계·중립 상태)

| 키 | 값 | 소스 위치 |
| --- | --- | --- |
| `slate.400` | `#94a3b8` | `tokens.css:22-24` 경계 3종의 기저색, `app.css:57` 스크롤바. `border.control`(alpha 0.60)의 기저색이기도 하다 |
| `slate.500` | `#64748b` | `tokens.css:33` `--status-queued`. 라이트 `border.control`이 이 stop을 불투명하게 재사용한다 |
| `slate.600` | `#475569` | `tokens.css:39` `--status-neutral-end` |
| `slate.700` | `#3f4b5f` | 6절 파생 (라이트 `status.neutralEnd`) |
| `slate.750` | `#52607a` | 6절 파생 (라이트 `status.queued`) |

### 4.4 상태 계열 (Tailwind 값 그대로)

| 키 | 값 | 소스 위치 |
| --- | --- | --- |
| `emerald.400` | `#34d399` | `tokens.css:41` `--meter-normal` |
| `emerald.500` | `#10b981` | `tokens.css:36` `--status-success` |
| `emerald.700` | `#047857` | 6절 파생 (라이트 `status.success`, `meter.normal`) |
| `green.700` | `#15803d` | `tokens.css:46` `--severity-read` |
| `amber.400` | `#fbbf24` | `tokens.css:42` `--meter-warning` |
| `amber.500` | `#f59e0b` | `tokens.css:35` `--status-waiting` |
| `amber.700` | `#b45309` | 6절 파생 (라이트 `status.waiting`, `meter.warning`) |
| `amber.100` | `#fef3c7` | 6절 파생 (라이트 `state.disabledPolicy`) |
| `amber.950` | `#422006` | `tokens.css:81` `--state-disabled-policy` |
| `yellow.500` | `#eab308` | `tokens.css:37` `--status-partial` |
| `yellow.700` | `#a16207` | 6절 파생 |
| `orange.700` | `#c2410c` | `tokens.css:47` `--severity-write` |
| `red.300` | `#fca5a5` | `app.css:492` `.btn.policy-disabled color` |
| `red.400` | `#f87171` | `tokens.css:43` `--meter-exceeded` |
| `red.500` | `#ef4444` | `tokens.css:38` `--status-danger` |
| `red.600` | `#dc2626` | 6절 파생 |
| `red.650` | `#c81e1e` | 6절 파생 (라이트 `status.danger`) |
| `red.700` | `#b91c1c` | `tokens.css:48` `--severity-destructive` |
| `red.900` | `#7f1d1d` | `tokens.css:49` `--severity-blocked` |

### 4.5 비색상 primitive

| 계열 | 키 | 값 |
| --- | --- | --- |
| 폰트 스택 | `stack.sans` | `Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| 폰트 스택 | `stack.mono` | `'JetBrains Mono', ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace` |
| 수치 | `scale.4` … `scale.48` | `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px` |
| 반경 | `curve.6` … `curve.24` | `6px`, `9px`, `12px`, `18px`, `24px` |
| 이징 | `ease.entrance` | `cubic-bezier(0.2, 0, 0, 1)` |
| 이징 | `ease.overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

두 폰트 스택 모두 원격 폰트를 로드하지 않는다. `Inter`와 `JetBrains Mono`는 소비자가 제공하거나 스택의 후속 항목으로 대체된다(SRS 5.2 기술 제약 4, FR-CSS-002 AC-4).

---

## 5. Semantic 토큰

### 5.1 표 읽는 법

- **용도(usage)**: `body`(본문 텍스트, 4.5:1) / `large`(대형 텍스트, 3:1) / `nonText`(비텍스트 요소, 3:1) / `decorative`(대비 검사 제외). 이 필드는 `ENT-TOK-001`의 필수 메타데이터이며 `pnpm check:contrast`의 검사 대상 여부를 결정한다(FR-THM-004 AC-2, FR-A11Y-004 AC-3).
- **다크 값**: `tokens.css` 실측값 또는 `{토큰 참조}`.
- **라이트 값**: 6절의 파생 규칙으로 산출한 값.
- `usage` 값은 SRS 12.1절이 확정했다. `decorative` 지정 사유는 8.4절에 측정값과 함께 기록한다.

### 5.2 표면

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `surface.base` | decorative | `#080b12` | `#e8ecf2` | FR-THM-001, FR-THM-002 |
| `surface.canvas` | decorative | `#0b101a` | `#eef1f6` | FR-THM-001, FR-THM-002 |
| `surface.subtle` | decorative | `#101722` | `#f3f6f9` | FR-THM-001, FR-THM-002 |
| `surface.2` | decorative | `{surface.subtle}` | `{surface.subtle}` | FR-TOK-003 AC-1, FR-THM-001 AC-2 |
| `surface.raised` | decorative | `#141d2a` | `#fbfcfd` | FR-THM-001, FR-THM-002 |
| `surface.elevated` | decorative | `#192535` | `#ffffff` | FR-THM-001, FR-THM-002 |
| `surface.overlay` | decorative | `rgba(4, 7, 12, 0.78)` | `rgba(12, 18, 28, 0.45)` | FR-CMP-006, FR-THM-002 |
| `surface.glass` | decorative | `rgba(16, 23, 34, 0.82)` | `rgba(251, 252, 253, 0.86)` | FR-THM-002 예외 처리 |
| `surface.timeline` | decorative | `#0d141f` | `#f1f4f8` | FR-CMP-005 |

표면 토큰이 `decorative`인 이유: 표면은 대비 검사의 **배경 인자**이지 전경이 아니다. 표면 자체의 대비는 그 위에 놓인 텍스트·경계 쌍으로 검사된다(8절).

### 5.3 텍스트

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `text.primary` | body | `#f4f7fb` | `#0c121c` | FR-THM-005, FR-A11Y-004 |
| `text.secondary` | body | `#c5cfdd` | `#33415a` | FR-THM-005, FR-A11Y-004 |
| `text.muted` | body | `#8290a3` | `#4d5a6e` | FR-THM-005, FR-A11Y-004 |
| `text.faint` | decorative | `#5f6d80` | `#6b788c` | FR-THM-005 AC-3 |
| `text.inverse` | body | `#07111f` | `#f4f7fb` | FR-A11Y-004 |
| `text.monoPayload` | body | `#dce6f3` | `#1b2537` | FR-CMP-005 AC-4 |

세 본문 토큰의 다크 대비율은 표면 5단계 전체에서 기준을 넘는다. 최저값은 언제나 `surface.elevated`(`#192535`) 위에서 나온다: `text.primary` 14.40:1, `text.secondary` 9.83:1, `text.muted` 4.76:1. 최고값은 `surface.base` 위 18.32:1 / 12.51:1 / 6.06:1이다. 세 토큰에 사용 제약이 없다.

**`text.faint`는 `decorative`이며 `surface.elevated` 위에서 쓸 수 없다.** 다크 `#5f6d80`은 `surface.base` 위 3.74:1, `surface.elevated` 위 2.94:1로 본문 4.5:1을 어디에서도 만족하지 않는다. 허용 용도는 메타 정보, 타임스탬프, 대문자 라벨(`.nav-section-label`, `.topbar-eyebrow`), 입력 placeholder다. `surface.elevated` 위 사용이 발견되면 `pnpm lint:tokens`가 실패한다(FR-THM-005 AC-3). 이 규칙은 다크 측정값에서 도출되었고 두 테마에 동일하게 적용한다 — 라이트에서는 같은 조합이 4.48:1이지만, 토큰의 사용 규칙이 테마에 따라 갈라지면 컴포넌트 코드가 테마를 분기해야 하므로(10.4절) 규칙을 통일한다.

### 5.4 경계

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `border.subtle` | decorative | `rgba(148, 163, 184, 0.1)` | `#e2e8f0` | FR-THM-005 AC-4 |
| `border.default` | decorative | `rgba(148, 163, 184, 0.18)` | `#6b788c` | FR-THM-005 AC-4 |
| `border.strong` | decorative | `rgba(148, 163, 184, 0.3)` | `#5b6879` | FR-THM-005 AC-4 |
| `border.control` | nonText | `rgba(148, 163, 184, 0.6)` | `#64748b` | FR-THM-005 AC-2 |
| `border` | decorative | `{border.default}` | `{border.default}` | FR-TOK-003 AC-1, FR-THM-001 AC-2 |

**`border.subtle`·`border.default`·`border.strong`은 `decorative`다.** 세 토큰의 다크 값은 비텍스트 3:1을 만족하지 못한다(합성 후 1.13:1 / 1.30:1 / 1.69:1). WCAG 1.4.11은 컴포넌트를 식별하는 데 필요한 시각 정보에만 3:1을 요구하는데, 이 세 토큰이 그리는 카드·패널·표 행의 경계는 표면색 차이(`surface.raised` 대 `surface.base`)와 `elevation.*` 그림자가 이미 식별한다. 경계선은 그 식별을 보조할 뿐 단독으로 지지하지 않는다. 이 예외 근거는 SRS 12.1절이 확정했고 대비 검사 대상에서 제외된다(FR-THM-005 AC-4).

**`border.control`은 신규 semantic 토큰이며 `nonText`다.** 폼 컨트롤에는 위 예외가 성립하지 않는다 — `TextField`의 배경은 `surface.base`이고 주변 표면도 `surface.base`이므로, 경계선이 사라지면 입력 영역의 범위를 알 방법이 없다. 소스는 여기에 `border.default`(1.30:1)를 썼다. 같은 slate 색의 alpha를 0.60으로 올려 `surface.raised` 위 3.23:1을 확보한다. 적용 대상은 `TextField`, `TextArea`, `Select`, `Switch`, `Checkbox` 다섯 컴포넌트의 경계로 한정한다(FR-THM-005 AC-2).

라이트 경계는 alpha 합성으로 3:1에 도달할 수 없다(`rgba(15,23,42,0.45)`를 흰 배경에 합성해도 2.93:1). 그래서 라이트 경계는 `border.control`을 포함해 전부 불투명 값으로 정의한다 — 6.3절에 근거와 측정값을 기술했다.

FR-THM-002 AC-3은 세 경계 토큰이 라이트에서 비텍스트 3:1을 만족할 것을 요구하고, 후행 FR인 FR-THM-005 AC-4는 같은 세 토큰을 `decorative`로 지정해 검사 대상에서 제외한다. 이 문서는 FR-THM-005를 따른다 — OD-001 종결 결정이 낳은 요구사항이고 SRS 12.1절이 명시적 근거를 담는다. 실질 차이는 `border.subtle` 하나뿐이다. 라이트 `border.default`(4.36:1)와 `border.strong`(5.52:1)은 검사 대상이 아님에도 3:1을 넘고, `border.subtle`(1.20:1)만 넘지 못한다.

### 5.5 강조

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `accent` | body | `#6d7cff` | `#4f5bd5` | FR-THM-005, FR-CMP-002 |
| `accent.strong` | nonText | `#5667f5` | `#3f4ac0` | FR-CMP-002 |
| `accent.soft` | decorative | `rgba(109, 124, 255, 0.14)` | `rgba(79, 91, 213, 0.1)` | FR-CMP-003 |
| `accent.glow` | decorative | `rgba(109, 124, 255, 0.28)` | `rgba(79, 91, 213, 0.22)` | FR-THM-002 예외 처리 |

**`accent`는 `body`이되 `surface.elevated` 위 본문 사용을 금지한다.** 다크 측정값은 `surface.base` 위 5.60:1, `surface.raised` 위 4.82:1, `surface.elevated` 위 4.40:1이다. 마지막 조합만 본문 4.5:1에 미달한다. 링크 텍스트(`app.css:62` `a { color: var(--status-running) }`)가 `surface.elevated` 위에 놓이면 `pnpm lint:tokens`가 실패한다. 같은 표면 위에서도 대형 텍스트(3:1)와 비텍스트(3:1) 용도는 허용된다.

`accent.strong`은 `nonText`다. Conductor 컴포넌트는 이 색을 배경으로 쓰면서 그 위에 본문을 올리지 않는다 — 그 이유는 7.1절에 측정값과 함께 기술했다. 선언된 검사 쌍은 `accent.strong` 대 `surface.base`(다크 4.36:1, 라이트 6.00:1) 하나다.

### 5.6 실행 상태 (FR-TOK-005 AC-1, AC-5)

`icon` 필드는 `lucide-react`의 아이콘 이름이다. Conductor는 아이콘을 번들하지 않고 소비자가 props로 주입한다(SRS 10절, FR-CMP-004).

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | `icon` | 관련 FR |
| --- | --- | --- | --- | --- | --- |
| `status.queued` | nonText | `#64748b` | `#52607a` | `circle-dashed` | FR-THM-005 AC-5 |
| `status.running` | body | `{accent}` | `{accent}` | `loader` | FR-THM-005, FR-TOK-003 |
| `status.waiting` | body | `#f59e0b` | `#b45309` | `pause-circle` | FR-THM-005, SCN-002 |
| `status.success` | body | `#10b981` | `#047857` | `check-circle-2` | FR-THM-005 |
| `status.partial` | body | `#eab308` | `#a16207` | `alert-circle` | FR-THM-005 |
| `status.danger` | body | `#ef4444` | `#c81e1e` | `x-circle` | FR-THM-005, FR-CMP-008 |
| `status.neutralEnd` | decorative | `#475569` | `#3f4b5f` | `circle-slash` | FR-THM-005 AC-6 |

상태 7종은 세 무리로 갈린다. `running`·`waiting`·`success`·`partial`·`danger` 다섯은 채도가 높아 `surface.raised` 위에서 본문 4.5:1을 넘으므로 `body`다(다크 4.50 ~ 8.84). `queued`는 중립 회색이지만 비텍스트 3:1을 넘으므로 `nonText`다(다크 `surface.raised` 3.56:1, `surface.elevated` 3.25:1). `neutralEnd`는 표면 6종 어디에서도 3:1에 이르지 못하므로 `decorative`이며 대비 검사 대상이 아니다(다크 2.04:1 ~ 2.60:1). 세 분류는 SRS 12.1절이 확정했고 FR-THM-005 AC-5·AC-6이 강제한다.

**`status.queued`와 `status.neutralEnd`를 쓰는 컴포넌트는 색 외에 아이콘과 텍스트를 함께 렌더해야 한다**(FR-THM-005 AC-7, FR-A11Y-003). 두 상태는 점·마커로만 색을 드러내고 텍스트 전경색으로 쓰지 않는다. `StatusBadge`가 이 규칙을 어떻게 구현하는지는 7.3절에 있다.

`status.neutralEnd`의 `decorative` 분류는 값 보존의 대가다. 근거와 대가는 8.5절에 측정값과 함께 기록했다.

### 5.7 미터 (FR-TOK-005 AC-3)

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `meter.normal` | body | `#34d399` | `#047857` | FR-THM-005, FR-CMP-008 AC-4 |
| `meter.warning` | body | `#fbbf24` | `#b45309` | FR-THM-005, FR-CMP-008 AC-4 |
| `meter.exceeded` | body | `#f87171` | `#dc2626` | FR-THM-005, FR-CMP-008 AC-4 |

미터 3종은 `body`(4.5:1)로 분류된다. 다크 값은 `surface.raised` 위에서 8.82:1 / 10.15:1 / 6.13:1로 통과한다. 라이트 값은 v0.2에서 비텍스트 3:1을 목표로 산출했기 때문에 `emerald.600`(3.67:1)과 `amber.600`(3.10:1)이 본문 기준에 미달했다. 6.6절의 파생 규칙을 `body` 기준으로 다시 적용해 `emerald.700`(`#047857`, 5.34:1)과 `amber.700`(`#b45309`, 4.89:1)으로 산출했다. 그 결과 라이트 `meter.normal`은 라이트 `status.success`와, 라이트 `meter.warning`은 라이트 `status.waiting`과 같은 값을 갖는다. 두 쌍은 별개 키이며 키 대칭 검사(FR-QA-001)에 영향이 없다. 값이 겹치는 것은 두 토큰이 라이트 표면 위에서 같은 의미(정상·경고)를 같은 색상각으로 전달하기 때문이다.

### 5.8 심각도 (FR-TOK-005 AC-2, AC-5)

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | `icon` | 관련 FR |
| --- | --- | --- | --- | --- | --- |
| `severity.read` | body (배경 용도) | `#15803d` | `#15803d` | `eye` | FR-THM-005, FR-CMP-004 |
| `severity.write` | body (배경 용도) | `#c2410c` | `#c2410c` | `pencil` | FR-THM-005, FR-CMP-004 |
| `severity.destructive` | body (배경 용도) | `#b91c1c` | `#b91c1c` | `trash-2` | FR-THM-005, FR-CMP-004 |
| `severity.blocked` | body (배경 용도) | `#7f1d1d` | `#7f1d1d` | `shield-x` | FR-THM-005, FR-CMP-004 |

**심각도 4색은 배경 전용이다. 전경색으로 쓸 수 없다.** `SeverityTag`는 이 색을 배경으로 쓰고 그 위에 `text.primary`(다크) 또는 `text.inverse`(라이트)를 올린다. 배경으로 쓸 때 텍스트 대비는 4.67:1 ~ 9.32:1로 본문 기준을 통과한다(8절 CP-029 ~ CP-032). 같은 색을 전경으로 뒤집으면 `surface.raised` 위에서 1.69:1 ~ 3.38:1로 무너진다. `usage`는 `body`이되 검사 쌍에서 언제나 배경 인자로만 등장한다. 전경 사용이 발견되면 `pnpm lint:tokens`가 실패한다.

두 테마가 같은 값을 공유하는 유일한 토큰군이다. 심각도는 표면 명도와 무관하게 "이 동작이 외부에 미치는 영향"을 나타내는 절대 등급이므로, 테마에 따라 색을 옮기면 등급 간 서열이 흔들린다. FR-QA-001의 키 집합 대칭 검사는 통과하며 `themeSpecific` 예외를 사용하지 않는다.

### 5.9 타이포그래피

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `font.sans` | decorative | `{stack.sans}` | `{stack.sans}` | FR-CSS-002 AC-4 |
| `font.mono` | decorative | `{stack.mono}` | `{stack.mono}` | FR-CMP-005 AC-4 |

#### 5.9.1 `font.size` (FR-TOK-007 AC-1)

테마와 무관하다. 두 팔레트가 같은 값을 갖는다.

| 토큰 키 | 값 | 소스 근거 |
| --- | --- | --- |
| `font.size.2xs` | `10px` | `app.css:205` `.nav-section-label`, `app.css:281` `.topbar-eyebrow` |
| `font.size.xs` | `11px` | `app.css:197` `.app-brand-copy span`, `app.css:763` `kbd` |
| `font.size.sm` | `12px` | `app.css:335` `.user-menu-copy strong`, `app.css:504` `.badge` |
| `font.size.base` | `13px` | `app.css:290` `.topbar-title`, `app.css:454` `.btn`, `app.css:97` `.mono` |
| **font.size.md** | `14px` | `app.css:22` `body` |
| `font.size.lg` | `16px` | `app.css:192` `.app-brand-copy strong` |
| `font.size.xl` | `20px` | `app.css:400` `.section-heading h2`(15px)와 `app.css:80` `h1` clamp 하한(24px) 사이의 제목 단계 |

#### 5.9.2 `font.lineHeight` (FR-TOK-007 AC-2)

파생 규칙: `lineHeight = round(font.size × ratio)`. `ratio`는 용도로 결정한다 — 대문자 라벨(2xs, xs)은 자간이 넓어 행간을 줄이므로 1.40 / 1.45, 본문 계열(sm, base, md, lg)은 소스의 `line-height: 1.5`를 그대로 쓰고, 제목(xl)은 1.30을 쓴다. 반올림은 half-up이다. 값은 단위 없는 비율이 아니라 px다 — 중첩 요소에서 배수가 누적되지 않도록 하기 위함이다.

| 토큰 키 | 값 | 계산 |
| --- | --- | --- |
| `font.lineHeight.2xs` | `14px` | `10 × 1.40 = 14.0` |
| `font.lineHeight.xs` | `16px` | `11 × 1.45 = 15.95 → 16` |
| `font.lineHeight.sm` | `18px` | `12 × 1.50 = 18.0` |
| `font.lineHeight.base` | `20px` | `13 × 1.50 = 19.5 → 20` |
| **font.lineHeight.md** | `21px` | `14 × 1.50 = 21.0` |
| `font.lineHeight.lg` | `24px` | `16 × 1.50 = 24.0` |
| `font.lineHeight.xl` | `26px` | `20 × 1.30 = 26.0` |

FR-TOK-007 AC-4는 제목이 `font.size.xl` 이상과 `clamp()` 기반 반응형 값을 쓸 것을 요구한다. 스케일은 7단계로 고정되어 있으므로(AC-1) `clamp()`의 상한은 새 토큰이 아니라 파생 수식으로 만든다: 상한 = `font.size.xl × 1.6 = 32px`. 소스 `h1 { font-size: clamp(24px, 3vw, 32px) }`의 상한과 일치한다. 하한은 `font.size.xl × 1.2 = 24px`로 소스와 일치한다. 이 수식은 7.7절의 component 토큰 `page.headingSize`로만 노출된다.

#### 5.9.3 간격 (`space.*`)

`space.1`~`space.4`는 4px 등차, `space.5`~`space.8`은 8px 등차다. 테마 무관.

| 토큰 키 | 값 | 토큰 키 | 값 |
| --- | --- | --- | --- |
| `space.1` | `4px` | `space.5` | `24px` |
| `space.2` | `8px` | `space.6` | `32px` |
| `space.3` | `12px` | `space.7` | `40px` |
| `space.4` | `16px` | `space.8` | `48px` |

#### 5.9.4 반경 (`radius.*`)

테마 무관. 소스 값 그대로다. 등차·등비가 아니며 근사하지 않는다(FR-THM-001 예외 처리).

| 토큰 키 | 값 | 소스 |
| --- | --- | --- |
| `radius.xs` | `6px` | `tokens.css:65` |
| `radius.sm` | `9px` | `tokens.css:66` |
| **radius.md** | `12px` | `tokens.css:67` |
| `radius.lg` | `18px` | `tokens.css:68` |
| `radius.xl` | `24px` | `tokens.css:69` |
| `radius.pill` | `9999px` | `app.css:500`, `app.css:1269` |

`radius.pill`은 `tokens.css`의 다섯 단계 표면 반경을 확장해 근사한 값이 아니라, Badge와 Switch가 `app.css`에서 공유하는 완전 원형 기하를 그대로 승격한 semantic 토큰이다. 컴포넌트 명세가 처음부터 `--cdt-radius-pill`을 요구했으나 WP-005 구현에서 소스가 누락된 사실을 CR-018 시각 검수에서 발견해 복구했다(DEV-011).

### 5.10 고도 (`elevation.*`)

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `elevation.raised` | decorative | `0 12px 30px rgba(0, 0, 0, 0.18)` | `0 12px 30px rgba(12, 18, 28, 0.08)` | FR-THM-002 AC-4 |
| `elevation.hover` | decorative | `0 18px 46px rgba(0, 0, 0, 0.26)` | `0 18px 46px rgba(12, 18, 28, 0.12)` | FR-THM-002 AC-4, FR-CMP-003 AC-2 |
| `elevation.overlay` | decorative | `0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px {border.strong}` | `0 24px 64px rgba(12, 18, 28, 0.2), 0 0 0 1px {border.strong}` | FR-THM-002 AC-4, FR-CMP-006 |

세 토큰의 라이트 alpha(0.08 / 0.12 / 0.20)는 다크 alpha(0.18 / 0.26 / 0.45)와 전부 다르다 — FR-THM-002 AC-4의 "동일 값 재사용 금지"를 만족한다. 파생 근거는 6.4절에 있다.

### 5.11 상호작용

| 토큰 키 | 용도 | 다크 값 | 라이트 값 | 관련 FR |
| --- | --- | --- | --- | --- |
| `focusRing` | nonText | `0 0 0 3px rgba(109, 124, 255, 0.8)` | `0 0 0 3px rgba(79, 91, 213, 0.8)` | FR-THM-005 AC-1, FR-A11Y-001 |
| `state.hover` | decorative | `rgba(255, 255, 255, 0.055)` | `rgba(12, 18, 28, 0.05)` | FR-CSS-004 |
| `state.selected` | decorative | `rgba(109, 124, 255, 0.16)` | `rgba(79, 91, 213, 0.12)` | FR-CSS-004 |
| `state.disabled` | decorative | `#18202c` | `#e2e8f0` | FR-CMP-002 AC-4 |
| `state.disabledPolicy` | decorative | `#422006` | `#fef3c7` | FR-CMP-002 AC-5 |

**`focusRing`은 소스 값을 교정한 두 토큰 중 하나다(FR-THM-005 AC-1).** 소스는 accent를 alpha 0.30으로 썼다. 합성 후 `surface.base` 위 1.50:1로, 포커스 표시자에 3:1을 요구하는 WCAG 2.4.11을 만족하지 못한다. 포커스 표시자는 장식으로 분류할 수 없으므로 값 보존이 성립하지 않는다. alpha를 0.80으로 올린다.

| 표면 | 다크 합성색 | 다크 대비 | 라이트 합성색 | 라이트 대비 |
| --- | --- | --- | --- | --- |
| `surface.base` | `#5965d0` | 3.93:1 | `#6e78db` | 3.30:1 |
| `surface.raised` | `#5b69d4` | 3.56:1 | `#717bdd` | 3.66:1 |
| `surface.elevated` | `#5c6bd7` | 3.34:1 | `#727cdd` | 3.72:1 |

여섯 조합이 모두 3:1을 넘는다. 다크에서는 표면이 밝아질수록 대비가 내려가고 라이트에서는 올라간다 — 링 색이 두 팔레트에서 반대 방향으로 표면에 접근하기 때문이다. 최저값 3.30:1(라이트 `surface.base`)이 전체 여유를 결정한다.

대비 측정 기준: 포커스 링이 덮는 픽셀의 focus 전후 색을 비교한다. focus 전 그 픽셀의 색은 링이 놓인 표면이다. alpha 0.80은 표면에 따라 합성색이 달라지므로 표면별로 따로 계산한다.

`state.disabled`와 `state.disabledPolicy`는 배경 채움이며, 그 위 텍스트 쌍으로 검사된다(8절 CP-040, CP-041).

### 5.12 z-index (FR-TOK-008)

테마 무관. 여섯 레이어의 값이 서로 다르다(AC-3).

| 토큰 키 | 값 | 사용처 |
| --- | --- | --- |
| `z.base` | `0` | 기본 흐름 |
| `z.raised` | `10` | 포커스 링이 부모의 `overflow: hidden`에 잘릴 때 상승(FR-A11Y-001 예외 처리) |
| `z.sticky` | `20` | `cdt-app-shell`의 상단바 |
| `z.drawer` | `30` | 사이드 내비, `Drawer` 패널 |
| `z.overlay` | `40` | `Dialog`·`Drawer`의 배경 가림막 (FR-CMP-006 AC-4) |
| `z.popover` | `50` | `Tooltip`, `DropdownMenu`, `Select` 내용, `skip-link` (FR-CMP-006 AC-4) |

`z.popover`(50)를 초과하는 값이 필요한 소비자는 자체 레이어를 직접 지정한다. Conductor는 50 초과 값을 산출하지 않는다(FR-TOK-008 예외 처리).

### 5.13 브레이크포인트 (FR-TOK-009)

테마 무관. CSS 커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않으므로(SRS 5.2 기술 제약 3), 토큰 빌드가 `@media` 조건에 리터럴 px를 치환한다. 산출 CSS의 `@media` 조건에 `var(--cdt-breakpoint-*)`가 등장하면 검사가 실패한다(AC-2).

| 토큰 키 | 값 | 소스 근거 | 적용 규칙 |
| --- | --- | --- | --- |
| `breakpoint.sm` | `560px` | `app.css:1074` | `cdt-card-grid` 단일 컬럼 전환, 폼 컨트롤 최소 높이 42px (FR-CSS-003 AC-3, FR-CMP-007 AC-5) |
| **breakpoint.md** | `800px` | `app.css:988` | `cdt-split-layout` 단일 컬럼 전환, `Table` 가로 스크롤 활성, 오프캔버스 내비 (FR-CSS-003 AC-2, FR-CMP-005 AC-1, FR-CMP-009 AC-3) |
| `breakpoint.lg` | `1080px` | `app.css:973` | 내비 폭 축소, 카드 그리드 최소 컬럼 폭 축소 |

`@conductor-by-89soone/tokens`는 `breakpoints` 객체를 export해 JS에서 같은 값을 읽게 한다(AC-3). 이는 `tokens` 객체와 별개의 named export다.

---

## 6. 라이트 팔레트 파생 규칙

FR-THM-002는 라이트 테마가 다크 테마와 **동일한 semantic 키 집합**을 가질 것을 요구한다(AC-1). 값 파생은 아래 규칙을 따른다. 규칙은 기계적으로 재현 가능해야 하며, "보기 좋게 조정했다"는 서술은 근거로 인정하지 않는다.

### 6.1 표면: 명도 서열 반전 후 상단 압축

**규칙**: 다크 표면 5단계의 깊이 서열(base가 가장 어둡고 elevated가 가장 밝다)을 유지한 채, 명도 축을 반전한다. 반전 후 라이트 표면은 base가 가장 어둡고 elevated가 가장 밝다 — 즉 **서열 인덱스는 그대로이고 절대 명도만 옮긴다.** 흰색이 천장이므로 상대 휘도를 `[0.83, 1.00]` 구간에 압축한다. 이 구간 폭(0.17)은 다크의 구간 폭(0.00335 ~ 0.01787)보다 넓다. 인간의 명도 지각이 어두운 쪽에서 더 예민하기 때문이며, 좁은 구간을 그대로 반전하면 라이트 표면 5단계가 서로 구분되지 않는다.

| semantic 키 | 다크 | 다크 상대 휘도 | 라이트 | 라이트 상대 휘도 | primitive |
| --- | --- | --- | --- | --- | --- |
| `surface.base` | `#080b12` | 0.00335 | `#e8ecf2` | 0.83558 | `{ink.200}` |
| `surface.canvas` | `#0b101a` | 0.00516 | `#eef1f6` | 0.87742 | `{ink.150}` |
| `surface.timeline` | `#0d141f` | 0.00685 | `#f1f4f8` | 0.90179 | `{ink.100}` |
| `surface.subtle` | `#101722` | 0.00838 | `#f3f6f9` | 0.91806 | `{ink.75}` |
| `surface.raised` | `#141d2a` | 0.01195 | `#fbfcfd` | 0.97222 | `{ink.25}` |
| `surface.elevated` | `#192535` | 0.01787 | `#ffffff` | 1.00000 | `{ink.0}` |

두 테마 모두 상대 휘도가 base → elevated 방향으로 단조 증가한다. `surface.timeline`은 다크에서 canvas와 subtle 사이에 있고, 라이트에서도 같은 자리를 유지한다.

색상(hue)은 유지한다. 다크 표면의 색상각은 220° 부근(청색 편향)이고 라이트 표면도 220° 부근을 쓴다. 무채색 회색을 쓰지 않는 이유는 다크 팔레트가 청색 편향 중립을 제품 정체성으로 삼기 때문이다(P-1).

### 6.2 텍스트: 명도 축 반사, 대비 목표 고정

**규칙**: 각 텍스트 토큰이 다크에서 `surface.base` 위에 만들어내던 대비율을 목표치로 삼고, 라이트 `surface.base`(`#e8ecf2`) 위에서 같은 등급에 도달하는 값을 `ink.*` ramp에서 고른다. 등급은 "통과 여부"이지 소수점 일치가 아니다 — 명도 지각의 비선형성 때문에 두 테마에서 동일한 대비율을 만드는 것은 색상 왜곡 없이는 불가능하다.

| semantic 키 | 다크 값 / `surface.base` 대비 | 라이트 값 / `surface.base` 대비 | primitive | 판정 |
| --- | --- | --- | --- | --- |
| `text.primary` | `#f4f7fb` / 18.32:1 | `#0c121c` / 15.83:1 | `{ink.880}` | 양쪽 통과 |
| `text.secondary` | `#c5cfdd` / 12.51:1 | `#33415a` / 8.66:1 | `{ink.750}` | 양쪽 통과 |
| `text.muted` | `#8290a3` / 6.06:1 | `#4d5a6e` / 5.90:1 | `{ink.700}` | 양쪽 통과 |
| `text.faint` | `#5f6d80` / 3.74:1 | `#6b788c` / 3.78:1 | `{ink.500}` | `decorative` (본문 아님) |
| `text.inverse` | `#07111f` | `#f4f7fb` | `{ink.50}` | 강조 배경 위에서 검사 |
| `text.monoPayload` | `#dce6f3` / 13.44:1(raised) | `#1b2537` / 14.96:1(raised) | `{ink.800}` | 양쪽 통과 |

`text.faint`는 두 테마에서 **동일한 방식으로** 본문 기준에 미달한다. 이는 우연이 아니라 파생 규칙의 결과다 — 다크의 등급을 목표로 삼았으므로 다크의 성질도 함께 계승된다. SRS 12.1절이 이 토큰을 `decorative`로 확정했으므로 두 값 모두 본문 기준의 적용을 받지 않는다. 값을 올려 `text.muted`와 구분 불가능하게 만드는 대신 용도를 좁힌다(5.3절).

`text.inverse`는 라이트에서 `{ink.50}`(`#f4f7fb`)이 된다. 다크 `text.primary`와 값이 같다. 두 토큰은 서로 다른 키이므로 키 집합 대칭 검사(FR-QA-001)에 영향이 없다.

### 6.3 경계: 장식 경계는 alpha, 컨트롤 경계는 대비

다크 경계는 `rgba(148, 163, 184, α)`를 표면 위에 합성한다. 합성 결과의 대비율은 아래와 같다.

| 토큰 | α | `usage` | `surface.base` 위 합성색 / 대비 | `surface.raised` 위 합성색 / 대비 | `surface.elevated` 위 합성색 / 대비 |
| --- | --- | --- | --- | --- | --- |
| `border.subtle` | 0.10 | decorative | `#161a23` / 1.13:1 | `#212a38` / 1.17:1 | `#253242` / 1.19:1 |
| `border.default` | 0.18 | decorative | `#212630` / 1.30:1 | `#2b3544` / 1.37:1 | `#2f3c4d` / 1.38:1 |
| `border.strong` | 0.30 | decorative | `#323944` / 1.69:1 | `#3a4555` / 1.75:1 | `#3e4b5c` / 1.74:1 |
| `border.control` | 0.60 | nonText | `#5c6676` / 3.39:1 | `#616d7f` / 3.23:1 | `#637184` / 3.11:1 |

앞의 세 토큰은 `decorative`이므로 대비 기준을 지지 않는다(FR-THM-005 AC-4). `border.control`만 3:1을 지며, alpha 0.60이 그 기준을 세 표면 모두에서 넘긴다. 같은 slate 색이 3:1을 만들려면 α ≥ 0.55(`surface.base`), 0.57(`raised`), 0.59(`elevated`)가 필요하다. 0.60은 가장 까다로운 `surface.elevated`를 3.11:1로 통과시키는 최소 근처의 값이다.

라이트에서는 alpha 방식이 성립하지 않는다. 같은 `rgba(148, 163, 184, 0.6)`을 흰 배경에 합성하면 `#bfc8d4`로 1.69:1이다. 어두운 잉크로 바꿔 `rgba(12, 18, 28, α)`를 흰 배경에 합성해도 α = 0.45에서 2.93:1, 3:1을 넘으려면 α ≈ 0.47이 필요하며 그 시점의 합성색은 사실상 불투명 중간 회색이다. "반투명 층"이라는 P-4의 성질이 소멸한다.

**결론**: 라이트 경계는 네 토큰 모두 alpha를 버리고 불투명 값으로 정의한다. `surface.*`가 라이트에서 모두 불투명하므로 합성 성질을 잃어도 잃는 것이 없다.

| semantic 키 | `usage` | 라이트 값 | primitive | `surface.base` 위 | `surface.raised` 위 | `surface.elevated` 위 | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `border.subtle` | decorative | `#e2e8f0` | `{ink.250}` | 1.04:1 | 1.20:1 | 1.23:1 | 검사 대상 아님 |
| `border.default` | decorative | `#6b788c` | `{ink.500}` | 3.78:1 | 4.36:1 | 4.48:1 | 검사 대상 아님 |
| `border.strong` | decorative | `#5b6879` | `{ink.650}` | 4.79:1 | 5.52:1 | 5.67:1 | 검사 대상 아님 |
| `border.control` | nonText | `#64748b` | `{slate.500}` | 4.01:1 | 4.63:1 | 4.76:1 | 세 표면 모두 통과 |

라이트 `border.control`은 `{slate.500}`(`#64748b`)이다. 새 primitive를 만들지 않았다 — 이 값은 다크 `status.queued`가 이미 쓰는 stop이며, 라이트 표면 위에서 세 표면 모두 3:1을 넘고 라이트 `border.default`(`#6b788c`)보다 어두워 컨트롤 경계가 장식 경계보다 뚜렷하다는 서열이 유지된다. 다크에서 `border.control`이 `border.strong`보다 뚜렷한 것과 같은 서열이다.

### 6.3.1 `focusRing`의 라이트 값

다크 `focusRing`이 accent를 alpha 0.80으로 합성하므로 라이트도 같은 구조를 쓴다. 라이트 accent(`#4f5bd5`)를 alpha 0.80으로 합성한다.

| 표면 | 라이트 합성색 | 대비 | 판정 |
| --- | --- | --- | --- |
| `surface.base` `#e8ecf2` | `#6e78db` | 3.30:1 | 통과 |
| `surface.canvas` `#eef1f6` | `#6f79dc` | 3.41:1 | 통과 |
| `surface.subtle` `#f3f6f9` | `#707adc` | 3.52:1 | 통과 |
| `surface.raised` `#fbfcfd` | `#717bdd` | 3.66:1 | 통과 |
| `surface.elevated` `#ffffff` | `#727cdd` | 3.72:1 | 통과 |

다섯 표면 모두 3:1을 넘는다. 라이트에서는 표면이 밝아질수록 링과 표면의 명도 차가 벌어져 대비가 올라간다. 다크에서는 반대로 내려간다(3.93 → 3.34). 두 테마의 최저값은 라이트 `surface.base`의 3.30:1이며, 이 값이 `focusRing` 전체의 여유를 결정한다.

### 6.4 고도: 색을 바꾸고 alpha를 낮춘다

다크 그림자는 순수 검정(`rgb(0,0,0)`)이다. 어두운 표면 위에서 검정 그림자는 표면과 색상이 같아 자연스럽다. 라이트 표면 위에 같은 검정을 쓰면 회색 얼룩으로 읽히고 팔레트의 청색 편향과 어긋난다.

**규칙 두 가지.**

1. **색상 교체**: 그림자 기저색을 `rgb(0, 0, 0)`에서 `rgb(12, 18, 28)`(= `{ink.880}`의 RGB)로 바꾼다. 표면 색상각과 일치한다.
2. **alpha 축소**: 라이트 alpha = 다크 alpha × 0.45 (raised, hover) / × 0.44 (overlay), 소수 둘째 자리 반올림. 계수가 1 미만인 이유는 밝은 표면이 잃을 수 있는 휘도 여유가 크기 때문이다 — 같은 alpha를 쓰면 라이트에서 그림자가 다크보다 훨씬 짙게 지각된다.

| semantic 키 | 다크 alpha | 계산 | 라이트 alpha | 라이트 값 |
| --- | --- | --- | --- | --- |
| `elevation.raised` | 0.18 | 0.18 × 0.45 = 0.081 | 0.08 | `0 12px 30px rgba(12, 18, 28, 0.08)` |
| `elevation.hover` | 0.26 | 0.26 × 0.45 = 0.117 | 0.12 | `0 18px 46px rgba(12, 18, 28, 0.12)` |
| `elevation.overlay` | 0.45 | 0.45 × 0.44 = 0.198 | 0.20 | `0 24px 64px rgba(12, 18, 28, 0.2), 0 0 0 1px {border.strong}` |

세 라이트 alpha(0.08, 0.12, 0.20)가 세 다크 alpha(0.18, 0.26, 0.45)와 모두 다르므로 FR-THM-002 AC-4를 만족한다. 오프셋과 블러 반경(`12px 30px`, `18px 46px`, `24px 64px`)은 테마 무관하게 유지한다 — 기하 구조는 광원 모델이지 색이 아니다.

`elevation.overlay`의 두 번째 그림자 `0 0 0 1px {border.strong}`은 semantic 참조다. 라이트에서 자동으로 `#5b6879`로 해석되어 오버레이 경계가 3:1을 유지한다.

### 6.5 반투명 표면: `surface.glass`와 `surface.overlay`

`surface.overlay`는 가림막(scrim)이다. 다크에서 `rgba(4, 7, 12, 0.78)`. 라이트에서도 **가림막은 어두워야 한다** — 밝은 막은 아래 내용을 가리지 못한다. 색을 `rgb(12, 18, 28)`로 바꾸고 alpha를 0.45로 낮춘다. 라이트 `surface.base` 위 합성 결과는 `#858a92`로, `text.primary`(`#0c121c`)와 5.40:1이다. 가림막 위에 텍스트를 올리지 않으므로 이 값은 `decorative`다. 가림막의 목적은 배후 내용을 판독 불가로 만드는 것이며, `Dialog` 패널은 `surface.elevated`(`#ffffff`) 위에 그려진다.

`surface.glass`는 다루기 더 어렵다. 다크 `rgba(16, 23, 34, 0.82)`는 `backdrop-filter: blur(18px)`와 함께 쓰여 배후를 흐리면서 어둡게 눌러 패널 경계를 만든다. 라이트에서 `rgba(251, 252, 253, 0.86)`를 `surface.base`(`#e8ecf2`) 위에 합성하면 `#f8fafb`가 되고 배경과의 대비는 1.13:1이다. **패널 경계가 사실상 사라진다.**

FR-THM-002 예외 처리는 이 경우를 예상하고 규정했다: "다크 전용 시각 장치(글래스 배경, 글로우)가 라이트에서 판독 불가하면, 해당 컴포넌트 토큰을 라이트 팔레트에서 solid 대안 값으로 재정의한다. 컴포넌트 코드는 수정하지 않는다."

이 규정에 따른 처리:

- `surface.glass` semantic 토큰은 두 테마 모두에 존재한다(키 대칭 유지).
- 라이트에서 글래스 표면을 쓰는 component 토큰 `overlay.background`와 `card.background`는 `{surface.glass}` 대신 `{surface.elevated}`(불투명)를 참조하도록 **라이트 팔레트가 재정의한다**(7.6절).
- 재정의는 component 토큰의 라이트 값 열에서 일어난다. React·CSS 코드는 언제나 `--cdt-overlay-background`를 읽으므로 수정되지 않는다.
- 라이트에서 패널 경계는 `border.strong`(`#5b6879`, 5.52:1)과 `elevation.raised`가 담당한다.

`accent.glow`도 같은 처리를 받는다. 다크 `rgba(109, 124, 255, 0.28)`은 어두운 표면 위에서 발광으로 읽힌다. 라이트에서 같은 개념을 재현할 수 없으므로 alpha를 0.22로 낮추고, 글로우가 정보를 전달하는 유일한 수단인 곳이 없도록 component 토큰이 항상 `border.strong` 또는 텍스트를 함께 지정한다. `accent.glow`는 두 테마에서 `decorative`다.

### 6.6 강조·상태·미터: 배경 명도에 맞춘 재선택

**규칙**: 색상각(hue)과 의미를 유지하고 명도만 조정한다. 조정 목표는 아래 두 가지를 동시에 만족하는 것이다.

1. 채움으로 쓸 때: `text.inverse`(라이트에서 `#f4f7fb`)를 얹어 본문 4.5:1 이상.
2. 전경·테두리로 쓸 때: `surface.raised`(`#fbfcfd`) 위에서 해당 토큰의 `usage` 기준 이상. `body` 토큰은 4.5:1, `nonText` 토큰은 3:1이다.

`usage` 분류는 SRS 12.1절이 확정했고 라이트도 그대로 상속한다. 따라서 규칙 2의 기준은 토큰마다 다르다 — `status.running` ~ `status.danger`와 `meter.*`는 4.5:1, `status.queued`와 `status.neutralEnd`는 3:1이다.

Tailwind ramp를 쓰는 색은 같은 색상 계열에서 2~3단계 어두운 stop을 고른다. `accent`는 제품 고유 색이므로 `indigo.500`(`#6d7cff`)의 색상각을 유지한 채 명도를 낮춘 `indigo.700`(`#4f5bd5`)을 새로 정의했다.

| semantic 키 | `usage` | 다크 | 라이트 | 라이트 primitive | `text.inverse` 얹었을 때 | `surface.raised` 위 |
| --- | --- | --- | --- | --- | --- | --- |
| `accent` | body | `#6d7cff` | `#4f5bd5` | `{indigo.700}` | 5.16:1 통과 | 5.39:1 통과 |
| `accent.strong` | nonText | `#5667f5` | `#3f4ac0` | `{indigo.800}` | 6.62:1 | 6.93:1 통과 |
| `status.queued` | nonText | `#64748b` | `#52607a` | `{slate.750}` | 5.90:1 | 6.17:1 통과 |
| `status.running` | body | `{accent}` | `{accent}` | — | 5.16:1 통과 | 5.39:1 통과 |
| `status.waiting` | body | `#f59e0b` | `#b45309` | `{amber.700}` | 4.67:1 통과 | 4.89:1 통과 |
| `status.success` | body | `#10b981` | `#047857` | `{emerald.700}` | 5.10:1 통과 | 5.34:1 통과 |
| `status.partial` | body | `#eab308` | `#a16207` | `{yellow.700}` | 4.58:1 통과 | 4.79:1 통과 |
| `status.danger` | body | `#ef4444` | `#c81e1e` | `{red.650}` | 5.34:1 통과 | 5.59:1 통과 |
| `status.neutralEnd` | decorative | `#475569` | `#3f4b5f` | `{slate.700}` | 2.24:1 (검사 제외) | 8.58:1 (검사 제외) |
| `meter.normal` | body | `#34d399` | `#047857` | `{emerald.700}` | — | 5.34:1 통과 |
| `meter.warning` | body | `#fbbf24` | `#b45309` | `{amber.700}` | — | 4.89:1 통과 |
| `meter.exceeded` | body | `#f87171` | `#dc2626` | `{red.600}` | — | 4.70:1 통과 |

라이트 상태색 7종과 미터 3종이 각자의 `usage` 기준을 통과한다. `status.neutralEnd`는 `decorative`라 두 테마 모두 검사 대상이 아니지만(CR-006), 측정값을 남겨 둔다. 다크에서 2.24:1인 값이 라이트에서 8.58:1이 되는 이유는 어두운 표면 위의 어두운 회색이라는 근본 문제가 라이트에서 사라지기 때문이다. 이 비대칭이 8.5절이 다룬 모순의 원인이었다.

**`status.danger`가 `{red.600}`이 아닌 이유.** 위 규칙 1을 처음 적용했을 때 `status.danger`의 라이트 값으로 Tailwind Red 600(`#dc2626`)을 골랐다. 측정하면 `text.inverse`(`#f4f7fb`)를 얹었을 때 4.49:1로, 기준 4.5:1에 0.01 모자란다. 규칙 1이 스스로 그 값을 기각한다. 같은 색상각에서 한 단계 더 어두운 `#c81e1e`를 `{red.650}`으로 정의해 5.34:1을 확보했다.

**`meter.normal`·`meter.warning`의 라이트 값이 바뀐 이유.** v0.2는 미터를 비텍스트 도형으로 보고 3:1을 목표로 `{emerald.600}`(`#059669`)과 `{amber.600}`(`#d97706`)을 산출했다. SRS 12.1절이 미터 3종을 `body`로 분류했으므로 기준이 4.5:1로 올라갔고, 두 값은 각각 3.67:1과 3.10:1로 미달한다. 규칙 2를 새 기준으로 다시 적용해 `{emerald.700}`(5.34:1)과 `{amber.700}`(4.89:1)로 산출했다.

두 재산출 모두 소스 값 변경이 아니다. 라이트 값은 이 문서가 파생한 값이므로, 파생 규칙이 스스로 기각한 결과를 그대로 두지 않고 규칙에 맞게 다시 산출한다(0절). 소스 값을 보존한다는 원칙은 다크 팔레트에만 적용되며, 다크의 교정은 FR-THM-005가 명시한 두 토큰으로 한정된다.

### 6.7 상호작용 상태

| semantic 키 | 다크 | 라이트 | 파생 근거 |
| --- | --- | --- | --- |
| `state.hover` | `rgba(255, 255, 255, 0.055)` | `rgba(12, 18, 28, 0.05)` | hover는 표면을 배경 반대 방향으로 민다. 다크는 흰색 가산, 라이트는 잉크 가산. alpha는 라이트에서 지각 강도를 맞추기 위해 0.055 → 0.05 |
| `state.selected` | `rgba(109, 124, 255, 0.16)` | `rgba(79, 91, 213, 0.12)` | 기저색이 각 테마의 `accent` RGB. 라이트 accent가 더 어두워 같은 alpha에서 더 강하게 읽히므로 0.16 → 0.12 |
| `state.disabled` | `#18202c` | `#e2e8f0` | `{ink.820}` ↔ `{ink.250}`. `text.muted`를 얹었을 때 다크 5.05:1, 라이트 5.67:1 |
| `state.disabledPolicy` | `#422006` | `#fef3c7` | `{amber.950}` ↔ `{amber.100}`. 정책 차단은 amber 계열을 유지한다. 다크는 어두운 amber 채움에 밝은 amber 텍스트, 라이트는 밝은 amber 채움에 어두운 amber 텍스트 |
| `focusRing` | `0 0 0 3px rgba(109, 124, 255, 0.8)` | `0 0 0 3px rgba(79, 91, 213, 0.8)` | FR-THM-005 AC-1의 교정 값. 두 테마가 각자의 `accent` RGB를 같은 alpha로 합성한다. 측정값은 6.3.1절 |
| `border.control` | `rgba(148, 163, 184, 0.6)` | `#64748b` | FR-THM-005 AC-2의 신규 토큰. 라이트는 6.3절의 불투명 규칙을 따른다 |

---

## 7. Component 토큰

component 토큰은 semantic 토큰만 참조한다(FR-TOK-002 AC-3). 아래 표의 값 열에 primitive 키나 리터럴 색이 등장하면 빌드가 실패한다.

라이트 값 열이 비어 있으면 다크와 동일한 참조를 쓴다는 뜻이다 — 참조 대상 semantic 토큰이 테마별로 다른 값을 가지므로 참조식 하나로 두 테마가 모두 성립한다. 이것이 3계층 구조가 실제로 테마를 분리한다는 증거다. 라이트 값이 명시된 행만이 6.5절의 예외 재정의다.

### 7.1 `button.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `button.minHeight` | `40px` | | FR-CMP-007 AC-5 |
| `button.minHeightCompact` | `42px` | | FR-CMP-007 AC-5 (`breakpoint.sm` 미만) |
| `button.paddingBlock` | `{space.2}` | | FR-CSS-004 |
| `button.paddingInline` | `14px` | | FR-CSS-004 |
| `button.radius` | `{radius.md}` | | FR-CSS-004 |
| `button.fontSize` | `{font.size.md}` | | FR-TOK-007 AC-3, CR-019 |
| `button.gap` | `{space.2}` | | FR-CSS-004 |
| `button.transition` | `{motion.fast}` | | FR-CSS-005 |
| `button.primary.background` | `{accent}` | | FR-CMP-002 AC-1 |
| `button.primary.backgroundHover` | `{accent}` | | FR-CMP-002 |
| `button.primary.text` | `{text.inverse}` | | FR-A11Y-004 |
| `button.primary.border` | `transparent` | | FR-CSS-004 |
| `button.primary.shadow` | `{elevation.raised}` | | FR-CMP-002 |
| `button.primary.shadowHover` | `{elevation.hover}` | | FR-CMP-002 |
| `button.secondary.background` | `{surface.raised}` | | FR-CMP-002 AC-1 |
| `button.secondary.backgroundHover` | `{surface.elevated}` | | FR-CMP-002 |
| `button.secondary.text` | `{text.primary}` | | FR-A11Y-004 |
| `button.secondary.border` | `{border.strong}` | | FR-THM-005 AC-4 |
| `button.secondary.borderHover` | `{accent}` | | FR-CMP-002 |
| `button.ghost.background` | `transparent` | | FR-CMP-002 AC-1 |
| `button.ghost.backgroundHover` | `{state.hover}` | | FR-CMP-002 |
| `button.ghost.text` | `{text.muted}` | | FR-A11Y-004 |
| `button.ghost.textHover` | `{text.primary}` | | FR-CMP-002 |
| `button.ghost.border` | `transparent` | | FR-CSS-004 |
| `button.disabled.background` | `{state.disabled}` | | FR-CMP-002 AC-4 |
| `button.disabled.text` | `{text.muted}` | | FR-CMP-002 AC-4 |
| `button.disabled.border` | `{border.default}` | | FR-CMP-002 AC-4 |
| `button.policyDisabled.background` | `{state.disabledPolicy}` | | FR-CMP-002 AC-5 |
| `button.policyDisabled.text` | `{meter.exceeded}` | `{severity.destructive}` | FR-CMP-002 AC-5 |
| `button.policyDisabled.border` | `{status.danger}` | | FR-CMP-002 AC-5 |
| `button.focusRing` | `{focusRing}` | | FR-A11Y-001 AC-1 |

**`button.primary`가 단색이고 hover가 배경을 바꾸지 않는 이유.** 소스 `.btn-primary`는 `linear-gradient(135deg, var(--accent), var(--accent-strong))`에 `color: #fff`를 얹는다. 측정하면 흰 글자는 `#6d7cff`(그라데이션 시작점) 위에서 3.51:1, `#5667f5`(끝점) 위에서 4.51:1이다. `text.inverse`(`#07111f`)를 쓰면 정반대로 5.39:1과 4.20:1이다. **어느 글자색을 골라도 그라데이션의 한쪽 끝에서 본문 4.5:1이 무너진다.** 그라데이션을 버리고 단색 `{accent}` + `{text.inverse}`로 두면 5.39:1로 통과한다.

같은 이유로 hover가 배경을 `{accent.strong}`으로 바꾸지 않는다. 바꾸면 hover 상태의 글자 대비가 4.20:1로 떨어지고, WCAG 1.4.3은 상태별로 최소 대비를 요구한다. `accent.strong`을 어둡게 조정해도 해결되지 않는다 — `#4c5ce8`에서 `text.inverse` 대비가 3.61:1로 더 나빠지고, 밝게 하면 `accent`와 구분되지 않는다. hover는 배경을 유지한 채 `{elevation.hover}`로 표현한다. 측정상 본문 4.5:1을 두 상태 모두에서 지키는 유일한 조합이다.

`accent.strong`은 이 결과로 Conductor 컴포넌트에서 배경 채움으로 쓰이지 않는다. `nonText` 토큰으로 남아 소비자가 강조 계열의 두 번째 단계로 참조한다. 선언된 검사 쌍은 `accent.strong` 대 `surface.base`뿐이다(8절 CP-012).

**`button.policyDisabled.text`가 테마별로 다른 이유.** 다크는 어두운 amber 채움(`#422006`) 위에 밝은 붉은 글자가 필요하다 — `{meter.exceeded}`(`#f87171`)가 5.27:1로 통과한다(`{status.danger}` `#ef4444`는 3.87:1로 미달). 라이트는 밝은 amber 채움(`#fef3c7`) 위에 어두운 붉은 글자가 필요하므로 `{severity.destructive}`(`#b91c1c`)를 참조한다. 두 참조 모두 semantic 토큰이며 primitive를 건너뛰지 않는다. 이 라이트 참조는 5.8절의 "심각도는 배경 전용" 제약의 예외가 아니다 — `severity.destructive`가 배경이 아닌 곳은 여기뿐이며, `state.disabledPolicy` 채움 위 5.81:1로 본문 기준을 넘는다. 이 조합은 8절 CP-041로 선언해 검사한다.

**`button.secondary.border`가 `{border.control}`이 아닌 이유.** `border.control`의 적용 대상은 `TextField`·`TextArea`·`Select`·`Switch`·`Checkbox` 다섯 컴포넌트로 한정된다(FR-THM-005 AC-2). 버튼은 그 목록에 없다. 버튼은 경계선 없이도 채움(`surface.raised`), 라벨 텍스트, 포커스 링으로 식별되므로 `border.strong`(`decorative`)을 계속 참조한다. 소스 `.btn`도 `border: 1px solid var(--border-strong)`을 쓴다. 이 판단은 SRS 12.1절이 세 경계 토큰에 부여한 WCAG 1.4.11 예외 근거와 같은 논리다.

**CR-019에서 `button.fontSize`를 14px로 높인 이유.** 버튼은 빈번하게 스캔하는 동작 라벨이며 Conductor 본문도 14px를 사용한다. 13px 원본 값의 보존보다 본문과의 판독 일관성을 우선하되, 높이·패딩·공개 API는 바꾸지 않아 밀도와 레이아웃 계약을 유지한다.

### 7.2 `card.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `card.background` | `{surface.glass}` | `{surface.elevated}` | FR-CMP-003, FR-THM-002 예외 처리 |
| `card.border` | `{border.default}` | `{border.strong}` | FR-CMP-003, 6.5절 |
| `card.radius` | `{radius.lg}` | | FR-CSS-004 |
| `card.radiusCompact` | `{radius.md}` | | `breakpoint.sm` 미만 |
| `card.padding` | `{space.5}` | | FR-CSS-004 |
| `card.paddingCompact` | `18px` | | `breakpoint.sm` 미만 |
| `card.shadow` | `{elevation.raised}` | | FR-CMP-003 |
| `card.interactive.borderHover` | `{border.strong}` | | FR-CMP-003 AC-2 |
| `card.interactive.shadowHover` | `{elevation.hover}` | | FR-CMP-003 AC-2 |
| `card.interactive.translateHover` | `-2px` | | FR-CMP-003 AC-2 |
| `card.interactive.transition` | `{motion.fast}` | | FR-CSS-005 |
| `card.grid.minColumn` | `320px` | | FR-CSS-003 AC-3 |
| `card.grid.minColumnCompact` | `260px` | | `breakpoint.lg` 미만 |
| `card.grid.gap` | `{space.5}` | | FR-CSS-003 |

`card.background`의 라이트 재정의는 6.5절의 근거를 따른다. 라이트에서 `{surface.glass}`(`rgba(251,252,253,0.86)`)를 쓰면 `surface.base`와 1.06:1이라 카드 경계가 소멸한다. 불투명 `{surface.elevated}`를 참조하고 `card.border`를 `{border.strong}`으로 올려 5.52:1을 확보한다. `Card` 컴포넌트 코드는 수정되지 않는다 — `--cdt-card-background`와 `--cdt-card-border`를 읽을 뿐이다.

### 7.3 `badge.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `badge.radius` | `9999px` | | FR-CSS-004 |
| `badge.paddingBlock` | `{space.1}` | | FR-CSS-004 |
| `badge.paddingInline` | `10px` | | FR-CSS-004 |
| `badge.fontSize` | `{font.size.sm}` | | FR-TOK-007 AC-3 |
| `badge.lineHeight` | `{font.lineHeight.sm}` | | FR-TOK-007 AC-2 |
| `badge.gap` | `6px` | | FR-CMP-004 AC-1 |
| `badge.iconSize` | `12px` | | FR-CMP-004 AC-2 |
| `badge.fill.background` | `{status.running}` 외 4종 | | FR-TOK-005 AC-1 |
| `badge.fill.text` | `{text.inverse}` | | FR-CMP-004, FR-A11Y-004 |
| `badge.marker.background` | `{surface.raised}` | | FR-THM-005 AC-7 |
| `badge.marker.text` | `{text.primary}` | | FR-THM-005 AC-7 |
| `badge.marker.border` | `{border.strong}` | | FR-CSS-004 |
| `badge.marker.dot` | `{status.queued}` 또는 `{status.neutralEnd}` | | FR-THM-005 AC-5, AC-6 |
| `badge.marker.dotSize` | `9px` | | `app.css:582-584` |
| `badge.marker.dotRing` | `{surface.raised}` | | `app.css:585` |
| `badge.marker.dotRingWidth` | `2px` | | `app.css:585` |
| `badge.severity.background` | `{severity.read}` 외 3종 | | FR-TOK-005 AC-2 |
| `badge.severity.text` | `{text.primary}` | `{text.inverse}` | 8절 CP-029 ~ CP-032 |

`StatusBadge`는 상태의 `usage`에 따라 두 형태 중 하나로 렌더된다. 이는 시각 변종을 고르는 props가 아니라 상태 토큰의 메타데이터가 결정하는 구조다 — 소비자는 `status` props만 넘긴다.

**채움 형태** (`running`, `waiting`, `success`, `partial`, `danger` — `usage: body`): 상태색을 배경으로 깔고 `{text.inverse}`를 얹는다. 다섯 조합 모두 본문 4.5:1을 넘는다(다크 5.03 ~ 9.87, 라이트 4.58 ~ 5.34).

**마커 형태** (`queued` — `usage: nonText`, `neutralEnd` — `usage: decorative`): 배경은 `{surface.raised}`, 라벨은 `{text.primary}`(다크 15.77:1)이고, 상태색은 지름 9px의 점으로만 나타난다. 두 중립 회색을 배경 채움으로 쓰면 다크에서 `text.inverse`가 3.98:1·2.50:1, `text.primary`가 4.43:1·7.05:1이 되어 `status.queued`가 어느 글자색으로도 본문 기준을 넘지 못한다. 마커 형태는 그 문제를 없앤다. FR-THM-005 AC-7이 요구하는 "점·마커 전용, 텍스트 전경 금지"와 "아이콘·텍스트 병기"를 동시에 만족한다.

점은 `{badge.marker.dotRing}`(표면색, 2px)으로 둘러싸인다. 소스 `.timeline-marker`가 `border: 2px solid var(--surface-timeline)`으로 같은 구조를 쓴다(`app.css:585`). 이 링이 점의 기하 경계를 만들기 때문에 점의 식별이 채움 대비에 의존하지 않는다 — `status.neutralEnd`를 `decorative`로 분류할 수 있는 근거다(8.4절, 8.5절).

두 형태 모두 아이콘과 텍스트를 함께 렌더한다(FR-CMP-004 AC-1, FR-A11Y-003 AC-1, FR-THM-005 AC-7). 마커 형태의 점은 색을 되풀이할 뿐 정보를 혼자 지지하지 않는다. `status.queued`의 점은 `nonText`이므로 `surface.raised` 대비 3:1을 지고 3.56:1로 통과한다(8절 CP-039). `status.neutralEnd`의 점은 `decorative`이므로 검사 대상이 아니다.

### 7.4 `table.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `table.headerText` | `{text.muted}` | | FR-CMP-005 |
| `table.headerFontSize` | `{font.size.base}` | | FR-TOK-007 AC-3 |
| `table.headerBorder` | `{border.default}` | | FR-CMP-005 |
| `table.headerBorderWidth` | `2px` | | FR-CMP-005 |
| `table.cellBorder` | `{border.default}` | | FR-CMP-005 |
| `table.cellPaddingBlock` | `{space.4}` | | FR-CSS-004 |
| `table.cellPaddingInline` | `{space.3}` | | FR-CSS-004 |
| `table.rowBackgroundHover` | `{state.hover}` | | FR-CSS-004 |
| `table.rowTransition` | `{motion.fast}` | | FR-CSS-005 |
| `table.linkText` | `{text.secondary}` | | FR-CMP-005 |
| `table.linkTextHover` | `{text.primary}` | | FR-CMP-005 |
| `table.numFontFamily` | `{font.mono}` | | FR-CMP-005 AC-2 |
| `table.scrollBreakpoint` | `{breakpoint.md}` | | FR-CMP-005 AC-1 |

`table.cellBorder`가 `{border.default}`(`decorative`)를 참조하는 것은 정당하다. 행 구분선은 컴포넌트 경계가 아니라 콘텐츠 구분자이며, 표의 구조는 `<table>` 시맨틱과 헤더 텍스트가 전달한다. WCAG 1.4.11의 대상이 아니다.

### 7.4.1 `timeline.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `timeline.background` | `{surface.timeline}` | | FR-CMP-005 |
| `timeline.border` | `{border.default}` | | FR-CMP-005 |
| `timeline.stepBackgroundHover` | `{state.hover}` | | FR-CMP-005 |
| `timeline.markerBackground` | `{accent}` | | FR-CMP-005 |
| `timeline.markerRing` | `{accent.glow}` | | FR-CMP-005 |
| `timeline.markerBorder` | `{surface.timeline}` | | FR-A11Y-001 |

### 7.4.2 `codeBlock.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `codeBlock.background` | `{surface.timeline}` | | FR-CMP-005 |
| `codeBlock.border` | `{border.default}` | | FR-CMP-005 |
| `codeBlock.text` | `{text.monoPayload}` | | FR-CMP-005 |

### 7.4.3 `kbd.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `kbd.background` | `{surface.raised}` | | FR-CMP-005 |
| `kbd.border` | `{border.default}` | | FR-CMP-005 |
| `kbd.borderBottom` | `{border.strong}` | | FR-CMP-005 |
| `kbd.text` | `{text.secondary}` | | FR-CMP-005 |

### 7.4.4 `banner.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `banner.info.background` | `{surface.raised}` | | FR-CMP-008, CR-018 |
| `banner.info.border` | `{status.running}` | | FR-CMP-008, FR-A11Y-003 |
| `banner.info.text` | `{text.secondary}` | | FR-A11Y-004 |
| `banner.warning.background` | `{surface.raised}` | | FR-CMP-008, CR-018 |
| `banner.warning.border` | `{status.waiting}` | | FR-CMP-008, FR-A11Y-003 |
| `banner.warning.text` | `{text.secondary}` | | FR-A11Y-004 |
| `banner.danger.background` | `{surface.raised}` | | FR-CMP-008, CR-018 |
| `banner.danger.border` | `{status.danger}` | | FR-CMP-008, FR-A11Y-003 |
| `banner.danger.text` | `{text.secondary}` | | FR-A11Y-004 |

CR-018 이전 구현은 상태 semantic 색을 배경 전체에 적용하고 `text.inverse`를 본문에 사용했다. 상태는 넓은 면적이 아니라 시작 가장자리와 아이콘으로 병기하고, 본문은 공통 중립 표면 위의 `text.secondary`로 고정한다. 다크·라이트 모두 기존 CP-004(`text.secondary/surface.raised`)를 통과하며, 상태색/`surface.raised` 조합도 CP-019~CP-023의 기준을 통과한다. Banner 토큰 키와 React API는 바뀌지 않는다.

### 7.5 `input.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `input.minHeight` | `40px` | | FR-CMP-007 AC-5 |
| `input.minHeightCompact` | `42px` | | FR-CMP-007 AC-5 (`breakpoint.sm` 미만) |
| `input.background` | `{surface.base}` | `{surface.elevated}` | FR-CMP-007 |
| `input.backgroundFocus` | `{surface.canvas}` | `{surface.elevated}` | FR-CMP-007 |
| `input.text` | `{text.primary}` | | FR-A11Y-004 |
| `input.placeholder` | `{text.faint}` | | FR-THM-005 AC-3 |
| `input.border` | `{border.control}` | | FR-THM-005 AC-2 |
| `input.borderHover` | `{border.control}` | | FR-CMP-007 |
| `input.borderFocus` | `{accent}` | | FR-A11Y-001 |
| `input.borderInvalid` | `{status.danger}` | | FR-CMP-007 AC-2 |
| `input.radius` | `{radius.sm}` | | FR-CSS-004 |
| `input.paddingBlock` | `9px` | | FR-CSS-004 |
| `input.paddingInline` | `{space.3}` | | FR-CSS-004 |
| `input.focusRing` | `{focusRing}` | | FR-A11Y-001 AC-1 |
| `input.label.text` | `{text.secondary}` | | FR-CMP-007 AC-1, CR-019 |
| `input.label.fontSize` | `{font.size.base}` | | FR-TOK-007 AC-3 |
| `input.error.text` | `{status.danger}` | | FR-A11Y-003 AC-2 |
| `input.transition` | `{motion.fast}` | | FR-CSS-005 |

**`input.*`는 `TextField`, `TextArea`, `Select`, `Switch`, `Checkbox` 다섯 컴포넌트가 공유하는 토큰군이다.** FR-THM-005 AC-2가 `border.control`의 적용 대상으로 지정한 목록과 정확히 일치한다.

`input.border`는 소스의 `border-default`(다크 1.30:1)가 아니라 신규 `{border.control}`(다크 3.23:1)을 참조한다. 입력 요소는 배경이 주변 표면과 거의 같고 라벨이 요소 바깥에 있으므로, 경계선이 사라지면 입력 영역의 범위를 알 방법이 없다. 이것이 SRS 12.1절의 두 교정 대상 중 하나다.

`input.placeholder`가 `{text.faint}`를 참조하는 것은 소스와 일치하며(`app.css:752-755`), SRS 12.1절이 placeholder를 `text.faint`의 명시적 허용 용도로 나열한다. 필드의 라벨은 placeholder가 아니라 `input.label.text`(`{text.secondary}`, 다크 `surface.base` 위 12.51:1)가 전달한다 — `Field`가 라벨을 `htmlFor`/`id`로 연결하기 때문이다(FR-CMP-007 AC-1). 설명은 별도 `text.muted` 단계에 남겨 라벨과 보조 정보의 위계를 분리한다(CR-019).

`text.faint`의 `surface.elevated` 금지 규칙(5.3절)과 이 참조는 충돌하지 않는다. 그 금지는 다크 측정값 2.94:1에서 나왔고, 다크 `input.background`는 `{surface.base}`다. 라이트에서만 `input.background`가 `{surface.elevated}`를 참조하는데, 라이트 `text.faint`(`#6b788c`)는 흰 배경 위에서 4.48:1이다. 금지 조합이 실제로 렌더되는 경로가 없다.

### 7.5.1 `feedbackMeter.*`

`meter.*`는 FR-TOK-005가 정확히 3개로 고정한 semantic 상태군(`normal`, `warning`, `exceeded`)이다. C-062의 component token은 CR-013에 따라 별도 `feedbackMeter.*` 네임스페이스를 쓴다. 이렇게 하면 의미 색상과 렌더링 슬롯이 같은 최상위 그룹을 공유하지 않는다.

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `feedbackMeter.trackBackground` | `{surface.track}` | | FR-CMP-008 AC-4 |
| `feedbackMeter.fillNormal` | `{meter.normal}` | | FR-CMP-008 AC-4 |
| `feedbackMeter.fillWarning` | `{meter.warning}` | | FR-CMP-008 AC-4 |
| `feedbackMeter.fillExceeded` | `{meter.exceeded}` | | FR-CMP-008 AC-4 |
| `feedbackMeter.height` | `8px` | | FR-CMP-008 AC-4 |

### 7.6 `overlay.*`

| 토큰 키 | 다크 값 | 라이트 값 (다를 때만) | 관련 FR |
| --- | --- | --- | --- |
| `overlay.scrim` | `{surface.overlay}` | | FR-CMP-006 AC-2 |
| `overlay.scrimBlur` | `4px` | | FR-CMP-006 |
| `overlay.scrimZ` | `{z.overlay}` | | FR-CMP-006 AC-4 |
| `overlay.background` | `{surface.glass}` | `{surface.elevated}` | FR-THM-002 예외 처리, 6.5절 |
| `overlay.backgroundBlur` | `16px` | `0px` | 6.5절 |
| `overlay.border` | `{border.strong}` | | FR-THM-005 AC-4 |
| `overlay.radius` | `{radius.lg}` | | FR-CSS-004 |
| `overlay.shadow` | `{elevation.overlay}` | | FR-CMP-006 |
| `overlay.contentZ` | `{z.popover}` | | FR-CMP-006 AC-4 |
| `overlay.drawerZ` | `{z.drawer}` | | FR-CMP-006 AC-4 |
| `overlay.drawerBackground` | `{surface.raised}` | | FR-CMP-006 |
| `overlay.drawerWidth` | `500px` | | FR-CMP-006 |
| `overlay.enter` | `{motion.standard}` | | FR-CSS-005 |
| `overlay.exit` | `{motion.fast}` | | FR-CSS-005 |

`overlay.backgroundBlur`가 라이트에서 `0px`인 이유: 불투명 `{surface.elevated}` 배경 위의 `backdrop-filter`는 시각 효과를 만들지 않으면서 합성 레이어를 강제해 재페인트 비용을 발생시킨다(NFR-001의 테마 전환 100ms 목표). 값을 `0px`로 두면 브라우저가 필터를 건너뛴다.

### 7.7 `page.*` (레이아웃 및 제목)

| 토큰 키 | 값 | 관련 FR |
| --- | --- | --- |
| `page.headingSize` | `clamp(24px, 3vw, 32px)` | FR-TOK-007 AC-4 |
| `page.headingLineHeight` | `1.16` | `app.css:81` |
| `page.stackGap` | `{space.6}` | FR-CSS-003 AC-1 |
| `page.stackGapCompact` | `{space.5}` | `breakpoint.sm` 미만 |
| `page.contentStackGap` | `{space.5}` | FR-CSS-003 AC-1 |
| `page.splitBreakpoint` | `{breakpoint.md}` | FR-CSS-003 AC-2 |
| `page.splitAsideWidth` | `minmax(280px, 340px)` | FR-CSS-003 |
| `page.shellNavWidth` | `272px` | FR-CMP-009 |
| `page.shellNavWidthCompact` | `232px` | `breakpoint.lg` 미만 |
| `page.topbarZ` | `{z.sticky}` | FR-TOK-008 |
| `page.navZ` | `{z.drawer}` | FR-TOK-008 |
| `page.skipLinkZ` | `{z.popover}` | FR-CSS-002 AC-5 |

`page.headingSize`의 `24px`와 `32px`는 리터럴이 아니라 5.9.2절의 파생 수식 결과다: `font.size.xl × 1.2 = 24px`, `font.size.xl × 1.6 = 32px`. 토큰 빌드가 수식을 평가해 리터럴로 산출한다. `clamp()` 인자는 CSS 커스텀 프로퍼티로 남길 수 없다 — 소비자가 `calc()` 없이 재정의하면 무효 값이 되기 때문이다.

`page.headingLineHeight`만 단위 없는 비율이다. `clamp()`로 크기가 변하는 유일한 토큰이므로 px 고정이 불가능하다.

### 7.8 셸 컴포넌트 토큰 (WP-023)

| 토큰 키 | 값 | 관련 컴포넌트 |
| --- | --- | --- |
| `appShell.navWidth` | `{page.shellNavWidth}` | C-070 |
| `appShell.mainMaxWidth` | `1480px` | C-070 |
| `appShell.overlayBackground` | `{surface.overlay}` | C-070 |
| `skipLink.background` | `{accent}` | C-070 |
| `skipLink.text` | `{text.inverse}` | C-070 |
| `navList.background` | `{surface.raised}` | C-071 |
| `navList.border` | `{border.subtle}` | C-071 |
| `navItem.text` | `{text.muted}` | C-071 |
| `navItem.textActive` | `{text.primary}` | C-071 |
| `navItem.backgroundHover` | `{state.hover}` | C-071 |
| `navItem.backgroundActive` | `{state.selected}` | C-071 |
| `navItem.indicator` | `{accent}` | C-071 |
| `navSectionLabel.text` | `{text.faint}` | C-071 |
| `font.weight.sectionLabel` | `700` | C-071 |
| `topBar.background` | `{surface.glass}` | C-072 |
| `topBar.border` | `{border.subtle}` | C-072 |
| `topBar.eyebrowText` | `{text.faint}` | C-072 |
| `topBar.titleText` | `{text.secondary}` | C-072 |
| `topBar.minHeight` | `68px` | C-072 |

---

## 8. 대비율 검사 쌍

### 8.1 `contrast-pairs.ts`의 성격

FR-THM-004 AC-1은 검사 대상 쌍이 `packages/tokens/src/contrast-pairs.ts`에 **명시적으로 선언**될 것을 요구한다. 조합 폭발을 검사하지 않는다 — 실제로 함께 렌더되는 전경/배경 쌍만 선언한다.

각 쌍의 스키마:

```
{ id, foreground, background, usage, themes }
```

- `foreground`, `background`: semantic 또는 component 토큰 키. primitive 키는 허용하지 않는다.
- `usage`: `body`(4.5:1) | `large`(3:1) | `nonText`(3:1). 각 토큰의 `usage`는 SRS 12.1절이 확정했다.
- `themes`: `["dark", "light"]`. 두 테마 각각에 대해 계산한다(FR-THM-004 요구사항).

`usage: "decorative"` 토큰은 쌍으로 선언하지 않는다(FR-THM-004 예외 처리, FR-A11Y-004 AC-3). 제외 대상과 그 사유는 8.4절에 있으며 `pnpm check:contrast --report`로 조회한다.

계산 규칙: WCAG 2.1 상대 휘도 공식. alpha가 있는 색은 `background`와 합성한 뒤 계산한다(AC-4). `focusRing`처럼 그림자 문법을 갖는 토큰은 링이 덮는 픽셀 영역의 focus 전후 색을 비교한다 — focus 전 색은 링이 놓이는 표면이다.

미달 쌍이 1건 이상이면 `pnpm check:contrast`가 종료 코드 1을 반환하고 쌍 이름·테마·측정 대비율·기준값을 출력한다(AC-3).

### 8.2 선언된 쌍과 측정 결과

선언된 쌍 40개 × 2개 테마 = 80건. 모든 수치는 계산된 값이다.

CP-025는 CR-006으로 선언 목록에서 제거되었다. **ID는 재사용하지 않는다** — 번호를 당기면 이전 리포트·테스트 이름·커밋 메시지의 CP 참조가 다른 쌍을 가리키게 된다. 제거된 자리는 표에 흔적으로 남긴다.

| ID | 전경 | 배경 | usage | 기준 | 다크 | 라이트 |
| --- | --- | --- | --- | --- | --- | --- |
| CP-001 | `text.primary` | `surface.base` | body | 4.5 | 18.32 pass | 15.83 pass |
| CP-002 | `text.primary` | `surface.raised` | body | 4.5 | 15.77 pass | 18.27 pass |
| CP-003 | `text.primary` | `surface.elevated` | body | 4.5 | 14.40 pass | 18.77 pass |
| CP-004 | `text.secondary` | `surface.raised` | body | 4.5 | 10.77 pass | 10.00 pass |
| CP-005 | `text.secondary` | `surface.elevated` | body | 4.5 | 9.83 pass | 10.27 pass |
| CP-006 | `text.muted` | `surface.base` | body | 4.5 | 6.06 pass | 5.90 pass |
| CP-007 | `text.muted` | `surface.elevated` | body | 4.5 | 4.76 pass | 6.99 pass |
| CP-008 | `text.monoPayload` | `surface.raised` | body | 4.5 | 13.44 pass | 14.96 pass |
| CP-009 | `accent` | `surface.base` | body | 4.5 | 5.60 pass | 4.67 pass |
| CP-010 | `accent` | `surface.raised` | body | 4.5 | 4.82 pass | 5.39 pass |
| CP-011 | `text.inverse` | `accent` | body | 4.5 | 5.39 pass | 5.16 pass |
| CP-012 | `accent.strong` | `surface.base` | nonText | 3.0 | 4.36 pass | 6.00 pass |
| CP-013 | `focusRing` | `surface.base` | nonText | 3.0 | 3.93 pass | 3.30 pass |
| CP-014 | `focusRing` | `surface.raised` | nonText | 3.0 | 3.56 pass | 3.66 pass |
| CP-015 | `focusRing` | `surface.elevated` | nonText | 3.0 | 3.34 pass | 3.72 pass |
| CP-016 | `border.control` | `surface.base` | nonText | 3.0 | 3.39 pass | 4.01 pass |
| CP-017 | `border.control` | `surface.raised` | nonText | 3.0 | 3.23 pass | 4.63 pass |
| CP-018 | `border.control` | `surface.elevated` | nonText | 3.0 | 3.11 pass | 4.76 pass |
| CP-019 | `status.running` | `surface.raised` | body | 4.5 | 4.82 pass | 5.39 pass |
| CP-020 | `status.waiting` | `surface.raised` | body | 4.5 | 7.89 pass | 4.89 pass |
| CP-021 | `status.success` | `surface.raised` | body | 4.5 | 6.68 pass | 5.34 pass |
| CP-022 | `status.partial` | `surface.raised` | body | 4.5 | 8.84 pass | 4.79 pass |
| CP-023 | `status.danger` | `surface.raised` | body | 4.5 | 4.50 pass | 5.59 pass |
| CP-024 | `status.queued` | `surface.raised` | nonText | 3.0 | 3.56 pass | 6.17 pass |
| ~~CP-025~~ | ~~`status.neutralEnd`~~ | ~~`surface.raised`~~ | — | — | 제거됨 (CR-006) | 제거됨 (CR-006) |
| CP-026 | `meter.normal` | `surface.raised` | body | 4.5 | 8.82 pass | 5.34 pass |
| CP-027 | `meter.warning` | `surface.raised` | body | 4.5 | 10.15 pass | 4.89 pass |
| CP-028 | `meter.exceeded` | `surface.raised` | body | 4.5 | 6.13 pass | 4.70 pass |
| CP-029 | `badge.severity.text` | `severity.read` | body | 4.5 | 4.67 pass | 4.67 pass |
| CP-030 | `badge.severity.text` | `severity.write` | body | 4.5 | 4.82 pass | 4.82 pass |
| CP-031 | `badge.severity.text` | `severity.destructive` | body | 4.5 | 6.02 pass | 6.02 pass |
| CP-032 | `badge.severity.text` | `severity.blocked` | body | 4.5 | 9.32 pass | 9.32 pass |
| CP-033 | `badge.fill.text` | `status.running` | body | 4.5 | 5.39 pass | 5.16 pass |
| CP-034 | `badge.fill.text` | `status.waiting` | body | 4.5 | 8.82 pass | 4.67 pass |
| CP-035 | `badge.fill.text` | `status.success` | body | 4.5 | 7.46 pass | 5.10 pass |
| CP-036 | `badge.fill.text` | `status.partial` | body | 4.5 | 9.87 pass | 4.58 pass |
| CP-037 | `badge.fill.text` | `status.danger` | body | 4.5 | 5.03 pass | 5.34 pass |
| CP-038 | `badge.marker.text` | `badge.marker.background` | body | 4.5 | 15.77 pass | 18.27 pass |
| CP-039 | `badge.marker.dot` (`status.queued`) | `badge.marker.background` | nonText | 3.0 | 3.56 pass | 6.17 pass |
| CP-040 | `text.muted` | `state.disabled` | body | 4.5 | 5.05 pass | 5.67 pass |
| CP-041 | `button.policyDisabled.text` | `state.disabledPolicy` | body | 4.5 | 5.27 pass | 5.81 pass |

라이트 `severity.*` 4쌍(CP-029 ~ CP-032)의 측정값이 다크와 동일하다. 라이트 `badge.severity.text`가 `{text.inverse}`(`#f4f7fb`)이고 다크 `badge.severity.text`가 `{text.primary}`(`#f4f7fb`)로 값이 같으며, 심각도 채움 4색이 두 테마에서 같은 값이기 때문이다. 우연이 아니라 5.8절과 6.2절의 정의가 만나는 지점이다.

`badge.marker.dot`의 `status.neutralEnd` 변형은 그 토큰이 `decorative`이므로 선언하지 않는다(8.4절). `status.queued` 변형만 CP-039로 선언한다.

### 8.3 두 교정 값의 효과

FR-THM-005가 강제한 두 교정이 9건의 미달을 제거했다. `focusRing` 6건(두 테마 × 표면 3종)과 폼 컨트롤 경계 3건(다크 표면 3종)이다. 라이트 `border.default`는 이미 불투명 값이라 교정 전에도 3:1을 넘었으므로 그쪽에서 제거된 미달은 0건이다.

| 쌍 | 교정 전 (소스 값) | 교정 후 | 기준 |
| --- | --- | --- | --- |
| CP-013 `focusRing` / `surface.base` (다크) | 1.50 (alpha 0.30) | **3.93** (alpha 0.80) | 3.0 |
| CP-014 `focusRing` / `surface.raised` (다크) | 1.55 (alpha 0.30) | **3.56** | 3.0 |
| CP-015 `focusRing` / `surface.elevated` (다크) | 1.54 (alpha 0.30) | **3.34** | 3.0 |
| CP-013 ~ CP-015 (라이트) | 1.50 / 1.53 / 1.54 | **3.30 / 3.66 / 3.72** | 3.0 |
| CP-016 ~ CP-018 `border.control` (다크) | 1.30 / 1.37 / 1.38 (`border.default` 사용 시) | **3.39 / 3.23 / 3.11** | 3.0 |
| CP-016 ~ CP-018 `border.control` (라이트) | 4.36 (`border.default` 사용 시) | **4.01 / 4.63 / 4.76** | 3.0 |

라이트에서 `border.default`는 이미 불투명 값이라 3:1을 넘었다. `border.control`을 도입한 실익은 다크에 있다. 그러나 토큰 키는 두 테마에 대칭으로 존재해야 하므로(FR-QA-001 AC-1) 라이트에도 대응 값을 정의했다.

### 8.4 대비 검사에서 제외되는 토큰

`usage: "decorative"` 토큰은 쌍으로 선언되지 않는다. 제외 사유를 토큰 소스 주석에 기록하고 `pnpm check:contrast --report`로 조회한다(FR-A11Y-004 AC-3).

| 토큰 | 다크 측정값 | 제외 사유 |
| --- | --- | --- |
| `surface.*` (9개) | — | 대비 검사의 배경 인자다. 표면 자체는 전경이 아니다 |
| `text.faint` | `surface.base` 3.74 / `surface.elevated` 2.94 | 본문이 아니다. 메타·타임스탬프·대문자 라벨·placeholder 전용이며 `surface.elevated` 위 사용을 `pnpm lint:tokens`가 차단한다 (FR-THM-005 AC-3) |
| `border.subtle` | 1.13 | WCAG 1.4.11 예외. 카드·패널 경계는 표면색 차이와 `elevation.*` 그림자가 이미 식별한다 |
| `border.default` | 1.30 | 위와 같다. 폼 컨트롤에는 `border.control`을 쓴다 |
| `border.strong` | 1.69 | 위와 같다 |
| `status.neutralEnd` | 2.04 ~ 2.60 | WCAG 1.4.11 예외 (CR-006). FR-THM-005 AC-7이 아이콘·텍스트 병기를 강제하므로 색이 상태를 혼자 전달하지 않아 1.4.1을 충족한다. 점의 기하 경계는 채움 대비가 아니라 `.timeline-marker`의 표면색 링(`app.css:585`)이 만든다. `border.*` 예외와 동일 논리다. 8.5절 |
| `accent.soft` | — | 배경 위 미세한 강조 채움. 그 위 텍스트는 언제나 `text.primary`를 쓴다 |
| `accent.glow` | — | 다크 전용 발광. 정보를 혼자 전달하는 경로가 없다 (6.5절) |
| `surface.glass` / `surface.overlay` | — | 반투명 층. 6.5절이 라이트 재정의를 규정한다 |
| `elevation.*` (3개) | — | 그림자. `elevation.overlay`의 1px 링은 `border.strong` 참조이며 함께 제외된다 |
| `state.hover` / `state.selected` | — | 표면을 미세하게 미는 층. 선택 상태는 `aria-pressed`와 텍스트 색이 함께 전달한다 (FR-A11Y-003) |
| `state.disabled` / `state.disabledPolicy` | — | 배경 채움. 그 위 텍스트 쌍 CP-040, CP-041로 검사한다 |
| `font.*` / `space.*` / `radius.*` / `z.*` / `breakpoint.*` / `motion.*` | — | 색이 아니다 |

`accent`는 `body`이지만 `surface.elevated` 위 조합(다크 4.40:1)을 쌍으로 선언하지 않는다. 그 조합의 본문 사용이 금지되어 있기 때문이다(5.5절). 금지 위반은 대비 검사가 아니라 `pnpm lint:tokens`가 검출한다. 같은 이유로 `text.faint`의 `surface.elevated` 조합도 선언하지 않는다.

`severity.*` 4종은 `usage: body`이지만 검사 쌍에서 언제나 배경 인자로만 등장한다(CP-029 ~ CP-032). 전경 사용은 `pnpm lint:tokens`가 차단한다(5.8절).

### 8.5 해소된 결함: CP-025 `status.neutralEnd` (CR-006)

> **결론 먼저.** 2026-07-10 CR-006으로 **해소안 A**가 채택되었다(사용자 결정). `status.neutralEnd`의 값 `#475569`를 보존하고 `usage`를 `nonText` → `decorative`로 낮춘다. CP-025는 선언된 쌍에서 제거되었다. `pnpm check:contrast`는 두 테마에서 종료 코드 0을 반환한다. SRS 12.1절과 FR-THM-005 AC-6이 이 결정을 담고 있다. 아래는 그 결정의 근거로 보존한 측정 기록이다.

**측정 사실.** 다크 `status.neutralEnd`(`#475569`)는 `nonText` 기준 3:1을 표면 6종 어디에서도 만족하지 못한다.

| 표면 | `surface.base` | `surface.canvas` | `surface.timeline` | `surface.subtle` | `surface.raised` | `surface.elevated` |
| --- | --- | --- | --- | --- | --- | --- |
| 대비 | 2.60 | 2.51 | 2.44 | 2.37 | 2.24 | 2.04 |

가장 유리한 조합조차 2.60:1이다. 라이트 `status.neutralEnd`(`#3f4b5f`)는 `surface.raised` 위 8.58:1로 통과하므로, 이 결함은 다크 전용이다.

**모순의 성격.** CR-006 이전의 SRS 12.1절은 `status.neutralEnd`에 `usage: "nonText"`를 부여하면서 값을 보존하도록 지시했다. 두 지시는 동시에 성립하지 않았다. `nonText`는 3:1을 뜻하고, 보존된 값은 2.24:1이었다. 그대로 두면 `pnpm check:contrast`가 다크 테마에서 종료 코드 1을 반환하고, M-3(미달 0건)과 FR-A11Y-004 AC-1이 충족되지 않았을 것이다.

같은 무리의 `status.queued`(`#64748b`)에는 이 문제가 없다. `surface.raised` 위 3.56:1, `surface.elevated` 위 3.25:1로 통과한다. 두 토큰을 함께 `nonText`로 묶은 분류가 한쪽에서만 성립했다. CR-006은 이 묶음을 풀어 `status.queued`만 `nonText`로 남겼다(FR-THM-005 AC-5).

**이 문서가 하지 않은 것.** 값을 임의로 바꾸지 않았고 `usage`를 임의로 낮추지도 않았다. 모순을 보고하고 두 해소안을 제시한 뒤 결정을 기다렸다. 결정은 CR을 통해 내려졌다.

**검토된 두 해소안.** 정확히 하나만 채택 가능했다. `nonText` 분류와 값 보존 중 하나가 물러서야 했다.

- **해소안 A — `usage`를 `decorative`로 낮춘다. ✅ 채택 (CR-006)** 근거: 마커 형태의 점은 아이콘·텍스트와 언제나 병기되므로(FR-THM-005 AC-7이 강제한다) 색이 상태를 혼자 전달하지 않는다. 소스의 `.timeline-marker`는 `border: 2px solid var(--surface-timeline)`로 표면색 링을 둘러 도형의 경계를 만든다(`app.css:585`) — 점의 가시성은 채움 대비가 아니라 이 링이 지지한다. 값 보존 방침(G-1 시각 보존, M-1 시각 회귀 1%)과 정합한다. 대가: 다크 종료 상태의 점이 배경에서 흐리게 읽힌다.
- **해소안 B — 값을 밝게 교정한다. ❌ 기각** `#5d6e86`으로 올리면 `surface.raised` 위 3.26:1로 `nonText`를 통과하고, 배지 마커 배경 위 `text.primary` 대비도 4.84:1로 유지된다. 기각 사유: `status.queued`(`#64748b`)와 명도가 근접해 두 중립 상태의 시각 구분이 좁아지고, `focusRing`·`border.control`에 이어 세 번째 시각 회귀 원인이 된다. OD-001이 확정한 "접근성 결함인 것만 값을 교정한다"는 최소 수정 방침과 충돌한다.

**채택 근거.** FR-THM-005 AC-7이 아이콘·텍스트 병기를 강제하므로 WCAG 1.4.1의 색상 비의존 요건이 충족되고, 1.4.11이 요구하는 "컴포넌트 식별에 필요한 시각 정보"의 역할은 점의 채움이 아니라 표면색 링과 텍스트가 맡는다. 이는 12.1절이 `border.subtle`·`border.default`·`border.strong`에 적용한 예외 근거와 동일한 논리다.

**남는 대가 (알려진 제약).** 다크 테마에서 종료 상태의 점은 배경에서 흐리게 읽힌다(최대 2.60:1). 이 사실은 `conductor_implementation_traceability.md`의 알려진 제약 표에 기록되어 있다. 시인성 불만이 실제로 제기되면 CR을 열어 해소안 B(`#5d6e86`)를 재검토한다.

### 8.6 요약

| 항목 | 다크 미달 | 라이트 미달 | 처리 |
| --- | --- | --- | --- |
| `focusRing` (CP-013 ~ CP-015) | 0건 | 0건 | FR-THM-005 AC-1 교정으로 해소 (alpha 0.30 → 0.80) |
| 폼 컨트롤 경계 (CP-016 ~ CP-018) | 0건 | 0건 | FR-THM-005 AC-2 신규 `border.control`로 해소 |
| `text.faint` | — | — | `decorative` 분류 + `surface.elevated` 금지 (FR-THM-005 AC-3) |
| `border.subtle` / `default` / `strong` | — | — | `decorative` 분류, WCAG 1.4.11 예외 (FR-THM-005 AC-4) |
| `accent` | 0건 | 0건 | `body` 분류 + `surface.elevated` 본문 금지 |
| `status.queued` (CP-024, CP-039) | 0건 | 0건 | `nonText` 분류 유지 + 아이콘·텍스트 병기 (FR-THM-005 AC-5) |
| `status.neutralEnd` (구 CP-025) | 0건 | 0건 | `decorative` 분류 (FR-THM-005 AC-6, CR-006). 선언된 쌍에서 제거. 8.5절 |
| 상태·미터·심각도 나머지 | 0건 | 0건 | `body` 분류로 전부 통과 |
| **합계** | **0건** | **0건** | |

선언된 40개 쌍 × 2개 테마 = 80건이 전부 통과한다. `pnpm check:contrast`는 다크와 라이트 모두에서 종료 코드 0을 반환하며, M-3(미달 0건)과 FR-A11Y-004 AC-1이 충족된다.

대가는 사라지지 않고 위치를 옮겼다. `status.neutralEnd`의 다크 시인성 저하(최대 2.60:1)는 대비 검사가 아니라 **알려진 제약**으로 관리된다(`conductor_implementation_traceability.md` §5). 검사를 통과했다는 사실이 그 점이 잘 보인다는 뜻은 아니다.
---

## 9. 모션 토큰과 감소 모드

### 9.1 모션 토큰

| 토큰 키 | 값 | 용도 |
| --- | --- | --- |
| `motion.fast` | `140ms {ease.entrance}` | 색·배경·경계 전환, hover 반응 |
| `motion.standard` | `240ms {ease.entrance}` | 오버레이 진입, 페이지 진입, 오프캔버스 내비 |
| `motion.bounce` | `300ms {ease.overshoot}` | 토글·스위치의 상태 확정 |

`{ease.entrance}` = `cubic-bezier(0.2, 0, 0, 1)`, `{ease.overshoot}` = `cubic-bezier(0.34, 1.56, 0.64, 1)`. 세 토큰은 지속 시간과 이징을 한 문자열로 묶는다 — 소스가 `transition: all var(--motion-fast)` 형태로 소비하기 때문이다. 테마 무관이다.

### 9.2 감소 모드 (FR-CSS-005)

소스 `tokens.css:88-93`은 `* { transition-duration: 0ms !important; animation-duration: 0ms !important; }`를 쓴다. Conductor는 이 구현을 계승하지 않는다. 이유는 두 가지다.

1. FR-CSS-001 AC-2가 산출물의 `!important` 출현 0건을 요구한다.
2. FR-CSS-005 AC-4가 전역 `*` 셀렉터 대신 Conductor 스코프 셀렉터를 요구하고, 규칙이 `cdt.base` 레이어에 존재할 것을 요구한다.

이 두 제약을 동시에 만족하는 구현은 하나뿐이다. **감소 모드에서 모션 토큰의 값 자체를 0으로 재선언한다.**

```
@layer cdt.base {
  @media (prefers-reduced-motion: reduce) {
    :where([data-cdt-theme]) {
      --cdt-motion-fast: 0ms linear;
      --cdt-motion-standard: 0ms linear;
      --cdt-motion-bounce: 0ms linear;
      scroll-behavior: auto;
    }
  }
}
```

이 구현이 성립하는 근거:

- `cdt.component` 레이어의 규칙들은 `transition: all var(--cdt-motion-fast)` 형태로 커스텀 프로퍼티를 **읽기만** 한다. 값 재선언은 레이어 간 우선순위 경쟁이 아니라 상속 경쟁이며, 루트에서 재선언된 값이 모든 후손 요소에 전달된다. 따라서 `cdt.base`(낮은 레이어)의 선언이 `cdt.component`(높은 레이어)의 소비를 지배한다. `!important`가 필요 없다.
- `:where([data-cdt-theme])`의 명시도는 0이다. 소비자가 자신의 모션 값을 재선언하면 언제나 이긴다.
- `data-cdt-theme`은 문서 루트 요소에 놓이므로(FR-THM-003) `scroll-behavior: auto`가 `html`에 적용되어 AC-3을 만족한다.
- 전환의 최종 시각 결과는 변하지 않는다. 지속 시간만 0이 되므로 hover·focus·selected의 종착 상태가 동일하다(AC-2).
- `transition-duration`과 `animation-duration`의 계산값이 모든 Conductor 요소에서 `0s`가 된다(AC-1). `0ms linear`의 이징 함수는 지속 시간이 0이므로 관측 가능한 효과가 없다.

`data-cdt-theme` 속성이 없는 요소(소비자 자신의 DOM)에는 이 규칙이 적용되지 않는다. 소비자의 모션은 소비자가 소유한다.

### 9.3 감소 모드의 진행 표시

`Spinner`와 `ProgressRing`은 감소 모드에서 애니메이션 대신 정적 진행률 텍스트를 노출한다(FR-CSS-005 예외 처리, FR-CMP-008 AC-5). 이는 토큰이 아니라 컴포넌트 동작이며, `@media (prefers-reduced-motion: reduce)` 조건 아래에서 `.cdt-spinner__label`의 `display`를 전환해 구현한다. 지속 시간을 0으로 만드는 것만으로는 무한 회전이 정지 상태로 남아 진행 여부를 전달하지 못하기 때문이다.

---

## 10. 금지 사항

아래 항목은 `pnpm lint:tokens`, `pnpm build`, `pnpm check:contrast` 중 하나 이상이 종료 코드 1로 차단한다.

### 10.1 ad hoc 값

- `packages/css`와 `packages/react`의 CSS·TS 파일에 색상 리터럴(`#rrggbb`, `rgb()`, `rgba()`, `hsl()`)을 쓰지 않는다. 위반 0건이 FR-TOK-001 AC-1의 수용 기준이다.
- 간격·반경·모션 값을 리터럴 px/ms로 쓰지 않는다(FR-TOK-001 AC-2). 예외는 토큰 소스 자체와 브레이크포인트 치환 결과다.
- `font-size`의 px 리터럴 0건(FR-TOK-007 AC-3). `z-index`의 숫자 리터럴 0건(FR-TOK-008 AC-2).
- 스케일 밖 값이 필요하면 CR을 열어 스케일을 확장한다. 컴포넌트가 임의 크기를 선언하면 검사가 실패한다.
- 불가피한 리터럴은 파일 상단에 `/* cdt-allow-literal: <사유> */` 주석을 요구하며, 허용 목록은 `pnpm lint:tokens --report`로 조회한다(FR-TOK-001 예외 처리).

### 10.2 primitive 직접 참조

- component 토큰이 primitive를 참조하면 빌드가 실패하고 위반 토큰 키 쌍을 출력한다(FR-TOK-002 AC-3, AC-4). component는 semantic만 참조한다.
- primitive 토큰은 CSS로 산출되지 않는다(FR-TOK-004 AC-4). `var(--cdt-ink-900)`은 존재하지 않는 프로퍼티다.
- primitive 토큰은 `@conductor-by-89soone/tokens`의 공개 진입점으로 export되지 않는다(FR-TOK-002 AC-5). 소비자가 `ink.900`에 도달하는 경로가 없다.
- semantic 토큰이 다른 semantic 토큰을 참조하는 것은 허용된다(`surface.2` → `surface.subtle`, `status.running` → `accent`). 이는 같은 계층 내부의 참조이며 방향 위반이 아니다. 단, 순환 참조는 빌드 오류다(FR-TOK-003 AC-3).

### 10.3 테마 이름을 담은 토큰

- `--cdt-dark-surface`, `--cdt-light-border`, `tokens.dark.accent` 같은 이름을 만들지 않는다(용어집 3절 8항). 테마는 값을 교체하는 층이지 키를 분기하는 층이 아니다.
- 다크·라이트 semantic 키 집합의 대칭 차집합은 공집합이다(FR-THM-002 AC-1, FR-QA-001 AC-1). 한 테마에만 존재하는 키는 계약 테스트가 검출한다.
- 한 테마에만 존재하는 component 토큰도 같은 검사를 받는다(FR-QA-001 AC-2). 7절의 라이트 재정의는 **값의 재정의**이며 키의 추가가 아니다.
- 정당한 테마 전용 토큰이 필요하면 `themeSpecific: true` 메타데이터를 부여하고 리포트에 노출한다. 이 문서가 정의한 토큰 중 `themeSpecific`을 쓰는 것은 0개다.

### 10.4 컴포넌트 코드의 테마 분기

- React 컴포넌트가 현재 테마를 읽어 스타일을 분기하지 않는다. 컴포넌트는 언제나 `--cdt-*`를 읽고, 값의 교체는 팔레트가 수행한다(FR-THM-003 AC-4: 테마 전환 시 커스텀 프로퍼티 값만 바뀌며 컴포넌트가 재마운트되지 않는다).
- 라이트에서 판독 불가한 다크 전용 시각 장치(`surface.glass`, `accent.glow`)는 **라이트 팔레트가 component 토큰의 값을 재정의**해 해결한다. 컴포넌트 코드는 수정하지 않는다(FR-THM-002 예외 처리). 6.5절과 7.2절, 7.6절이 이 방식을 따른다.

### 10.5 대비 검사 우회

- `usage: "decorative"` 부여는 검사 제외이지 면제가 아니다. 제외 사유를 토큰 소스 주석에 기록하고 `pnpm check:contrast --report`로 조회 가능하게 한다(FR-THM-004 예외 처리, FR-A11Y-004 AC-3).
- `usage` 값은 SRS 12.1절이 확정했다. 미달 쌍을 없애려고 토큰의 `usage`를 낮추는 행위는 CR 없이 수행할 수 없다. `status.neutralEnd`의 강등도 CR-006을 거쳤다(8.5절). 현재 미해소 항목은 없다.
- 소스에서 계승한 값을 근사해 통과시키지 않는다. 다크 팔레트의 교정 대상은 `focusRing`과 `border.control` 둘뿐이다(FR-THM-005). 다른 값을 바꾸려면 측정값·대체값·시각 회귀 영향을 CR에 기재한다(FR-THM-001 예외 처리, SCN-002).
- 라이트 팔레트 값은 이 문서가 파생한 값이므로, 6절의 파생 규칙이 요구하는 기준을 만족하도록 재산출할 수 있다. 재산출 시 규칙과 측정값을 함께 기록한다(6.6절 `status.danger`, `meter.normal`, `meter.warning`).

---

## 11. 추적성

| 이 문서의 절 | 근거 요구사항 |
| --- | --- |
| 1 | FR-THM-001 출처, SRS 5.1 가정 4 |
| 2 | FR-TOK-002, FR-TOK-003 |
| 3 | FR-TOK-004, 용어집 3절 |
| 4 | FR-TOK-002 AC-1/AC-5, FR-TOK-004 AC-4 |
| 5 | FR-THM-001, FR-THM-005, FR-TOK-005, FR-TOK-007, FR-TOK-008, FR-TOK-009 |
| 6 | FR-THM-002, FR-THM-005, FR-QA-001 |
| 7 | FR-TOK-002 AC-3, FR-THM-005 AC-2/AC-5/AC-6/AC-7, FR-CMP-002 ~ FR-CMP-008 |
| 8 | FR-THM-004, FR-THM-005, FR-A11Y-004, M-3, SRS 12.1절, CR-006 |
| 9 | FR-CSS-005, FR-CSS-001 AC-2 |
| 10 | FR-TOK-001, FR-TOK-002, FR-QA-001, FR-THM-003, FR-THM-005 |

FR-THM-005는 OD-001(2026-07-10 종결, CR-005)이 낳은 요구사항이고, 그 AC-5·AC-6·AC-7은 CR-006(2026-07-10 종결)이 재구성한 것이다. 이 문서에서 그 요구사항이 실현되는 지점은 5.3절(`text.faint` 분류, AC-3), 5.4절(경계 분류와 `border.control` 신설, AC-2·AC-4), 5.5절(`accent` 분류), 5.6절(상태 분류, AC-5·AC-6), 5.7절(미터 분류), 5.8절(심각도 배경 전용), 5.11절(`focusRing` 교정, AC-1), 6.3절과 6.3.1절(라이트 대응 값), 7.3절(마커 형태 배지, AC-7), 7.5절(폼 컨트롤 경계, AC-2), 8절(검사 쌍) 열한 곳이다.

CR-006은 `status.neutralEnd`의 `usage`를 `nonText`에서 `decorative`로 낮췄다(FR-THM-005 AC-6). 값 `#475569`는 보존된다. 이 문서에 남은 흔적은 5.6절의 분류 표, 7.3절의 마커 형태, 8.2절의 제거된 CP-025 행, 8.4절의 제외 사유, 8.5절의 결정 기록, 그리고 8.5절 말미의 알려진 제약이다.

이 문서는 `W-010`(색상), `W-011`(타이포그래피), `W-012`(간격/레이아웃), `W-013`(반경/고도), `W-014`(모션), `W-030`(토큰 참조 페이지)의 값 근거다. 문서 사이트는 이 문서가 아니라 `@conductor-by-89soone/tokens/tokens.json`을 읽어 렌더한다(FR-DOC-002 AC-1). 두 산출물이 어긋나면 토큰 소스가 옳고 이 문서를 고친다.
