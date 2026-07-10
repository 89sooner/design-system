# Conductor Design System 토큰/메타데이터 스키마

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 0. 문서 재해석

Conductor Design System에는 데이터베이스가 없다(`srs_final.md` 11절). 이 문서는 표준 아키텍처 문서 세트의 `data_model.md` 자리를 차지하지만, 여기서 "엔티티"는 테이블 스키마가 아니라 **토큰 소스와 빌드 산출물이 공유하는 정적 스키마**를 의미한다: 토큰 정의(`TokenDefinition`), 토큰 그룹(`TokenGroup`), 토큰 참조 그래프의 간선(`TokenAlias`), 테마 팔레트(`ThemePalette`), 컴포넌트 메타데이터(`ComponentMeta`), 문서 사이트 라우트(`DocPage`)가 그 대상이다. 모든 스키마는 `TypeScript` 타입으로 정의하며, 빌드 시점에 생성되고 소비되는 정적 파일(JSON/JS/CSS)로만 존재한다. 런타임 쓰기, 트랜잭션, 동시성 제어는 이 제품에 존재하지 않는다.

## 1. 목적

`ENT-TOK-001` ~ `ENT-DOC-001` 각 엔티티의 TypeScript 스키마, 필드, 불변식, 소유권, 관계, 스키마 변경 정책, 빌드 산출물 파일 레이아웃, 재현성 보장 방식을 정의한다. 엔티티 네이밍은 `../10_requirements/glossary.md`를 따른다.

## 2. 엔티티 카탈로그

| Entity ID | 엔티티 | 책임 | 소유 모듈 | 관련 요구사항 |
| --- | --- | --- | --- | --- |
| ENT-TOK-001 | TokenDefinition | 토큰 하나의 소스 정의(키, 계층, 값 또는 참조, 메타데이터) | `packages/tokens/src/` | FR-TOK-001~007 |
| ENT-TOK-002 | TokenGroup | 문서 사이트 표시 및 계약 검사를 위한 토큰 묶음 | `packages/tokens/src/` | FR-TOK-005, FR-DOC-002 |
| ENT-TOK-003 | TokenAlias | 참조 해석 그래프의 간선(edge). 빌드 중간 산출물 | `packages/tokens/scripts/build.ts` | FR-TOK-003 |
| ENT-THM-001 | ThemePalette | 한 테마의 semantic 키 → 최종 값 매핑 | `packages/tokens/src/`, `packages/tokens/dist/` | FR-THM-001, FR-THM-002 |
| ENT-CMP-001 | ComponentMeta | 공개 컴포넌트 하나의 계약 메타데이터 | `packages/react/src/`, 빌드 시 추출 | FR-CMP-001~009, FR-DOC-003 |
| ENT-DOC-001 | DocPage | 문서 사이트 라우트 하나의 메타데이터 | `packages/docs/src/` | FR-DOC-001~007 |

## 3. 엔티티 스키마

### 3.1 ENT-TOK-001 TokenDefinition

```ts
type TokenTier = "primitive" | "semantic" | "component";
type TokenUsage = "body" | "large" | "nonText" | "decorative";

interface TokenDefinition {
  key: string;                 // 점 표기 계층 키, 예: "surface.raised", "status.running"
  tier: TokenTier;
  value?: string | number;     // primitive 계층: 리터럴 값. semantic/component 계층: 미사용
  alias?: string;              // semantic/component 계층: 참조 대상 토큰 키. primitive 계층: 미사용
  usage?: TokenUsage;          // 대비 검사 분류. 부재 시 FR-THM-004 검사 대상에서 제외
  description: string;         // 용도 설명. 빈 문자열이면 문서 사이트에 "설명 없음"으로 표시(FR-DOC-002 예외 처리)
  themeSpecific?: boolean;     // true면 FR-QA-001 대칭 키 검사에서 제외
  icon?: string;               // status.*, severity.* 토큰에서 필수, 빈 문자열 금지(FR-TOK-005 AC-5)
}
```

**필드 소유권.** `key`, `tier`, `value`, `alias`, `usage`, `themeSpecific`, `icon`은 `packages/tokens/src/{primitive,semantic,component}/*.ts`에서 사람이 직접 편집한다. `description`은 동일 파일에서 편집하되 누락 시 빌드가 실패하지 않고 경고만 출력한다(FR-DOC-002 예외 처리).

**불변식.**

1. `tier === "primitive"`이면 `value`가 반드시 존재하고 `alias`는 존재하지 않는다(FR-TOK-002 AC-1).
2. `tier === "semantic"`이면 `alias`의 대상은 `tier === "primitive"` 또는 `tier === "semantic"`인 키여야 한다(FR-TOK-002 AC-2, CR-008). `component` 대상은 빌드 오류다.
3. `tier === "component"`이면 `alias`의 대상은 `tier === "semantic"` 또는 `tier === "component"`인 키여야 한다(FR-TOK-002 AC-3, CR-008). 상위 계층 대상은 빌드 오류다.
4. 불변식 2·3을 하나의 문장으로 줄이면: **토큰은 자기 계층 또는 하위 계층의 토큰만 참조한다.** 상위 계층으로 올라가는 참조가 발견되면 빌드가 종료 코드 1로 실패하고 위반 토큰 키 쌍을 출력한다(AC-4). 동일 계층 참조가 순환을 이루면 FR-TOK-003 AC-3의 순환 검출이 잡는다(AC-6).

> **CR-008 (DEV-001).** 이 문서의 이전 판은 불변식 2에서 "semantic 토큰이 다른 semantic 토큰을 재사용하면 그 토큰을 `component` 계층으로 정의한다"고 규정했다. 이 재분류 규칙은 성립하지 않는다. `elevation.overlay`(semantic)가 `{border.strong}`(semantic)을 포함하는데, `overlay.shadow`(component)가 `{elevation.overlay}`를 참조한다. 전자를 component로 재분류하면 후자가 component → component 참조가 되어 같은 규칙이 다시 금지한다. 재분류는 모순을 옮길 뿐 없애지 못한다. CR-008이 FR-TOK-002 AC-2·AC-3을 정정해 동일 계층 참조를 허용했고, 이 문서의 불변식을 그에 맞춰 갱신했다. `surface.2`와 `border`는 semantic 계층에 그대로 둔다.
5. `tier === "primitive"`인 키는 `@conductor/tokens`의 공개 진입점(`API-PKG-001`)에서 export되지 않는다(AC-5). `tokens.js`/`tokens.d.ts`는 semantic·component 계층만 노출한다.
6. `key`가 `status.*` 또는 `severity.*`로 시작하면 `icon`이 존재하고 빈 문자열이 아니어야 한다(FR-TOK-005 AC-5).
7. `key`는 토큰 소스 전체에서 유일하다. 중복 키가 발견되면 빌드가 실패한다.

### 3.2 ENT-TOK-002 TokenGroup

문서 사이트의 Foundations 페이지(FR-DOC-002)와 상태/심각도/미터 토큰군 계약(FR-TOK-005)이 토큰을 묶어서 표시하기 위한 조직 단위다. 소스에서 파생되며 별도로 편집하지 않는다(토큰 키의 첫 세그먼트로 그룹핑을 자동 생성한다).

```ts
interface TokenGroup {
  groupKey: string;        // 예: "surface", "status", "severity", "meter", "font.size", "z", "breakpoint"
  tier: TokenTier;
  memberKeys: string[];    // 이 그룹에 속한 TokenDefinition.key 목록
  order: number;           // Foundations 페이지 내 표시 순서
}
```

**불변식.** `status` 그룹의 `memberKeys.length === 7`, `severity` 그룹은 `4`, `meter` 그룹은 `3`이어야 한다(FR-TOK-005 AC-1~3). 위반 시 빌드가 실패한다.

### 3.3 ENT-TOK-003 TokenAlias

토큰 빌드 중 참조 해석기(`conductor_backend_architecture.md` 5절)가 생성하는 그래프 간선이다. 최종 산출물 파일로 저장되지 않으며, 순환 검출과 오류 메시지 조립에만 사용되는 빌드 중간 표현이다.

```ts
interface TokenAlias {
  from: string;            // 참조원 토큰 키
  to: string;              // 참조 대상 토큰 키
  depth: number;           // 이 간선이 해석된 재귀 깊이(0부터 시작, 최대 10)
  resolvedValue?: string;  // 해석 완료 후 채워지는 최종 리터럴 값
}
```

**소유권.** `packages/tokens/scripts/build.ts`의 `resolveToken` 함수가 생성·소비한다. 순환이 검출되면 `from → to` 간선들을 순서대로 이어붙여 `a -> b -> c -> a` 오류 메시지를 만든다(FR-TOK-003 AC-3).

### 3.4 ENT-THM-001 ThemePalette

```ts
interface ThemePalette {
  theme: "dark" | "light";
  colorScheme: "dark" | "light";              // CSS color-scheme 계산값과 일치(FR-THM-001 AC-4, FR-THM-002 AC-2)
  values: Record<string, string>;              // semantic 토큰 키 -> 이 테마에서의 최종 리터럴 값
  generatedAt: string;                          // ISO-8601, 빌드 시각
  sourceHash: string;                           // 토큰 소스 디렉터리 SHA-256 해시(재현성 검증용)
}
```

**불변식.**

1. `dark`와 `light` 두 `ThemePalette.values`의 키 집합은 동일해야 한다(대칭 차집합 공집합, FR-THM-002 AC-1, FR-QA-001 AC-1). `themeSpecific: true`가 부여된 `TokenDefinition`은 이 검사에서 제외한다.
2. `dark` 테마는 기준(canonical) 테마다. 모든 semantic 토큰 키의 정의는 다크 팔레트에서 확정되며, 라이트 팔레트는 다크 팔레트의 키 집합을 그대로 따른다(FR-THM-001).
3. `border.subtle`, `border.default`, `border.strong` 키는 두 테마 모두에서 비텍스트 대비 3:1 이상을 만족해야 한다(FR-THM-002 AC-3).
4. `elevation.*` 키의 그림자 alpha 값은 다크와 라이트 테마에서 서로 다른 값을 가져야 한다(동일 값 재사용 금지, FR-THM-002 AC-4).

**소유권.** 소스는 `packages/tokens/src/semantic/*.dark.ts`와 `*.light.ts`(사람이 편집). `packages/tokens/dist/tokens.css`와 `dist/tokens.json`은 빌드 산출물이며 사람이 직접 편집하지 않는다.

### 3.5 ENT-CMP-001 ComponentMeta

```ts
interface ComponentMeta {
  name: string;                 // PascalCase, 예: "Button", "StatusBadge"
  filePath: string;             // "packages/react/src/Button/Button.tsx"
  propsTypeName: string;        // "ButtonProps"
  variants?: string[];          // 예: ["primary", "secondary", "ghost"]
  tones?: string[];             // 예: ["neutral", "danger"]
  sizes?: string[];             // 예: ["sm", "md", "lg"]
  relatedFR: string[];          // 예: ["FR-CMP-002"]
  hasTestFile: boolean;         // FR-QA-002 AC-1 검사에 사용
  hasCatalogPage: boolean;      // FR-DOC-003 AC-5 검사에 사용
}
```

**소유권과 생성 방식.** `name`, `filePath`, `propsTypeName`, `variants`, `tones`, `sizes`는 컴포넌트 소스 코드(TypeScript 타입 정의)에서 빌드 시 정적 추출한다. `hasTestFile`, `hasCatalogPage`는 파일 시스템 존재 여부 검사로 채운다. 이 엔티티는 사람이 직접 편집하는 파일을 갖지 않는다 — 소스 오브 트루스는 컴포넌트 구현 코드 자체다.

**불변식.** `@conductor/react`의 공개 진입점에서 export된 모든 컴포넌트는 대응하는 `ComponentMeta`를 가지며, `hasTestFile`과 `hasCatalogPage`가 모두 `true`여야 한다. 하나라도 `false`면 각각 FR-QA-002 AC-1, FR-DOC-003 AC-5에 따라 빌드가 실패한다.

### 3.6 ENT-DOC-001 DocPage

```ts
type DocPageSource = "generated-tokens" | "generated-components" | "static-mdx";

interface DocPage {
  routeId: string;             // "W-010" ~ "W-050"
  path: string;                // "/tokens/color"
  title: string;
  source: DocPageSource;
  relatedFR: string[];
}
```

**소유권.** `generated-tokens`, `generated-components` 페이지는 `packages/tokens/dist/tokens.json`과 `ComponentMeta` 목록에서 빌드 시 생성된다(FR-DOC-002 AC-2: 토큰 소스에 토큰을 추가하면 재빌드 후 자동으로 나타난다). `static-mdx` 페이지(사용 규칙, 설치 안내 등)는 `packages/docs/src/content/*.mdx`를 사람이 편집한다.

## 4. 관계도

```text
TokenDefinition (primitive) ──alias──┐
                                       v
TokenDefinition (semantic) ───────────┴─> ThemePalette.values[key]  (테마별 실측)
        │                                        │
        │ component가 참조                        │ 대비 검사 입력(usage 필드)
        v                                        v
TokenDefinition (component)              contrast-report.json (JOB-CI-001 산출물)

TokenDefinition[] ──grouping──> TokenGroup[] ──렌더링──> DocPage(source="generated-tokens")

ComponentMeta[] ──props 표 생성──> DocPage(source="generated-components")
ComponentMeta.hasTestFile / hasCatalogPage ──검사──> FR-QA-002, FR-DOC-003 게이트

TokenAlias[] (빌드 중간 표현) ──해석 완료 시 소멸, resolvedValue만 ThemePalette.values에 반영
```

## 5. 산출물 파일 레이아웃

| 파일 | 위치 | 생성 Job | 소비자 |
| --- | --- | --- | --- |
| `tokens.css` | `packages/tokens/dist/tokens.css` | JOB-BUILD-001 | `packages/css`(JOB-BUILD-002), 소비자 애플리케이션 |
| `tokens.js` / `tokens.d.ts` | `packages/tokens/dist/` | JOB-BUILD-001 | `packages/react`, 소비자 애플리케이션(API-TOK-002) |
| `tokens.json` | `packages/tokens/dist/tokens.json` | JOB-BUILD-001 | 문서 사이트(FR-DOC-002, FR-DOC-004) |
| `breakpoints.js` / `.d.ts` | `packages/tokens/dist/` | JOB-BUILD-001 | `packages/css`(미디어쿼리 리터럴 치환), 소비자 애플리케이션 |
| `contrast-report.json` | `packages/tokens/dist/contrast-report.json` | JOB-CI-001 | 문서 사이트 토큰 참조 페이지(FR-DOC-004 AC-3, AC-4) |

`tokens.js`의 값은 원시 색상 리터럴이 아니라 CSS 변수 참조 문자열이다. 예: `tokens.surface.raised === "var(--cdt-surface-raised)"`. 이 설계는 FR-THM-003 AC-4(테마 전환 시 컴포넌트가 재마운트되지 않음)를 JS 상수를 쓰는 코드에서도 그대로 만족시킨다 — 테마가 바뀌어도 JS 객체의 문자열 값 자체는 불변이고, 브라우저가 CSS 캐스케이드에서 실제 색을 다시 계산하기 때문이다. 예외는 `breakpoints`뿐이며, 이 값은 리터럴 숫자(px)로 노출한다(`{ sm: 560, md: 800, lg: 1080 }`, FR-TOK-009). `tokens.json`은 이와 달리 두 테마의 실측 리터럴 값을 나란히 담아 문서 사이트가 "다크 값과 라이트 값을 나란히 표시"(FR-DOC-004 AC-2)할 수 있게 한다.

## 6. 스키마 마이그레이션 정책

| 변경 유형 | 분류 | 처리 |
| --- | --- | --- |
| 토큰 키 rename 또는 삭제 | 파괴 변경 | semver major, `CHANGELOG`에 이전 키 → 신규 키 매핑을 마이그레이션 노트로 기재(FR-DX-005 AC-4) |
| 토큰 키 신규 추가 | 비파괴 변경 | semver minor |
| 토큰 값(색상/px/ms) 변경(키는 유지) | 비파괴 변경(시각 변경) | semver minor. `pnpm test:visual`(FR-QA-004) 및 `pnpm check:contrast`(FR-THM-004) 통과가 병합 조건 |
| `TokenDefinition.tier` 변경 | 파괴 변경 | semver major. 계층 변경은 참조 방향(3절 불변식)을 재검증해야 한다 |
| `ComponentMeta.propsTypeName`의 필수 prop 추가/제거 | 파괴 변경 | semver major, `conductor_api_contracts.md` 6절 버저닝 규칙을 따른다 |
| `usage`/`themeSpecific`/`description` 메타데이터만 변경 | 비파괴 변경 | semver patch |

토큰 키는 사람이 읽는 식별자이자 공개 API 표면(semantic·component 계층은 `@conductor/tokens`에서 export됨)이므로, rename은 값 변경과 달리 소비자 코드의 컴파일을 깨뜨린다. 이 때문에 rename만 별도로 파괴 변경으로 분류한다.

## 7. 보존/재현성

- **락파일 고정.** `pnpm-lock.yaml`을 저장소에 커밋하고, CI는 `pnpm install --frozen-lockfile`로 실행한다. 락파일과 `package.json`이 불일치하면 install이 실패한다.
- **재현성 검증.** `ThemePalette.sourceHash`는 토큰 소스 디렉터리 전체를 정렬 후 SHA-256 해시한 값이다. 동일 소스 + 동일 락파일 + 동일 Node 버전(20 이상, NFR-005)에서 두 번 빌드한 산출물은 바이트 단위로 동일해야 한다.
- **산출물 보존 기간.** `dist/`는 버전 관리 대상이 아니다(각 패키지 `.gitignore`). 릴리스된 버전의 산출물은 npm 레지스트리에 배포된 tarball이 유일한 보존 대상이며, 재현이 필요하면 해당 git 태그에서 재빌드한다.
- **백업/복구.** 데이터베이스가 없으므로 별도 백업 절차가 없다. 복구 대상은 저장소(git)와 npm 레지스트리 배포 이력뿐이며, 롤백 절차는 `conductor_async_events_jobs.md`의 JOB-REL-001을 따른다.
