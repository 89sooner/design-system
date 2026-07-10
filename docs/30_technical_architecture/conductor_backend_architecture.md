# Conductor Design System 빌드 파이프라인 아키텍처

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 0. 문서 재해석

이 문서는 표준 아키텍처 문서 세트의 `backend_architecture.md` 자리를 차지하지만, Conductor Design System에는 서버 런타임, 도메인 API 서비스, 데이터베이스, 메시지 큐, 인증 서버가 존재하지 않는다(`srs_final.md` 4.3 Out of Scope, 5.1 가정 4). 이 제품이 배포하는 것은 3개 npm 패키지(`@conductor/tokens`, `@conductor/css`, `@conductor/react`)와 1개 정적 문서 사이트뿐이다.

따라서 이 문서는 "백엔드 아키텍처"를 **빌드 파이프라인 아키텍처**로 재해석한다: 토큰 소스에서 최종 배포 산출물에 이르는 4단계 빌드(토큰 → CSS → React → 문서 정적 빌드)의 모듈 경계, 각 단계의 입출력과 실패 처리, 순서 강제 방식, 그리고 빌드 시점에 실행되는 해석·검사 알고리즘을 정의한다. `actor context`, `permission check`, `idempotency key`, `audit event` 같은 런타임 백엔드 개념은 이 제품에 적용되지 않으므로 이 문서에 포함하지 않는다.

## 1. 목적

토큰 빌드, CSS 빌드, React 빌드, 문서 정적 빌드 각 단계의 모듈 책임과 FR 매핑을 정의하고, 빌드 순서 강제(FR-DX-001), 토큰 참조 해석과 순환 검출(FR-TOK-003), CSS 커스텀 프로퍼티 접두사 검사(FR-TOK-004), 대비 검사(FR-THM-004), 토큰 리터럴 린트(FR-TOK-001)의 구현 방식을 코딩 에이전트가 그대로 구현할 수 있는 수준으로 명세한다.

## 2. 파이프라인 개요

```text
packages/tokens/src/  ──[JOB-BUILD-001]──>  packages/tokens/dist/
                                                   │
                                                   v
packages/css/src/     ──[JOB-BUILD-002]──>  packages/css/dist/
                                                   │
                                                   v
packages/react/src/   ──[JOB-BUILD-003]──>  packages/react/dist/
                                                   │
                                                   v
packages/docs/src/    ──[JOB-BUILD-004]──>  packages/docs/dist/  (정적 사이트)
```

각 단계는 선행 단계의 `dist/` 산출물만을 입력으로 소비한다. 소스 상대경로 참조(예: `packages/react`가 `packages/css/src/*.css`를 직접 import)는 금지되며, 각 패키지는 선행 패키지를 workspace 의존성(`workspace:*`)으로 선언해 `dist/`를 통해서만 소비한다(FR-DX-001 AC-4).

| 단계 | Job ID | 패키지 | 관련 FR |
| --- | --- | --- | --- |
| 토큰 빌드 | JOB-BUILD-001 | `packages/tokens` | FR-TOK-001~009, FR-THM-001, FR-THM-002, FR-THM-004 |
| CSS 빌드 | JOB-BUILD-002 | `packages/css` | FR-CSS-001~005, FR-TOK-009(브레이크포인트 치환) |
| React 빌드 | JOB-BUILD-003 | `packages/react` | FR-CMP-001~009, FR-DX-002, FR-DX-003, FR-DX-004 |
| 문서 정적 빌드 | JOB-BUILD-004 | `packages/docs` | FR-DOC-001~007 |

## 3. 단계별 모듈 맵

### 3.1 토큰 빌드 (JOB-BUILD-001)

| 항목 | 내용 |
| --- | --- |
| 책임 모듈 | `packages/tokens/scripts/build.ts` (bin: `conductor-build-tokens`, API-TOK-001) |
| 입력 | `packages/tokens/src/primitive/*.ts`, `packages/tokens/src/semantic/*.ts`, `packages/tokens/src/component/*.ts`, `packages/tokens/src/contrast-pairs.ts` |
| 출력 | `dist/tokens.css`, `dist/tokens.js`, `dist/tokens.d.ts`, `dist/tokens.json`, `dist/breakpoints.js`, `dist/breakpoints.d.ts` |
| 처리 순서 | ① 토큰 소스 파싱 → ② 계층 검사(FR-TOK-002) → ③ 참조 해석과 순환 검출(FR-TOK-003) → ④ CSS 커스텀 프로퍼티 산출과 접두사 검사(FR-TOK-004) → ⑤ TypeScript/JSON 산출(FR-TOK-006) → ⑥ 브레이크포인트 리터럴 고정(FR-TOK-009) |
| 실패 처리 | 5절(참조 해석)에서 오류가 발생하면 이후 단계를 실행하지 않고 `dist/`에 어떤 파일도 쓰지 않는다(FR-TOK-003 예외 처리: 부분 산출물 금지). 기존 `dist/`도 덮어쓰지 않는다. |

### 3.2 CSS 빌드 (JOB-BUILD-002)

| 항목 | 내용 |
| --- | --- |
| 책임 모듈 | `packages/css/scripts/build.ts` |
| 입력 | `packages/css/src/reset.css`, `base.css`, `layout.css`, `component.css`, `utility.css` + `packages/tokens/dist/tokens.css`(빌드 시 참조, 산출물에는 커스텀 프로퍼티 선언만 병합) + `packages/tokens/dist/breakpoints.js`(미디어쿼리 리터럴 치환용) |
| 출력 | `dist/index.css`(reset+base+layout+component+utility 전 레이어 포함), `dist/component.css`(reset 레이어 제외, FR-CSS-002 예외 처리) |
| 처리 순서 | ① 5개 레이어를 고정 순서로 연결(FR-CSS-001) → ② `--cdt-*` 외 커스텀 프로퍼티 선언 여부 검사 → ③ `breakpoint.*` 참조를 `packages/tokens/dist/breakpoints.js` 값으로 리터럴 치환(FR-TOK-009 AC-2) → ④ `!important` 및 구조 셀렉터(`>`, `+`, `:nth-child`) 정적 검사(FR-CSS-004 AC-4) |
| 실패 처리 | ②~④ 위반이 1건이라도 있으면 종료 코드 1과 위반 규칙·파일·라인을 출력하고 `dist/`를 쓰지 않는다. |

### 3.3 React 빌드 (JOB-BUILD-003)

| 항목 | 내용 |
| --- | --- |
| 책임 모듈 | `packages/react/scripts/build.ts`(번들러) + `tsc --emitDeclarationOnly`(타입) |
| 입력 | `packages/react/src/**/*.tsx`, `packages/react/src/**/*.ts` + `packages/tokens/dist`(타입·값 참조) + `packages/css` 클래스 이름 규칙(빌드 의존은 아니나 순서상 후행) |
| 출력 | `dist/index.js`(ESM), `dist/index.d.ts`, 컴포넌트별 청크(트리쉐이킹 대상) |
| 처리 순서 | ① 공유 계약 테스트 스위트 통과 확인(FR-CMP-001 AC-5, 빌드 전제조건) → ② 번들 생성(`sideEffects: false` 전제, FR-DX-003) → ③ 타입 선언 생성과 `any` 검출(FR-DX-002 AC-2) → ④ SSR 안전성 정적 검사: 모듈 최상위에서 `window`/`document`/`localStorage` 참조 검출(FR-DX-004) |
| 실패 처리 | ③에서 `any`가 1건이라도 발견되면 해당 패키지 배포를 중단한다(FR-DX-002 예외 처리). ④에서 위반이 발견되면 위반 파일과 라인을 출력하고 빌드를 실패시킨다. |

### 3.4 문서 정적 빌드 (JOB-BUILD-004)

| 항목 | 내용 |
| --- | --- |
| 책임 모듈 | `packages/docs/scripts/build.ts`(정적 사이트 생성기) |
| 입력 | `@conductor/react`, `@conductor/css`(소비자로서 설치, FR-DOC-001 AC-1), `packages/tokens/dist/tokens.json`, `packages/docs/src/**/*.mdx`(사용 규칙·정적 페이지) |
| 출력 | `dist/`(정적 HTML/JS/CSS 번들, 서버 런타임 없이 배포 가능) |
| 처리 순서 | ① `@conductor/react`의 공개 진입점에서 export된 컴포넌트 목록과 `packages/docs/src/catalog/**`의 카탈로그 페이지 목록을 대조(FR-DOC-003 AC-5) → ② Foundations 페이지를 `tokens.json`에서 생성(FR-DOC-002) → ③ props 표를 `@conductor/react`의 `.d.ts`에서 추출해 생성(FR-DOC-003 AC-2) → ④ 정적 빌드 실행(외부 도메인 네트워크 요청 0건 검증 포함, FR-DOC-001 AC-4) |
| 실패 처리 | ①에서 카탈로그 페이지가 없는 공개 컴포넌트가 발견되면 빌드가 실패하고 누락된 컴포넌트 이름을 출력한다(FR-DOC-003 AC-5). |

## 4. 순서 강제 (FR-DX-001)

빌드 순서는 두 겹으로 강제한다.

**① 명시적 순차 실행.** 루트 `package.json`의 `build` 스크립트는 4개 패키지를 고정 순서로 순차 호출한다.

```json
{
  "scripts": {
    "build": "node scripts/check-build-order.mjs && pnpm --filter @conductor/tokens run build && pnpm --filter @conductor/css run build && pnpm --filter @conductor/react run build && pnpm --filter @conductor/docs run build"
  }
}
```

한 패키지 빌드가 0이 아닌 종료 코드를 반환하면 `&&` 체인이 즉시 중단되어 후속 패키지를 실행하지 않는다(FR-DX-001 예외 처리).

**② 역방향 의존 정적 검사.** `scripts/check-build-order.mjs`가 4개 패키지의 `package.json`의 `dependencies`를 읽어 허용된 방향(`tokens ← css ← react ← docs`)만 존재하는지 검사한다.

```ts
const ALLOWED_DEPS: Record<string, string[]> = {
  "@conductor/tokens": [],
  "@conductor/css": ["@conductor/tokens"],
  "@conductor/react": ["@conductor/tokens", "@conductor/css"],
  "@conductor/docs": ["@conductor/tokens", "@conductor/css", "@conductor/react"],
};

for (const [pkg, manifest] of packageManifests) {
  const deps = Object.keys(manifest.dependencies ?? {}).filter((d) => d.startsWith("@conductor/"));
  const forbidden = deps.filter((d) => !ALLOWED_DEPS[pkg].includes(d));
  if (forbidden.length > 0) {
    console.error(`error[BUILD-ORDER]: "${pkg}" declares forbidden dependency on ${forbidden.join(", ")}`);
    process.exitCode = 1;
  }
}
```

위반이 있으면 위반 패키지명과 금지된 의존 대상을 출력하고 종료 코드 1을 반환하며, 이후 빌드 단계는 실행되지 않는다(FR-DX-001 AC-1).

클린 체크아웃에서 `pnpm install && pnpm build`가 성공해야 하며(AC-2), 4코어 CI 러너 기준 전체 빌드가 3분 이내에 완료되어야 한다(AC-3, NFR-001).

## 5. 토큰 참조 해석기와 순환 검출 (FR-TOK-003)

참조 해석은 깊이 우선 탐색(DFS)으로 수행하며, 현재 경로(`path`)에 이미 등장한 키를 다시 방문하면 순환으로 판정한다.

```ts
interface TokenNode {
  value?: string;   // primitive tier: 리터럴 값
  alias?: string;   // semantic/component tier: 참조 대상 키
}

class TokenBuildError extends Error {}

function resolveToken(
  key: string,
  graph: Map<string, TokenNode>,
  path: string[] = [],
  depth = 0,
): string {
  if (depth > 10) {
    throw new TokenBuildError(`error[TOK-DEPTH]: reference depth exceeds 10 at "${key}"`);
  }
  if (path.includes(key)) {
    throw new TokenBuildError(
      `error[TOK-CYCLE]: circular token reference detected\n  ${[...path, key].join(" -> ")}`,
    );
  }
  const node = graph.get(key);
  if (!node) {
    throw new TokenBuildError(
      `error[TOK-MISSING]: "${path[path.length - 1] ?? "<root>"}" references unknown key "${key}"`,
    );
  }
  if (node.value !== undefined) {
    return node.value;
  }
  return resolveToken(node.alias!, graph, [...path, key], depth + 1);
}
```

`{ "surface.2": "{surface.subtle}" }` 형태의 참조 문법(FR-TOK-003 AC-1)은 파싱 단계에서 `{<key>}` 패턴을 `alias: "<key>"`로 정규화한 뒤 위 `resolveToken`에 전달된다. 참조 깊이는 10단계까지 허용하고(AC-2), 순환이 발견되면 종료 코드 1과 함께 `a -> b -> c -> a` 형식의 경로를 stderr에 출력한다(AC-3). 존재하지 않는 키를 참조하면 참조원과 대상 키를 함께 출력한다(AC-4).

해석 전체가 성공할 때까지 `dist/`에 어떤 파일도 쓰지 않는다(FR-TOK-003 예외 처리: 부분 산출물 금지, 기존 산출물 보존). 구현은 전체 토큰 그래프를 메모리 상에서 해석해 `Map<string, string>`(키 → 최종 값)을 완성한 뒤, 오류가 0건일 때만 파일 쓰기를 시작한다.

## 6. 접두사 검사기 (FR-TOK-004)

토큰 키에서 CSS 커스텀 프로퍼티 이름으로의 변환과 검사는 다음 규칙을 따른다.

```ts
function toCssCustomProperty(key: string): string {
  // "surface.raised" -> "--cdt-surface-raised"
  return `--cdt-${key
    .split(".")
    .map((seg) => seg.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))
    .join("-")}`;
}

function validatePrefix(declarations: string[]): void {
  const offending = declarations.filter((d) => !d.startsWith("--cdt-"));
  if (offending.length > 0) {
    throw new TokenBuildError(
      `error[TOK-PREFIX]: ${offending.length} custom propert${offending.length === 1 ? "y" : "ies"} missing "--cdt-" prefix\n` +
        offending.map((d) => `  ${d}`).join("\n"),
    );
  }
}

function detectNameCollisions(declarations: string[]): void {
  const seen = new Map<string, string>(); // cssName -> sourceKey
  for (const [sourceKey, cssName] of declarations) {
    const prior = seen.get(cssName);
    if (prior && prior !== sourceKey) {
      throw new TokenBuildError(`error[TOK-COLLISION]: "${prior}" and "${sourceKey}" both map to "${cssName}"`);
    }
    seen.set(cssName, sourceKey);
  }
}
```

`primitive` 계층 토큰은 이 변환 대상에서 제외한다(FR-TOK-004 AC-4). 두 토큰 키가 같은 CSS 이름으로 변환되면(예: `surface.Raised`와 `surface.raised`가 모두 `--cdt-surface-raised`로 충돌) 충돌한 두 키를 출력하고 빌드를 실패시킨다(예외 처리).

## 7. 대비 검사기 (FR-THM-004)

WCAG 2.1 상대 휘도 공식을 그대로 구현한다.

```ts
type RGB = { r: number; g: number; b: number };
type RGBA = RGB & { a: number };

function relativeLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function compositeOverBackground(fg: RGBA, bg: RGB): RGB {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  };
}

function contrastRatio(fg: RGBA, bg: RGB): number {
  const composed = fg.a < 1 ? compositeOverBackground(fg, bg) : fg;
  const l1 = relativeLuminance(composed);
  const l2 = relativeLuminance(bg);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

const THRESHOLD: Record<"body" | "large" | "nonText", number> = {
  body: 4.5,
  large: 3,
  nonText: 3,
};
```

검사 대상 쌍은 `packages/tokens/src/contrast-pairs.ts`에 `{ name, fg, bg, usage: "body" | "large" | "nonText" }` 형태로 명시적으로 선언한다(AC-1). `usage: "decorative"`가 부여된 토큰은 이 목록에 포함하지 않는다(FR-THM-004 예외 처리). 검사는 두 테마 각각의 `ThemePalette`(`../30_technical_architecture/conductor_data_model.md` ENT-THM-001)에서 실제 값을 읽어 수행하며, 미달 쌍이 1건 이상이면 이 검사기가 종료 코드 1을 반환하고 쌍 이름·테마·측정 대비율·기준값을 출력한다(AC-3). 상세 CLI 인터페이스는 `conductor_api_contracts.md`의 API-TOK-003을 따른다.

## 8. 린트: lint:tokens (FR-TOK-001)

`pnpm lint:tokens`는 `packages/css/src/**`와 `packages/react/src/**`를 대상으로 다음 패턴을 정적 스캔한다.

| 검사 항목 | 패턴 | 예외 |
| --- | --- | --- |
| 색상 리터럴 | `#[0-9a-fA-F]{3,8}\b`, `rgb(`, `rgba(`, `hsl(`, `hsla(` | 토큰 소스 디렉터리(`packages/tokens/src/primitive/**`) |
| 간격/반경 px 리터럴 | CSS 선언 값에서 `\d+px`가 `padding`, `margin`, `gap`, `border-radius`, `width`, `height` 속성에 등장 | 브레이크포인트 치환 결과(FR-TOK-009 AC-2), 1px 보더 두께 |
| 모션 ms 리터럴 | `\d+ms`, `\d+s`가 `transition`, `animation` 속성에 등장 | 토큰 소스 디렉터리 |

파일 상단에 `/* cdt-allow-literal: <사유> */` 주석이 있으면 해당 파일의 위반을 허용 목록으로 분류하고 실패로 집계하지 않는다(FR-TOK-001 예외 처리). 허용 목록은 `pnpm lint:tokens --report`로 조회한다(파일 경로와 사유를 표로 출력, 쓰기 동작 없음). 위반이 있으면 위반 파일 경로와 라인 번호를 출력하고 종료 코드 1을 반환한다(AC-3).

## 9. 증분 빌드와 캐시

각 패키지 빌드 스크립트는 실행 전 입력 파일 집합(해당 패키지의 `src/` 전체, 선행 패키지의 `dist/` 산출물 해시 포함)을 정렬한 뒤 SHA-256으로 해시하고 `.cache/<package-name>.hash`와 비교한다.

- 해시가 일치하면 빌드를 건너뛰고 기존 `dist/`를 그대로 사용하며 `skipped (cache hit)`를 stdout에 출력한다.
- 해시가 불일치하면 전체 재빌드를 수행하고 새 해시를 `.cache/<package-name>.hash`에 기록한다.
- `--watch` 플래그(로컬 전용)는 `chokidar` 기반 파일 워처로 변경을 감지하고 200ms debounce 후 해당 패키지만 재빌드하며, 재빌드 완료 시 `EVT-BUILD-001`(`../30_technical_architecture/conductor_async_events_jobs.md` 참조)을 발생시켜 후속 패키지의 워처를 트리거한다.

캐시는 빌드 정확성에 영향을 주지 않는 최적화이며, 캐시를 완전히 비우고 실행해도(`rm -rf .cache`) 동일한 산출물을 생성해야 한다(재현성 요건, `conductor_data_model.md` 7절 참조).

## 10. 로컬 vs CI 차이

| 항목 | 로컬 개발 | CI |
| --- | --- | --- |
| 캐시 | 재사용(해시 일치 시 스킵) | 항상 클린 빌드(캐시 미사용, 재현성 우선) |
| watch 모드 | 지원(`--watch`) | 미지원(1회 실행 후 종료) |
| 병렬성 | 개발자 로컬 코어 수에 따름 | 4코어 러너로 고정(NFR-001 측정 기준) |
| 실패 시 프로세스 | watch 모드에서는 오류를 출력하고 다음 변경을 계속 감시 | 즉시 종료 코드 1, 워크플로 전체 중단 |
| 산출물 보존 | `dist/`를 로컬 디스크에 유지 | 각 Job의 아티팩트로 업로드(`conductor_async_events_jobs.md` Job 카탈로그의 아티팩트 열 참조) |
| 대비/접근성 검사 | 개발자가 수동으로 `pnpm check:contrast`, `pnpm test:a11y` 실행 | JOB-CI-001, JOB-CI-002로 모든 PR에서 자동 실행 |
