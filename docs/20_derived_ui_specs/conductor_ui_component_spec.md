# Conductor Design System UI 컴포넌트 명세서

> 상태: review | 버전: v0.7 | 갱신일: 2026-08-06

## 0. 문서 위치와 범위

- 상위 기준 문서: `../10_requirements/srs_final.md` 9.4절(FR-CMP-001 ~ FR-CMP-009).
- 용어 기준: `../10_requirements/glossary.md`.
- 시각 근거: `agent-ai-platform/packages/web/src/styles/app.css`, 동 디렉터리 `tokens.css`.
- 이 문서는 승인된 범위를 번역한다. FR-CMP-001 ~ FR-CMP-009에 없는 컴포넌트를 추가하지 않는다. `F-CMP-010` 필터/칩 컴포넌트군은 FR이 부여되지 않았으므로 이 문서에 등장하지 않는다(SRS 4.2, OD-003).
- 컴포넌트 ID 레지스트리는 고정이다. 새 ID를 임의로 만들지 않는다.

| 군 | FR ID | API 계약 ID | 컴포넌트 ID |
| --- | --- | --- | --- |
| 공통 계약 | FR-CMP-001 | API-CMP-001 | (전 컴포넌트) |
| 액션 | FR-CMP-002 | API-CMP-002 | C-001, C-002 |
| 표면 | FR-CMP-003 | API-CMP-003 | C-010, C-011, C-012 |
| 상태 표시 | FR-CMP-004 | API-CMP-004 | C-020, C-021, C-022 |
| 데이터 표시 | FR-CMP-005 | API-CMP-005 | C-030, C-031, C-032, C-033 |
| 오버레이 | FR-CMP-006 | API-CMP-006 | C-040, C-041, C-042, C-043 |
| 폼 | FR-CMP-007 | API-CMP-007 | C-050, C-051, C-052, C-053, C-054, C-055 |
| 피드백 | FR-CMP-008 | API-CMP-008 | C-060, C-061, C-062, C-063, C-064 |
| 셸 (OD-004 조건부) | FR-CMP-009 | API-CMP-009 | C-070, C-071, C-072 |

## 1. 컴포넌트 설계 원칙

### 1.1 합성 우선

1. 하나의 컴포넌트는 하나의 시각 책임만 갖는다. 여러 책임이 필요하면 컴포넌트를 중첩한다.
2. 복합 컴포넌트(`Dialog`, `Drawer`, `DropdownMenu`, `Select`, `Table`, `Timeline`, `Field`)는 단일 props 뭉치 대신 네임스페이스 하위 컴포넌트를 노출한다. 예: `Dialog.Root`, `Dialog.Content`.
3. 컴포넌트는 자식을 `children`으로 받는다. 자식을 배열 props(`items: {...}[]`)로 받는 컴포넌트는 `NavList`(C-071) 하나뿐이며, 이는 링크 렌더를 위임해야 하기 때문이다(FR-CMP-009 AC-1).
4. 레이아웃은 컴포넌트가 아니라 `cdt.layout` 레이어의 클래스가 소유한다(FR-CSS-003). 컴포넌트는 자신의 바깥 여백(`margin`)을 선언하지 않는다.

### 1.2 도메인 로직 없음

1. 컴포넌트는 실행(run), 승인(approval), 스레드 같은 제품 도메인 개념을 알지 못한다. `StatusBadge`의 `status` 값 7종은 SRS FR-TOK-005가 고정한 토큰 키이며, 도메인 엔티티가 아니다.
2. 정렬, 페이지네이션, 가상 스크롤, 폼 유효성 검사, 알림 큐, 데이터 페칭을 제공하지 않는다(FR-CMP-005·FR-CMP-007·FR-CMP-008 예외/실패 처리).
3. 컴포넌트는 네트워크 요청을 발생시키지 않는다(NFR-002).
4. 아이콘을 번들하지 않는다. 아이콘은 `ReactNode` props로 주입받는다(SRS 10절, `lucide-react` peer dependency).

### 1.3 상태는 소비자 소유

1. 열림/닫힘, 체크 여부, 입력 값은 controlled props와 uncontrolled 기본값을 모두 지원하되, 기본 동작은 Radix 프리미티브가 제공한다.
2. Conductor는 상태를 저장하는 전역 스토어, Context Provider, 테마 Provider를 배포하지 않는다. 테마는 DOM 속성 `data-cdt-theme`이 결정한다(FR-THM-003).
3. 유일한 내부 Context는 `Field`(C-050)의 id/설명/오류 연결 Context다. 이 Context는 공개 API가 아니며 `@conductor-by-89soone/react` 진입점으로 export하지 않는다.
4. 모듈 최상위에서 `window`, `document`, `localStorage`에 접근하지 않는다(FR-DX-004).

### 1.4 접근성 소유권

1. 포커스 트랩, 롤 관리, 키보드 내비게이션, 오버레이 해제 동작은 Radix UI가 소유한다(SRS 5.2 기술 제약 2, ADR-004, FR-CMP-006 AC-5).
2. Conductor는 Radix가 제공한 `role`/`aria-*` 속성을 덮어쓰지 않는다(FR-A11Y-005 AC-4).
3. Conductor가 직접 제공하는 접근성 산출물은 다음 셋뿐이다: (a) 라벨-입력 프로그램적 연결(`Field`), (b) 장식 아이콘의 `aria-hidden="true"`, (c) 상태 전달을 위한 `aria-busy`/`aria-invalid`/`aria-valuenow`/`role="alert"`/`role="status"`.
4. 접근 가능한 이름(accessible name)의 문자열은 소비자가 제공한다. Conductor는 다국어 문자열 시스템을 갖지 않는다(SRS 4.3).

### 1.5 스타일 규칙

1. 모든 시각 값은 `--cdt-*` 토큰 참조로 기술한다. CSS 산출물과 React 산출물에 색상·간격·반경·모션 리터럴이 존재하면 `pnpm lint:tokens`가 실패한다(FR-TOK-001).
2. CSS 클래스는 `cdt-<블록>[__<요소>][--<변형>]` 규칙을 따른다(glossary 3.4, FR-CSS-004 AC-2).
3. 컴포넌트 클래스는 자식 구조 셀렉터(`>`, `+`, `:nth-child`)에 의존하지 않는다(FR-CSS-004 AC-4). Radix가 소유하는 DOM에는 `data-*` 속성 셀렉터만 사용한다.
4. `!important`를 사용하지 않는다(FR-CSS-001 AC-2). 소스 `app.css:954-957`의 `.dropdown-item:hover { ... !important }` 패턴은 계승하지 않는다. `DropdownMenu.Item`은 Radix가 부여하는 `[data-highlighted]` 속성 셀렉터로 하이라이트를 표현한다(`app.css:1263-1267`의 `.SelectItem[data-highlighted]` 패턴과 동일).
5. React 없이 CSS 클래스만으로 동일한 계산된 스타일을 얻을 수 있어야 한다(FR-CSS-004 AC-3).

#### CR-018 시각 정제 규칙

사용자 시각 피드백에 따라 공개 API와 접근성 소유권은 유지하면서 다음 표현 규칙을 추가한다.

1. 넓은 면을 강조색으로 채우는 것은 Primary 액션처럼 단일 최우선 행동에 한정한다. 정보·경고·오류 메시지는 중립 표면 위에 상태색 가장자리와 아이콘을 병기해 본문 대비와 정보 위계를 보존한다.
2. Card와 Overlay는 `surface.glass`·`surface.tint.1`·elevation을 함께 사용해 떠 있는 표면으로, Panel은 그림자 없는 구획 표면으로 구분한다. 라이트 테마의 불투명 대안과 0px blur 재정의는 그대로 적용한다(FR-THM-002).
3. Button·Form control은 얇은 내부 하이라이트와 hover/active 피드백을 갖되, 검증된 단색 Primary 채움과 `focusRing`·`border.control` 교정값을 바꾸지 않는다(FR-THM-005).
4. Table은 컨테이너·caption·header·body의 표면 및 타이포 위계를 갖고, Feedback 컴포넌트는 제목·설명·수치 레이블을 서로 다른 텍스트 단계로 표현한다.
5. 메뉴와 선택 항목의 `[data-highlighted]`는 `accent.soft` 배경 + `text.primary` 조합을 사용한다. 강조색 전체 채움은 사용자의 현재 위치보다 Primary 액션처럼 읽히므로 탐색 하이라이트에 사용하지 않는다.

#### CR-019 사용성 근거 기반 정제 규칙

Radix Themes·Primer·Atlassian Design System·Spectrum·Carbon·shadcn/ui·W3C의 공통 패턴을 Conductor의 기존 범위 안에서 다음처럼 적용한다.

1. 강조는 희소하게 사용한다. Button 라벨은 색상명이나 명사보다 짧은 동작 동사를 사용하고, 한 작업 그룹의 최우선 행동 하나만 Primary로 표현한다. 기본 버튼 글자 크기는 본문과 같은 14px로 높여 빠른 스캔과 판독을 돕는다.
2. 폼 예시는 항상 가시 라벨을 우선하고, 사용자가 값을 결정하는 데 필요한 조건은 placeholder가 아니라 설명으로 제공한다. Field 라벨은 `text.secondary`와 600 굵기를 사용해 보조 설명과 명확히 구분한다.
3. `box-shadow`를 재질 표현에 사용하는 Button·대화형 Card·TextField·TextArea·Select Trigger·Switch·Checkbox는 `:focus-visible`에서 장식 그림자 대신 공통 `focusRing` 계산값을 즉시 복원하고 그림자 전환을 적용하지 않는다. `cdt.reset`의 전역 규칙만으로는 상위 `cdt.component` 레이어의 그림자를 이길 수 없으므로 컴포넌트 레이어가 이를 명시한다(DEV-012).
4. 대화형 Card의 hover는 상승, active는 기본 평면으로 복귀해 누름을 표현한다. 한 상태에서 표면색 변화와 고도 변화를 중복 적용하지 않는다.
5. W-020 카탈로그 타일은 정적 Panel과 제목 링크를 합성한다. live Button·입력·링크를 대화형 Card 안에 중첩하지 않으며, 타일 전체가 링크라는 모호한 접근 가능한 이름을 만들지 않는다.

### 1.6 props 네이밍 고정

| 축 | props 이름 | 의미 | 금지 대체어 |
| --- | --- | --- | --- |
| 시각 변종 | `variant` | 채움 전략, 표면 질감 | `type`, `kind`, `style`, `appearance` |
| 의미 색상 | `tone` | 상태·심각도가 아닌 일반 의미 색 | `color`, `intent`, `status`(상태 전용 컴포넌트 제외) |
| 크기 | `size` | 높이·패딩·글자 크기 묶음 | `scale`, `density`, `sm`/`lg` 불리언 |

`tone` 값 집합은 `neutral | accent | info | success | warning | danger` 6종으로 고정한다. `StatusBadge`(C-021)와 `SeverityTag`(C-022)는 `tone` 대신 각각 `status`, `severity` props를 받는다. 두 축을 동시에 노출하지 않는다.

`size` 값 집합은 `sm | md` 2종으로 고정한다. `lg`를 도입하지 않는다. 소스에 세 번째 높이 단계가 존재하지 않는다(`app.css:449` `min-height: 40px`, `app.css:783-790` `min-height: 34px`, `app.css:1097-1099` 뷰포트 560px 미만에서 42px).

## 2. 공통 계약 (API-CMP-001)

FR-CMP-001을 만족하지 않는 컴포넌트는 `@conductor-by-89soone/react`의 공개 진입점에서 export하지 않는다. 아래 4개 조항은 공유 테스트 스위트가 공개 컴포넌트 전수에 대해 실행하며, 하나라도 실패하면 빌드가 실패한다(FR-CMP-001 AC-5, 예외/실패 처리).

### 2.1 조항

| 조항 | 요구 | 대응 AC | 검증 |
| --- | --- | --- | --- |
| CT-1 ref 전달 | `ref`를 전달하면 최상위 DOM 노드를 받는다 | FR-CMP-001 AC-1 | `expect(ref.current).toBeInstanceOf(HTMLElement)` |
| CT-2 className 병합 | 기본 클래스와 전달된 `className`이 함께 적용된다. 전달값이 기본 클래스를 대체하지 않는다 | FR-CMP-001 AC-2 | 두 클래스의 동시 존재 |
| CT-3 속성 통과 | `data-*`와 `aria-*`가 최상위 DOM 노드에 그대로 전달된다 | FR-CMP-001 AC-3 | `data-testid`, `aria-label` 존재 |
| CT-4 네이티브 확장 | props 타입이 대응 네이티브 요소의 props를 확장한다 | FR-CMP-001 AC-4 | 타입 테스트 |

복합 컴포넌트에서 CT-1 ~ CT-3의 "최상위 DOM 노드"는 각 하위 컴포넌트가 렌더하는 노드를 뜻한다. `Dialog.Root`처럼 DOM을 렌더하지 않는 노드는 계약 대상이 아니며, 공유 스위트의 제외 목록에 컴포넌트 이름과 사유를 기록한다.

### 2.2 TypeScript 시그니처

```ts
// packages/react/src/types.ts
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * 자체 props(Own)를 네이티브 요소(E)의 props 위에 얹는다.
 * 이름이 충돌하면 자체 props가 이긴다. FR-CMP-001 AC-4.
 */
export type PolymorphicProps<E extends ElementType, Own> = Own &
  Omit<ComponentPropsWithoutRef<E>, keyof Own>;

/** 시각 변종·의미 색상·크기의 고정 축. glossary 3.7 */
export type Tone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";
export type Size = "sm" | "md";

/** 아이콘은 번들하지 않고 주입받는다. SRS 10절. */
export type IconSlot = ReactNode;
```

```ts
// packages/react/src/Button.tsx
import { forwardRef } from "react";
import { cx } from "./cx";
import type { PolymorphicProps, Size } from "./types";

export interface ButtonOwnProps {
  variant?: "primary" | "secondary" | "ghost";
  tone?: "neutral" | "accent" | "danger";
  size?: Size;
  loading?: boolean;
  blockedReason?: string;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export type ButtonProps = PolymorphicProps<"button", ButtonOwnProps>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", tone = "neutral", size = "md", loading = false,
    blockedReason, iconStart, iconEnd, className, children, disabled, onClick, ...rest },
  ref,
) {
  const blocked = blockedReason !== undefined;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || blocked}
      aria-busy={loading || undefined}
      title={blockedReason}
      onClick={loading ? undefined : onClick}
      className={cx(
        "cdt-btn",
        `cdt-btn--${variant}`,
        tone !== "neutral" && `cdt-btn--tone-${tone}`,
        size !== "md" && `cdt-btn--${size}`,
        blocked && "cdt-btn--blocked",
        className,
      )}
      {...rest}
    >
      {iconStart}
      {children}
      {iconEnd}
    </button>
  );
});
```

`cx`는 falsy 값을 버리고 문자열을 공백으로 잇는 내부 함수다. 외부로 export하지 않는다.

### 2.3 계약 세부 규칙

1. **`className` 병합 순서**: 기본 클래스 → 변종 클래스 → 소비자 `className`. 소비자 클래스가 마지막에 오지만, `@layer` 밖에서 선언된 소비자 규칙이 이기는 것은 명시도가 아니라 캐스케이드 레이어 때문이다(FR-CSS-001 AC-3).
2. **`style` props**: 네이티브 props 확장으로 통과한다. Conductor는 인라인 `style`을 자체 주입하지 않는다. 예외는 값 기반 기하가 필요한 `Meter`(C-062)의 채움 폭과 `ProgressRing`(C-063)의 `stroke-dashoffset`이며, 두 값 모두 CSS 커스텀 프로퍼티(`--cdt-meter-ratio`, `--cdt-progress-ring-ratio`)로 전달한다. 색상·간격을 인라인으로 주입하지 않는다.
3. **`ref` 전달 대상**: `Table`(C-030)의 `ref`는 `<table>` 요소를 가리킨다. 가로 스크롤 컨테이너는 `scrollContainerProps`로 별도 제어한다. `AppShell`(C-070)의 `ref`는 셸 루트 `<div>`를 가리킨다.
4. **필수 `aria-label`**: `IconButton`(C-002)만 `aria-label`을 타입 수준 필수로 요구한다(FR-CMP-002 AC-3).
5. **개발 빌드 경고**: `process.env.NODE_ENV !== "production"` 분기 안에서만 `console.warn`을 호출한다. 프로덕션 번들에서 경고 코드가 제거되어야 한다. 경고를 발생시키는 컴포넌트는 `Card`(C-010), `Table`(C-030), `TextField`(C-051), `TextArea`(C-052), `Banner`(C-060)다.
6. **`any` 금지**: 공개 `.d.ts`에 `any`가 0건이어야 한다(FR-DX-002 AC-2, M-6).
7. **`displayName`**: 모든 forwardRef 컴포넌트에 `displayName`을 부여한다. 복합 컴포넌트는 `Dialog.Content`처럼 점 표기 이름을 쓴다.

## 3. 컴포넌트 카탈로그

각 항목의 "근거 CSS"는 `agent-ai-platform/packages/web/src/styles/app.css`를 `app.css:<시작>-<끝>` 형식으로, `tokens.css`를 `tokens.css:<시작>-<끝>` 형식으로 인용한다.

### 3.1 액션 컴포넌트군 (FR-CMP-002 / API-CMP-002)

#### C-001 Button

- **책임**: 소비자가 정의한 단일 동작을 실행하는 텍스트 라벨 대화형 요소를 렌더한다.
- **CSS 클래스**: `cdt-btn`, `cdt-btn--primary`, `cdt-btn--secondary`, `cdt-btn--ghost`, `cdt-btn--tone-accent`, `cdt-btn--tone-danger`, `cdt-btn--sm`, `cdt-btn--blocked`.
- **근거 CSS**:
  - `app.css:443-457` — `.btn` 기본형. `display: inline-flex`, `gap: var(--space-2)`, `min-height: 40px`, `border: 1px solid var(--border-strong)`, `border-radius: var(--radius-md)`, `padding: 8px 14px`, `font-size: 13px`, `font-weight: 600`, `transition: all var(--motion-fast)`.
  - `app.css:459-462` — `.btn:hover:not(:disabled)` 배경 `--surface-elevated`, 경계 강화.
  - `app.css:464-469` — `.btn-primary` 강조색 그라디언트 채움, 경계 없음, 강조 그림자.
  - `app.css:471-475` — `.btn-primary:hover:not(:disabled)` 1px 상승 + 그림자 확대.
  - `app.css:477-483` — `.btn:disabled` 배경 `--state-disabled`, `cursor: not-allowed`, 그림자 제거.
  - `app.css:490-494` — `.btn.policy-disabled` 정책 차단 시각(`--state-disabled-policy` 배경, `--status-danger` 경계).
  - `app.css:783-796` — `.filter-bar .btn` 34px 높이, 투명 배경, `[aria-pressed="true"]` 선택 시각. `sm` 크기와 `ghost` 변종의 근거.
  - `app.css:1097-1099` — 뷰포트 560px 미만에서 `min-height: 42px`.
  - **CR-018 결정**: `variant`가 채움 전략을 항상 우선한다. `primary`는 neutral/accent에서 accent 채움, danger에서 danger 채움을 사용한다. `secondary`는 표면 + 경계를 유지하고 accent/danger는 경계와 전경으로 tone을 나타낸다. `ghost`는 세 tone 모두 투명 경계를 유지한다. tone 클래스가 variant를 덮어써 Secondary/Ghost를 Primary처럼 만들지 않는다(DEV-011).
  - **CR-019 결정**: 기본 라벨은 14px(**font.size.md**)를 사용한다. 예제 라벨은 `accent`, `danger` 같은 시각 토큰명이 아니라 `Deploy`, `Delete`처럼 결과가 분명한 동작 문구를 사용한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | 아니오 | 채움 전략. `primary`는 강조색 채움, `secondary`는 표면 배경 + 경계, `ghost`는 배경·경계 없음 |
| `tone` | `"neutral" \| "accent" \| "danger"` | `"neutral"` | 아니오 | 의미 색상. `variant="primary"`는 `tone="neutral"`일 때 강조색으로 채워진다(FR-CSS-004 AC-3) |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | `md`는 최소 높이 40px, `sm`은 34px |
| `loading` | `boolean` | `false` | 아니오 | 참인 동안 `aria-busy="true"`를 부여하고 `onClick`을 호출하지 않는다 |
| `disabled` | `boolean` | `false` | 아니오 | 네이티브 props. 비활성 시각과 `cursor: not-allowed`를 적용한다 |
| `blockedReason` | `string` | — | 아니오 | 값이 있으면 `disabled`가 강제되고 `title`로 사유가 노출되며 `cdt-btn--blocked` 시각이 적용된다 |
| `iconStart` | `ReactNode` | — | 아니오 | 라벨 앞 아이콘. 소비자가 `aria-hidden="true"`를 부여한 요소를 넘긴다 |
| `iconEnd` | `ReactNode` | — | 아니오 | 라벨 뒤 아이콘 |
| `children` | `ReactNode` | — | 예 | 접근 가능한 이름을 제공하는 텍스트 라벨 |

- **variant**: `primary`, `secondary`, `ghost`. — **tone**: `neutral`, `accent`, `danger`. — **size**: `sm`, `md`.
- **이벤트**: `onClick`, `onFocus`, `onBlur`, `onKeyDown` 및 `<button>`의 모든 네이티브 이벤트. `loading`이 참인 동안 `onClick`은 호출되지 않는다.
- **상태**: `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `blocked`. `loading`과 `disabled`가 동시에 참이면 `disabled` 시각이 우선하고 `aria-busy="true"`는 유지된다(FR-CMP-002 예외/실패 처리).
- **접근성 책임**: role(`button`)과 accessible name은 **네이티브 요소와 소비자**가 제공한다(`children` 텍스트). `aria-busy` 전이는 **Conductor**가 제공한다. `blockedReason`의 노출(`title`)은 **Conductor**가, 문자열은 **소비자**가 제공한다. Radix는 관여하지 않는다.
- **사용 규칙**: 페이지당 `variant="primary"` 버튼은 1개로 제한한다. 화면 이동은 `Button`이 아니라 `<a>`를 쓴다.
- **금지**: `iconStart`/`iconEnd`만 넘기고 `children`을 비우지 않는다. 아이콘 전용 버튼은 `IconButton`(C-002)을 쓴다. `onClick`으로 `preventDefault`를 호출해 `loading` 가드를 우회하지 않는다.
- **관련**: FR-CMP-002, FR-A11Y-001, FR-A11Y-005 / W-020, W-021.

#### C-002 IconButton

- **책임**: 텍스트 라벨 없이 아이콘만으로 단일 동작을 실행하는 정사각 대화형 요소를 렌더한다.
- **CSS 클래스**: `cdt-btn`, `cdt-btn--icon`. `Button`의 변종·톤 클래스를 그대로 재사용한다.
  - **구현 상태**: `cdt-btn--icon-sm`은 **폐기**. 34×34 compact 정사각은 복합 선택자 `.cdt-btn--icon.cdt-btn--sm`가 담당하므로 별도 변형 클래스가 필요 없다. `IconButton`은 이 클래스를 더 이상 부여하지 않는다(클래스 계약 테스트가 강제).
- **근거 CSS**:
  - `app.css:485-488` — `.btn-icon` `width: 40px`, `padding: 0`. `.btn`(`app.css:443-457`)의 `min-height: 40px`와 합쳐 40×40 정사각이 된다.
  - `app.css:783-790` — `sm` 크기 34×34의 근거.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `aria-label` | `string` | — | **예** | 접근 가능한 이름. 누락 시 TypeScript 컴파일 오류(FR-CMP-002 AC-3) |
| `icon` | `ReactNode` | — | 예 | 렌더할 아이콘. Conductor가 `aria-hidden="true"` 래퍼로 감싼다 |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | 아니오 | C-001과 동일 |
| `tone` | `"neutral" \| "accent" \| "danger"` | `"neutral"` | 아니오 | C-001과 동일 |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | `md`는 40×40, `sm`은 34×34 |
| `loading` | `boolean` | `false` | 아니오 | C-001과 동일 |
| `disabled` | `boolean` | `false` | 아니오 | 네이티브 props |
| `blockedReason` | `string` | — | 아니오 | C-001과 동일 |

```ts
export type IconButtonProps = PolymorphicProps<"button", IconButtonOwnProps> & {
  "aria-label": string; // 필수. Omit되지 않으므로 누락 시 타입 오류.
};
```

- **variant / tone / size**: C-001과 동일 집합.
- **이벤트**: C-001과 동일.
- **상태**: `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `blocked`.
- **접근성 책임**: accessible name은 **소비자**가 `aria-label`로 제공한다(타입 강제). 아이콘의 `aria-hidden="true"`는 **Conductor**가 부여한다(FR-A11Y-005 AC-3). Radix는 관여하지 않는다.
- **사용 규칙**: 아이콘 의미가 명확하지 않으면 `Tooltip`(C-042)으로 감싼다.
- **금지**: `children`을 받지 않는다. `aria-label`에 빈 문자열을 넘기지 않는다. `icon`에 텍스트 노드를 넘기지 않는다.
- **관련**: FR-CMP-002, FR-A11Y-005 / W-020, W-021.

### 3.2 표면 컴포넌트군 (FR-CMP-003 / API-CMP-003)

#### C-010 Card

- **책임**: 관련된 내용을 하나의 떠 있는 표면으로 묶고, 정적 표면과 대화형 표면 두 모드를 지원한다.
- **CSS 클래스**: `cdt-card`, `cdt-card--interactive`, `cdt-card--sm`, `cdt-card__header`, `cdt-card__body`, `cdt-card__footer`.
- **근거 CSS**:
  - `app.css:418-426` — `.card` 그라디언트 배경, `backdrop-filter: blur(18px)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-lg)`, `padding: var(--space-5)`, `box-shadow: var(--elevation-raised)`, 4개 속성 전환.
  - `app.css:428-434` — `a.card:hover`, `button.card:hover`, `.interactive-card:hover` → `transform: translateY(-2px)`, `box-shadow: var(--elevation-hover)`, `border-color: var(--border-strong)`. FR-CMP-003 AC-2의 "2px 상승 + 강조 경계"의 근거.
  - `app.css:1058-1061` — `.card:has(> .table) { overflow-x: auto }`. FR-CMP-003 AC-4의 근거.
  - `app.css:1084` — 뷰포트 560px 미만에서 패딩 축소, 반경 `--radius-md`로 축소.
  - **CR-018 결정**: 초기 구현이 `card.background`과 `card.shadow`만 적용해 원본의 글래스 그라디언트와 재질 깊이를 잃었다. `surface.tint.1`에서 투명으로 사라지는 그라디언트, 얇은 내부 하이라이트, 라이트에서 0px로 재정의되는 글래스 blur를 복원한다. Primary 액션의 대비를 해치는 accent 그라디언트는 추가하지 않는다.
  - **CR-019 결정**: 대화형 Card의 active 상태는 hover의 `-2px` 상승을 해제하고 기본 평면으로 돌아온다. 카탈로그처럼 내부에 live control이 필요한 경우 대화형 Card 대신 정적 Panel과 별도 링크를 합성한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `as` | `"div" \| "button" \| "a"` | 자동 | 아니오 | 명시하지 않으면 `onClick`이 있으면 `button`, `href`가 있으면 `a`, 둘 다 없으면 `div`로 렌더된다 |
| `href` | `string` | — | 아니오 | 값이 있으면 `a`로 렌더되고 대화형 시각이 적용된다 |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | `md`는 패딩 `--cdt-space-5`, `sm`은 `--cdt-space-4` |
| `children` | `ReactNode` | — | 예 | 카드 내용 |

- **variant**: 없음. 대화형 여부는 `onClick`/`href`/`as`에서 파생되며 별도 시각 변종이 아니다. — **tone**: 없음. 카드는 의미 색상을 갖지 않는다. — **size**: `sm`, `md`.
- **이벤트**: `onClick`(대화형일 때), `onKeyDown`, `onFocus`, `onBlur`. 정적 `Card`는 이벤트를 노출하지 않는다.
- **상태**: `default`, `hover`(대화형만), `focus`(대화형만), `active`(대화형만). 정적 `Card`는 `default`만 갖는다.
- **접근성 책임**: role은 **네이티브 요소**가 제공한다(`button` 또는 `a`). 정적 `Card`는 `div`로 렌더되어 포커스를 받지 않는다(FR-CMP-003 AC-3). 대화형 `Card` 내부에 중첩 대화형 요소가 존재하면 **Conductor**가 개발 빌드에서 `console.warn`을 출력한다(FR-CMP-003 예외/실패 처리). accessible name은 **소비자**가 카드 내용 또는 `aria-label`로 제공한다.
- **사용 규칙**: `Card` 안에 `Table`(C-030)을 넣으면 가로 스크롤이 `Card` 경계 안에서 발생한다(FR-CMP-003 AC-4). 이는 `Table`이 자체 스크롤 컨테이너를 소유하기 때문이며, `Card`에 별도 props를 넘길 필요가 없다.
- **금지**: 대화형 `Card` 안에 `Button`, `a`, `input`을 넣지 않는다. `Card`에 `margin`을 부여하지 않는다. 간격은 `CardGrid`(C-011) 또는 `cdt-content-stack`이 소유한다.
- **관련**: FR-CMP-003, FR-CSS-004 / W-020, W-021.

#### C-011 CardGrid

- **책임**: 카드 집합을 최소 컬럼 폭 기준의 자동 채움 그리드로 배치한다.
- **CSS 클래스**: `cdt-card-grid`. 이 클래스는 `cdt.layout` 레이어에 존재한다(FR-CSS-003 AC-1).
- **근거 CSS**:
  - `app.css:436-440` — `.card-grid` `repeat(auto-fill, minmax(320px, 1fr))`, `gap: var(--space-5)`.
  - `app.css:983-985` — 뷰포트 1080px 미만에서 최소 컬럼 폭 260px.
  - `app.css:1085` — 뷰포트 560px 미만에서 단일 컬럼.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | 예 | 그리드 항목. 일반적으로 `Card` 목록 |
| `className` | `string` | — | 아니오 | 공통 계약 CT-2 |

- **variant / tone / size**: 없음. 컬럼 수는 뷰포트가 결정하며 props로 제어하지 않는다. 브레이크포인트는 빌드 시 리터럴로 치환된다(FR-TOK-009 AC-2).
- **이벤트**: 없음.
- **상태**: `default`만 갖는다.
- **접근성 책임**: 없음. `CardGrid`는 시각 배치만 담당하고 role을 부여하지 않는다. 목록 의미가 필요하면 **소비자**가 `role="list"`를 전달하고 각 자식에 `role="listitem"`을 부여한다.
- **사용 규칙**: `Card` 외의 요소도 자식으로 허용한다. 자식 높이는 그리드 행이 맞춘다.
- **금지**: `grid-template-columns`를 인라인 `style`로 덮어쓰지 않는다. 컬럼 수를 고정해야 하면 소비자가 자체 그리드 클래스를 정의한다.
- **관련**: FR-CMP-003, FR-CSS-003 / W-020, W-021.

#### C-012 Panel

- **책임**: 화면의 한 구획을 경계로 구분하되, 카드처럼 떠 있지 않은 평평한 표면을 제공한다.
- **CSS 클래스**: `cdt-panel` (구현됨). `cdt-panel__header`, `cdt-panel__body`는 **미구현**.
  - **구현 상태**: `Panel`은 header/body 슬롯을 렌더하지 않는다. 아무 요소도 선택하지 않는 규칙은 스타일시트에서 제거했고, 슬롯 API가 생기는 시점에 컴포넌트와 함께 되살린다(클래스 계약 테스트가 강제).
- **근거 CSS**: 소스에 `.panel` 클래스는 존재하지 않는다. 다음 두 규칙에서 파생한다.
  - `app.css:563-568` — `.timeline` 컨테이너: `background: var(--surface-timeline)`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-lg)`, `overflow: hidden`. 그림자와 `backdrop-filter`가 없다.
  - `app.css:149-161` — `.app-nav` 컨테이너: 경계 + 반경 + 내부 패딩을 갖는 비대화형 구획.
  - **결정**: `Panel`은 `.timeline` 컨테이너의 속성 집합을 그대로 채택한다. `Card`(C-010)와의 구분점은 세 가지다 — (a) `box-shadow` 없음, (b) `backdrop-filter` 없음, (c) hover 변형 없음. `Card`가 목록의 한 항목이라면 `Panel`은 페이지의 한 구획이다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `as` | `"div" \| "section" \| "aside"` | `"div"` | 아니오 | 렌더할 요소. `section` 선택 시 소비자가 `aria-label` 또는 `aria-labelledby`를 함께 넘긴다 |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | 내부 패딩. `md`는 `--cdt-space-5`, `sm`은 `--cdt-space-4` |
| `children` | `ReactNode` | — | 예 | 구획 내용 |

- **variant**: 없음. — **tone**: 없음. — **size**: `sm`, `md`.
- **이벤트**: 없음. `Panel`은 대화형이 아니다.
- **상태**: `default`만 갖는다.
- **접근성 책임**: role은 **소비자**가 `as` 선택으로 결정한다. `as="section"`일 때 접근 가능한 이름을 붙이는 책임도 **소비자**에게 있다. Conductor는 role을 자동 부여하지 않는다.
- **사용 규칙**: `Panel`은 자식의 `overflow: hidden` 클리핑을 유발한다. 내부 요소의 포커스 링이 잘리면 해당 요소에 `z-index` 상승 규칙을 적용한다(FR-A11Y-001 예외/실패 처리, `app.css:599-602` 패턴).
- **금지**: `Panel`에 `onClick`을 부여해 대화형으로 만들지 않는다. 대화형 표면이 필요하면 `Card`를 쓴다. `Panel`을 `Card` 안에 중첩하지 않는다.
- **관련**: FR-CMP-003, FR-CSS-004 / W-020, W-021.

### 3.3 상태 표시 컴포넌트군 (FR-CMP-004 / API-CMP-004)

#### C-020 Badge

- **책임**: 짧은 라벨을 알약 형태로 표시하고 의미 색상 하나를 전달한다.
- **CSS 클래스**: `cdt-badge`, `cdt-badge--neutral`, `cdt-badge--accent`, `cdt-badge--info`, `cdt-badge--success`, `cdt-badge--warning`, `cdt-badge--danger`.
- **근거 CSS**:
  - `app.css:497-507` — `.badge` `display: inline-flex`, `gap: 6px`, `border-radius: 9999px`, `padding: 4px 10px`, `font-size: 12px`, `font-weight: 600`, `letter-spacing: 0.5px`, `text-transform: uppercase`.
  - **결정**: 소스 `.badge`는 형태만 선언하고 색상을 선언하지 않는다(호출부가 인라인으로 지정했다). 따라서 `tone`별 색은 component 토큰으로 새로 정의하고, semantic 상태 토큰을 참조한다. `info`는 `status.running`, `success`는 `status.success`, `warning`은 `status.waiting`, `danger`는 `status.danger`, `accent`는 `accent`, `neutral`은 `text.muted` + `border.default`를 참조한다(`tokens.css:33-39`, `tokens.css:27-30`, `tokens.css:17`).
  - **결정**: `border-radius: 9999px`는 리터럴이므로 `--cdt-radius-pill` 토큰을 요구한다. 이 토큰은 `tokens.css`의 반경 스케일(`tokens.css:65-69`)에 없으므로 `@conductor-by-89soone/tokens`가 새로 정의해야 한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `tone` | `Tone` | `"neutral"` | 아니오 | 의미 색상 6종 |
| `icon` | `ReactNode` | — | 아니오 | 라벨 앞 아이콘. Conductor가 `aria-hidden="true"` 래퍼로 감싼다 |
| `children` | `ReactNode` | — | 예 | 라벨 텍스트 |

- **variant**: 없음. — **tone**: `neutral`, `accent`, `info`, `success`, `warning`, `danger`. — **size**: 없음. 소스에 두 번째 크기가 없다.
- **이벤트**: 없음. `Badge`는 `<span>`으로 렌더되며 대화형이 아니다.
- **상태**: `default`만 갖는다.
- **접근성 책임**: accessible name은 **소비자**가 `children` 텍스트로 제공한다. 아이콘의 `aria-hidden="true"`는 **Conductor**가 부여한다.
- **사용 규칙**: 실행 상태를 표시할 때는 `Badge`가 아니라 `StatusBadge`(C-021)를 쓴다. 심각도는 `SeverityTag`(C-022)를 쓴다.
- **금지**: `Badge`에 `onClick`을 부여하지 않는다. 클릭 가능한 태그가 필요하면 `Button variant="ghost" size="sm"`을 쓴다. 텍스트를 숨기고 아이콘만 남기지 않는다.
- **관련**: FR-CMP-004, FR-A11Y-003 / W-020, W-021.

#### C-021 StatusBadge

- **책임**: 실행 상태 7종 중 하나를 색·아이콘·텍스트 세 채널로 동시에 전달한다.
- **CSS 클래스**: `cdt-badge`, `cdt-status-badge`, `cdt-status-badge--queued` … `cdt-status-badge--neutral-end` (7종).
- **근거 CSS**:
  - `app.css:497-507` — 형태는 `.badge`를 그대로 계승한다.
  - `tokens.css:32-39` — `--status-queued`, `--status-running`, `--status-waiting`, `--status-success`, `--status-partial`, `--status-danger`, `--status-neutral-end` 7종.
  - **결정**: 소스에는 상태별 배경 규칙이 없다. FR-CMP-004 AC-1이 "상태색 배경"을 요구하므로, 배경은 상태색의 반투명 채움, 텍스트와 경계는 상태색을 참조하는 component 토큰으로 정의한다. 이 구성은 `.banner-error`(`app.css:632-641`)가 사용하는 "반투명 배경 + 동색 경계 + 밝은 전경" 3중 구조와 동일하다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `status` | `"queued" \| "running" \| "waiting" \| "success" \| "partial" \| "danger" \| "neutralEnd"` | — | 예 | FR-TOK-005의 7개 상태 키. 그 외 값은 TypeScript 컴파일 오류(FR-CMP-004 AC-3) |
| `icon` | `ReactNode` | — | 예 | 상태 아이콘. 어떤 아이콘을 넘길지는 `@conductor-by-89soone/tokens`의 `STATUS_ICONS[status]`가 지시한다 — `tokens.json`의 `icon` 메타데이터와 같은 값을 타입이 붙은 맵으로 배포한 것이다(FR-TOK-005 AC-5). 렌더된 아이콘 슬롯은 그 이름을 `data-cdt-icon` 속성으로 되풀이하므로 어떤 아이콘이 요구되었는지 DOM에서 확인할 수 있다 |
| `label` | `string` | — | 예 | 상태 텍스트. Conductor는 다국어 문자열을 갖지 않으므로 소비자가 제공한다 |

- **variant**: 없음. — **tone**: 없음. `status`가 색을 결정한다. `tone`과 `status`를 동시에 노출하지 않는다. — **size**: 없음.
- **이벤트**: 없음.
- **상태**: `default`만 갖는다.
- **접근성 책임**: 아이콘에 `aria-hidden="true"`를 부여하는 것은 **Conductor**다. 접근 가능한 이름은 `label` 텍스트가 제공하며 문자열은 **소비자**가 넘긴다(FR-CMP-004 AC-2). 그레이스케일 렌더에서 7종이 텍스트로 구분되는 것은 `label`이 필수이기 때문이다(FR-CMP-004 AC-5, FR-A11Y-003 AC-1).
- **사용 규칙**: `icon`과 `label`이 모두 필수이므로, 세 채널(색·아이콘·텍스트) 중 어느 하나도 생략할 수 없다.
- **금지**: `iconOnly` 모드를 제공하지 않는다(FR-CMP-004 예외/실패 처리). 공간이 부족하면 소비자가 `Tooltip`(C-042)으로 감싼다. `label`에 빈 문자열을 넘기지 않는다.
- **관련**: FR-CMP-004, FR-TOK-005, FR-A11Y-003 / W-020, W-021, W-040.

#### C-022 SeverityTag

- **책임**: 동작이 외부에 미치는 영향 등급 4종을 색·아이콘·텍스트 세 채널로 동시에 전달한다.
- **CSS 클래스**: `cdt-badge`, `cdt-severity-tag`, `cdt-severity-tag--read`, `cdt-severity-tag--write`, `cdt-severity-tag--destructive`, `cdt-severity-tag--blocked`.
- **근거 CSS**:
  - `app.css:497-507` — 형태는 `.badge`를 계승한다.
  - `tokens.css:45-49` — `--severity-read`, `--severity-write`, `--severity-destructive`, `--severity-blocked` 4종. 네 값 모두 어두운 채도색이므로 배경으로 쓰고 전경은 밝은 텍스트를 쓴다.
  - **결정**: `StatusBadge`가 반투명 배경을 쓰는 것과 달리 `SeverityTag`는 불투명 배경을 쓴다. 소스의 심각도 토큰은 이미 어두운 값(`tokens.css:46-49`)이며 반투명 처리 시 배경과 구분되지 않기 때문이다. 전경은 `text.primary`를 참조한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `severity` | `"read" \| "write" \| "destructive" \| "blocked"` | — | 예 | FR-TOK-005의 4개 심각도 키 |
| `icon` | `ReactNode` | — | 예 | 심각도 아이콘. `SEVERITY_ICONS[severity]`가 이름을 지시하고, 렌더된 슬롯이 `data-cdt-icon`으로 되풀이한다(FR-TOK-005 AC-5) |
| `label` | `string` | — | 예 | 심각도 텍스트. `severity="destructive"`이면 `destructive` 텍스트를 렌더한다(FR-CMP-004 AC-4) |

- **variant / tone / size**: 없음. `severity`가 색을 결정한다.
- **이벤트**: 없음.
- **상태**: `default`만 갖는다.
- **접근성 책임**: C-021과 동일하다. 아이콘 `aria-hidden`은 **Conductor**, 이름 문자열은 **소비자**.
- **사용 규칙**: 심각도는 실행 상태와 다른 축이다. 두 값을 하나의 배지로 합치지 않는다.
- **금지**: 심각도 값을 5종 이상으로 확장하지 않는다. 확장은 FR-TOK-005 변경 CR을 필요로 한다.
- **관련**: FR-CMP-004, FR-TOK-005, FR-A11Y-003 / W-020, W-021, W-040.

### 3.4 데이터 표시 컴포넌트군 (FR-CMP-005 / API-CMP-005)

#### C-030 Table

- **책임**: 행과 열로 구성된 데이터의 시각 계층을 제공하고, 가로 스크롤 컨테이너를 자체 소유한다.
- **CSS 클래스**: `cdt-table`, `cdt-table__scroll`, `cdt-table__head`, `cdt-table__body`, `cdt-table__row`, `cdt-table__header-cell`, `cdt-table__cell`, `cdt-num`.
- **근거 CSS**:
  - `app.css:510-514` — `.table` `width: 100%`, `border-collapse: collapse`.
  - `app.css:516-526` — `.table th` 좌측 정렬, `padding: var(--space-3)`, 하단 2px 경계, 대문자 변환, `letter-spacing: 0.08em`, `white-space: nowrap`.
  - `app.css:528-533` — `.table td` `padding: var(--space-4) var(--space-3)`, 하단 1px 경계, `vertical-align: middle`.
  - `app.css:535-541` — 행 hover 배경 `--state-hover`, `transition: background var(--motion-fast)`.
  - `app.css:551-555` — `.table-scroll` `overflow-x: auto`, `border-radius: inherit`.
  - `app.css:557-560` — `.num` `font-variant-numeric: tabular-nums`, 모노스페이스. FR-CMP-005 AC-2의 근거.
  - `app.css:1052-1056` — 뷰포트 800px 미만에서 `.table`이 `display: block; overflow-x: auto`로 전환된다. FR-CMP-005 AC-1의 근거.

**합성 API**

| 하위 컴포넌트 | 렌더 요소 | 클래스 |
| --- | --- | --- |
| `Table` | `<div>` 스크롤 컨테이너 + `<table>` | `cdt-table__scroll`, `cdt-table` |
| `Table.Head` | `<thead>` | `cdt-table__head` |
| `Table.Body` | `<tbody>` | `cdt-table__body` |
| `Table.Row` | `<tr>` | `cdt-table__row` |
| `Table.HeaderCell` | `<th>` | `cdt-table__header-cell` |
| `Table.Cell` | `<td>` | `cdt-table__cell` |

| 이름 (`Table`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `caption` | `ReactNode` | — | 아니오 | `<caption>` 요소로 렌더된다 |
| `aria-label` | `string` | — | 아니오 | `caption`이 없을 때의 대체 이름 |
| `scrollContainerProps` | `React.ComponentPropsWithoutRef<"div">` | — | 아니오 | 가로 스크롤 컨테이너 `<div>`에 전달되는 props |
| `children` | `ReactNode` | — | 예 | `Table.Head`, `Table.Body` |

| 이름 (`Table.Cell`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `numeric` | `boolean` | `false` | 아니오 | 참이면 `cdt-num` 클래스를 추가해 `tabular-nums`와 모노스페이스를 적용한다 |

| 이름 (`Table.HeaderCell`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `scope` | `"col" \| "row"` | `"col"` | 아니오 | 네이티브 `<th scope>` |

- **variant / tone / size**: 없음.
- **이벤트**: `Table.Row`가 `onClick`을 받으면 hover 배경 외의 시각을 추가하지 않는다. 행 선택 상태는 소비자가 `aria-selected`와 `data-selected`로 표현한다.
- **상태**: `default`, `hover`(행). 로딩·빈 상태는 `Table`이 소유하지 않는다. 빈 상태는 `EmptyState`(C-061)를 `Table` 대신 렌더한다.
- **접근성 책임**: 표 구조 role은 **네이티브 요소**가 제공한다. `caption` 또는 `aria-label`이 모두 없으면 **Conductor**가 개발 빌드에서 `console.warn`을 출력한다(FR-CMP-005 AC-5). 문자열과 `scope` 값은 **소비자**가 제공한다. 대화형 셀의 키보드 도달은 셀 안에 놓인 네이티브 대화형 요소가 담당한다(FR-A11Y-002 AC-4).
- **사용 규칙**: `Card`(C-010) 안에 넣으면 가로 스크롤이 카드 경계 안에서 발생한다(FR-CMP-003 AC-4). 숫자 열에는 `numeric`을 지정한다.
- **금지**: 정렬, 페이지네이션, 가상 스크롤을 제공하지 않는다(FR-CMP-005 예외/실패 처리). 데이터 로직은 소비자가 소유한다. `Table` 자식에 구조 셀렉터를 가정한 CSS를 작성하지 않는다(FR-CSS-004 AC-4).
- **관련**: FR-CMP-005, FR-CMP-003, FR-A11Y-002 / W-020, W-021.

#### C-031 Timeline

- **책임**: 순서를 갖는 단계 목록을 마커와 함께 세로로 표시하고, 각 단계를 선택 가능하게 한다.
- **CSS 클래스**: `cdt-timeline`, `cdt-timeline__step`, `cdt-timeline__step--interactive`, `cdt-timeline__marker`.
- **근거 CSS**:
  - `app.css:563-568` — `.timeline` 컨테이너 배경 `--surface-timeline`, 1px 경계, `--radius-lg`, `overflow: hidden`.
  - `app.css:570-579` — `.timeline-step` `display: flex`, `gap: var(--space-4)`, `padding: var(--space-4)`, 하단 1px 경계, `cursor: pointer`.
  - `app.css:581-589` — `.timeline-marker` 9×9 원형 마커, 2px 컨테이너색 테두리, 강조색 배경, 강조색 글로우 링.
  - `app.css:591-597` — 마지막 단계의 하단 경계 제거, hover 배경 `--state-hover`.
  - `app.css:599-602` — `.timeline-step:focus-visible { position: relative; z-index: 1 }`. `overflow: hidden` 컨테이너에서 포커스 링이 잘리지 않게 하는 규칙이며, FR-A11Y-001 예외/실패 처리의 근거다.
  - **결정**: `.timeline-step`은 소스에서 항상 `cursor: pointer`를 갖지만, FR-CMP-005 AC-3은 `onSelect` 유무에 따라 `button` 또는 `div`로 렌더할 것을 요구한다. 따라서 `cursor: pointer`는 `cdt-timeline__step--interactive`로 옮긴다.

**합성 API**: `Timeline`(`<ol>`) + `Timeline.Step`(`<li>` 안의 `<button>` 또는 `<div>`).

| 이름 (`Timeline`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `aria-label` | `string` | — | 아니오 | 목록의 접근 가능한 이름 |
| `children` | `ReactNode` | — | 예 | `Timeline.Step` 목록 |

| 이름 (`Timeline.Step`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `onSelect` | `() => void` | — | 아니오 | 값이 있으면 내부가 `button`으로 렌더되고 키보드로 도달한다. 없으면 `div`로 렌더된다 |
| `selected` | `boolean` | `false` | 아니오 | 참이면 `aria-current="step"`과 선택 배경이 적용된다 |
| `marker` | `ReactNode` | 기본 원형 마커 | 아니오 | 마커 슬롯. 커스텀 마커에도 `aria-hidden="true"`가 적용된다 |
| `children` | `ReactNode` | — | 예 | 단계 내용 |

- **variant / tone / size**: 없음.
- **이벤트**: `onSelect`. Enter/Space 키 처리는 네이티브 `<button>`이 담당한다.
- **상태**: `default`, `hover`(대화형만), `focus`(대화형만), `selected`.
- **접근성 책임**: 목록 role(`list`)과 항목 role(`listitem`)은 **네이티브 요소**(`ol`/`li`)가 제공한다. 대화형 단계의 role(`button`)과 키보드 활성화도 **네이티브 요소**가 제공한다. `aria-current="step"`은 **Conductor**가 `selected`에서 파생한다. 마커의 `aria-hidden="true"`는 **Conductor**가 부여한다. 목록 이름은 **소비자**가 제공한다.
- **사용 규칙**: 대화형 단계에서 포커스 링이 컨테이너의 `overflow: hidden`에 잘리므로 `cdt-timeline__step--interactive:focus-visible`이 `z-index`를 상승시킨다.
- **금지**: 단계 안에 중첩 `button`을 넣지 않는다. 가로 방향 타임라인을 제공하지 않는다.
- **관련**: FR-CMP-005, FR-A11Y-001, FR-A11Y-002 / W-020, W-021.

#### C-032 CodeBlock

- **책임**: 코드 또는 직렬화된 페이로드를 모노스페이스로 렌더하고 가로 스크롤을 제공한다.
- **CSS 클래스**: `cdt-code-block`, `cdt-code-block__pre`, `cdt-code-block__code`.
- **근거 CSS**:
  - `app.css:95-99` — `.mono` `font-family: var(--type-mono)`, `font-size: 13px`, `color: var(--text-mono-payload)`.
  - `app.css:551-555` — `.table-scroll`의 `overflow-x: auto` 패턴을 스크롤 컨테이너에 재사용한다.
  - `app.css:563-568` — `.timeline` 컨테이너의 배경·경계·반경을 코드 블록 표면에 재사용한다.
  - **결정**: 소스에 코드 블록 컨테이너 클래스가 없다. 위 세 규칙을 조합해 "`surface.timeline` 배경 + `border.default` 경계 + `radius.lg` 반경 + `overflow-x: auto` + `.mono` 타이포"로 정의한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `code` | `string` | — | 예 | 렌더할 텍스트. 이스케이프는 React가 처리한다 |
| `language` | `string` | — | 아니오 | `data-language` 속성으로만 반영된다. Conductor는 구문 강조를 수행하지 않는다 |
| `aria-label` | `string` | — | 아니오 | 코드 블록의 접근 가능한 이름 |

- **variant / tone / size**: 없음.
- **이벤트**: 없음. 복사 버튼은 문서 사이트가 소유한다(FR-DOC-006).
- **상태**: `default`, `focus`(키보드 스크롤을 위해 `tabIndex={0}`이 부여된 스크롤 컨테이너).
- **접근성 책임**: 스크롤 가능한 영역이 키보드로 도달 가능하도록 **Conductor**가 스크롤 컨테이너에 `tabIndex={0}`과 `role="region"`을 부여한다. 이름 문자열은 **소비자**가 제공한다.
- **사용 규칙**: JSON 페이로드를 렌더할 때 `JSON.stringify(value, null, 2)` 결과를 `code`로 넘긴다(FR-CMP-005 AC-4).
- **금지**: `dangerouslySetInnerHTML`로 강조된 HTML을 주입하지 않는다. 구문 강조가 필요하면 소비자가 자체 컴포넌트를 만든다. 줄 바꿈을 강제하지 않는다.
- **관련**: FR-CMP-005 / W-020, W-021.

#### C-033 Kbd

- **책임**: 단일 키 또는 키 조합의 한 조각을 키캡 형태로 표시한다.
- **CSS 클래스**: `cdt-kbd`.
- **근거 CSS**:
  - `app.css:757-766` — `kbd` 요소 셀렉터. `border: 1px solid var(--border-default)`, `border-bottom-color: var(--border-strong)`, `border-radius: 5px`, `background: var(--surface-raised)`, `color: var(--text-secondary)`, `font: 11px var(--type-mono)`, `padding: 2px 6px`, 상단 하이라이트 그림자.
  - **결정**: 소스는 요소 셀렉터 `kbd`를 사용하지만, FR-CSS-004 AC-1은 모든 클래스 셀렉터가 `cdt-`로 시작할 것을 요구한다. 따라서 `.cdt-kbd` 클래스 셀렉터로 옮기고 요소 셀렉터를 쓰지 않는다.
  - **결정**: `border-radius: 5px`는 반경 스케일에 없다. 가장 가까운 `--cdt-radius-xs`(6px)를 사용한다. 1px 차이는 시각 회귀 기준 1%(M-1) 안에 든다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | — | 예 | 키 이름 한 개. 예: `Esc` |

- **variant / tone / size**: 없음.
- **이벤트**: 없음.
- **상태**: `default`만 갖는다.
- **접근성 책임**: role은 **네이티브 요소**(`<kbd>`)가 제공한다. Conductor와 Radix는 관여하지 않는다.
- **사용 규칙**: 키 조합은 `Kbd` 여러 개와 사이의 텍스트 노드로 표현한다. 예: `<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>`.
- **금지**: 하나의 `Kbd`에 조합 전체(`Ctrl+K`)를 넣지 않는다. `Kbd`를 버튼으로 만들지 않는다.
- **관련**: FR-CMP-005 / W-020, W-021.

### 3.5 오버레이 컴포넌트군 (FR-CMP-006 / API-CMP-006)

이 군의 4개 컴포넌트는 모두 Radix UI 프리미티브를 감싼다. Conductor가 기여하는 것은 CSS 클래스와 토큰 참조뿐이다. 포커스 트랩, 롤 관리, 키보드 내비게이션, Escape 처리, 배경 스크롤 잠금, 포커스 복귀를 Conductor가 자체 구현한 건수는 0건이어야 한다(FR-CMP-006 AC-5).

Radix가 소유하는 DOM에는 `data-*` 속성 셀렉터만 사용한다(FR-CSS-004 예외/실패 처리, R-3). 사용 가능한 속성은 `[data-state]`, `[data-side]`, `[data-align]`, `[data-highlighted]`, `[data-disabled]`다.

#### C-040 Dialog

- **책임**: 화면 중앙에 모달 오버레이를 열고, 배경 상호작용을 차단한다.
- **CSS 클래스**: `cdt-overlay`, `cdt-dialog`, `cdt-dialog__title`, `cdt-dialog__description`, `cdt-dialog__close`.
- **근거 CSS**:
  - `app.css:693-700` — `.radix-overlay` `background: var(--surface-overlay)`, `backdrop-filter: blur(4px)`, `position: fixed; inset: 0`, `fadeIn` 애니메이션.
  - `app.css:702-709` — `.radix-content` `background: var(--surface-raised)`, `border: 1px solid var(--border-strong)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--elevation-overlay)`.
  - `app.css:683-686` — `@keyframes contentShow` 중앙 정렬 진입 애니메이션(`translate(-50%, -48%) scale(0.96)` → `translate(-50%, -50%) scale(1)`).
  - `app.css:673-681` — `@keyframes fadeIn`, `fadeOut`.
  - **결정**: 소스의 `z-index: 40`(오버레이)과 `50`(콘텐츠)은 리터럴이다. `--cdt-z-overlay`(40)와 `--cdt-z-popover`(50)로 치환한다(FR-TOK-008 AC-1, FR-CMP-006 AC-4).
  - **결정**: 퇴장은 진입의 역방향을 `motion.fast`(140ms)로 실행한다. `[data-state="closed"]`에 걸며 Radix Presence가 `animationend`까지 언마운트를 미룬다. 감소 모드의 처리는 토큰 명세 9.2절(DEV-030).

**합성 API**: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`. 각 이름은 동명의 Radix `Dialog` 파트를 감싼다. `Dialog.Content`는 Radix `Portal` + `Overlay` + `Content`를 함께 렌더한다.

| 이름 (`Dialog.Root`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | — | 아니오 | controlled 모드. Radix에 그대로 전달된다 |
| `defaultOpen` | `boolean` | `false` | 아니오 | uncontrolled 초기값 |
| `onOpenChange` | `(open: boolean) => void` | — | 아니오 | 열림 상태 변경 콜백 |
| `modal` | `boolean` | `true` | 아니오 | Radix props. `false`로 두면 배경 스크롤이 잠기지 않는다 |

| 이름 (`Dialog.Content`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | 최대 폭. `sm`은 좁은 확인 대화상자용 |
| `children` | `ReactNode` | — | 예 | `Dialog.Title`을 반드시 포함한다 |

- **variant / tone**: 없음. — **size**: `sm`, `md`(`Dialog.Content`).
- **이벤트**: `onOpenChange`, `onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside` (모두 Radix props 통과).
- **상태**: `closed`, `open`. Radix가 `[data-state="open"]`/`[data-state="closed"]`를 부여하고 CSS가 애니메이션을 건다.
- **접근성 책임**: role(`dialog`), `aria-modal`, 포커스 트랩, Escape 닫기, 포커스 복귀, 배경 스크롤 잠금은 모두 **Radix**가 제공한다(FR-CMP-006 AC-1, AC-2). accessible name은 **소비자**가 `Dialog.Title`로 제공한다. `z-index` 토큰 적용은 **Conductor**가 한다.
- **사용 규칙**: `Dialog.Content` 안에 `Dialog.Title`이 없으면 Radix가 개발 빌드 경고를 출력한다. 설명이 없으면 `Dialog.Description` 대신 `aria-describedby={undefined}`를 Radix props로 전달한다.
- **Close 기본 스타일**: `Dialog.Close`를 원시 버튼으로 렌더하면 `cdt-dialog__close`와 secondary compact Button 클래스가 기본 적용된다. `asChild`로 소비자 Button을 전달하면 `cdt-dialog__close`만 합성하고 소비자가 선택한 variant·size를 보존한다(CR-024, DEV-017).
- **금지**: Radix가 부여한 `role`, `aria-modal`, `aria-labelledby`를 덮어쓰지 않는다(FR-A11Y-005 AC-4). 자체 `useEffect`로 `document.body.style.overflow`를 조작하지 않는다. 중첩 `Dialog`를 열지 않는다.
- **관련**: FR-CMP-006, FR-TOK-008, FR-A11Y-002 / W-020, W-021.

#### C-041 Drawer

- **책임**: 화면 가장자리에서 밀려 들어오는 모달 패널을 열고, 배경 상호작용을 차단한다.
- **CSS 클래스**: `cdt-overlay`, `cdt-drawer`, `cdt-drawer--right`, `cdt-drawer--left`, `cdt-drawer__title`, `cdt-drawer__close`.
- **근거 CSS**:
  - `app.css:605-613` — `.drawer-overlay` `position: fixed; inset: 0`, `background: var(--surface-overlay)`, `backdrop-filter: blur(4px)`, `justify-content: flex-end`.
  - `app.css:615-624` — `.drawer` `width: 500px`, `max-width: 90vw`, `height: 100%`, `background: var(--surface-raised)`, `box-shadow: var(--elevation-overlay)`, `padding: var(--space-6)`, `overflow: auto`.
  - `app.css:626-629` — `@keyframes slideInRight`.
  - `app.css:1063-1067` — 뷰포트 800px 미만에서 `width: min(100%, 560px)`, 패딩 축소.
  - **결정**: 소스는 오른쪽 진입만 정의한다. `side="left"`는 `slideInRight`의 부호를 뒤집은 대칭 규칙으로 정의한다. `AppShell`(C-070)의 오프캔버스 내비가 왼쪽에서 들어오므로(`app.css:997` `translateX(-105%)`) 좌측 진입의 근거는 소스에 존재한다.
  - **결정**: 소스 `.drawer-overlay`의 `z-index: 50`은 `.radix-overlay`의 `40`과 어긋난다. Radix 기반으로 통일하므로 오버레이는 `--cdt-z-overlay`(40), 패널은 `--cdt-z-popover`(50)를 쓴다.

**합성 API**: `Drawer.Root`, `Drawer.Trigger`, `Drawer.Content`, `Drawer.Title`, `Drawer.Description`, `Drawer.Close`. Radix `Dialog` 프리미티브 위에 구현하며, 시각만 다르다.

| 이름 (`Drawer.Content`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `side` | `"left" \| "right"` | `"right"` | 아니오 | 진입 방향 |
| `children` | `ReactNode` | — | 예 | `Drawer.Title`을 반드시 포함한다 |

`Drawer.Root`의 props는 `Dialog.Root`와 동일하다.

- **variant**: 없음. — **tone**: 없음. — **size**: 없음. 폭은 뷰포트가 결정한다.
- **이벤트**: `Dialog`와 동일(모두 Radix props 통과).
- **상태**: `closed`, `open`.
- **접근성 책임**: **Radix**가 role(`dialog`), 포커스 트랩, Escape, 포커스 복귀, 배경 스크롤 잠금을 제공한다. accessible name은 **소비자**가 `Drawer.Title`로 제공한다.
- **사용 규칙**: 긴 내용은 `Drawer.Content` 자체가 세로 스크롤한다(`overflow: auto`).
- **Close 기본 스타일**: `Drawer.Close`는 `Dialog.Close`와 같은 원시 버튼 기본 스타일/`asChild` 보존 규칙을 사용하고 marker class만 `cdt-drawer__close`로 분리한다(CR-024, DEV-017).
- **금지**: `Drawer`와 `Dialog`를 동시에 열지 않는다. `side` 값을 `top`/`bottom`으로 확장하지 않는다. 소스에 근거가 없다.
- **관련**: FR-CMP-006, FR-TOK-008, FR-A11Y-002 / W-020, W-021.

#### C-042 Tooltip

- **책임**: 대화형 요소에 짧은 보조 설명을 hover와 focus 양쪽에서 노출한다.
- **CSS 클래스**: `cdt-tooltip`, `cdt-tooltip__arrow`.
- **근거 CSS**:
  - `app.css:1175-1189` — `.TooltipContent` `border-radius: var(--radius-sm)`, `padding: 8px 12px`, `font-size: 12px`, `line-height: 1.4`, `box-shadow: var(--elevation-overlay)`, `border: 1px solid var(--border-strong)`, `backdrop-filter: blur(8px)`.
  - `app.css:1190-1193` — `[data-state='delayed-open'][data-side='top'|'right'|'bottom'|'left']`별 진입 애니메이션. `data-*` 속성 셀렉터만 사용하는 패턴의 원본이다.
  - `app.css:1194-1196` — `.TooltipArrow`의 `fill`.
  - `app.css:1198-1213` — 4방향 슬라이드 키프레임.
  - **결정**: 소스는 배경과 전경을 리터럴로 선언한다(`app.css:1180-1181`, `1195`). `--cdt-tooltip-background`, `--cdt-tooltip-text`, `--cdt-tooltip-arrow-fill` component 토큰으로 치환하며, 각각 `surface.overlay` 계열과 `text.primary`를 참조한다.
  - **결정**: 소스 `z-index: 100`은 스케일 밖이다. `--cdt-z-popover`(50)를 사용한다. Radix Portal의 DOM 순서가 `Dialog` 위 표시를 보장한다.

**합성 API**: `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`. `Tooltip.Provider`는 Radix `Tooltip.Provider`를 그대로 재수출하며 앱 루트에 1회 배치한다.

| 이름 (`Tooltip.Root`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `open` / `defaultOpen` / `onOpenChange` | — | — | 아니오 | Radix props 통과 |
| `delayDuration` | `number` | Radix 기본값 | 아니오 | 지연 시간(ms) |

| 이름 (`Tooltip.Content`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | 아니오 | Radix props 통과. CSS가 `[data-side]`로 애니메이션을 선택한다 |
| `align` | `"start" \| "center" \| "end"` | `"center"` | 아니오 | Radix props 통과 |
| `showArrow` | `boolean` | `true` | 아니오 | `Tooltip.Arrow` 렌더 여부 |
| `children` | `ReactNode` | — | 예 | 설명 텍스트 |

- **variant / tone / size**: 없음.
- **이벤트**: `onOpenChange`, `onEscapeKeyDown` (Radix props 통과).
- **상태**: `closed`, `delayed-open`, `instant-open`. 세 값 모두 Radix가 `[data-state]`로 부여한다.
- **접근성 책임**: **Radix**가 `role="tooltip"`, `aria-describedby` 연결, hover/focus 양쪽 열림, Escape 닫기를 제공한다(FR-CMP-006 AC-3). Conductor는 시각만 제공한다. 설명 문자열은 **소비자**가 제공한다.
- **사용 규칙**: `Tooltip.Trigger`의 자식은 포커스 가능한 요소여야 한다. `IconButton`(C-002)을 감쌀 때도 `aria-label`을 생략하지 않는다. 툴팁은 보조 설명이며 유일한 이름 출처가 아니다.
- **금지**: 대화형 요소를 `Tooltip.Content` 안에 넣지 않는다. `disabled` 버튼을 직접 감싸지 않는다(포인터 이벤트가 발생하지 않는다). 감싸야 하면 래퍼 `<span tabIndex={0}>`을 소비자가 제공한다.
- **관련**: FR-CMP-006, FR-A11Y-002 / W-020, W-021.

#### C-043 DropdownMenu

- **책임**: 트리거에 앵커된 명령 목록을 열고 방향키 내비게이션을 제공한다.
- **CSS 클래스**: `cdt-menu`, `cdt-menu__item`, `cdt-menu__separator`, `cdt-menu__label`.
- **근거 CSS**:
  - `app.css:702-709` — `.radix-content` 표면(배경·경계·반경·그림자·진입 애니메이션).
  - `app.css:1239-1248` — `.SelectContent` `overflow: hidden`, `backdrop-filter: blur(16px)`, `slideDownAndFade` 진입. 메뉴 표면의 직접 근거다.
  - `app.css:1249-1267` — `.SelectItem` 높이 32px, 좌우 패딩, `.SelectItem[data-highlighted]` 하이라이트 배경. 메뉴 항목의 근거다.
  - `app.css:954-957` — `.dropdown-item:hover, .dropdown-item:focus { background: var(--state-hover) !important }`.
  - **결정**: 위 `!important` 규칙은 계승하지 않는다(FR-CSS-001 AC-2). 하이라이트는 `.cdt-menu__item[data-highlighted]` 속성 셀렉터로 표현하며, Radix가 키보드와 포인터 하이라이트를 하나의 속성으로 통합한다. CR-018 이후 배경은 `accent.soft`, 전경은 `text.primary`를 사용해 탐색 위치를 Primary 액션보다 낮은 시각 단계로 유지한다.
  - **결정**: 소스 `.SelectItem`의 `border-radius: 4px`는 스케일 밖이다. `--cdt-radius-xs`(6px)를 사용한다.

**합성 API**: `DropdownMenu.Root`, `DropdownMenu.Trigger`, `DropdownMenu.Content`, `DropdownMenu.Item`, `DropdownMenu.Label`, `DropdownMenu.Separator`.

| 이름 (`DropdownMenu.Content`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | 아니오 | Radix props 통과 |
| `align` | `"start" \| "center" \| "end"` | `"start"` | 아니오 | Radix props 통과 |
| `sideOffset` | `number` | `4` | 아니오 | Radix props 통과 |

| 이름 (`DropdownMenu.Item`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `tone` | `"neutral" \| "danger"` | `"neutral"` | 아니오 | 파괴적 명령을 `danger`로 표시한다 |
| `icon` | `ReactNode` | — | 아니오 | 항목 앞 아이콘. `aria-hidden="true"` 래퍼가 적용된다 |
| `disabled` | `boolean` | `false` | 아니오 | Radix props 통과. `[data-disabled]`가 부여된다 |
| `onSelect` | `(event: Event) => void` | — | 아니오 | Radix props 통과 |

- **variant**: 없음. — **tone**: `neutral`, `danger`(`DropdownMenu.Item`). — **size**: 없음.
- **이벤트**: `onOpenChange`(Root), `onSelect`(Item), `onEscapeKeyDown`, `onPointerDownOutside`(Content).
- **상태**: `closed`, `open`(Content), `highlighted`, `disabled`(Item).
- **접근성 책임**: **Radix**가 role(`menu`, `menuitem`), 방향키 내비게이션, 타이핑 검색, Escape 닫기, 포커스 복귀를 제공한다. 아이콘 `aria-hidden`은 **Conductor**가 부여한다. 항목 텍스트는 **소비자**가 제공한다.
- **사용 규칙**: 파괴적 명령은 `tone="danger"`로 표시하고 확인이 필요하면 `Dialog`(C-040)를 연다.
- **금지**: `:hover`/`:focus` 의사 클래스로 하이라이트를 구현하지 않는다. `[data-highlighted]`만 사용한다. 메뉴 항목 안에 `button`이나 `a`를 중첩하지 않는다. `!important`를 쓰지 않는다.
- **관련**: FR-CMP-006, FR-CSS-001, FR-A11Y-002 / W-020, W-021.

### 3.6 폼 컴포넌트군 (FR-CMP-007 / API-CMP-007)

이 군은 표시 계층만 담당한다. 폼 상태 관리와 유효성 검사 로직을 제공하지 않는다(FR-CMP-007 예외/실패 처리).

모든 폼 컨트롤의 최소 높이는 40px이며 뷰포트 560px 미만에서 42px로 증가한다(FR-CMP-007 AC-5). 근거: `app.css:728` `min-height: 40px`, `app.css:1224` `.SelectTrigger { height: 40px }`, `app.css:1097-1099` `.btn { min-height: 42px }`.

#### C-050 Field

- **책임**: 라벨·설명·오류 메시지를 하나의 입력 요소에 프로그램적으로 연결한다.
- **CSS 클래스**: `cdt-field`, `cdt-field__label`, `cdt-field__description`, `cdt-field__error`, `cdt-field__required`.
- **근거 CSS**:
  - `app.css:1166-1172` — `.form-label` `display: block`, `font-size: 13px`, `font-weight: 500`, `color: var(--text-muted)`, `margin-bottom: 8px`.
  - **결정**: 소스에 필드 래퍼, 설명, 오류 메시지 클래스가 없다. 래퍼는 `display: grid; gap: var(--space-2)`로 정의하고(`.form-label`의 8px 하단 여백을 그리드 간격으로 이관), 설명은 `text.muted` + `font.size.sm`, 오류는 `status.danger` + `font.size.sm`으로 정의한다. 오류 색은 `.banner-error`(`app.css:637`)의 전경 처리를 따른다.
  - **CR-019 결정**: 가시 라벨은 `text.secondary` + 600 굵기로 설명의 `text.muted`와 분리한다. placeholder는 예시 형식만 전달하며 라벨이나 입력 조건을 대신하지 않는다.

`Field`는 내부 Context로 `id`, `descriptionId`, `errorId`, `invalid`, `required`를 하위 컨트롤에 전달한다. 이 Context는 공개 API가 아니다(1.3 3항).

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` | — | 예 | 라벨 텍스트. `htmlFor`/`id`로 컨트롤에 연결된다(FR-CMP-007 AC-1) |
| `description` | `ReactNode` | — | 아니오 | 보조 설명. `aria-describedby`로 연결된다 |
| `error` | `ReactNode` | — | 아니오 | 오류 메시지. 값이 있으면 컨트롤에 `aria-invalid="true"`가 부여된다(FR-CMP-007 AC-2) |
| `required` | `boolean` | `false` | 아니오 | 라벨에 필수 표식을 렌더하고 Context로 하위 컨트롤에 전달한다. 자식 엘리먼트를 복제해 prop을 주입하지 않는다 |
| `id` | `string` | 자동 생성 | 아니오 | 명시하지 않으면 `useId()`로 생성한다 |
| `children` | `ReactNode` | — | 예 | 단일 폼 컨트롤 |

- **variant / tone / size**: 없음. `size`는 자식 컨트롤이 소유한다.
- **이벤트**: 없음.
- **상태**: `default`, `error`, `disabled`(자식이 `disabled`일 때 라벨 시각이 흐려진다).
- **접근성 책임**: 라벨-컨트롤 연결(`htmlFor`/`id`), 설명·오류의 `aria-describedby` 연결, `aria-invalid` 부여는 모두 **Conductor**가 수행한다. `useId()`는 React 18/19가 제공하며 SSR 안전하다(FR-DX-004). 문자열은 **소비자**가 제공한다. Radix는 관여하지 않는다.
- **사용 규칙**: `error`가 존재하는 동안 `description`도 함께 `aria-describedby`에 남긴다. 오류 메시지는 색상 외에 텍스트로 원인을 전달한다(FR-A11Y-003 AC-2). 문서와 제품 예시는 `Field`의 가시 라벨을 기본으로 사용한다.
- **금지**: `Field` 안에 컨트롤을 2개 이상 넣지 않는다. `placeholder`를 라벨 대용으로 쓰지 않는다.
- **관련**: FR-CMP-007, FR-A11Y-003, FR-A11Y-005 / W-020, W-021.

#### C-051 TextField

- **책임**: 한 줄 텍스트 입력을 렌더한다.
- **CSS 클래스**: `cdt-input`, `cdt-input--glass`, `cdt-input--sm`.
- **근거 CSS**:
  - `app.css:725-735` — `input:not([type="checkbox"]):not([type="radio"])` `min-height: 40px`, `border: 1px solid var(--border-default)`, `border-radius: var(--radius-sm)`, 어두운 반투명 배경, `padding: 9px 12px`.
  - `app.css:737-741` — hover 시 `border-color: var(--border-strong)`.
  - `app.css:743-750` — focus 시 `border-color: var(--accent)`, `box-shadow: var(--focus-ring)`, `outline: none`.
  - `app.css:752-755` — placeholder 색 `--text-faint`.
  - `app.css:712-723` — `.input-glass` 밝은 반투명 배경, `border-radius: var(--radius-md)`, `padding: 10px 14px`, `font-size: 14px`.
  - `app.css:1154-1165` — `.input-glass` hover/focus/placeholder 변형.
  - **결정**: 소스는 두 개의 입력 시각을 갖는다. 요소 셀렉터 기반의 `solid`(기본)와 클래스 기반의 `glass`다. 이를 `variant="solid" | "glass"`로 노출한다. 요소 셀렉터는 `cdt.reset` 레이어의 폰트 상속 정규화(`app.css:28-33`)에만 남기고, 시각은 `.cdt-input` 클래스 셀렉터가 소유한다(FR-CSS-004 AC-1).
  - **결정**: `.input-glass:focus`(`app.css:1158-1162`)는 `--status-running`을 경계색으로 쓴다. 이 값은 `--accent`와 동일하다(`tokens.css:27`, `tokens.css:34`). 의미상 상태색이 아니므로 `accent` 토큰을 참조한다. `.SelectTrigger:focus`(`app.css:1234-1238`)와 `.SwitchRoot[data-state='checked']`(`app.css:1281-1284`)에도 같은 결정을 적용한다.
  - **결정**: `.input-glass:focus`의 `box-shadow`는 소스에서 `--focus-ring`과 다른 리터럴이다. FR-A11Y-001 AC-1은 모든 대화형 요소가 동일한 `box-shadow` 계산값을 갖도록 요구한다. 따라서 `--cdt-focus-ring`으로 통일한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `variant` | `"solid" \| "glass"` | `"solid"` | 아니오 | 표면 질감 |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | `md`는 최소 높이 40px, `sm`은 34px |
| `invalid` | `boolean` | `Field`에서 상속 | 아니오 | 참이면 `aria-invalid="true"`와 오류 경계가 적용된다 |
| `iconStart` | `ReactNode` | — | 아니오 | 입력 앞 장식 아이콘. `aria-hidden="true"` 래퍼가 적용된다 |

`TextFieldProps extends React.ComponentPropsWithoutRef<"input">`. `type`, `value`, `defaultValue`, `onChange`, `placeholder`, `disabled`, `readOnly`는 네이티브 props로 통과한다.

- **variant**: `solid`, `glass`. — **tone**: 없음. — **size**: `sm`, `md`.
- **이벤트**: `onChange`, `onFocus`, `onBlur`, `onKeyDown` 등 `<input>`의 네이티브 이벤트 전부.
- **상태**: `default`, `hover`, `focus`, `disabled`, `readOnly`, `error`.
- **접근성 책임**: 라벨 연결은 **Conductor**의 `Field`(C-050)가 수행한다. `Field` 없이 렌더하고 `aria-label`도 없으면 **Conductor**가 개발 빌드에서 `console.warn`을 출력한다(FR-CMP-007 AC-3). role은 **네이티브 요소**가 제공한다.
- **사용 규칙**: `type="checkbox"`와 `type="radio"`에는 사용하지 않는다. 체크박스는 `Checkbox`(C-055)를 쓴다.
- **금지**: `outline: none`을 대체 포커스 표시 없이 선언하지 않는다(FR-A11Y-001 AC-2). 오류를 색상만으로 표현하지 않는다.
- **관련**: FR-CMP-007, FR-A11Y-001, FR-A11Y-003 / W-020, W-021.

#### C-052 TextArea

- **책임**: 여러 줄 텍스트 입력을 렌더한다.
- **CSS 클래스**: `cdt-textarea`, `cdt-textarea--glass`.
- **근거 CSS**:
  - `app.css:725-755` — `textarea`가 `input`과 동일한 경계·배경·포커스·placeholder 규칙을 공유한다.
  - `app.css:28-33` — `textarea { font: inherit }`.
  - **결정**: 소스는 `textarea`에 `min-height`를 별도로 주지 않고 `input`과 같은 40px 규칙에 포함한다. `rows` 기본값을 3으로 두어 초기 높이를 확보한다. `resize: vertical`을 `cdt.component` 레이어에서 선언한다. 소스에 `resize` 선언이 없으므로 브라우저 기본값(`both`)이 가로 레이아웃을 깨뜨리는 것을 막기 위한 결정이다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `variant` | `"solid" \| "glass"` | `"solid"` | 아니오 | C-051과 동일 |
| `rows` | `number` | `3` | 아니오 | 네이티브 props |
| `invalid` | `boolean` | `Field`에서 상속 | 아니오 | C-051과 동일 |

`TextAreaProps extends React.ComponentPropsWithoutRef<"textarea">`.

- **variant**: `solid`, `glass`. — **tone**: 없음. — **size**: 없음. 높이는 `rows`가 결정한다.
- **이벤트**: `<textarea>`의 네이티브 이벤트 전부.
- **상태**: `default`, `hover`, `focus`, `disabled`, `readOnly`, `error`.
- **접근성 책임**: C-051과 동일. 라벨 없이 렌더하면 **Conductor**가 개발 빌드 경고를 출력한다.
- **사용 규칙**: 자동 높이 확장이 필요하면 소비자가 `rows`를 제어한다.
- **금지**: `resize: none`을 강제하지 않는다. 세로 크기 조절 경로를 제거하면 긴 입력의 검토가 막힌다.
- **관련**: FR-CMP-007 / W-020, W-021.

#### C-053 Select

- **책임**: 미리 정의된 선택지 중 하나를 고르는 목록을 연다.
- **CSS 클래스**: `cdt-select__trigger`, `cdt-select__content`, `cdt-select__item`, `cdt-select__indicator` (모두 구현됨). `cdt-select`는 **미구현**.
  - **구현 상태**: `cdt-select__indicator`는 규칙이 없어 체크 글리프가 무색으로 렌더되던 상태였다. 규칙을 추가했다. `Select.Root`는 DOM 요소를 렌더하지 않는 Radix 컨텍스트 프로바이더이므로 `cdt-select` 블록 클래스가 붙을 요소 자체가 없다.
- **근거 CSS**:
  - `app.css:1216-1230` — `.SelectTrigger` `display: inline-flex`, `justify-content: space-between`, `height: 40px`, `border-radius: var(--radius-md)`, `padding: 0 14px`, `gap: 12px`.
  - `app.css:1231-1238` — hover 배경 상승, focus 경계 강조.
  - `app.css:1239-1248` — `.SelectContent` `overflow: hidden`, `backdrop-filter: blur(16px)`, `box-shadow: var(--elevation-overlay)`.
  - `app.css:1249-1267` — `.SelectItem` 높이 32px, `[data-highlighted]` 강조색 채움.
  - **결정**: `.SelectContent`의 `z-index: 60`은 스케일 밖이다. `--cdt-z-popover`(50)를 사용한다.
  - **결정**: `.SelectTrigger:focus`는 `:focus-visible`이 아닌 `:focus`를 사용한다. FR-A11Y-001 AC-4(마우스 포커스에서 링 미표시)를 만족하도록 `:focus-visible`로 옮긴다.
  - **CR-018 결정**: 선택 항목의 `[data-highlighted]`는 DropdownMenu와 동일한 `accent.soft` + `text.primary` 조합을 사용한다. 선택 여부는 Radix의 `aria-selected`와 항목 텍스트가 전달하며, 강조색 면 채움에만 의존하지 않는다.
  - **CR-018 구현 검증**: `Select.Content`는 전달받은 `children`을 `RadixSelect.Viewport` 안에 렌더해야 한다. 자식을 버리면 선택 항목뿐 아니라 닫힌 Trigger의 현재 값도 비어 보이므로, `defaultValue`의 ItemText가 Trigger에 표시되는 단위 테스트를 둔다(DEV-011).

**합성 API**: `Select.Root`, `Select.Trigger`, `Select.Value`, `Select.Content`, `Select.Item`, `Select.Group`, `Select.Label`. 모두 Radix `Select` 파트를 감싼다.

| 이름 (`Select.Root`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` / `defaultValue` / `onValueChange` | — | — | 아니오 | Radix props 통과 |
| `disabled` | `boolean` | `false` | 아니오 | Radix props 통과 |

| 이름 (`Select.Trigger`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | 높이 40px / 34px |
| `invalid` | `boolean` | `Field`에서 상속 | 아니오 | 오류 경계 |

| 이름 (`Select.Item`) | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `string` | — | 예 | Radix props 통과 |
| `disabled` | `boolean` | `false` | 아니오 | `[data-disabled]`가 부여된다 |
| `indicator` | `ReactNode` | `"✓"` | 아니오 | 선택 표시 글리프. `Checkbox`(C-054)와 같은 규약 |

- **variant**: 없음. — **tone**: 없음. — **size**: `sm`, `md`(`Select.Trigger`).
- **이벤트**: `onValueChange`, `onOpenChange`.
- **상태**: `default`, `hover`, `focus`, `open`, `disabled`, `error`(트리거) / `highlighted`, `checked`, `disabled`(항목).
- **접근성 책임**: **Radix**가 role(`combobox`/`listbox`/`option`), 방향키 내비게이션, 타이핑 검색, Escape 닫기, 포커스 복귀, `aria-expanded`/`aria-selected`를 제공한다(FR-A11Y-002 AC-3). 라벨 연결은 **Conductor**의 `Field`가 수행한다. 선택지 텍스트는 **소비자**가 제공한다.
- **사용 규칙**: 선택지가 10개를 넘으면 `Select.Group`과 `Select.Label`로 묶는다.
- **금지**: 네이티브 `<select>`로 대체하지 않는다. `[data-highlighted]` 대신 `:hover`로 하이라이트를 구현하지 않는다.
- **관련**: FR-CMP-007, FR-CMP-006, FR-A11Y-002 / W-020, W-021.

#### C-054 Switch

- **책임**: 즉시 적용되는 켬/끔 두 상태를 토글한다.
- **CSS 클래스**: `cdt-switch`, `cdt-switch__thumb`.
- **근거 CSS**:
  - `app.css:1269-1280` — `.SwitchRoot` `width: 42px`, `height: 24px`, `border-radius: 9999px`, 내부 그림자, `border: 1px solid var(--border-default)`, `transition: background-color var(--motion-fast)`.
  - `app.css:1281-1284` — `[data-state='checked']` 강조 배경 및 경계.
  - `app.css:1285-1295` — `.SwitchThumb` 18×18, 원형, `transform: translateX(2px)`.
  - `app.css:1322-1324` — `.SwitchThumb[data-state='checked'] { transform: translateX(20px) }`.
  - **결정**: `border-radius: 9999px`는 `--cdt-radius-pill` 토큰을 요구한다(C-020과 동일).
  - **결정**: 트랙 높이 24px는 최소 터치 대상 40px에 미달한다. FR-CMP-007 AC-5를 만족하도록 `.cdt-switch`에 `min-height: 40px`의 투명 히트 영역을 부여하고, 시각 트랙은 그 안에 중앙 정렬한다. 소스는 히트 영역을 정의하지 않는다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | — | 아니오 | controlled 모드. Radix props 통과 |
| `defaultChecked` | `boolean` | `false` | 아니오 | uncontrolled 초기값 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 아니오 | 상태 변경 콜백 |
| `disabled` | `boolean` | `false` | 아니오 | Radix props 통과 |

`SwitchProps extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>`.

- **variant / tone / size**: 없음.
- **이벤트**: `onCheckedChange`. Space 키 토글은 Radix가 처리한다(FR-CMP-007 AC-4).
- **상태**: `unchecked`, `checked`, `hover`, `focus`, `disabled`. Radix가 `[data-state]`와 `[data-disabled]`를 부여한다.
- **접근성 책임**: **Radix**가 `role="switch"`, `aria-checked`, Space 키 토글, 숨은 `<input>` 동기화를 제공한다. 라벨 연결은 **Conductor**의 `Field`가 수행한다. 라벨 문자열은 **소비자**가 제공한다.
- **사용 규칙**: `Switch`는 즉시 적용되는 설정에 쓴다. 폼 제출이 필요한 값에는 `Checkbox`(C-055)를 쓴다.
- **금지**: `Switch`에 `아이콘 전용` 라벨을 붙이지 않는다. `aria-checked`를 직접 설정하지 않는다(FR-A11Y-005 AC-4).
- **관련**: FR-CMP-007, FR-A11Y-002 / W-020, W-021.

#### C-055 Checkbox

- **책임**: 켬/끔/부분선택 세 상태를 갖는 선택 상자를 렌더한다.
- **CSS 클래스**: `cdt-checkbox`, `cdt-checkbox__indicator`.
- **근거 CSS**: 소스에 체크박스 시각이 없다. `app.css:725` `input:not([type="checkbox"]):not([type="radio"])`는 체크박스를 명시적으로 제외하며, 별도 규칙을 두지 않았다. 다음 세 규칙에서 파생한다.
  - `app.css:1269-1280` — `.SwitchRoot`의 경계·내부 그림자·전환 시간.
  - `app.css:1281-1284` — 선택 상태의 강조색 채움 및 경계.
  - `app.css:1263-1267` — `.SelectItem[data-highlighted]`가 사용하는 강조색 위 흰 전경 조합.
  - **결정**: 20×20 정사각, `--cdt-radius-xs` 반경, 미선택 시 `border.default` 경계 + 투명 배경, 선택 시 `accent` 채움 + 흰 체크 표시. `Switch`와 동일하게 `min-height: 40px` 투명 히트 영역을 부여한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `checked` | `boolean \| "indeterminate"` | — | 아니오 | controlled 모드. Radix props 통과 |
| `defaultChecked` | `boolean` | `false` | 아니오 | uncontrolled 초기값 |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | — | 아니오 | 상태 변경 콜백 |
| `disabled` | `boolean` | `false` | 아니오 | Radix props 통과 |
| `indicator` | `ReactNode` | 기본 체크 표시 | 아니오 | 표시 아이콘 슬롯. `aria-hidden="true"` 래퍼가 적용된다 |

- **variant / tone / size**: 없음.
- **이벤트**: `onCheckedChange`. Space 키 토글은 Radix가 처리한다(FR-CMP-007 AC-4).
- **상태**: `unchecked`, `checked`, `indeterminate`, `hover`, `focus`, `disabled`.
- **접근성 책임**: **Radix**가 `role="checkbox"`, `aria-checked`(`"mixed"` 포함), Space 키 토글, 폼 제출용 숨은 `<input>`을 제공한다. 라벨 연결은 **Conductor**의 `Field`가 수행한다. 표시 아이콘의 `aria-hidden`은 **Conductor**가 부여한다.
- **사용 규칙**: 부분선택은 자식 항목이 일부만 선택된 목록의 부모에만 쓴다.
- **금지**: 네이티브 `<input type="checkbox">`를 직접 스타일링하지 않는다. `indeterminate`를 DOM 프로퍼티로 직접 설정하지 않는다.
- **관련**: FR-CMP-007, FR-A11Y-002 / W-020, W-021.

### 3.7 피드백 컴포넌트군 (FR-CMP-008 / API-CMP-008)

#### C-060 Banner

- **책임**: 페이지 또는 구획 범위의 메시지를 원인·영향·복구 액션과 함께 표시한다.
- **CSS 클래스**: `cdt-banner`, `cdt-banner--info`, `cdt-banner--warning`, `cdt-banner--danger`, `cdt-banner__icon`, `cdt-banner__body`, `cdt-banner__action`.
- **근거 CSS**:
  - `app.css:632-641` — `.banner-error` 반투명 위험색 배경, 동색 반투명 경계, `border-radius: var(--radius-md)`, `padding: var(--space-4)`, 밝은 위험색 전경, `display: flex`, `gap: var(--space-3)`.
  - `app.css:643-652` — `.banner-info` 동일 구조의 정보색 변형.
  - `app.css:664-670` — `.warn-box` 동일 구조의 경고색 변형. `display: flex`가 없는 블록 형태다.
  - **결정**: 세 규칙의 공통 flex 구조를 `tone` 축으로 통합한다. CR-018에서 넓은 상태색 면이 본문보다 먼저 읽히는 문제를 수정해, 배경은 세 tone 모두 `surface.raised`, 본문은 `text.secondary`를 사용한다. tone은 3px 시작 가장자리와 아이콘 색으로 병기하고 제목은 `text.primary`를 사용한다. 색만으로 의미를 전달하지 않는 P-2와 다크·라이트 본문 대비를 동시에 보존한다.
  - **결정**: `tone` 값은 `info`, `warning`, `danger` 3종으로 고정한다. `success` 배너는 소스에 시각 근거가 없고 FR-CMP-008 AC-1이 요구하지 않으므로 추가하지 않는다. 성공 상태는 `StatusBadge status="success"`(C-021)로 전달한다.
  - **결정**: `--cdt-banner-<tone>-background|border|text` component 토큰으로 구조를 유지한다. background는 `surface.raised`, border는 각 상태 semantic 토큰, text는 `text.secondary`를 참조하므로 테마별 컴포넌트 분기 없이 같은 CSS가 동작한다(FR-THM-002).

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `tone` | `"info" \| "warning" \| "danger"` | `"info"` | 아니오 | `danger`는 `role="alert"`, `info`와 `warning`은 `role="status"`를 갖는다(FR-CMP-008 AC-1) |
| `icon` | `ReactNode` | — | 아니오 | 배너 아이콘. `aria-hidden="true"` 래퍼가 적용된다 |
| `title` | `ReactNode` | — | 아니오 | 메시지 제목 |
| `action` | `ReactNode` | — | 조건부 | 복구 액션 슬롯. `tone="danger"`에서 비어 있으면 개발 빌드 경고를 출력한다(FR-CMP-008 AC-2) |
| `children` | `ReactNode` | — | 예 | 원인과 영향을 서술하는 본문 |

- **variant**: 없음. — **tone**: `info`, `warning`, `danger`. — **size**: 없음.
- **이벤트**: 없음. 닫기 동작은 소비자가 `action` 슬롯에 `IconButton`을 넣어 구현한다.
- **상태**: `default`만 갖는다.
- **접근성 책임**: `role="alert"`(danger) 및 `role="status"`(info/warning) 부여는 **Conductor**가 수행한다(FR-A11Y-005 AC-2). 아이콘 `aria-hidden`도 **Conductor**가 부여한다. 메시지 문자열과 액션 내용은 **소비자**가 제공한다. Radix는 관여하지 않는다.
- **사용 규칙**: `tone="danger"`에는 항상 복구 액션을 넣는다. 배너는 페이지에 이미 존재하는 영역이며, 나타났다 사라지는 알림이 아니다.
- **금지**: 토스트/스낵바로 사용하지 않는다. 알림 큐 관리는 소비자 책임이다(FR-CMP-008 예외/실패 처리). `role`을 직접 덮어쓰지 않는다.
- **관련**: FR-CMP-008, FR-A11Y-005 / W-020, W-021.

#### C-061 EmptyState

- **책임**: 내용이 없는 이유와 다음 동작을 중앙 정렬로 제시한다.
- **CSS 클래스**: `cdt-empty-state`, `cdt-empty-state__icon`, `cdt-empty-state__title`, `cdt-empty-state__description`, `cdt-empty-state__action` (모두 구현됨).
  - **구현 상태**: `cdt-empty-state__action`은 규칙이 없어 `action` 슬롯이 설명 바로 아래에 붙어 렌더되던 상태였다. 규칙을 추가했다.
- **근거 CSS**:
  - `app.css:654-662` — `.empty-state` `text-align: center`, `color: var(--text-muted)`, `padding: var(--space-6)`, `display: flex; flex-direction: column; align-items: center`, `gap: var(--space-3)`.
  - **결정**: 소스는 제목과 설명의 타이포 구분을 정의하지 않는다. 제목은 `font.size.lg` + `text.primary`, 설명은 **font.size.md** + `text.muted`로 정의한다. `.page-heading p`(`app.css:366-371`)의 "본문은 `text.muted`" 처리를 근거로 삼는다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` | — | 예 | 빈 상태의 원인을 요약하는 제목 |
| `description` | `ReactNode` | — | 아니오 | 원인 서술 |
| `action` | `ReactNode` | — | 아니오 | 다음 동작 슬롯. 일반적으로 `Button`(C-001) |
| `icon` | `ReactNode` | — | 아니오 | 장식 아이콘. `aria-hidden="true"` 래퍼가 적용된다 |

- **variant / tone / size**: 없음.
- **이벤트**: 없음.
- **상태**: `default`만 갖는다.
- **접근성 책임**: 아이콘 `aria-hidden`은 **Conductor**가 부여한다. 제목의 표제 수준(`h2`/`h3`)은 **소비자**가 `title`에 헤딩 요소를 넣어 결정한다. Conductor는 표제 수준을 가정하지 않는다.
- **사용 규칙**: 목록이 비었을 때 `Table`(C-030) 대신 `EmptyState`를 렌더한다. 오류로 인한 빈 화면에는 `Banner tone="danger"`(C-060)를 함께 쓴다.
- **금지**: `EmptyState`를 로딩 표시로 쓰지 않는다. 로딩은 `Spinner`(C-064)를 쓴다.
- **관련**: FR-CMP-008 / W-020, W-021.

#### C-062 Meter

- **책임**: 임계값을 갖는 유한 범위의 값을 가로 막대로 표시한다.
- **CSS 클래스**: `cdt-meter`, `cdt-meter__track`, `cdt-meter__fill`, `cdt-meter__value`.
- **근거 CSS**:
  - `app.css:1308-1314` — `.linear-progress-bg` 반투명 흰색 트랙, `border-radius: 9999px`, `height: 8px`, `overflow: hidden`.
  - `app.css:1316-1320` — `.linear-progress-fill` `height: 100%`, 동일 반경, `transition: width 1s ..., background-color 0.5s ease`.
  - `tokens.css:41-43` — `--meter-normal`, `--meter-warning`, `--meter-exceeded`.
  - **결정**: 채움 폭은 `--cdt-meter-ratio` 커스텀 프로퍼티로 전달하고 CSS가 `transform: scaleX(var(--cdt-meter-ratio))`로 그린다(공통 계약 2.3-2항). 레이아웃 속성을 전환하지 않기 위해서다(DEV-031). 인라인 `style`로 색상을 주입하지 않는다.
  - **결정**: 소스 `transition` 시간 1s / 0.5s는 리터럴이다. `--cdt-motion-standard`로 통일한다. 모션 감소 설정에서는 0ms가 된다(FR-CSS-005 AC-1).
  - **결정**: 트랙 배경은 리터럴 반투명 흰색이다. `--cdt-surface-track` semantic 토큰을 요구한다. `state.hover`(`tokens.css:78`)와 값이 근접하지만 의미가 다르므로 별도 키로 둔다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | 예 | 현재 값 |
| `min` | `number` | `0` | 아니오 | 범위 하한 |
| `max` | `number` | `100` | 아니오 | 범위 상한 |
| `warningAt` | `number` | — | 아니오 | 이 값 이상에서 `meter.warning` 색으로 전환한다 |
| `exceededAt` | `number` | — | 아니오 | 이 값 이상에서 `meter.exceeded` 색으로 전환한다 |
| `valueText` | `string` | — | 예 | 수치 텍스트. 색상 외 전달 수단이다(FR-A11Y-003 AC-3) |
| `aria-label` | `string` | `Field`에서 상속 | 조건부 | `Field` 밖에서 쓰면 필수 |

- **variant / tone / size**: 없음. 색은 `value`와 임계값이 결정한다.
- **이벤트**: 없음.
- **상태**: `normal`, `warning`, `exceeded`.
- **접근성 책임**: `role="meter"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` 부여는 **Conductor**가 수행한다(FR-CMP-008 AC-4). 이름 문자열과 `valueText`는 **소비자**가 제공한다. Radix는 관여하지 않는다.
- **사용 규칙**: `valueText`가 필수이므로 임계 초과가 색 없이도 읽힌다.
- **금지**: 진행 중인 비동기 작업의 진행률에 쓰지 않는다. 그 용도는 `ProgressRing`(C-063)이다. 임계값 없이 색을 변화시키지 않는다.
- **관련**: FR-CMP-008, FR-TOK-005, FR-A11Y-003 / W-020, W-021.

#### C-063 ProgressRing

- **책임**: 0에서 100 사이의 진행률을 원형 궤도로 표시한다.
- **CSS 클래스**: `cdt-progress-ring`, `cdt-progress-ring__track`, `cdt-progress-ring__indicator`, `cdt-progress-ring__label`.
- **근거 CSS**:
  - `app.css:1298-1302` — `.progress-ring` `transition: stroke-dashoffset ..., stroke ...`, `transform: rotate(-90deg)`, `transform-origin: 50% 50%`. 12시 방향에서 시작하는 회전의 근거다.
  - `app.css:1304-1306` — `.progress-ring-bg` 반투명 흰색 `stroke`.
  - `app.css:1150-1153` — 모션 감소 설정에서 애니메이션 제거.
  - **결정**: `stroke-dashoffset`은 `--cdt-progress-ring-ratio` 커스텀 프로퍼티로 전달한다. 트랙 `stroke`는 `--cdt-surface-track`을 참조한다(C-062와 공유).
  - **결정**: 모션 감소 설정에서 애니메이션 대신 진행률 텍스트를 노출한다(FR-CSS-005 예외/실패 처리, FR-CMP-008 AC-5). 텍스트는 항상 DOM에 존재하며, 모션 감소가 아닐 때 `.cdt-progress-ring__label`이 시각적으로 표시된다. 텍스트를 조건부로 마운트하지 않는다(SSR 안전성, FR-DX-004 AC-3).

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `number` | — | 예 | 0 이상 `max` 이하의 진행률 |
| `max` | `number` | `100` | 아니오 | 범위 상한 |
| `valueText` | `string` | — | 예 | 진행률 텍스트. 모션 감소 설정에서 애니메이션을 대체한다 |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | 지름. `md`는 64px, `sm`은 40px |
| `aria-label` | `string` | — | 예 | 무엇의 진행률인지 서술한다 |

- **variant / tone**: 없음. — **size**: `sm`, `md`.
- **이벤트**: 없음.
- **상태**: `default`, `reduced-motion`(정적 진행률 텍스트).
- **접근성 책임**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` 부여는 **Conductor**가 수행한다. SVG 요소에 `aria-hidden="true"`를 부여하고 이름은 래퍼가 갖는다. 문자열은 **소비자**가 제공한다.
- **사용 규칙**: 진행률을 알 수 없는 작업에는 `Spinner`(C-064)를 쓴다.
- **금지**: `value`를 생략해 무한 회전을 만들지 않는다.
- **관련**: FR-CMP-008, FR-CSS-005, FR-A11Y-005 / W-020, W-021.

#### C-064 Spinner

- **책임**: 진행률을 알 수 없는 대기 상태를 회전 표시로 알린다.
- **CSS 클래스**: `cdt-spinner`, `cdt-spinner__label`.
- **근거 CSS**:
  - `app.css:969-971` — `@keyframes spin { to { transform: rotate(360deg) } }`. 소스에 `.spinner` 클래스는 없고 키프레임만 존재한다.
  - `app.css:1150-1153` — 모션 감소 설정 처리.
  - **결정**: 원형 궤도의 시각은 `ProgressRing`(C-063)의 트랙·인디케이터 구조를 재사용하되 `stroke-dasharray`를 고정하고 `spin` 키프레임을 적용한다. 두 컴포넌트는 동일한 `--cdt-surface-track`과 `--cdt-accent`를 소비한다.
  - **결정**: 모션 감소 설정에서 회전을 멈추고 `label` 텍스트를 노출한다(FR-CSS-005 예외/실패 처리). 정지한 원형 궤도만 남기면 대기 상태가 전달되지 않기 때문이다.
  - **결정**: 라벨의 화면 밖 숨김 규칙은 노출 규칙과 같은 `cdt.base` 레이어에 둔다. `cdt.component`에 두면 레이어 순서가 명시도를 이겨 노출이 한 번도 적용되지 않는다(DEV-029).
  - **결정**: 회전 주기는 전용 토큰 `motion.spin`(1000ms linear)이 정한다. UI 전환 토큰에 `linear`를 덧붙이면 단축 선언의 이징이 둘이 되어 선언 전체가 무효가 된다(DEV-028).

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` | — | 예 | 무엇을 대기 중인지 서술한다. 모션 감소 설정에서 시각적으로 노출된다 |
| `size` | `"sm" \| "md"` | `"md"` | 아니오 | 지름. `md`는 24px, `sm`은 16px |

- **variant / tone**: 없음. — **size**: `sm`, `md`.
- **이벤트**: 없음.
- **상태**: `default`, `reduced-motion`.
- **접근성 책임**: `role="status"`와 `aria-live="polite"` 부여는 **Conductor**가 수행한다. `label`은 모션 감소가 아닐 때 `cdt-sr-only`로 감춰지고 스크린리더에는 항상 노출된다. 문자열은 **소비자**가 제공한다.
- **사용 규칙**: 버튼 내부 대기에는 `Spinner`를 직접 넣지 않고 `Button loading`(C-001)을 쓴다. `Button`이 `loading` 동안 `iconStart` 자리에 `size="sm"` `Spinner`를 `aria-hidden`으로 그리며, 안내는 버튼의 `aria-busy`가 담당한다.
- **금지**: `Spinner`를 페이지 전체 차단 오버레이로 쓰지 않는다. 그 용도는 `Dialog`(C-040)다.
- **관련**: FR-CMP-008, FR-CSS-005, FR-A11Y-005 / W-020, W-021.

### 3.8 셸 컴포넌트군 (FR-CMP-009 / API-CMP-009, OD-004 조건부)

이 군은 우선순위 `Should`이며 OD-004가 2026-07-10에 "패키지에 포함"으로 종결되었다. C-070 ~ C-072는 `@conductor-by-89soone/react` 공개 진입점에 포함하며, 의존성 목록의 라우팅 라이브러리 0건을 유지한다(FR-CMP-009 AC-2). 이 조건이 깨지면 SRS 예외 처리에 따라 FR-CMP-009를 `deprecated`로 표시하고 세 컴포넌트를 문서 사이트 내부 컴포넌트로 강등한다.

#### C-070 AppShell

- **책임**: 사이드 내비게이션, 상단바, 본문 영역의 골격을 배치하고 건너뛰기 링크를 제공한다.
- **CSS 클래스**: `cdt-app-shell`, `cdt-app-shell__nav`, `cdt-app-shell__content`, `cdt-app-shell__main`, `cdt-app-shell__overlay`, `cdt-skip-link`.
- **근거 CSS**:
  - `app.css:131-135` — `.app-shell` `display: flex`, `min-height: 100vh`, `isolation: isolate`.
  - `app.css:14-19` — indigo와 teal의 저농도 radial glow가 base surface 위에 놓인다. CR-031은 이를 `surface.tint.1`/`.2` 장식 토큰과 AppShell background로 일반화한다.
  - `app.css:137-147` — `.app-nav-wrapper` 폭 272px, `position: sticky`, `height: 100vh`, `z-index: 30`.
  - `app.css:252-257` — `.app-content-wrapper` `flex: 1`, 세로 방향, `min-width: 0`.
  - `app.css:338-344` — `.app-main` `flex: 1`, `padding: clamp(24px, 4vw, 48px)`, `max-width: 1480px`, 중앙 정렬.
  - `app.css:113-128` — `.skip-link` 화면 밖 고정 배치, `:focus`에서 화면 안으로 이동.
  - `app.css:989-1003` — 뷰포트 800px 미만에서 `.app-nav-wrapper`가 `position: fixed`로 전환되고 `translateX(-105%)`로 숨겨지며, `[data-open="true"]`에서 노출된다. FR-CMP-009 AC-3 오프캔버스의 근거다.
  - `app.css:1005-1014` — `.mobile-nav-overlay` `position: fixed; inset: 0`, 반투명 배경, `backdrop-filter: blur(4px)`, `z-index: 25`.
  - **결정**: `.app-nav-wrapper`의 `z-index: 30`은 `--cdt-z-drawer`(30)와 일치한다. `.mobile-nav-overlay`의 `25`는 스케일 밖이므로 `--cdt-z-sticky`(20)와 `--cdt-z-drawer`(30) 사이 값이 필요하다. 오버레이를 `--cdt-z-sticky`로 낮추면 상단바와 겹치므로, 오프캔버스 상태에서 내비 래퍼를 `--cdt-z-overlay`(40)로, 오버레이를 `--cdt-z-drawer`(30)로 올린다. `.skip-link`의 `z-index: 200`은 `--cdt-z-popover`(50)로 치환한다.
  - **결정**: 오프캔버스 상태의 Escape 닫기와 오버레이 클릭 닫기(FR-CMP-009 AC-3)는 Radix `Dialog`의 `modal={false}` 구성으로 구현한다. Conductor가 키 핸들러를 자체 작성하지 않는다(FR-CMP-006 AC-5).

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `nav` | `ReactNode` | — | 예 | 사이드 내비 내용. 일반적으로 `NavList`(C-071) |
| `topBar` | `ReactNode` | — | 아니오 | 상단바 내용. 일반적으로 `TopBar`(C-072) |
| `navOpen` | `boolean` | — | 아니오 | 오프캔버스 열림 상태(controlled) |
| `onNavOpenChange` | `(open: boolean) => void` | — | 아니오 | 열림 상태 변경 콜백 |
| `skipLinkLabel` | `string` | — | 예 | 건너뛰기 링크 텍스트. 다국어 문자열은 소비자가 제공한다 |
| `navCloseLabel` | `string` | `"Close navigation"` | 아니오 | 오프캔버스 스크림의 접근 가능한 이름. 스크림은 `<button>`이며 누르면 내비가 닫힌다 |
| `mainId` | `string` | `"cdt-main"` | 아니오 | 건너뛰기 링크의 대상 `id`. 본문 `<main>`에 부여된다 |
| `children` | `ReactNode` | — | 예 | 본문 내용 |

- **variant / tone / size**: 없음.
- **이벤트**: `onNavOpenChange`.
- **상태**: `default`, `nav-open`(뷰포트 800px 미만). 내비 래퍼에 `[data-open="true"]`가 부여된다.
- **접근성 책임**: 건너뛰기 링크 렌더와 본문 `<main id>` 연결, 포커스 이동은 **Conductor**가 수행한다(FR-CMP-009 AC-4). 오프캔버스의 포커스 트랩·Escape·포커스 복귀는 **Radix**가 제공한다. `<nav>`와 `<main>` landmark role은 **네이티브 요소**가 제공한다. 링크 문자열은 **소비자**가 제공한다.
- **사용 규칙**: 페이지당 `AppShell` 1개. 본문 영역의 최대 폭은 셸이 소유한다.
- **금지**: `AppShell`이 라우팅 상태를 읽지 않는다. 현재 경로 판정은 `NavList`(C-071)의 `items[].active`가 받는다.
- **관련**: FR-CMP-009, FR-CSS-002, FR-CSS-003, FR-A11Y-002 / W-001, W-021.

#### C-071 NavList

- **책임**: 내비게이션 항목 목록을 렌더하고, 링크 요소의 생성을 소비자에게 위임한다.
- **CSS 클래스**: `cdt-nav-list`, `cdt-nav-list__section-label`, `cdt-nav-list__item`, `cdt-nav-list__item--active`.
- **근거 CSS**:
  - `app.css:149-161` — `.app-nav` `display: flex; flex-direction: column`, `gap: 4px`, 경계 + 반경 + `overflow-y: auto`.
  - `app.css:200-207` — `.nav-section-label` `font-size: 10px`, `font-weight: 750`, `letter-spacing: 0.12em`, `text-transform: uppercase`, 색 `--text-faint`.
  - `app.css:209-221` — `.app-nav a` `min-height: 42px`, `padding: 9px 12px`, `border-radius: var(--radius-md)`, 색 `--text-muted`, `position: relative; overflow: hidden`.
  - `app.css:223-235` — `.app-nav a::before` 좌측 3px 활성 표시자. `transform: scaleY(0)` 기본.
  - `app.css:237-250` — hover 배경, `.active` 그라디언트 배경 + `::before`의 `scaleY(0.7)` + 글로우.
  - **결정**: `.app-nav a` 요소 셀렉터를 `.cdt-nav-list__item` 클래스 셀렉터로 옮긴다(FR-CSS-004 AC-1, AC-4). `renderLink`가 반환한 요소에 Conductor가 클래스를 병합한다.
  - **결정**: 소스의 `font-weight: 750`은 가변 폰트 축 값이다. 시스템 폰트 스택으로 대체되면 700으로 반올림된다(SRS 5.2 기술 제약 4). `--cdt-font-weight-section-label` component 토큰으로 노출한다.

```ts
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  section?: string;
}

export interface NavListProps {
  items: NavItem[];
  renderLink: (item: NavItem, props: NavLinkRenderProps) => ReactNode;
  "aria-label": string;
}

export interface NavLinkRenderProps {
  className: string;
  "aria-current": "page" | undefined;
  children: ReactNode;
}
```

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `items` | `NavItem[]` | — | 예 | 항목 목록. `section`이 같은 연속 항목은 하나의 구획 라벨 아래 묶인다 |
| `renderLink` | `(item, props) => ReactNode` | — | 예 | 링크 요소를 소비자가 생성한다. Conductor는 `className`, `aria-current`, `children`을 넘긴다(FR-CMP-009 AC-1) |
| `aria-label` | `string` | — | 예 | 내비게이션 목록의 접근 가능한 이름 |

- **variant / tone / size**: 없음.
- **이벤트**: 없음. 클릭 처리는 `renderLink`가 반환한 요소가 소유한다.
- **상태**: `default`, `hover`, `focus`, `active`(현재 경로).
- **접근성 책임**: `aria-current="page"` 계산과 전달은 **Conductor**가 수행한다(`item.active`에서 파생). 링크 요소의 role은 **소비자**가 `renderLink`에서 생성한 요소가 제공한다. 목록 이름은 **소비자**가 제공한다. 활성 표시자 `::before`는 장식이며 색상 외에 `aria-current`가 상태를 전달한다.
- **사용 규칙**: `renderLink`에서 라우터의 `Link` 컴포넌트를 반환한다. `props.className`을 그대로 전달해야 시각이 적용된다.
- **금지**: `NavList`가 `href` 비교로 활성 항목을 판정하지 않는다. 판정은 소비자가 `item.active`로 넘긴다. `@conductor-by-89soone/react`가 라우팅 라이브러리를 import하지 않는다(FR-CMP-009 AC-2).
- **관련**: FR-CMP-009, FR-A11Y-002, FR-A11Y-003 / W-001, W-021.

#### C-072 TopBar

- **책임**: 현재 위치의 맥락 문구와 전역 명령을 상단 고정 영역에 배치한다.
- **CSS 클래스**: `cdt-topbar`, `cdt-topbar__context`, `cdt-topbar__eyebrow`, `cdt-topbar__title`, `cdt-topbar__actions`, `cdt-topbar__menu-button`.
- **근거 CSS**:
  - `app.css:259-271` — `.app-topbar` `display: flex`, `justify-content: space-between`, `padding: 0 clamp(20px, 4vw, 48px)`, `min-height: 68px`, 반투명 배경 + `backdrop-filter: blur(20px) saturate(130%)`, 하단 1px 경계, `position: sticky; top: 0`, `z-index: 20`.
  - `app.css:273-276` — `.topbar-context` `display: grid`, `min-width: 0`.
  - `app.css:278-284` — `.topbar-eyebrow` `font-size: 10px`, `font-weight: 700`, `letter-spacing: 0.11em`, 대문자 변환, 색 `--text-faint`.
  - `app.css:286-293` — `.topbar-title` `font-size: 13px`, `font-weight: 600`, 말줄임 처리.
  - `app.css:295-298` — `.mobile-menu-button` 기본 `display: none`.
  - `app.css:1016-1024` — 뷰포트 800px 미만에서 메뉴 버튼 노출, 상단바 높이·패딩 축소.
  - `app.css:1080` — 뷰포트 560px 미만에서 `.topbar-context` 숨김.
  - **결정**: `z-index: 20`은 `--cdt-z-sticky`(20)와 일치한다. 그대로 사용한다.
  - **결정**: 상단바 배경은 리터럴 반투명 값이다(`app.css:265`). `--cdt-topbar-background` component 토큰으로 치환하고 `surface.glass`(`tokens.css:12`)를 참조한다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `eyebrow` | `ReactNode` | — | 아니오 | 제목 위 상위 맥락 문구 |
| `title` | `ReactNode` | — | 아니오 | 현재 위치 제목. 넘치면 말줄임 처리된다 |
| `actions` | `ReactNode` | — | 아니오 | 우측 명령 슬롯 |
| `menuButton` | `ReactNode` | — | 아니오 | 오프캔버스 내비 토글. 뷰포트 800px 미만에서만 표시된다 |

- **variant / tone / size**: 없음.
- **이벤트**: 없음. 메뉴 버튼의 `onClick`은 소비자가 `AppShell`의 `onNavOpenChange`에 연결한다.
- **상태**: `default`. 뷰포트 800px 미만에서 `menuButton`이 노출되고, 560px 미만에서 `eyebrow`와 `title`이 숨겨진다.
- **접근성 책임**: `<header>` landmark role은 **네이티브 요소**가 제공한다. `menuButton`의 `aria-expanded`와 `aria-controls`는 **소비자**가 `IconButton`에 전달한다. Conductor는 상단바 자체에 role을 부여하지 않는다.
- **사용 규칙**: `title`은 화면 제목이 아니라 현재 위치 표시다. 화면 제목은 본문의 `h1`이 소유한다.
- **금지**: `TopBar`에 `h1`을 넣지 않는다. `title`이 560px 미만에서 숨겨지므로, 유일한 제목 출처로 삼지 않는다.
- **관련**: FR-CMP-009, FR-CSS-003 / W-001, W-021.

## 4. 중복 방지 규칙

새 컴포넌트를 제안하기 전에 아래 체크리스트를 위에서 아래로 통과시킨다. 하나라도 "예"이면 새 컴포넌트를 만들지 않는다.

| # | 확인 질문 | "예"일 때의 조치 |
| --- | --- | --- |
| D-1 | FR-CMP-002 ~ FR-CMP-009에 이 컴포넌트가 승인되어 있는가? "아니오"인가? | 승인되지 않았다면 CR을 열어 FR을 먼저 추가한다. 문서에 컴포넌트를 먼저 쓰지 않는다 |
| D-2 | 기존 컴포넌트의 `variant` 값 추가로 해결되는가? | `variant`를 추가한다. 예: `Card`의 대화형 모드는 별도 `InteractiveCard`가 아니다 |
| D-3 | 기존 컴포넌트의 `tone` 값 추가로 해결되는가? | `tone`을 추가한다. 예: 위험 배너는 `DangerBanner`가 아니라 `Banner tone="danger"`다 |
| D-4 | 기존 컴포넌트의 `size` 값 추가로 해결되는가? | `size`를 추가한다. `size` 집합은 `sm \| md` 2종을 넘지 않는다 |
| D-5 | 기존 컴포넌트에 슬롯(`icon`, `action`, `marker`, `indicator`) props를 추가하면 되는가? | 슬롯을 추가한다. 예: 배너의 복구 버튼은 `BannerAction`이 아니라 `action` 슬롯이다 |
| D-6 | 둘 이상의 기존 컴포넌트를 합성하면 되는가? | 소비자 코드에서 합성한다. 예: `IconButton` + `Tooltip`은 `TooltipIconButton`이 아니다 |
| D-7 | `cdt.layout` 레이어의 클래스로 해결되는가? | 레이아웃 클래스를 쓴다(FR-CSS-003). 레이아웃은 컴포넌트가 아니다 |
| D-8 | Radix가 이미 동일한 동작을 제공하는가? | Radix 프리미티브를 감싼다. 동작을 자체 구현하지 않는다(FR-CMP-006 AC-5) |
| D-9 | 제품 도메인 지식(실행, 승인, 스레드, 도구)을 요구하는가? | 소비자 애플리케이션에 남긴다. Conductor는 도메인 컴포넌트를 배포하지 않는다(SRS 4.3) |
| D-10 | 데이터 로직(정렬, 페이징, 검증, 페칭, 알림 큐)을 요구하는가? | 소비자에게 남긴다. Conductor는 표시 계층만 갖는다 |

체크리스트를 모두 "아니오"로 통과한 경우에만 다음을 수행한다.

1. `srs_final.md` 9.4절에 FR을 추가하는 CR을 연다.
2. `glossary.md`에 컴포넌트 이름을 표준 용어로 등록한다.
3. 이 문서의 3절에 컴포넌트 ID를 부여하고 카탈로그 항목을 추가한다.
4. `requirements_screen_traceability_matrix.md`에 FR-화면 매핑을 추가한다.
5. 단위 테스트와 공유 계약 스위트 등록을 완료한다(FR-QA-002 AC-1).

이름 충돌 검사: 새 이름이 기존 컴포넌트의 금지 동의어인지 `glossary.md` 2.3절에서 확인한다. `AppTopBar`, `LeftNavPanel`, `InspectorPanel`, `ErrorBanner`는 각각 `TopBar`(C-072), `NavList`(C-071), `Panel`(C-012), `Banner`(C-060)의 금지 동의어다.

## 5. 접근성 책임 분담표

각 셀은 role / accessible name / state를 제공하는 주체를 뜻한다. `—`는 해당 컴포넌트가 그 주체에게 아무 책임도 위임하지 않음을 뜻한다.

| ID | 컴포넌트 | Radix가 제공 | Conductor가 제공 | 소비자가 제공 |
| --- | --- | --- | --- | --- |
| C-001 | Button | — | `aria-busy`, `title`(차단 사유), disabled 시각 | 라벨 텍스트, `blockedReason` 문자열 |
| C-002 | IconButton | — | 아이콘 `aria-hidden`, `aria-busy` | `aria-label`(타입 필수) |
| C-010 | Card | — | 중첩 대화형 요소 경고, 요소 선택(`div`/`button`/`a`) | 카드 내용 또는 `aria-label` |
| C-011 | CardGrid | — | — | `role="list"`가 필요하면 직접 전달 |
| C-012 | Panel | — | — | `as` 선택, `aria-label` |
| C-020 | Badge | — | 아이콘 `aria-hidden` | 라벨 텍스트 |
| C-021 | StatusBadge | — | 아이콘 `aria-hidden`, 색·아이콘·텍스트 3채널 강제 | `icon` 노드, `label` 문자열 |
| C-022 | SeverityTag | — | 아이콘 `aria-hidden`, 3채널 강제 | `icon` 노드, `label` 문자열 |
| C-030 | Table | — | `caption`/`aria-label` 누락 경고 | `caption` 또는 `aria-label`, `scope` |
| C-031 | Timeline | — | `aria-current="step"`, 마커 `aria-hidden`, 포커스 링 클리핑 회피 | 목록 `aria-label`, 단계 내용 |
| C-032 | CodeBlock | — | 스크롤 영역 `tabIndex={0}`, `role="region"` | `aria-label` |
| C-033 | Kbd | — | — | 키 이름 텍스트 |
| C-040 | Dialog | role=`dialog`, `aria-modal`, 포커스 트랩, Escape, 포커스 복귀, 스크롤 잠금 | `z-index` 토큰, 시각 | `Dialog.Title` 텍스트 |
| C-041 | Drawer | role=`dialog`, 포커스 트랩, Escape, 포커스 복귀, 스크롤 잠금 | `side` 시각, `z-index` 토큰 | `Drawer.Title` 텍스트 |
| C-042 | Tooltip | role=`tooltip`, `aria-describedby`, hover+focus 열림, Escape | 시각, `[data-side]` 애니메이션 | 설명 텍스트, 포커스 가능한 트리거 |
| C-043 | DropdownMenu | role=`menu`/`menuitem`, 방향키, 타이핑 검색, Escape, 포커스 복귀 | 아이콘 `aria-hidden`, `[data-highlighted]` 시각 | 항목 텍스트, `onSelect` |
| C-050 | Field | — | `htmlFor`/`id` 연결, `aria-describedby`, `aria-invalid`, `useId()` | 라벨·설명·오류 문자열 |
| C-051 | TextField | — | 라벨 누락 경고, `aria-invalid` 상속 | `Field` 사용 또는 `aria-label` |
| C-052 | TextArea | — | 라벨 누락 경고, `aria-invalid` 상속 | `Field` 사용 또는 `aria-label` |
| C-053 | Select | role=`combobox`/`listbox`/`option`, 방향키, Escape, `aria-expanded`, `aria-selected` | 시각, `[data-highlighted]` | 선택지 텍스트, `Field` 사용 |
| C-054 | Switch | role=`switch`, `aria-checked`, Space 토글, 숨은 `input` | 히트 영역 40px, 시각 | `Field` 사용 또는 `aria-label` |
| C-055 | Checkbox | role=`checkbox`, `aria-checked="mixed"`, Space 토글, 숨은 `input` | 표시 `aria-hidden`, 히트 영역 40px | `Field` 사용 또는 `aria-label` |
| C-060 | Banner | — | `role="alert"`(danger) / `role="status"`, 아이콘 `aria-hidden`, danger의 액션 누락 경고 | 메시지 텍스트, 복구 액션 |
| C-061 | EmptyState | — | 아이콘 `aria-hidden` | 표제 수준(`h2`/`h3`), 문자열 |
| C-062 | Meter | — | `role="meter"`, `aria-valuenow`/`min`/`max`/`valuetext` | `aria-label`, `valueText` |
| C-063 | ProgressRing | — | `role="progressbar"`, `aria-value*`, SVG `aria-hidden`, 모션 감소 텍스트 | `aria-label`, `valueText` |
| C-064 | Spinner | — | `role="status"`, `aria-live="polite"`, 모션 감소 텍스트 | `label` 문자열 |
| C-070 | AppShell | 오프캔버스 포커스 트랩, Escape, 포커스 복귀 | 건너뛰기 링크, `<main id>` 연결, 포커스 이동 | `skipLinkLabel` 문자열 |
| C-071 | NavList | — | `aria-current="page"` 계산·전달 | 링크 요소(`renderLink`), 목록 `aria-label`, `item.active` |
| C-072 | TopBar | — | — | `menuButton`의 `aria-expanded`/`aria-controls` |

교차 규칙:

1. Conductor가 Radix의 `role` 또는 `aria-*`를 덮어쓴 건수는 0건이어야 한다(FR-A11Y-005 AC-4).
2. 포커스 트랩·롤 관리·키보드 내비게이션의 Conductor 자체 구현 건수는 0건이어야 한다(FR-CMP-006 AC-5). 표에서 "Radix가 제공" 열이 비어 있는 컴포넌트는 이 세 동작을 필요로 하지 않는다.
3. 모든 문자열은 소비자가 제공한다. Conductor는 기본 문자열을 갖지 않는다(SRS 4.3 다국어 문자열 시스템 제외).
4. 장식 아이콘의 `aria-hidden="true"`는 예외 없이 Conductor가 부여한다(FR-A11Y-005 AC-3).
5. 모든 대화형 요소의 `:focus-visible` `box-shadow` 계산값은 `--cdt-focus-ring`으로 동일하다(FR-A11Y-001 AC-1).

## 6. 컴포넌트-토큰 매핑

component 토큰은 semantic 토큰만 참조한다(FR-TOK-002 AC-3). 아래 표의 "참조하는 semantic 토큰" 열은 각 component 토큰이 해석되는 대상이다. 그라디언트처럼 단일 값으로 표현되지 않는 시각은 component 토큰의 값이 두 개 이상의 semantic 토큰을 합성한 결과이며, 색상 리터럴을 포함하지 않는다.

### 6.1 전 컴포넌트가 공유하는 semantic 토큰

| 토큰 | 용도 | 적용 컴포넌트 |
| --- | --- | --- |
| `--cdt-focus-ring` | `:focus-visible` 표시 | 대화형 요소 전부 (C-001, C-002, C-010, C-031, C-032, C-040 ~ C-043, C-051 ~ C-055, C-070, C-071) |
| `--cdt-motion-fast` | hover/focus 전환 | C-001, C-002, C-010, C-030, C-031, C-051 ~ C-054, C-071 |
| `--cdt-motion-standard` | 진입·퇴장·값 전환 | C-040, C-041, C-042, C-062, C-063, C-070 |
| `--cdt-border-subtle` / `-default` / `-strong` | 경계 3단계 | C-010, C-012, C-030, C-031, C-033, C-042, C-051 ~ C-055, C-070, C-072 |
| `--cdt-text-primary` / `-secondary` / `-muted` / `-faint` | 전경 4단계 | 전 컴포넌트 |
| `--cdt-space-2` ~ `--cdt-space-6` | 내부 간격 | 전 컴포넌트 |
| `--cdt-radius-xs` ~ `--cdt-radius-xl`, `--cdt-radius-pill` | 반경 | 전 컴포넌트 |
| `--cdt-z-sticky` / `-drawer` / `-overlay` / `-popover` | 겹침 순서 | C-040 ~ C-043, C-053, C-070, C-072 |

### 6.2 컴포넌트별 component 토큰

| 컴포넌트 | component 토큰 | 참조하는 semantic 토큰 |
| --- | --- | --- |
| C-001 Button | `--cdt-button-neutral-background`, `--cdt-button-neutral-border`, `--cdt-button-neutral-text`, `--cdt-button-neutral-background-hover`, `--cdt-button-primary-background`, `--cdt-button-primary-text`, `--cdt-button-primary-shadow`, `--cdt-button-tone-danger-border`, `--cdt-button-tone-danger-text`, `--cdt-button-disabled-background`, `--cdt-button-disabled-text`, `--cdt-button-blocked-background`, `--cdt-button-blocked-border`, `--cdt-button-blocked-text` | `surface.raised`, `surface.elevated`, `border.strong`, `border.default`, `text.primary`, `text.muted`, `accent`, `accent.strong`, `elevation.accent`, `status.danger`, `state.disabled`, `state.disabledPolicy` |
| C-002 IconButton | C-001의 토큰을 그대로 소비한다. 고유 토큰 없음 | — |
| C-010 Card | `--cdt-card-background`, `--cdt-card-border`, `--cdt-card-border-hover`, `--cdt-card-shadow`, `--cdt-card-shadow-hover`, `--cdt-card-padding` | `surface.raised`, `surface.canvas`, `border.default`, `border.strong`, `elevation.raised`, `elevation.hover`, `space.5` |
| C-011 CardGrid | 없음. `cdt.layout` 레이어가 `space.5`를 직접 소비한다 | `space.5` |
| C-012 Panel | `--cdt-panel-background`, `--cdt-panel-border`, `--cdt-panel-padding` | `surface.timeline`, `border.default`, `space.5` |
| C-020 Badge | `--cdt-badge-<tone>-background`, `--cdt-badge-<tone>-border`, `--cdt-badge-<tone>-text` (tone 6종) | `accent`, `status.running`, `status.success`, `status.waiting`, `status.danger`, `text.muted`, `border.default` |
| C-021 StatusBadge | `--cdt-status-badge-<status>-background`, `--cdt-status-badge-<status>-border`, `--cdt-status-badge-<status>-text` (status 7종) | `status.queued`, `status.running`, `status.waiting`, `status.success`, `status.partial`, `status.danger`, `status.neutralEnd` |
| C-022 SeverityTag | `--cdt-severity-tag-<severity>-background`, `--cdt-severity-tag-<severity>-text` (severity 4종) | `severity.read`, `severity.write`, `severity.destructive`, `severity.blocked`, `text.primary` |
| C-030 Table | `--cdt-table-header-text`, `--cdt-table-header-border`, `--cdt-table-cell-border`, `--cdt-table-row-background-hover` | `text.muted`, `border.default`, `state.hover` |
| C-031 Timeline | `--cdt-timeline-background`, `--cdt-timeline-border`, `--cdt-timeline-step-background-hover`, `--cdt-timeline-marker-background`, `--cdt-timeline-marker-ring`, `--cdt-timeline-marker-border` | `surface.timeline`, `border.default`, `state.hover`, `accent`, `accent.glow` |
| C-032 CodeBlock | `--cdt-code-block-background`, `--cdt-code-block-border`, `--cdt-code-block-text` | `surface.timeline`, `border.default`, `text.monoPayload` |
| C-033 Kbd | `--cdt-kbd-background`, `--cdt-kbd-border`, `--cdt-kbd-border-bottom`, `--cdt-kbd-text` | `surface.raised`, `border.default`, `border.strong`, `text.secondary` |
| C-040 Dialog | `--cdt-overlay-background`, `--cdt-dialog-background`, `--cdt-dialog-border`, `--cdt-dialog-shadow` | `surface.overlay`, `surface.raised`, `border.strong`, `elevation.overlay` |
| C-041 Drawer | `--cdt-overlay-background`, `--cdt-drawer-background`, `--cdt-drawer-shadow`, `--cdt-drawer-padding` | `surface.overlay`, `surface.raised`, `elevation.overlay`, `space.6` |
| C-042 Tooltip | `--cdt-tooltip-background`, `--cdt-tooltip-text`, `--cdt-tooltip-border`, `--cdt-tooltip-arrow-fill`, `--cdt-tooltip-shadow` | `surface.overlay`, `surface.glass`, `text.primary`, `border.strong`, `elevation.overlay` |
| C-043 DropdownMenu | `--cdt-menu-background`, `--cdt-menu-border`, `--cdt-menu-shadow`, `--cdt-menu-item-background-highlighted`, `--cdt-menu-item-text-highlighted`, `--cdt-menu-item-tone-danger-text` | `surface.glass`, `border.strong`, `elevation.overlay`, `accent`, `text.inverse`, `status.danger` |
| C-050 Field | `--cdt-field-label-text`, `--cdt-field-description-text`, `--cdt-field-error-text`, `--cdt-field-required-text`, `--cdt-field-gap` | `text.muted`, `status.danger`, `space.2` |
| C-051 TextField | `--cdt-input-background`, `--cdt-input-border`, `--cdt-input-border-hover`, `--cdt-input-border-focus`, `--cdt-input-background-focus`, `--cdt-input-text`, `--cdt-input-placeholder`, `--cdt-input-border-invalid`, `--cdt-input-glass-background`, `--cdt-input-glass-background-hover`, `--cdt-input-glass-background-focus` | `surface.canvas`, `surface.tint.1`, `surface.tint.2`, `surface.tint.3`, `border.default`, `border.strong`, `accent`, `text.primary`, `text.faint`, `status.danger` |
| C-052 TextArea | C-051의 토큰을 그대로 소비한다. 고유 토큰 없음 | — |
| C-053 Select | `--cdt-select-trigger-background`, `--cdt-select-trigger-background-hover`, `--cdt-select-trigger-border`, `--cdt-select-content-background`, `--cdt-select-content-border`, `--cdt-select-item-background-highlighted`, `--cdt-select-item-text-highlighted` | `surface.tint.1`, `surface.tint.2`, `surface.glass`, `border.default`, `border.strong`, `accent`, `text.inverse`, `elevation.overlay` |
| C-054 Switch | `--cdt-switch-track-background`, `--cdt-switch-track-background-checked`, `--cdt-switch-track-border`, `--cdt-switch-thumb-background`, `--cdt-switch-thumb-shadow` | `surface.tint.2`, `accent`, `border.default`, `text.primary` |
| C-055 Checkbox | `--cdt-checkbox-background`, `--cdt-checkbox-background-checked`, `--cdt-checkbox-border`, `--cdt-checkbox-indicator-color` | `surface.tint.1`, `accent`, `border.default`, `text.inverse` |
| C-060 Banner | `--cdt-banner-<tone>-background`, `--cdt-banner-<tone>-border`, `--cdt-banner-<tone>-text` (tone 3종) | `status.running`, `status.waiting`, `status.danger` |
| C-061 EmptyState | `--cdt-empty-state-title-text`, `--cdt-empty-state-description-text`, `--cdt-empty-state-padding` | `text.primary`, `text.muted`, `space.6` |
| C-062 Meter | `--cdt-feedback-meter-track-background`, `--cdt-feedback-meter-fill-normal`, `--cdt-feedback-meter-fill-warning`, `--cdt-feedback-meter-fill-exceeded`, `--cdt-feedback-meter-height` | `surface.track`, `meter.normal`, `meter.warning`, `meter.exceeded` |
| C-063 ProgressRing | `--cdt-progress-ring-track-stroke`, `--cdt-progress-ring-indicator-stroke`, `--cdt-progress-ring-label-text` | `surface.track`, `accent`, `text.primary` |
| C-064 Spinner | `--cdt-spinner-track-stroke`, `--cdt-spinner-indicator-stroke` | `surface.track`, `accent` |
| C-070 AppShell | `--cdt-app-shell-background`, `--cdt-app-shell-nav-width`, `--cdt-app-shell-main-max-width`, `--cdt-app-shell-overlay-background`, `--cdt-skip-link-background`, `--cdt-skip-link-text` | `surface.base`, `surface.tint.1`, `surface.tint.2`, `surface.overlay`, `accent`, `text.inverse` |
| C-071 NavList | `--cdt-nav-list-background`, `--cdt-nav-list-border`, `--cdt-nav-item-text`, `--cdt-nav-item-text-active`, `--cdt-nav-item-background-hover`, `--cdt-nav-item-background-active`, `--cdt-nav-item-indicator`, `--cdt-nav-section-label-text`, `--cdt-font-weight-section-label` | `surface.raised`, `surface.canvas`, `border.subtle`, `text.muted`, `text.primary`, `state.hover`, `state.selected`, `accent`, `accent.soft`, `text.faint` |
| C-072 TopBar | `--cdt-topbar-background`, `--cdt-topbar-border`, `--cdt-topbar-eyebrow-text`, `--cdt-topbar-title-text`, `--cdt-topbar-min-height` | `surface.glass`, `border.subtle`, `text.faint`, `text.secondary` |

### 6.3 이 문서가 `@conductor-by-89soone/tokens`에 요구하는 신규 semantic 토큰

아래 4개 키는 `tokens.css`에 존재하지 않으나 컴포넌트 구현에 필요하다. `packages/tokens/src/`에 정의하고 두 테마 모두에 값을 부여한다(FR-QA-001 AC-1).

| 키 | 필요한 이유 | 근거 |
| --- | --- | --- |
| `radius.pill` | `border-radius: 9999px`의 리터럴 제거 | `app.css:501`(`.badge`), `app.css:1273`(`.SwitchRoot`), `app.css:1310`(`.linear-progress-bg`) |
| `surface.track` | 진행 표시의 반투명 트랙 배경 | `app.css:1305`(`.progress-ring-bg`), `app.css:1309`(`.linear-progress-bg`) |
| `surface.tint.1` / `.2` / `.3` | 폼 컨트롤의 반투명 배경 3단계 | `app.css:714`, `app.css:1155`, `app.css:1159`(`.input-glass` 기본/hover/focus), `app.css:1226`, `app.css:1232`(`.SelectTrigger`) |
| `elevation.accent` | 강조 버튼의 색 있는 그림자 | `app.css:468`(`.btn-primary`), `app.css:474`(hover) |

`font.weight.*` 스케일은 FR-TOK-007이 다루지 않으므로, `--cdt-font-weight-section-label`은 component 토큰으로 두고 semantic 토큰을 신설하지 않는다.



