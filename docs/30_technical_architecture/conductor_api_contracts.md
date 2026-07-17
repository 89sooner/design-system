# Conductor Design System 패키지 공개 API 계약

> 상태: review | 버전: v0.4 | 갱신일: 2026-07-17

## 0. 문서 재해석

Conductor Design System에는 HTTP API, 요청/응답 엔드포인트, 인증 토큰 기반 authz가 없다(`srs_final.md` 4.3, 10절). 이 문서는 표준 아키텍처 문서 세트의 `api_contracts.md` 자리를 차지하지만, 여기서 "API 계약"은 **npm 패키지의 공개 표면**을 의미한다: 각 패키지 `package.json`의 `exports`/`sideEffects` 선언, CLI 인터페이스(`buildTokens`, `checkContrast`), `@conductor-by-89soone/tokens`가 노출하는 TypeScript 값의 타입 시그니처, `@conductor-by-89soone/react`의 컴포넌트 props 계약, `data-cdt-theme` DOM 속성 계약이 그 대상이다. "요청"은 CLI 실행 또는 모듈 import로, "응답"은 stdout/stderr/종료 코드 또는 렌더된 DOM으로 대응한다.

## 1. 목적

`API-PKG-###`, `API-TOK-###`, `API-THM-###`, `API-CMP-###`, `API-DOC-001` 각각의 안정된 공개 계약을 코딩 에이전트가 fixture와 테스트에 그대로 옮길 수 있는 수준의 JSON/TypeScript 예시와 함께 정의한다.

## 2. 공통 원칙

1. 공개 API는 각 패키지 `package.json`의 `exports` 필드에 선언된 경로로만 노출된다. 선언되지 않은 내부 경로(`@conductor-by-89soone/react/src/Button`)의 import는 런타임 해석 오류를 발생시킨다(FR-DX-003 AC-1).
2. 모든 진입점은 타입 선언(`.d.ts`)을 동반하며, 공개 선언 파일에 `any`가 0건이다(FR-DX-002).
3. 조회성 API(토큰 값 읽기, props 타입)와 실행형 API(CLI)를 분리한다. CLI는 부수효과(파일 쓰기)를 명시적으로 문서화한다.
4. 모든 CLI 오류는 기계 판독 가능한 오류 코드(`error[<CODE>]:` 접두사)와 사람이 읽을 수 있는 조치 힌트를 stderr에 함께 출력한다.
5. 네이밍은 `../10_requirements/glossary.md` 3절 네이밍 규칙을 따른다.
6. 공개 API의 파괴 변경은 semver major와 마이그레이션 노트를 동반한다(FR-DX-005, 6절 참조).

## 3. API 카탈로그

| API ID | 종류 | 대상 | 목적 | 관련 요구사항 |
| --- | --- | --- | --- | --- |
| API-PKG-001 | package exports | `@conductor-by-89soone/tokens` | 토큰 JS/JSON/타입 진입점 | FR-DX-002, FR-DX-003, FR-TOK-006 |
| API-PKG-002 | package exports | `@conductor-by-89soone/css` | 스타일시트 진입점(전체/부분) | FR-DX-003, FR-CSS-001, FR-CSS-002 |
| API-PKG-003 | package exports | `@conductor-by-89soone/react` | React 컴포넌트 진입점 | FR-DX-002, FR-DX-003, FR-CMP-001 |
| API-TOK-001 | CLI | `buildTokens`(bin: `conductor-build-tokens`) | 토큰 소스 → 산출물 빌드 | FR-TOK-003, JOB-BUILD-001 |
| API-TOK-002 | JS export | `tokens`, `breakpoints` | 타입 부여된 토큰/브레이크포인트 값 | FR-TOK-006, FR-TOK-009 |
| API-TOK-003 | CLI | `checkContrast`(bin: `conductor-check-contrast`) | 테마별 대비 검사 | FR-THM-004, FR-A11Y-004, JOB-CI-001 |
| API-THM-001 | DOM 속성 계약 | `data-cdt-theme` | 테마 결정 우선순위 | FR-THM-001~003 |
| API-CMP-001 | TS interface | 공통 컴포넌트 계약 | ref/className/data-*/aria-*/네이티브 props 확장 | FR-CMP-001 |
| API-CMP-002 | TS interface | 액션군(`Button`, `IconButton`) | FR-CMP-002 |
| API-CMP-003 | TS interface | 표면군(`Card`, `CardGrid`, `Panel`) | FR-CMP-003 |
| API-CMP-004 | TS interface | 상태표시군(`Badge`, `StatusBadge`, `SeverityTag`) | FR-CMP-004, FR-TOK-005 |
| API-CMP-005 | TS interface | 데이터표시군(`Table`, `Timeline`, `CodeBlock`, `Kbd`) | FR-CMP-005 |
| API-CMP-006 | TS interface | 오버레이군(`Dialog`, `Drawer`, `Tooltip`, `DropdownMenu`) | FR-CMP-006 |
| API-CMP-007 | TS interface | 폼군(`Field`, `TextField`, `TextArea`, `Select`, `Switch`, `Checkbox`) | FR-CMP-007 |
| API-CMP-008 | TS interface | 피드백군(`Banner`, `EmptyState`, `Meter`, `ProgressRing`, `Spinner`) | FR-CMP-008 |
| API-CMP-009 | TS interface | 셸군(`AppShell`, `NavList`, `TopBar`) | FR-CMP-009 |
| API-DOC-001 | 정적 라우트 계약 | 문서 사이트 W-001~W-050 | 라우트/데이터 출처 매핑 | FR-DOC-001~007 |

## 4. API 상세 규격

### API-PKG-001 `@conductor-by-89soone/tokens` exports

```json
{
  "name": "@conductor-by-89soone/tokens",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./tokens.json": "./dist/tokens.json",
    "./breakpoints": {
      "types": "./dist/breakpoints.d.ts",
      "import": "./dist/breakpoints.js"
    },
    "./package.json": "./package.json"
  }
}
```

`sideEffects: false`는 primitive 계층이 export되지 않는 것과 별개로, `tokens`/`breakpoints` 객체가 트리쉐이킹 대상이 되어야 함을 선언한다. `./tokens.json`은 빌드 산출물 원본을 그대로 노출하며 문서 사이트가 소비한다(`API-TOK-002`, `conductor_data_model.md` 5절).

### API-PKG-002 `@conductor-by-89soone/css` exports

```json
{
  "name": "@conductor-by-89soone/css",
  "version": "0.1.0",
  "sideEffects": ["*.css"],
  "files": ["dist"],
  "exports": {
    ".": "./dist/index.css",
    "./component.css": "./dist/component.css",
    "./package.json": "./package.json"
  }
}
```

`.`(기본 진입점)은 `cdt.reset`부터 `cdt.utility`까지 5개 레이어를 모두 포함한다(FR-CSS-001). `./component.css`는 `cdt.reset` 레이어를 제외한 산출물이며, 소비자의 기존 전역 리셋과 충돌할 때 사용한다(FR-CSS-002 예외 처리). `sideEffects: ["*.css"]`는 번들러가 미사용으로 판단해 CSS import를 제거하지 않도록 보장한다.

### API-PKG-003 `@conductor-by-89soone/react` exports

```json
{
  "name": "@conductor-by-89soone/react",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "lucide-react": ">=0.400.0 <2"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

`sideEffects: false`와 named export 전용 구조(default export 금지)가 결합해 `import { Button } from "@conductor-by-89soone/react"` 단독 사용 시 다른 컴포넌트가 번들에 포함되지 않는다. `Button` 단독 import gzip 크기는 React를 제외하고 4KB 이하여야 한다(M-7, FR-DX-003 AC-3).

### API-TOK-001 `buildTokens` CLI

- 실행: `pnpm --filter @conductor-by-89soone/tokens run build` (내부적으로 `conductor-build-tokens` bin 호출)
- 인자: 없음(소스 위치는 `packages/tokens/src/`로 고정)
- 플래그:

| 플래그 | 기본값 | 설명 |
| --- | --- | --- |
| `--watch` | off | 로컬 전용 증분 재빌드(`conductor_backend_architecture.md` 9절) |
| `--out <dir>` | `dist` | 산출물 디렉터리 |
| `--report` | off | 파일을 쓰지 않고 린트 허용 목록/제외 목록만 조회 |

- stdout 형식(성공):

```text
[tokens] resolved 128 tokens (42 primitive, 61 semantic, 25 component)
[tokens] wrote dist/tokens.css (61 declarations)
[tokens] wrote dist/tokens.js, dist/tokens.d.ts, dist/tokens.json
[tokens] wrote dist/breakpoints.js, dist/breakpoints.d.ts
done in 340ms
```

- stderr 형식(실패, 순환 참조 예시):

```text
error[TOK-CYCLE]: circular token reference detected
  surface.card -> surface.raised -> surface.card
resolved 0 of 128 tokens; no output written
```

- 종료 코드: `0` 성공 · `1` 참조 해석 실패(순환/미존재 키/깊이 초과) · `2` 접두사 또는 이름 충돌 위반 · `3` 잘못된 CLI 인자.

### API-TOK-002 `tokens` / `breakpoints` TypeScript export

```ts
// packages/tokens/dist/index.d.ts
export declare const tokens: {
  readonly surface: {
    readonly base: "var(--cdt-surface-base)";
    readonly raised: "var(--cdt-surface-raised)";
    readonly subtle: "var(--cdt-surface-subtle)";
  };
  readonly status: {
    readonly queued: "var(--cdt-status-queued)";
    readonly running: "var(--cdt-status-running)";
    readonly waiting: "var(--cdt-status-waiting)";
    readonly success: "var(--cdt-status-success)";
    readonly partial: "var(--cdt-status-partial)";
    readonly danger: "var(--cdt-status-danger)";
    readonly neutralEnd: "var(--cdt-status-neutral-end)";
  };
  readonly severity: {
    readonly read: "var(--cdt-severity-read)";
    readonly write: "var(--cdt-severity-write)";
    readonly destructive: "var(--cdt-severity-destructive)";
    readonly blocked: "var(--cdt-severity-blocked)";
  };
  // meter, border, elevation, font, z 등 나머지 semantic/component 그룹은 동일 패턴
};

export type Tokens = typeof tokens;
```

```ts
// packages/tokens/dist/breakpoints.d.ts
export declare const breakpoints: {
  readonly sm: 560;
  readonly md: 800;
  readonly lg: 1080;
};
```

`tokens` 하위 값은 원시 색상이 아니라 `var(--cdt-*)` 참조 문자열이다(`conductor_data_model.md` 5절 근거). `tokens.surface.raised`에 접근하면 위 리터럴 유니온 타입으로 추론되고(FR-TOK-006 AC-1), `tokens.surface.nonexistent`처럼 존재하지 않는 키에 접근하면 TypeScript 컴파일 오류가 발생한다(AC-2). `breakpoints`는 반대로 리터럴 숫자(px)를 노출한다 — CSS 커스텀 프로퍼티가 미디어쿼리 조건에서 평가되지 않기 때문이다(FR-TOK-009, 기술 제약 5.2.3).

### API-TOK-003 `checkContrast` CLI

- 실행: `pnpm --filter @conductor-by-89soone/tokens run check:contrast`
- 인자: 없음
- 플래그:

| 플래그 | 기본값 | 설명 |
| --- | --- | --- |
| `--theme <dark\|light\|all>` | `all` | 검사 대상 테마 한정 |
| `--report` | off | 제외 목록(`usage: "decorative"`)만 조회 |

- stdout 형식:

```text
theme=dark  pair=text.body/surface.base   ratio=13.42  threshold=4.50(body)     PASS
theme=dark  pair=text.faint/surface.base  ratio=3.10   threshold=4.50(body)     FAIL
theme=light pair=text.body/surface.base   ratio=15.01  threshold=4.50(body)     PASS
2 of 48 pairs checked failed contrast threshold
```

- 종료 코드: `0` 전건 통과 · `1` 미달 1건 이상.
- 산출물: `dist/contrast-report.json`(`conductor_data_model.md` 5절), 문서 사이트 토큰 참조 페이지(FR-DOC-004)가 소비한다.

### API-THM-001 `data-cdt-theme` 속성 계약

우선순위 규칙(FR-THM-003)은 CSS 캐스케이드 특이성으로 구현한다.

```css
:root {
  color-scheme: dark;
  --cdt-surface-base: #080b12;
  /* 다크 값이 :root 기본값 — 속성 부재 또는 무효 값일 때의 최종 대체값 */
}

@media (prefers-color-scheme: light) {
  :root:not([data-cdt-theme]) {
    color-scheme: light;
    --cdt-surface-base: #ffffff;
    /* 속성이 없고 OS가 light일 때만 적용 */
  }
}

:root[data-cdt-theme="light"] {
  color-scheme: light;
  --cdt-surface-base: #ffffff;
  /* 명시적 속성이 OS 설정을 덮어씀 */
}
```

| 우선순위 | 조건 | 적용 팔레트 |
| --- | --- | --- |
| 1 | `data-cdt-theme="light"` | 라이트(OS 설정과 무관, AC-1) |
| 1 | `data-cdt-theme="dark"` | 다크 |
| 2 | 속성 없음, `prefers-color-scheme: dark` | 다크(AC-2) |
| 2 | 속성 없음, `prefers-color-scheme: light` | 라이트(AC-2) |
| 3 | 속성값이 `dark`/`light` 이외 | 다크(`:root` 기본값으로 귀결, AC-3) |

테마 전환은 `data-cdt-theme` 값만 바꾸며 CSS 커스텀 프로퍼티 재계산으로 반영되므로 컴포넌트가 재마운트되지 않는다(AC-4). SSR 초기 페인트 깜빡임을 막기 위한 인라인 스니펫은 `@conductor-by-89soone/css`의 공개 export가 아니라 문서 사이트 W-002 페이지에 복사 가능한 코드 예제로 게시한다(FR-THM-003 예외 처리) — 패키지가 `<head>`에 자동 주입하지 않는다.

### API-CMP-001 공통 컴포넌트 계약

```ts
// 모든 공개 컴포넌트가 만족해야 하는 패턴. 별도로 export되는 타입은 아니며,
// 각 컴포넌트의 Props 인터페이스가 이 패턴을 반복한다.
export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
}

export declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;
```

공유 계약 테스트 스위트는 공개 컴포넌트 전수에 대해 다음을 검증한다(FR-CMP-001 AC-5): `ref` 전달 시 최상위 DOM 노드 수신(AC-1), `className="x"` 전달 시 기본 클래스와 병합(AC-2), `data-testid`/`aria-label`이 최상위 DOM 노드로 통과(AC-3), Props 타입이 대응 네이티브 요소 props를 확장(AC-4). 계약을 만족하지 않는 컴포넌트는 공개 진입점에서 export하지 않는다.

### API-CMP-002 액션군

```ts
export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  tone?: "neutral" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export interface IconButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  "aria-label": string; // 필수. 누락 시 TypeScript 컴파일 오류(FR-CMP-002 AC-3)
  icon: React.ComponentType<{ "aria-hidden"?: boolean }>;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}
```

### API-CMP-003 표면군

```ts
type CardOwnProps =
  | { onClick: React.MouseEventHandler; href?: never }
  | { href: string; onClick?: never }
  | { onClick?: undefined; href?: undefined };

export type CardProps = CardOwnProps &
  Omit<React.ComponentPropsWithoutRef<"div">, "onClick" | "href">;

export interface CardGridProps extends React.ComponentPropsWithoutRef<"div"> {
  minColumnWidth?: number; // 기본 320
}
```

`onClick` 또는 `href`가 주어지면 각각 `button` 또는 `a` 요소로 렌더된다(대화형 모드, FR-CMP-003 AC-1). 둘 다 없으면 `div`로 렌더되고 포커스를 받지 않는다(정적 모드, AC-3).

### API-CMP-004 상태표시군

```ts
export type StatusValue =
  | "queued" | "running" | "waiting" | "success" | "partial" | "danger" | "neutralEnd";

export type SeverityValue = "read" | "write" | "destructive" | "blocked";

export interface StatusBadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  status: StatusValue; // 이외 값은 TypeScript 컴파일 오류(FR-CMP-004 AC-3)
}

export interface SeverityTagProps extends React.ComponentPropsWithoutRef<"span"> {
  severity: SeverityValue;
}
```

### API-CMP-005 데이터표시군

```ts
export interface TableProps extends React.ComponentPropsWithoutRef<"table"> {
  caption?: string; // caption 또는 aria-label 부재 시 개발 빌드 콘솔 경고(FR-CMP-005 AC-5)
}

export interface TimelineStep {
  id: string;
  label: string;
  onSelect?: () => void; // 존재하면 button으로, 없으면 div로 렌더(AC-3)
}

export interface TimelineProps extends React.ComponentPropsWithoutRef<"ol"> {
  steps: TimelineStep[];
}
```

### API-CMP-006 오버레이군

```ts
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export interface DrawerProps extends DialogProps {
  side?: "left" | "right";
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}
```

포커스 트랩, 롤 관리, Escape 처리는 Radix UI Primitives 위임이며 Conductor가 자체 구현하지 않는다(AC-5, ADR-004).

### API-CMP-007 폼군

```ts
export interface FieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: React.ReactElement;
}

export interface TextFieldProps extends React.ComponentPropsWithoutRef<"input"> {
  invalid?: boolean; // true면 렌더된 input이 aria-invalid="true"를 가짐(AC-2)
}
```

### API-CMP-008 피드백군

```ts
export interface BannerProps extends React.ComponentPropsWithoutRef<"div"> {
  tone: "info" | "success" | "warning" | "danger";
  action?: React.ReactNode; // tone="danger"일 때 비어 있으면 개발 빌드 콘솔 경고(AC-2)
}

export interface MeterProps {
  value: number;
  min: number;
  max: number;
  warningThreshold: number;
  exceededThreshold: number;
}
```

`tone="danger"`는 `role="alert"`, `tone="info"`는 `role="status"`로 렌더된다(AC-1).

### API-CMP-009 셸군

```ts
export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  nav: React.ReactNode;
  topBar?: React.ReactNode;
  navOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  skipLinkLabel: string;
  mainId?: string;
  children: React.ReactNode;
}

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  section?: string;
}

export interface NavLinkRenderProps {
  className: string;
  "aria-current": "page" | undefined;
  children: React.ReactNode;
}

export interface NavListProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  items: readonly NavItem[];
  renderLink: (item: NavItem, props: NavLinkRenderProps) => React.ReactNode;
  "aria-label": string;
}

export interface TopBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  menuButton?: React.ReactNode;
}
```

`renderLink`로 링크 렌더를 위임해 `@conductor-by-89soone/react`가 라우팅 라이브러리에 의존하지 않는다(AC-1, AC-2). `AppShell`의 모바일 내비는 exact `@radix-ui/react-dialog`의 non-modal `DismissableLayer`에 Escape와 outside pointer dismissal을 위임한다. OD-004는 2026-07-10에 패키지 포함으로 종결되었다.

### API-DOC-001 문서 사이트 라우트 계약

| 라우트 | 화면 ID | 데이터 출처 |
| --- | --- | --- |
| `/tokens/color` | W-010 | `tokens.json`(색상 그룹) |
| `/tokens/typography` | W-011 | `tokens.json`(`font.*` 그룹) |
| `/tokens/layout` | W-012 | `tokens.json`(`breakpoint.*`, spacing) |
| `/components` | W-020 | `ComponentMeta[]` |
| `/components/:name` | W-021 | `ComponentMeta`, 컴포넌트 `.d.ts` |
| `/tokens/reference` | W-030 | `tokens.json`, `contrast-report.json` |
| `/guidelines` | W-040 | 정적 MDX |
| `/accessibility` | W-050 | axe 허용 목록 파일 |

라우트는 정적 파일로 빌드되며 서버 런타임을 요구하지 않는다(FR-DOC-001 AC-3). 상세 데이터 흐름은 `conductor_backend_architecture.md` 3.4절을 따른다.

## 5. 오류 모델

CLI 오류는 다음 형식을 공유한다.

```text
error[<CODE>]: <한 줄 요약>
  <세부 내용 1>
  <세부 내용 2>
```

| Error Code | 발생 CLI | 종료 코드 | 의미 |
| --- | --- | --- | --- |
| `TOK-CYCLE` | `buildTokens` | 1 | 토큰 참조 순환 검출 |
| `TOK-MISSING` | `buildTokens` | 1 | 존재하지 않는 토큰 키 참조 |
| `TOK-DEPTH` | `buildTokens` | 1 | 참조 깊이 10단계 초과 |
| `TOK-PREFIX` | `buildTokens` | 2 | `--cdt-` 접두사 누락 |
| `TOK-COLLISION` | `buildTokens` | 2 | 두 토큰 키가 동일 CSS 이름으로 충돌 |
| `CONTRAST-FAIL` | `checkContrast` | 1 | 대비율 기준 미달 쌍 존재 |
| `BUILD-ORDER` | `check-build-order` | 1 | 패키지 간 역방향 의존 선언 |

## 6. 버저닝

1. **semver.** `MAJOR.MINOR.PATCH`. 3개 패키지는 독립적으로 버전이 오르되, 한 릴리스에서 함께 배포될 수 있다.
2. **파괴 변경 정의.**
   - 토큰 키 rename/삭제(`conductor_data_model.md` 6절)
   - 컴포넌트 props의 필수 필드 추가, 기존 필드 타입 축소, prop 삭제
   - `package.json`의 `exports` 경로 삭제 또는 삭제된 것과 동등하게 취급되는 경로 변경
   - CSS 클래스명(`cdt-*`) 삭제 또는 rename
   - CLI 플래그 삭제, 종료 코드 의미 변경
3. **비파괴 변경.** 신규 토큰/컴포넌트/props(선택적, 기본값 존재) 추가, 버그 수정으로 인한 시각적 보정(기존 토큰 키 유지).
4. **deprecation 절차(FR-DX-005).** deprecated 대상에 `@deprecated` JSDoc 태그와 대체 경로를 명시하고 문서 사이트에 지원 종료 표식을 노출한다. 최소 1회의 minor 릴리스 동안 동작을 유지한 뒤, 다음 major에서 제거한다. 제거 시 `CHANGELOG`에 마이그레이션 노트를 포함한다(AC-4). 변경 이력이 없는 패키지는 버전을 올리지 않는다(AC-3).
