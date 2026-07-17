# Conductor Design System 프론트엔드 아키텍처

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-17

## 1. 목적과 두 개의 프론트엔드

이 문서는 Conductor의 프론트엔드 구조를 정의한다. Conductor에는 성격이 다른 프론트엔드가 두 개 있고, 둘을 분리해서 다룬다.

| 구분 | (a) 컴포넌트 라이브러리 | (b) 문서 사이트 |
| --- | --- | --- |
| 산출물 | npm 패키지 `@conductor-by-89soone/react` | `apps/docs`의 정적 HTML/JS/CSS |
| 실행 위치 | 소비자 애플리케이션 안 | 정적 호스트 |
| 상태 소유 | 소유하지 않는다. 소비자가 소유한다 | 소유한다(테마, 필터, 복사 상태) |
| 라우팅 | 없다. 라우팅 라이브러리 의존 0건 | React Router 7.x |
| 데이터 출처 | 없다. props가 유일한 입력 | 빌드 산출 JSON |
| 관련 요구사항 | FR-CMP-001 ~ 009, FR-DX-002 ~ 004 | FR-DOC-001 ~ 007 |

문서 사이트는 라이브러리의 첫 번째 소비자이며(FR-DOC-001 AC-1), 소스 상대경로가 아니라 workspace 설치로 패키지를 사용한다. 두 프론트엔드의 관계는 라이브러리 → 문서 사이트 단방향이다.

---

# Part A. 컴포넌트 라이브러리 `@conductor-by-89soone/react`

## 2. 기술 스택

| 항목 | 결정 | 근거 | ADR |
| --- | --- | --- | --- |
| 언어 | TypeScript 5.x, `strict: true` | 공개 API `any` 0건 (FR-DX-002 AC-2, NFR-004) | ADR-008 |
| React | peer `^18.0.0 \|\| ^19.0.0` | NFR-005, SRS 10절 | — |
| 스타일 | Vanilla CSS + CSS 커스텀 프로퍼티. `@conductor-by-89soone/css`가 별도 배포 | FR-CSS-001 ~ 005 | ADR-002 |
| 접근성 동작 | `@radix-ui/react-*` 1.x, 정확 버전 고정 | FR-CMP-006 AC-5, R-3 | ADR-004 |
| 아이콘 | `lucide-react` peer dependency | SRS 10절 | ADR-004 |
| 번들러 | tsup 8.x → ESM + CJS + `.d.ts` | FR-DX-002, FR-DX-003 | ADR-008 |
| 런타임 의존성 | 0개 | `Button` gzip 4KB 이하 (M-7, NFR-001) | ADR-008 |

클래스 병합은 외부 패키지 없이 내부 `cx(...)` 헬퍼로 처리한다. `clsx`를 의존성으로 두면 `Button` 단독 import에 무조건 실린다.

## 3. 컴포넌트 소유권

| ID | 컴포넌트 | 렌더 요소 | Radix 결합 | FR |
| --- | --- | --- | --- | --- |
| C-001 | Button | `button` | 없음 | FR-CMP-002 |
| C-002 | IconButton | `button` | 없음 | FR-CMP-002 |
| C-010 | Card | `div` / `button` / `a` | 없음 | FR-CMP-003 |
| C-011 | CardGrid | `div` | 없음 | FR-CMP-003 |
| C-012 | Panel | `section` | 없음 | FR-CMP-003 |
| C-020 | Badge | `span` | 없음 | FR-CMP-004 |
| C-021 | StatusBadge | `span` | 없음 | FR-CMP-004 |
| C-022 | SeverityTag | `span` | 없음 | FR-CMP-004 |
| C-030 | Table | `div` > `table` | 없음 | FR-CMP-005 |
| C-031 | Timeline | `ol` > `li` > `button`/`div` | 없음 | FR-CMP-005 |
| C-032 | CodeBlock | `pre` > `code` | 없음 | FR-CMP-005 |
| C-033 | Kbd | `kbd` | 없음 | FR-CMP-005 |
| C-040 | Dialog | Radix 소유 | `@radix-ui/react-dialog` | FR-CMP-006 |
| C-041 | Drawer | Radix 소유 | `@radix-ui/react-dialog` (측면 고정 변형) | FR-CMP-006 |
| C-042 | Tooltip | Radix 소유 | `@radix-ui/react-tooltip` | FR-CMP-006 |
| C-043 | DropdownMenu | Radix 소유 | `@radix-ui/react-dropdown-menu` | FR-CMP-006 |
| C-050 | Field | `div` > `label` | 없음 | FR-CMP-007 |
| C-051 | TextField | `input` | 없음 | FR-CMP-007 |
| C-052 | TextArea | `textarea` | 없음 | FR-CMP-007 |
| C-053 | Select | Radix 소유 | `@radix-ui/react-select` | FR-CMP-007 |
| C-054 | Switch | Radix 소유 | `@radix-ui/react-switch` | FR-CMP-007 |
| C-055 | Checkbox | Radix 소유 | `@radix-ui/react-checkbox` | FR-CMP-007 |
| C-060 | Banner | `div[role=alert\|status]` | 없음 | FR-CMP-008 |
| C-061 | EmptyState | `div` | 없음 | FR-CMP-008 |
| C-062 | Meter | `div[role=meter]` | 없음 | FR-CMP-008 |
| C-063 | ProgressRing | `div` > `svg` | 없음 | FR-CMP-008 |
| C-064 | Spinner | `span` | 없음 | FR-CMP-008 |
| C-070 | AppShell | `div` > `header`/`nav`/`main` | 없음 | FR-CMP-009 |
| C-071 | NavList | `nav` > `ul` | 없음 | FR-CMP-009 |
| C-072 | TopBar | `header` | 없음 | FR-CMP-009 |

Radix에 Drawer 프리미티브가 없으므로 C-041은 `@radix-ui/react-dialog` 위에 측면 고정 콘텐츠 변형으로 구현한다. 포커스 트랩, Escape 닫기, 배경 스크롤 잠금, 트리거 포커스 복귀가 Dialog와 동일한 코드 경로에서 나오므로 FR-CMP-006 AC-1·AC-2가 두 컴포넌트에서 같은 근거로 성립한다. `Dialog`와 `Drawer`의 선택 기준은 W-040이 문서화한다(FR-DOC-007 AC-4).

C-050 `Field`는 Radix Label을 쓰지 않고 네이티브 `label[for]`로 연결한다. 의존성 하나를 줄이면서 FR-CMP-007 AC-1을 만족한다.

## 4. props 계약 (API-CMP-001)

FR-CMP-001이 요구하는 네 가지를 모든 공개 컴포넌트가 지킨다.

```ts
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  tone?: Tone;
  size?: Size;
  loading?: boolean;
};
// forwardRef<HTMLButtonElement, ButtonProps>
```

| 계약 | 구현 | AC |
| --- | --- | --- |
| ref 전달 | 모든 컴포넌트가 `forwardRef`로 최상위 DOM 노드를 노출 | FR-CMP-001 AC-1 |
| `className` 병합 | 내부 `cx(base, variants, props.className)` | AC-2 |
| `data-*` / `aria-*` 통과 | 나머지 props를 최상위 노드에 스프레드 | AC-3 |
| 네이티브 props 확장 | `React.ComponentPropsWithoutRef<T>` 교차 타입 | AC-4 |
| 전수 검증 | `contract.test.tsx`가 공개 export를 순회하며 위 4개를 검사 | AC-5 |

공유 계약 스위트는 `@conductor-by-89soone/react`의 공개 export 객체를 런타임에 순회한다. 계약을 만족하지 못하는 컴포넌트는 export하지 않으며, 스위트 실패는 빌드 실패다(FR-CMP-001 예외 처리).

Radix가 소유하는 컴포넌트(C-040 ~ C-043, C-053 ~ C-055)에서는 Radix가 부여한 `role`과 `aria-*`를 Conductor가 덮어쓰지 않는다(FR-A11Y-005 AC-4). 스프레드 순서를 `{...radixProps} {...userProps}`가 아니라 `{...userProps} {...radixProps}`로 두어 사용자 props가 접근성 속성을 이길 수 없게 한다. 다만 `className`과 `style`은 명시적으로 병합한다.

`IconButton`의 `aria-label`은 선택이 아니라 필수다. `Omit<ButtonProps, "aria-label"> & { "aria-label": string }`으로 타입을 좁혀 누락 시 컴파일 오류가 나게 한다(FR-CMP-002 AC-3).

`StatusBadge`의 `status`는 FR-TOK-005의 7개 리터럴 유니언, `SeverityTag`의 `severity`는 4개 리터럴 유니언이다. 유니언은 `tokens.json`에서 생성하지 않고 `@conductor-by-89soone/tokens`가 export하는 타입에서 파생하므로, 토큰 소스에 상태가 추가되면 타입이 자동으로 넓어진다(FR-CMP-004 AC-3).

### 4.1 개발 빌드 전용 경고

SRS는 여섯 곳에서 개발 빌드 콘솔 경고를 요구한다: 토큰 미주입(SCN-001), 대화형 `Card` 내부의 중첩 대화형 요소(FR-CMP-003), 이름 없는 `Table`(FR-CMP-005 AC-5), 라벨 없는 `TextField`(FR-CMP-007 AC-3), 액션 없는 `Banner tone="danger"`(FR-CMP-008 AC-2), 설명 없는 토큰(FR-DOC-002 예외 처리, 빌드 시점).

이 경고들은 `process.env.NODE_ENV !== "production"` 가드 안에서만 실행되고, DOM 검사가 필요한 경우 `useEffect` 안에서 수행한다. 모듈 최상위에서 `window`/`document`에 접근하지 않는다(FR-DX-004 AC-2). 경고 코드는 프로덕션 번들에서 제거되므로 `Button`의 4KB 예산에 실리지 않는다.

## 5. 상태 소유권과 결합 지점

라이브러리는 애플리케이션 상태를 소유하지 않는다.

| 상태 종류 | 소유자 | 라이브러리가 제공하는 것 |
| --- | --- | --- |
| 폼 값, 유효성 | 소비자 (react-hook-form 등) | `aria-invalid`, `aria-describedby` 연결과 오류 표시 계층 (FR-CMP-007 예외 처리) |
| 테이블 정렬, 페이지네이션, 가상 스크롤 | 소비자 | 시각 계층과 가로 스크롤 컨테이너만 (FR-CMP-005 예외 처리) |
| 오버레이 열림/닫힘 | 소비자 또는 Radix 비제어 모드 | `open` / `onOpenChange` / `defaultOpen` 통과 |
| 알림 큐, 토스트 | 소비자 | 없음. 토스트를 제공하지 않는다 (FR-CMP-008 예외 처리) |
| 라우팅, 현재 경로 | 소비자 | `NavList`의 `renderLink` 위임 (FR-CMP-009 AC-1) |
| 테마 | 소비자 (DOM 속성) | 없음. 라이브러리에 테마 코드가 존재하지 않는다 |
| 국제화 문자열 | 소비자 | 없음. 문자열은 props로 받는다 |

내부 상태를 갖는 컴포넌트는 세 개뿐이다. `Button`의 `loading`은 props로 받고, `Card`의 hover는 CSS가 처리하며, 실제 `useState`는 `Timeline`의 비제어 선택, `CodeBlock`의 스크롤 그림자, `Meter`의 임계 계산 캐시에만 존재한다. 셋 다 제어 모드 props를 함께 노출한다.

`NavList`가 `renderLink: (props: NavLinkRenderProps) => ReactNode`로 링크 렌더를 위임하므로 `@conductor-by-89soone/react`의 `dependencies`에 라우팅 라이브러리가 0건이다(FR-CMP-009 AC-2). 이 API가 성립하지 않으면 FR-CMP-009는 `deprecated`가 되고 셸은 문서 사이트 내부 컴포넌트로 강등된다(OD-004).

## 6. SSR 안전성 (FR-DX-004)

| 규칙 | 강제 방법 |
| --- | --- |
| 모듈 최상위에서 `window`, `document`, `localStorage` 접근 금지 | `@conductor-by-89soone/react` 전체를 Node 환경에서 import하는 테스트. 접근 시 즉시 예외 |
| 브라우저 전역 접근은 `useEffect` 또는 이벤트 핸들러 안에서만 | ESLint `no-restricted-globals` + 코드 리뷰 |
| 서버/클라이언트 첫 렌더 일치 | 공개 컴포넌트 전수를 `renderToString`으로 렌더하는 테스트(AC-1). `apps/docs` 프리렌더가 동일 코드를 두 번째로 검증 |
| ID 생성 | `Math.random()`이나 증가 카운터 대신 React `useId`. `Field`의 label/description/error 연결 ID가 서버와 클라이언트에서 일치한다 |

`@conductor-by-89soone/react`의 엔트리 상단에 `"use client"` 배너를 tsup으로 삽입한다. 모든 공개 컴포넌트가 훅 또는 이벤트 핸들러를 갖거나 그런 컴포넌트를 합성하므로 패키지 전체가 클라이언트 경계다. 배너를 넣지 않으면 React Server Components 소비자가 매 import마다 래퍼를 만들어야 한다. `"use client"`는 SSR을 막지 않으므로 FR-DX-004 AC-1과 충돌하지 않는다.

테마 결정처럼 첫 페인트 이전에 브라우저 정보가 필요한 경우, 패키지가 전역에 접근하는 대신 소비자가 `@conductor-by-89soone/css/theme-init.js`의 스니펫을 인라인한다(FR-THM-003 예외 처리).

## 7. 트리셰이킹과 번들 예산 (FR-DX-003)

| 수단 | 내용 |
| --- | --- |
| `sideEffects: false` | 패키지 전역 선언. CSS는 별도 패키지이므로 이 선언이 안전하다 |
| 배럴 파일 | `src/index.ts`는 재수출만 한다. 부수효과 있는 초기화 코드를 두지 않는다 |
| ESM 우선 | `exports.import`가 ESM, `exports.require`가 CJS. 번들러는 ESM을 골라 정적 분석한다 |
| 런타임 의존성 0개 | `cx`는 내부 구현. 아이콘은 peer |
| 하위 경로 import 차단 | `exports`에 `.`만 선언. `@conductor-by-89soone/react/src/Button`은 해석 오류다(AC-1) |
| 예산 검사 | size-limit 11.x가 `import { Button } from "@conductor-by-89soone/react"`를 React를 external로 두고 번들해 gzip 4KB를 검사한다(JOB-CI-004). 초과 시 CI가 초과 모듈 목록을 출력한다 |

`StatusBadge`와 `SeverityTag`는 상태·심각도별 기본 아이콘을 `lucide-react`에서 이름으로 import한다. peer dependency이므로 Conductor 번들에 아이콘이 실리지 않고, 소비자 번들러가 사용된 아이콘만 남긴다. `icon` props로 아이콘 컴포넌트를 주입하면 기본값을 대체한다(SRS 10절의 "아이콘 컴포넌트를 props로 주입받는다"). `Button`은 아이콘을 import하지 않으므로 M-7의 4KB 예산이 이 결정에 영향받지 않는다.

## 8. CSS 전달 방식과 테마 주입

`@conductor-by-89soone/react`는 CSS를 import하지 않고 번들하지도 않는다. 컴포넌트는 `cdt-` 클래스 이름만 출력한다. 이 분리가 세 가지를 동시에 성립시킨다: 비-React 소비자가 같은 클래스를 직접 쓸 수 있고(FR-CSS-004 AC-3), `sideEffects: false`가 참이 되며, 소비자가 리셋을 제외한 부분 진입점을 고를 수 있다(FR-CSS-002 예외 처리).

Radix가 소유하는 DOM에는 구조 셀렉터를 쓰지 않고 `data-state`, `data-side`, `data-disabled` 같은 속성 셀렉터만 사용한다(R-3, FR-CSS-004 AC-4). Radix가 인라인으로 주입하는 `--radix-*` 커스텀 프로퍼티는 `@layer` 대상이 아니며, 이 예외는 W-002에 문서화된다(FR-CSS-001 예외 처리).

테마 주입은 라이브러리 밖에서 일어난다. 루트 요소의 `data-cdt-theme` 속성이 팔레트를 고르고, 컴포넌트는 `var(--cdt-*)`를 참조할 뿐이다. 테마 전환은 커스텀 프로퍼티 값 교체이므로 컴포넌트가 재마운트되지 않는다(FR-THM-003 AC-4). React 컨텍스트로 테마를 배포하지 않는 이유가 여기에 있다.

## 9. 라이브러리 테스트 전략

| 계층 | 도구 | 대상 | 관련 요구사항 |
| --- | --- | --- | --- |
| 단위·상호작용 | Vitest 3.x + Testing Library 16.x + jsdom | 렌더, props, 키보드 상호작용 | FR-QA-002 |
| 공통 계약 | 공유 스위트가 공개 export 전수 순회 | ref, className, 속성 통과, 타입 확장 | FR-CMP-001 AC-5 |
| SSR | Node 환경 `renderToString` | 예외 0건, hydration 경고 0건 | FR-DX-004 AC-1, AC-3 |
| 접근성 | Vitest 브라우저 모드(Playwright chromium) + axe-core 4.x | 컴포넌트 × 상태 × 테마 2종 | FR-QA-003, JOB-CI-002 |
| 시각 회귀 | Playwright 1.4x 스냅샷, 고정 컨테이너 이미지 | 기준 12개 × 테마 2종 = 24 스냅샷 | FR-QA-004, JOB-CI-003 |
| 토큰 계약 | Vitest | 두 테마 semantic 키 대칭 | FR-QA-001 |
| 타입 | `tsc --noEmit` + api-extractor 7.x | `any` 0건, 내부 타입 누출 0건 | FR-DX-002 |

접근성 검사를 jsdom이 아니라 실제 브라우저에서 실행하는 이유는 axe-core의 `color-contrast` 규칙이 레이아웃과 계산된 색을 요구하기 때문이다. jsdom에서 실행하면 이 규칙을 예외 처리해야 하고, 그 예외는 FR-QA-003 AC-4의 허용 목록에 남는다. 브라우저 모드는 Playwright를 이미 시각 회귀에 쓰므로 새 의존성을 추가하지 않는다.

테스트 이름은 `FR-<AREA>-<번호> AC-<번호>: <설명>` 형식을 포함한다(FR-QA-002 AC-2). 공개 export에 대응 테스트 파일이 없으면 빌드 전 검사가 컴포넌트 이름을 출력하고 실패한다(AC-1).

---

# Part B. 문서 사이트 `apps/docs`

## 10. 기술 스택과 렌더링 모드

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 빌드 | Vite 6 또는 7 | ADR-007 |
| 라우팅 | React Router 7.x 프레임워크 모드, `ssr: false` + `prerender` | 정적 산출, 서버 런타임 없음 (FR-DOC-001 AC-3) |
| 렌더링 | 빌드 시 라우트별 정적 HTML 프리렌더 → 브라우저에서 hydration | NFR-001 LCP 예산, FR-DX-004 검증 |
| 콘텐츠 | TSX. MDX 툴체인을 도입하지 않는다 | 프리뷰가 실제 컴포넌트를 마운트해야 한다(FR-DOC-003 AC-1) |
| Conductor 소비 | `workspace:*` 프로토콜로 세 패키지 설치 | FR-DOC-001 AC-1 |
| 폰트 | 시스템 폰트 스택. 원격 폰트 0건 | NFR-002, FR-CSS-002 AC-4 |

프리렌더는 세 가지를 동시에 얻는다. 첫째, 서버 런타임 없이 라우트마다 완성된 HTML이 나온다(FR-DOC-001 AC-3). 둘째, 첫 페인트가 JS 실행을 기다리지 않으므로 LCP p75 2.5초 예산에 여유가 생긴다(NFR-001). 셋째, 모든 공개 컴포넌트가 Node 환경에서 렌더되므로 FR-DX-004 AC-1의 SSR 안전성이 매 빌드마다 반증된다. `@conductor-by-89soone/react`에 브라우저 전역 접근이 새로 들어오면 문서 사이트 빌드가 깨진다.

Storybook을 쓰지 않는 이유는 ADR-007에 기록한다. 요약하면 FR-DOC-002(토큰 산출물에서 생성하는 Foundations), FR-DOC-004(테마별 값과 대비율 표), FR-DOC-007(권장/금지 예 병치)이 컴포넌트 카탈로그가 아니라 데이터 기반 문서 화면이며, Storybook 위에서는 이 화면들이 애드온 또는 별도 사이트가 된다.

## 11. 라우트 트리와 화면 매핑 (API-DOC-001)

| 경로 | 화면 ID | 직접 검증하는 FR | 데이터 출처 |
| --- | --- | --- | --- |
| `/` | W-001 | FR-DOC-001, FR-DOC-005, FR-THM-003, FR-CMP-009 | 없음(저작 TSX) |
| `/getting-started` | W-002 | FR-CSS-001, FR-DX-001, FR-DX-003, FR-DX-004 | 저작 TSX + `theme-init.js` 원문 |
| `/foundations/color` | W-010 | FR-TOK-002, FR-TOK-005, FR-THM-001, FR-THM-002, FR-DOC-002 | `tokens.json` |
| `/foundations/typography` | W-011 | FR-TOK-007, FR-DOC-002 | `tokens.json` |
| `/foundations/spacing` | W-012 | FR-TOK-009, FR-CSS-003, FR-DOC-002 | `tokens.json` + `breakpoints` |
| `/foundations/elevation` | W-013 | FR-DOC-002 | `tokens.json` |
| `/foundations/motion` | W-014 | FR-CSS-005, FR-DOC-002 | `tokens.json` |
| `/components` | W-020 | FR-CSS-004, FR-CMP-002 ~ 008, FR-DOC-003 | 컴포넌트 레지스트리 |
| `/components/:componentId` | W-021 | FR-CMP-001 ~ 009, FR-CSS-004, FR-DOC-003, FR-DOC-006, FR-DX-002 | 레지스트리 + `props.generated.json` + 예제 소스 원문 |
| `/tokens` | W-030 | FR-TOK-004, FR-TOK-008, FR-THM-001 ~ 004, FR-DOC-004, FR-DOC-005, FR-A11Y-004, FR-QA-001 | `tokens.json` + `contrast-report.json` |
| `/patterns` | W-040 | FR-TOK-005, FR-CMP-004, FR-DOC-007, FR-A11Y-003 | 저작 TSX |
| `/accessibility` | W-050 | FR-THM-004, FR-A11Y-001 ~ 005, FR-QA-002 ~ 004 | `contrast-report.json` + axe 허용 목록 파일 |

`/components/:componentId`는 동적 세그먼트이지만 정적으로 프리렌더된다. `prerender` 함수가 컴포넌트 레지스트리의 `componentId` 목록을 읽어 경로를 나열하므로, 배포 산출물에는 컴포넌트 수만큼의 HTML 파일이 존재한다. 레지스트리에 없는 `componentId`는 404 라우트로 떨어진다.

모든 화면은 `AppShell`(C-070), `NavList`(C-071), `TopBar`(C-072)로 구성된 셸 안에서 렌더된다(FR-DOC-001 AC-2). OD-004가 셸을 문서 사이트 내부 컴포넌트로 강등하기로 결정하면, 이 세 컴포넌트의 소스 위치가 `packages/react/src`에서 `apps/docs/src/shell`로 옮겨질 뿐 라우트 구조는 바뀌지 않는다.

## 12. 데이터 소스와 생성 파이프라인

문서 사이트에는 서버 상태가 없다. 모든 데이터는 빌드 시점에 확정된 읽기 전용 JSON이다.

| 데이터 | 생산자 | 소비 화면 | 요구사항 |
| --- | --- | --- | --- |
| `tokens.json` | JOB-BUILD-001 `buildTokens` | W-010 ~ W-014, W-030 | FR-TOK-006 AC-3, FR-DOC-002 AC-1 |
| `contrast-report.json` | JOB-CI-001 `checkContrast --report --json` | W-030, W-050 | FR-DOC-004 AC-3, FR-A11Y-004 AC-3 |
| `props.generated.json` | react-docgen-typescript 2.x가 `@conductor-by-89soone/react`의 `.d.ts`를 읽어 생성 | W-021 | FR-DOC-003 AC-2, FR-DX-002 |
| 컴포넌트 레지스트리 | `apps/docs/src/registry.ts` (C-### ↔ 컴포넌트 ↔ FR ID ↔ 예제 모듈) | W-020, W-021 | ENT-CMP-001 |
| 예제 소스 원문 | Vite `?raw` import로 예제 모듈의 텍스트를 그대로 읽는다 | W-021 | FR-DOC-006 |
| axe 허용 목록 | `axe-allowlist.json` (규칙 ID + 사유) | W-050 | FR-QA-003 AC-4, FR-A11Y-005 예외 처리 |

Foundations 화면에는 토큰 값 하드코딩이 0건이다(FR-DOC-002 AC-1). 각 행은 `tokens.json`의 키, 계층, 현재 테마 값, `description` 필드를 렌더한다. `description`이 비어 있으면 화면에 `설명 없음`을 표시하고 `buildTokens`가 경고를 출력한다(FR-DOC-002 예외 처리).

W-021의 props 표는 손으로 쓰지 않는다. 수동 작성 행이 0건임은 `props.generated.json` 밖의 props 데이터를 화면이 참조하지 않는다는 사실로 성립한다(FR-DOC-003 AC-2).

FR-DOC-003 AC-5의 "공개 export이면서 카탈로그 화면이 없는 컴포넌트 0건"은 빌드 시 검사한다. `Object.keys(await import("@conductor-by-89soone/react"))`와 레지스트리 키 집합의 대칭 차집합이 비어 있지 않으면 JOB-BUILD-004가 종료 코드 1로 실패한다.

## 13. 라이브 프리뷰 구현

프리뷰는 스크린샷 이미지가 아니라 실제로 마운트된 컴포넌트다(FR-DOC-003 AC-1). 런타임 코드 편집기나 트랜스파일러를 싣지 않는다(런타임 편집기는 4.3 Out of Scope이며, 브라우저 트랜스파일러는 LCP 예산을 잠식한다).

각 예제는 `apps/docs/src/examples/<componentId>/<exampleId>.tsx` 모듈이다. 화면은 같은 모듈을 두 방식으로 소비한다.

1. 정적 import → 실제 렌더 (`<Example />`)
2. `import source from "./<exampleId>.tsx?raw"` → `CodeBlock`에 표시할 소스 텍스트

같은 파일에서 렌더와 코드가 나오므로 표시된 코드와 렌더 결과가 어긋날 수 없다. 복사 버튼은 이 원문을 그대로 클립보드에 쓴다(FR-DOC-006).

`variant`와 `tone` 조합 전수 렌더(FR-DOC-003 AC-3)는 예제 모듈이 아니라 레지스트리의 조합 표에서 생성한다. 레지스트리가 컴포넌트별 `variants: readonly string[]`과 `tones: readonly string[]`을 선언하고, `VariantMatrix` 컴포넌트가 카테시안 곱을 렌더한다.

프리뷰는 현재 선택된 테마를 따른다(AC-4). 프리뷰가 별도 iframe에 격리되지 않고 문서 사이트와 같은 문서에 렌더되기 때문에, 루트의 `data-cdt-theme`이 그대로 적용된다. iframe 격리를 쓰지 않는 대가는 문서 사이트 자체의 CSS가 프리뷰에 새어 들어갈 수 있다는 점이며, 이는 문서 사이트의 모든 스타일을 `cdt.utility` 위 별도 레이어(`docs`)에 두고 프리뷰 컨테이너 내부를 선택하지 않는 규칙으로 막는다.

## 14. 상태 경계와 오류 경계

### 14.1 상태 경계

| 상태 | 위치 | 비고 |
| --- | --- | --- |
| 서버 상태 | 없다 | 백엔드가 없다 |
| 빌드 시점 데이터 | 모듈 스코프 상수 | `tokens.json`, `contrast-report.json`, `props.generated.json` |
| URL 상태 | 라우트 파라미터(`componentId`), W-030의 필터 질의(`?q=`) | 새로고침과 공유에 견딘다(FR-DOC-004 AC-1) |
| 클라이언트 상태 | 테마 선택, 복사 버튼의 일시 상태, 모바일 내비 열림 | `useState` / `useSyncExternalStore` |
| 폼 상태 | 없다 | W-030의 필터 입력이 유일한 입력 요소이며 URL로 승격된다 |
| 실시간 상태 | 없다 | 소켓, 폴링, 이벤트 스트림이 없다 |

전역 상태 관리 라이브러리를 도입하지 않는다. 문서 사이트에서 컴포넌트 경계를 넘는 상태는 테마 하나뿐이고, 테마는 React 상태가 아니라 DOM 속성이다.

### 14.2 오류 경계

| 경계 | 범위 | 동작 | 요구사항 |
| --- | --- | --- | --- |
| 라우트 오류 경계 | 라우트 단위 (React Router `ErrorBoundary`) | 셸은 유지하고 본문만 오류 화면으로 교체 | FR-DOC-001 AC-2 |
| 프리뷰 오류 경계 | 프리뷰 하나 단위 | 해당 프리뷰 영역만 `Banner tone="danger"`로 교체하고 나머지 화면은 계속 렌더 | FR-DOC-003 예외 처리 |
| 404 | 레지스트리에 없는 `componentId` | 컴포넌트 목록으로 되돌아가는 링크가 있는 `EmptyState` | — |
| 데이터 결손 | `contrast-report.json` 부재 | 대비율 열을 `측정되지 않음`으로 표시하고 화면 상단에 경고 배너 | FR-DOC-004 예외 처리 |
| 클립보드 거부 | `navigator.clipboard` 부재 또는 거부 | 복사 버튼을 `disabled`로 렌더하고 코드 블록 텍스트는 선택 가능하게 유지. 오류 배너를 띄우지 않는다 | FR-DOC-006 AC-3, 예외 처리 |
| `localStorage` 차단 | 프라이빗 모드 | 예외를 삼키고 `prefers-color-scheme`으로 대체. 저장 실패가 렌더를 막지 않는다 | FR-DOC-005 예외 처리 |

React 오류 경계는 서버 렌더 중에는 동작하지 않는다. 따라서 프리렌더(JOB-BUILD-004) 중에 예제가 예외를 던지면 문서 사이트 빌드가 실패한다. 이것은 의도한 동작이다. 깨진 예제는 배포되지 않고, 프리뷰 오류 경계는 hydration 이후 상호작용 시점의 예외만 격리한다.

## 15. 테마 토글과 최초 페인트 (FR-DOC-005)

깜빡임 방지(AC-4)와 SSR 안전성(FR-DX-004)은 프리렌더 환경에서 정면으로 충돌한다. 프리렌더된 HTML은 사용자의 저장된 테마를 알 수 없고, React는 hydration 시 서버 마크업과 다른 결과를 내면 경고한다.

해결은 두 단계다.

**1단계 — 페인트 이전에 속성을 확정한다.** `apps/docs`의 루트 HTML `<head>`에 `@conductor-by-89soone/css/theme-init.js`의 스니펫을 인라인한다. 스니펫은 스타일시트가 적용되기 전에 동기 실행되어 `document.documentElement.dataset.cdtTheme`을 확정한다.

```js
try {
  var t = localStorage.getItem("cdt-theme");
} catch (e) {}
if (t !== "dark" && t !== "light") {
  t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
document.documentElement.setAttribute("data-cdt-theme", t);
```

색은 전적으로 이 속성에서 나오므로 React가 언제 hydrate되든 시각적 깜빡임이 없다. `localStorage` 접근이 차단되면 `try` 블록이 삼키고 `prefers-color-scheme`으로 떨어진다(FR-DOC-005 AC-3, 예외 처리). 이 스니펫은 `@conductor-by-89soone/css`가 자동 주입하지 않는다. 문서 사이트가 소비자로서 직접 삽입하고, W-002가 같은 절차를 소비자에게 문서화한다(FR-THM-003 예외 처리).

**2단계 — React는 DOM을 상태의 출처로 삼는다.** 토글 컴포넌트는 `useSyncExternalStore`로 `data-cdt-theme` 속성을 읽는다.

- `subscribe`: `documentElement`에 `MutationObserver`를 걸어 속성 변화를 통지
- `getSnapshot`: `documentElement.getAttribute("data-cdt-theme")`
- `getServerSnapshot`: `"dark"` (FR-THM-003 AC-3의 기본값과 일치)

`useSyncExternalStore`는 hydration 렌더에 `getServerSnapshot`을 쓰고, hydration 완료 직후 클라이언트 스냅샷이 다르면 hydration 경고 없이 리렌더를 예약한다. 저장된 테마가 라이트인 사용자에게도 hydration 경고가 0건이며, 바뀌는 것은 토글의 `aria-pressed` 값뿐이다. 배경색은 1단계에서 이미 라이트였다.

토글 조작은 `setAttribute` + `localStorage.setItem`을 수행한다. React 상태를 거치지 않으므로 문서 트리 전체가 리렌더되지 않고, 재페인트가 NFR-001의 100ms 예산 안에 들어온다. 토글은 `role="switch"`와 `aria-checked`를 노출하고 키보드로 조작 가능하다(AC-5) — `Switch`(C-054)를 그대로 쓴다.

## 16. 접근성

문서 사이트는 자신이 문서화하는 기준을 스스로 지킨다.

| 항목 | 구현 | 요구사항 |
| --- | --- | --- |
| 건너뛰기 링크 | `AppShell`이 렌더하고 본문 영역으로 포커스 이동 | FR-CMP-009 AC-4, FR-CSS-002 AC-5 |
| 라우트 전환 시 포커스 | 전환 후 본문의 `h1`에 프로그램적 포커스, `aria-live="polite"`로 화면 제목 통지 | FR-A11Y-002 |
| 포커스 링 | `--cdt-focus-ring` 토큰. 문서 사이트가 자체 포커스 스타일을 선언하지 않는다 | FR-A11Y-001 |
| 모바일 내비 | 800px 미만에서 오프캔버스. 오버레이 클릭 또는 Escape로 닫힘 | FR-CMP-009 AC-3 |
| 색상 비의존 | W-030의 대비 pass/fail을 색 배지가 아니라 아이콘 + 텍스트로 표시 | FR-A11Y-003 |
| 복사 완료 통지 | `aria-live="polite"` 영역. 2초 후 원래 상태 복귀 | FR-DOC-006 AC-1, AC-2 |
| axe 검사 | 12개 라우트 × 테마 2종 | FR-QA-003 AC-3 |
| 허용 목록 노출 | `axe-allowlist.json`을 W-050이 렌더한다 | FR-A11Y-005 예외 처리 |

## 17. 성능 예산 (NFR-001)

| 지표 | 예산 | 확보 수단 |
| --- | --- | --- |
| LCP p75 (로컬 프로덕션 빌드, NFR-001이 지정한 스로틀 프로파일) | 2.5초 이하 | 프리렌더 HTML로 첫 페인트에 JS 불필요. 시스템 폰트로 웹폰트 왕복 0회. 히어로 이미지 없음 |
| 테마 전환 후 재페인트 | 100ms 이하 | 속성 교체 → 커스텀 프로퍼티 재해석. React 리렌더 트리는 토글 컴포넌트 1개 |
| 라우트별 JS | W-030을 제외한 전 라우트에서 `tokens.json`을 싣지 않는다 | 라우트 단위 코드 분할(`lazy`). `tokens.json`은 Foundations와 W-030 청크에만 포함 |
| 외부 네트워크 요청 | 0건 | 원격 폰트·원격 스크립트·분석 스크립트 금지(FR-DOC-001 AC-4, NFR-002) |
| CSS | `@conductor-by-89soone/css` gzip 20KB 이하 + 문서 전용 `docs` 레이어 | NFR-001 |

`contrast-report.json`은 W-030과 W-050에만 필요하다. 두 화면의 청크에서만 import하고, 파일이 없을 때의 결손 처리는 14.2절에 있다.

## 18. 문서 사이트 테스트 전략

| 계층 | 도구 | 대상 |
| --- | --- | --- |
| 단위 | Vitest 3.x | 테마 스토어(`subscribe`/`getSnapshot`), W-030 필터 로직, 레지스트리 대칭 검사 |
| 컴포넌트 | Vitest + Testing Library | 프리뷰 오류 경계, 복사 버튼 상태 전이, 데이터 결손 시 경고 배너 |
| 빌드 계약 | JOB-BUILD-004 내 검사 | 공개 export ↔ 카탈로그 화면 대칭(FR-DOC-003 AC-5), 프리렌더 중 예외 0건(FR-DX-004 AC-1) |
| E2E | Playwright 1.4x | 테마 토글 지속성(FR-DOC-005 AC-2), 깜빡임 부재(AC-4), 클립보드 복사(FR-DOC-006), 키보드 경로(FR-A11Y-002) |
| 접근성 | `@axe-core/playwright` | 12개 라우트 × 테마 2종 |
| 성능 | Lighthouse CI | LCP p75 2.5초 (W-001) |

깜빡임 부재 검증(AC-4)은 다음과 같이 측정한다. `localStorage`에 `cdt-theme=light`를 심고 `waitUntil: "commit"`으로 재방문한 뒤, `domcontentloaded` 시점에 스크린샷을 찍어 배경 픽셀이 라이트 팔레트의 `surface.base` 값인지 확인한다. 다크 픽셀이 한 프레임이라도 관측되면 실패다.

## 19. 참조 문서

- 시스템 구조: `conductor_system_architecture.md`
- 결정 근거: `conductor_architecture_decision_records.md` (ADR-002, ADR-004, ADR-007, ADR-008, ADR-009)
- 공개 API: `conductor_api_contracts.md`
- 화면 ID: `../20_derived_ui_specs/conductor_product_ia.md`
- 요구사항: `../10_requirements/srs_final.md`
