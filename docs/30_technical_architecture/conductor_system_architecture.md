# Conductor Design System 시스템 아키텍처

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 목적과 범위

이 문서는 Conductor Design System의 시스템 구조, 패키지 경계, 빌드 파이프라인, 소비자 통합 지점을 정의한다. 모든 결정은 `../10_requirements/srs_final.md`와 `../10_requirements/prd.md`의 승인 범위 안에서만 유효하다. 이 문서는 제품 범위를 추가하지 않는다. 아키텍처가 새로운 제품 행위를 요구하면 CR을 열어 SRS를 먼저 갱신한다.

이 문서가 인용하는 결정의 근거는 `conductor_architecture_decision_records.md`의 ADR-001 ~ ADR-010이다.

## 2. 제품 컨텍스트

Conductor는 실행되는 서버 애플리케이션이 아니다. 배포 산출물은 npm 패키지 3종과 정적 문서 사이트 1종이다. SRS 4.3은 백엔드 서비스, 데이터베이스, 인증 서버, 메시지 큐를 범위에서 제외한다. 따라서 이 시스템의 "런타임"은 두 개로 분리된다: Conductor 저장소의 **빌드 타임 런타임**과, Conductor를 설치한 남의 애플리케이션 안에서 벌어지는 **소비자 런타임**이다. 이 구분이 이 문서 전체의 축이다.

```text
                         ┌──────────────────────────────┐
   System Maintainer ───▶│  Conductor 저장소 (모노레포)   │
   Coding Agent      ───▶│  토큰 소스 · CSS · React      │
   A11y Reviewer     ───▶│  문서 사이트 소스             │
                         └──────────────┬───────────────┘
                                        │ pnpm build / CI 게이트
                                        ▼
                    ┌───────────────────────────────────────┐
                    │  배포 산출물 (Conductor가 소유)         │
                    │  · npm: @conductor/tokens             │
                    │  · npm: @conductor/css                │
                    │  · npm: @conductor/react              │
                    │  · 정적 파일: apps/docs 빌드 결과      │
                    └───────┬───────────────────┬───────────┘
                            │ pnpm add          │ 정적 호스팅
                            ▼                   ▼
              ┌───────────────────────┐   ┌──────────────────┐
              │ 소비자 애플리케이션    │   │ 문서 사이트 방문자 │
              │ (Conductor 소유 아님) │   │ (인증 없음)       │
              │ 번들러 → 브라우저      │   │ 브라우저          │
              └───────────────────────┘   └──────────────────┘
```

외부 시스템 경계는 SRS 10절이 정의한 네 가지뿐이다: npm 레지스트리, React peer dependency, Radix UI, `lucide-react` peer dependency. 런타임 외부 시스템 연동은 0건이다(NFR-002).

## 3. 컨테이너/런타임 뷰

### 3.1 빌드 타임 런타임 (Conductor가 소유하고 운영한다)

| 컨테이너 | 실행 주체 | 입력 | 출력 | 관련 잡 |
| --- | --- | --- | --- | --- |
| 토큰 빌더 | Node 20 또는 22, `buildTokens` CLI | `packages/tokens/src/**` (TypeScript 토큰 소스) | `tokens.css`, `tokens.js`/`.d.ts`, `tokens.json` | JOB-BUILD-001 |
| 대비 검사기 | Node, `checkContrast` CLI | `tokens.json`, `contrast-pairs.ts` | 종료 코드 + `contrast-report.json` | JOB-CI-001 |
| CSS 번들러 | lightningcss 1.x | `packages/css/src/**.css` + `tokens.css` | 레이어 진입점별 `.css` 산출물 | JOB-BUILD-002 |
| React 번들러 | tsup 8.x (esbuild + dts) | `packages/react/src/**` | ESM/CJS 번들 + `.d.ts` | JOB-BUILD-003 |
| 문서 정적 빌더 | Vite 6/7 + React Router 7 프리렌더 | `apps/docs/src/**`, `tokens.json`, `contrast-report.json` | 라우트별 정적 HTML + 에셋 | JOB-BUILD-004 |
| 품질 게이트 | Vitest 3.x, Playwright 1.4x, size-limit 11.x | 빌드 산출물 | 종료 코드 + 리포트 아티팩트 | JOB-CI-002, JOB-CI-003, JOB-CI-004 |
| 릴리스 | Changesets 2.x + npm OIDC | 버전 결정 파일, 빌드 산출물 | npm 배포, CHANGELOG, semver 태그 | JOB-REL-001 |

이 컨테이너는 전부 CI 러너 안에서 유한 시간 실행 후 종료한다. 상주 프로세스가 없다. FR-DX-001 AC-3이 전체 빌드 3분(4코어), NFR-004가 CI 전체 10분을 상한으로 고정한다.

### 3.2 소비자 런타임 (Conductor가 소유하지 않는다)

| 컨테이너 | 소유자 | Conductor가 제공하는 것 | Conductor가 제공하지 않는 것 |
| --- | --- | --- | --- |
| 소비자 번들러 (Vite, Next.js, Rspack) | 소비자 | `exports` 맵, `sideEffects` 선언, ESM/CJS 이중 산출, `.d.ts` | 번들러 플러그인, preset, 설정 파일 |
| 소비자 브라우저 | 최종 사용자 | CSS 커스텀 프로퍼티 + `@layer` 스타일시트, React 컴포넌트 | 상태 관리, 데이터 페칭, 라우팅, 폼 검증 |
| 소비자 SSR 프로세스 (Node) | 소비자 | 모듈 최상위에서 브라우저 전역에 접근하지 않는 코드(FR-DX-004) | 테마 결정 스니펫 자동 주입(FR-THM-003 예외 처리) |
| 문서 사이트 정적 호스트 | Conductor 또는 사내 호스팅 | 프리렌더된 HTML + 해시 이름 에셋 | 서버 사이드 로직, 세션, 사용자 계정 |

소비자 런타임에서 Conductor 코드가 수행하는 부수효과는 세 가지로 한정된다: CSS 파일 로드(`sideEffects: ["*.css"]`), React 컴포넌트의 DOM 렌더, 개발 빌드 한정 콘솔 경고. 네트워크 요청은 0건이다(NFR-002).

## 4. 패키지 경계와 의존 방향

```text
@conductor/tokens ──▶ @conductor/css ──▶ @conductor/react ──▶ apps/docs
       │                    │                    │                 │
       │ tokens.json        │ index.css          │ ESM/CJS+d.ts    │ 정적 HTML
       │ tokens.css         │ component.css      │                 │
       │ tokens.d.ts        │ tokens.css(전달)   │                 │
       └────────────────────┴────────────────────┴─────────────────┘
                    역방향 참조 = 빌드 오류 (FR-DX-001 AC-1)
```

| 패키지 | 책임 | 책임이 아닌 것 | 공개 계약 |
| --- | --- | --- | --- |
| `@conductor/tokens` | 3계층 토큰 소스, 참조 해석, CSS/TS/JSON 산출, 대비 검사 | 스타일 규칙, 컴포넌트 | API-PKG-001, API-TOK-001, API-TOK-002, API-TOK-003 |
| `@conductor/css` | `@layer` 5단 스타일시트, 레이아웃/컴포넌트 클래스, 리셋 | React, DOM 구조 | API-PKG-002, API-THM-001 |
| `@conductor/react` | 접근성 계약을 지킨 프리미티브 컴포넌트, props 타입 | 스타일 값, 애플리케이션 상태, 라우팅 | API-PKG-003, API-CMP-001 ~ API-CMP-009 |
| `apps/docs` | Conductor의 첫 번째 소비자이자 참조 구현 | 재사용 가능한 코드 배포 | API-DOC-001 |

의존 방향 강제는 두 겹이다. 첫째, pnpm workspace가 순환 의존을 검출해 `pnpm -r run build` 실행 전에 실패시킨다. 둘째, `pnpm check:deps` 스크립트가 각 `package.json`의 `dependencies`/`devDependencies`를 허용 간선 목록(`tokens → css → react → docs`)과 대조해 목록 밖 간선이 있으면 종료 코드 1을 반환한다. NFR-004의 "순환 패키지 의존 0건" 지표는 이 두 검사로 측정한다.

`apps/docs`는 소스 상대경로가 아니라 workspace 프로토콜(`"@conductor/react": "workspace:*"`)로 세 패키지를 설치한다. FR-DOC-001 AC-1과 FR-DX-001 AC-4가 요구하는 "소스 상대경로 import 0건"은 이 설치 방식으로 구조적으로 보장되며, `apps/docs`의 `tsconfig.json`에 `paths` 별칭을 두지 않는 것으로 확인한다.

### 4.1 진입점 계약

`@conductor/tokens`

- `.` → `tokens`, `breakpoints`, 토큰 타입 (API-TOK-002). primitive 토큰은 export하지 않는다(FR-TOK-002 AC-5).
- `./tokens.json` → 키·값·계층·용도 메타데이터 (FR-TOK-006 AC-3). W-030과 Foundations 화면의 유일한 데이터 출처다.
- `./tokens.css` → semantic + component 커스텀 프로퍼티. primitive는 산출되지 않는다(FR-TOK-004 AC-4).
- `bin`: `buildTokens`(API-TOK-001), `checkContrast`(API-TOK-003).

`@conductor/css`

- `.` → 토큰 + reset + base + layout + component + utility 전체
- `./tokens.css` → 커스텀 프로퍼티 선언만
- `./reset.css`, `./base.css`, `./layout.css`, `./component.css`, `./utility.css` → 부분 진입점 (FR-DX-003 AC-4)
- `./theme-init.js` → `<head>`에 인라인할 테마 결정 스니펫의 정적 파일 사본. 패키지가 자동 주입하지 않는다(FR-THM-003 예외 처리).
- `sideEffects: ["*.css"]` (FR-DX-003 AC-2)

`./component.css`는 리셋을 제외하되 토큰 커스텀 프로퍼티는 포함한다. 리셋만 제외하려는 소비자가 토큰까지 잃으면 컴포넌트가 값 없이 렌더되기 때문이다(FR-CSS-002 예외 처리의 의도).

`@conductor/react`

- `.` → 공개 컴포넌트와 props 타입 전량 (API-PKG-003). 하위 경로 import는 `exports`에 선언하지 않으므로 런타임 해석 오류가 된다(FR-DX-003 AC-1).
- `sideEffects: false` (FR-DX-003 AC-3)
- `peerDependencies`: `react` `^18.0.0 || ^19.0.0`, `lucide-react`. `@conductor/css`는 peer가 아니라 문서상의 필수 동반 설치다. 번들러가 CSS를 부수효과로 취급해야 하므로 소비자가 직접 import한다(SCN-001).

## 5. 빌드 파이프라인

```text
pnpm install
    │
    ▼
JOB-BUILD-001  buildTokens
    │  packages/tokens/src/{primitive,semantic,component}.ts
    │  ├─ 계층 검증        (FR-TOK-002 AC-1~AC-4)
    │  ├─ 참조 해석 10단계 (FR-TOK-003 AC-2)
    │  ├─ 순환 참조 검출   (FR-TOK-003 AC-3, a → b → c → a 출력)
    │  ├─ 이름 충돌 검출   (FR-TOK-004 AC-5)
    │  └─ 전체 해석 성공 후에만 파일 기록 (FR-TOK-003 예외 처리)
    │  산출: tokens.css, tokens.js, tokens.d.ts, tokens.json
    ▼
JOB-CI-001  checkContrast          ─── 실패 시 파이프라인 중단 (FR-THM-004 AC-3)
    │  입력: tokens.json + contrast-pairs.ts
    │  산출: contrast-report.json (JOB-BUILD-004와 W-030이 소비)
    ▼
JOB-BUILD-002  lightningcss
    │  입력: packages/css/src/**.css, @conductor/tokens/tokens.css
    │  @import 인라인, @layer 순서 보존, browserslist 타깃 다운레벨, 압축
    │  산출: index.css + 6개 부분 진입점
    │  검사: !important 0건(FR-CSS-001 AC-2), 전 규칙의 레이어 소속(AC-1),
    │        구조 셀렉터 0건(FR-CSS-004 AC-4), 원격 폰트 참조 0건(FR-CSS-002 AC-4)
    ▼
JOB-BUILD-003  tsup
    │  입력: packages/react/src/**
    │  산출: ESM + CJS + .d.ts, 엔트리 상단 "use client" 배너
    │  검사: api-extractor 7.x 리포트 — any 0건, 내부 타입 누출 0건 (FR-DX-002)
    ▼
JOB-BUILD-004  vite build (React Router 7 prerender, ssr:false)
    │  입력: apps/docs/src/**, tokens.json, contrast-report.json,
    │        props.generated.json(react-docgen-typescript 2.x)
    │  산출: 라우트 12종 + 컴포넌트 상세 N개의 정적 HTML
    │  검사: 공개 export ↔ 카탈로그 화면 대칭 (FR-DOC-003 AC-5)
    ▼
품질 게이트 (병렬)
    ├─ pnpm test        Vitest 3.x + Testing Library 16.x   (FR-QA-001, FR-QA-002)
    ├─ pnpm test:a11y   Vitest 브라우저 모드 + axe-core 4.x  (JOB-CI-002, FR-QA-003)
    ├─ pnpm test:visual Playwright 1.4x 스냅샷 24종          (JOB-CI-003, FR-QA-004)
    ├─ pnpm size        size-limit 11.x                      (JOB-CI-004, FR-DX-003 AC-3)
    ├─ pnpm lint:tokens postcss AST + TS 컴파일러 API         (FR-TOK-001, FR-TOK-007)
    └─ pnpm audit --audit-level high                          (NFR-002)
    ▼
JOB-REL-001  Changesets + npm OIDC 배포
```

`pnpm -r run build`는 workspace 의존 그래프의 위상 순서로 실행하므로 JOB-BUILD-001 ~ 004의 순서는 별도 오케스트레이터 없이 성립한다(ADR-001). 한 패키지가 실패하면 후속 패키지를 실행하지 않고 실패한 패키지 이름과 로그를 출력한다(FR-DX-001 예외 처리).

JOB-CI-001을 JOB-BUILD-002 앞에 두는 이유는 SCN-002 때문이다. 관리자가 상태색을 바꾸면 대비 미달이 CSS 산출 이전에 드러나야 하고, 실패 시 이전 산출물이 남지 않아야 한다.

### 5.1 토큰 린트의 구현 위치

FR-TOK-001 AC-3은 위반 파일 경로와 라인 번호를, FR-TOK-001 예외 처리는 `/* cdt-allow-literal: <사유> */` 주석 기반 허용 목록을 요구한다. 이 두 요건은 범용 린터 설정으로 표현되지 않으므로 `packages/tokens/scripts/lint-tokens.ts`가 담당한다. CSS는 postcss 8.x AST로 파싱해 선언의 `source.start.line`을 읽고, TypeScript/TSX는 TypeScript 5.x 컴파일러 API로 소스 파일을 순회한다. postcss는 빌드 변환 도구가 아니라 검사용 파서로만 쓰인다.

## 6. 소비자 통합 지점

SCN-001의 기본 흐름은 명령 3개 이하(M-5)로 완료된다.

1. `pnpm add @conductor/react @conductor/css @conductor/tokens`
2. 진입 파일에 `import "@conductor/css";`
3. 루트 요소에 `data-cdt-theme="dark"` (API-THM-001)

| 통합 지점 | 계약 | 실패 시 동작 |
| --- | --- | --- |
| CSS 로드 | `import "@conductor/css"` 또는 `./component.css` | 개발 빌드에서 `--cdt-surface-base` 미해석을 감지해 콘솔 경고 1회. 컴포넌트는 스타일 없이 렌더된다(SCN-001 예외 흐름) |
| 테마 지정 | 루트의 `data-cdt-theme` 속성. 없으면 `prefers-color-scheme`, 값이 `dark`/`light` 이외면 다크 (FR-THM-003) | 없음. 항상 하나의 팔레트가 적용된다 |
| SSR 첫 페인트 | 소비자가 `@conductor/css/theme-init.js`의 스니펫을 `<head>`에 인라인 | 스니펫을 넣지 않으면 첫 페인트가 다크로 시작한다. 패키지는 전역에 접근하지 않는다(FR-DX-004 예외 처리) |
| React 없는 소비 | `cdt-btn cdt-btn--primary` 클래스 직접 사용 (FR-CSS-004 AC-3) | 없음. `@conductor/css`만 설치한다 |
| 오버레이 위 레이어 | `z.popover`(50) 초과 값을 소비자가 직접 지정 (FR-TOK-008 예외 처리) | W-030이 이 사실을 문서화한다 |
| 캐스케이드 재정의 | 레이어 밖 소비자 규칙이 동일 명시도에서 Conductor 규칙을 이긴다 (FR-CSS-001 AC-3) | `!important` 없이 재정의된다 |

미해석 토큰 감지는 모듈 최상위가 아니라 `useEffect` 안에서 `getComputedStyle(document.documentElement).getPropertyValue("--cdt-surface-base")`를 1회 읽고, 모듈 스코프 플래그로 중복 출력을 막는다. `process.env.NODE_ENV !== "production"` 가드가 프로덕션 번들에서 이 코드를 제거한다. FR-DX-004 AC-2를 지키는 유일한 위치다.

## 7. 교차 관심사

### 7.1 토큰 단일 출처

`packages/tokens/src/` 밖에서 색상·간격·반경·모션 리터럴이 등장하면 `pnpm lint:tokens`가 실패한다(FR-TOK-001). 이 규칙에는 구조적 예외가 하나 있다. CSS 커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않으므로(SRS 5.2 기술 제약 3), `breakpoint.*` 토큰은 빌드 시 `@media (min-width: 800px)` 형태의 리터럴로 치환된다(FR-TOK-009 AC-2). 치환 결과는 린트 대상에서 제외되고, 동일 값을 JS에서 읽어야 하는 소비자는 `breakpoints` export를 사용한다(FR-TOK-009 AC-3).

토큰 값은 세 산출물로 갈라지지만 출처는 하나다. 문서 사이트는 `tokens.json`만 읽고 값을 하드코딩하지 않으므로(FR-DOC-002 AC-1), 토큰 추가가 재빌드만으로 Foundations 화면에 반영된다(AC-2).

### 7.2 접근성

접근성은 세 계층에서 각각 다른 방법으로 강제된다.

| 계층 | 대상 | 강제 수단 | 관련 요구사항 |
| --- | --- | --- | --- |
| 토큰 | 전경/배경 쌍의 대비율 | `checkContrast` (빌드 게이트) | FR-THM-004, FR-A11Y-004, NFR-003 |
| CSS | 포커스 링, 모션 감소 | `cdt.base` 레이어 규칙 + 산출물 검사 | FR-A11Y-001, FR-CSS-005 |
| 컴포넌트 | role/name/state, 키보드 경로 | Radix 위임 + axe-core 전수 검사 | FR-A11Y-002, FR-A11Y-005, FR-CMP-006 AC-5 |

세 계층 어디에서도 위반을 런타임에 감지하지 않는다. 감지는 전부 빌드 타임에서 끝난다. 이것이 서버 없는 제품의 접근성 전략이다.

`checkContrast`는 alpha가 있는 색을 배경과 합성한 뒤 WCAG 2.1 상대 휘도 공식으로 계산한다(FR-THM-004 AC-4). 검사 대상 쌍은 `contrast-pairs.ts`에 명시 선언되며 자동 조합 생성을 하지 않는다(AC-1). 장식 전용 토큰은 `usage: "decorative"`로 제외하고 제외 목록을 리포트에 출력한다(FR-A11Y-004 AC-3).

OD-001은 이 검사의 대상 쌍 정의를 아직 확정하지 않았고, FR-THM-004와 FR-A11Y-004를 차단한다. 아키텍처 관점에서 OD-001의 세 선택지는 모두 `contrast-pairs.ts`와 토큰의 `usage` 메타데이터 안에서 표현되므로, 어느 쪽으로 결정되든 파이프라인 구조는 바뀌지 않는다. 결정은 요구사항 계층에 남는다.

### 7.3 테마

테마는 런타임 상태가 아니라 DOM 속성이다. `data-cdt-theme`이 바뀌면 CSS 커스텀 프로퍼티 값만 바뀌고 React 트리는 재마운트되지 않는다(FR-THM-003 AC-4). 이 성질이 NFR-001의 "테마 전환 후 재페인트 100ms 이하"를 성립시킨다. React 컨텍스트로 테마를 내려보내는 설계였다면 전 컴포넌트 리렌더가 발생하고 이 예산을 지킬 근거가 사라진다.

`@conductor/react`에는 테마 관련 코드가 없다. 테마 토글은 `apps/docs`가 소유하며, 그 구현은 `conductor_frontend_architecture.md` 6.4절에 있다.

두 팔레트의 semantic 키 집합은 대칭이어야 하고(FR-THM-002 AC-1), 이를 FR-QA-001의 계약 테스트가 검사한다. 라이트 테마는 기능이 아니라 3계층 토큰 설계의 반증 시험이다(PRD G-3). 라이트에서 값이 깨지는 컴포넌트가 나오면 그것은 컴포넌트가 semantic 계층을 건너뛰었다는 증거이며, 수정 대상은 팔레트가 아니라 컴포넌트 토큰이다(FR-THM-002 예외 처리).

## 8. 품질 속성

| 속성 | 목표 | 관련 요구사항 | 설계 영향 |
| --- | --- | --- | --- |
| 성능 | `Button` 단독 import gzip 4KB 이하, `@conductor/css` 전체 gzip 20KB 이하, 문서 사이트 LCP p75 2.5초 이하, `pnpm build` 3분 이하(4코어), 테마 전환 재페인트 100ms 이하 | NFR-001, M-7 | `sideEffects: false` + 배럴 파일에서 재수출만 수행. `@conductor/react`의 런타임 의존성 0개(클래스 병합은 내부 `cx` 헬퍼). 테마 전환은 속성 교체이므로 React 리렌더 없음. 문서 사이트는 프리렌더 HTML로 첫 페인트를 JS 없이 완료 |
| 보안 | 런타임 외부 네트워크 요청 0건, high 이상 취약점 0건, 산출물 비밀값 0건, npm OIDC 배포 | NFR-002 | 원격 폰트·원격 스크립트 금지를 CSS 산출물 검사로 강제(FR-CSS-002 AC-4). 문서 사이트는 외부 도메인 요청 0건(FR-DOC-001 AC-4). 릴리스는 장기 토큰 없이 OIDC로 수행(ADR-010) |
| 접근성 | WCAG 2.1 AA, 본문 4.5:1, 대형·비텍스트 3:1, axe serious 이상 0건, 키보드 도달 100% | NFR-003 | 대비는 토큰 빌드 게이트에서, 키보드·role은 Radix 위임과 axe 전수 검사로 확보(ADR-004). 두 테마 모두에서 검사(FR-QA-003 AC-3) |
| 운영성 | 롤백 10분 이내, 파괴 변경 마이그레이션 노트 100%, CI 10분 이하, 공개 API `any` 0건, 순환 의존 0건 | NFR-004 | 롤백은 `npm dist-tag`로 이전 버전을 `latest`로 승격하고 문제 버전을 deprecate한다. `any` 0건은 api-extractor 리포트로, 순환 의존 0건은 pnpm 검출과 `check:deps`로 측정 |
| 호환성 | Chrome/Firefox/Safari/Edge 최근 2개 메이저, React 18·19, Node 20 이상 | NFR-005 | `@layer`와 `:focus-visible`이 타깃 브라우저 전부에서 지원된다는 사실이 ADR-005의 전제다. lightningcss의 browserslist 타깃이 이 범위를 넘어 다운레벨하지 않도록 고정한다. React 18/19 이중 CI 매트릭스 |

## 9. "서버가 없다"는 사실의 아키텍처 영향

이 제품에는 배포된 코드가 실행되는 우리 소유의 프로세스가 없다. 이 사실이 통상적인 아키텍처 문서의 절반을 다른 것으로 대체한다.

| 통상적 관심사 | Conductor에서의 대응물 | 근거 |
| --- | --- | --- |
| 런타임 인증/인가 | 저장소 접근 권한과 릴리스 승인 권한 | SRS 6절 |
| 배포 롤백 | `npm dist-tag` 재지정 + deprecate, 10분 이내 | NFR-004, SRS 5.3 |
| 프로덕션 장애 | 잘못된 버전의 npm 배포. 감지자는 소비자다 | FR-DX-005 |
| 관측성/APM | CI 잡 리포트(대비, axe, 시각 회귀, 번들 크기)와 API 추출 리포트 | JOB-CI-001~004 |
| SLO/가용성 | 존재하지 않는다. 대신 빌드 결정성과 산출물 검사 통과가 서비스 수준이다 | FR-DX-001 AC-2 |
| 데이터베이스 | 토큰 스키마(ENT-TOK-001~003), 팔레트(ENT-THM-001), 컴포넌트 메타(ENT-CMP-001), 문서 페이지(ENT-DOC-001). 전부 빌드 산출물로 고정되는 읽기 전용 구조체 | SRS 11절 |
| API 계약 | 패키지 공개 진입점과 props 타입. 파괴 변경은 semver major | FR-DX-002, FR-DX-003 |
| 큐/이벤트 | CI 잡의 위상 순서. 비동기 이벤트 시스템이 없다 | JOB-BUILD-001~004 |
| 시크릿 관리 | OIDC로 대체. 저장된 npm 장기 토큰이 없다 | NFR-002 |
| 인프라 보안 | 공급망 보안. `pnpm audit`, Radix 정확 버전 고정, npm provenance | NFR-002, R-3 |

가장 큰 결과는 **오류가 소비자의 빌드나 브라우저에서 드러난다**는 점이다. 우리는 그 시점에 개입할 수 없다. 따라서 이 제품의 모든 검증은 배포 이전으로 당겨져 있고, 배포 이후의 유일한 통제 수단은 버전 교체다. FR-TOK-003의 "부분 산출물을 남기지 않는다", FR-DX-002의 "타입 생성 실패 시 배포 중단", FR-QA-003의 "허용 목록에 없는 새 위반이 나타나면 CI 실패"는 모두 같은 원칙의 표현이다.

두 번째 결과는 **문서 사이트가 테스트 하네스를 겸한다**는 점이다. `apps/docs`는 Conductor의 첫 번째 소비자이며(FR-DOC-001 AC-1), 소스 상대경로를 쓰지 않으므로 `exports` 맵의 실사용 검증을 매 빌드마다 수행한다. 문서 사이트를 정적으로 프리렌더하면 모든 공개 컴포넌트가 Node 환경에서 렌더되므로, FR-DX-004 AC-1의 SSR 안전성이 별도 테스트 없이 빌드 단계에서 반증된다(ADR-007).

## 10. 트레이드오프

| 선택 | 얻는 것 | 잃는 것 | 수용 근거 |
| --- | --- | --- | --- |
| Vanilla CSS + 커스텀 프로퍼티 (ADR-002) | 프레임워크 비종속 소비, 런타임 스타일 비용 0, 테마 전환 시 리렌더 없음 | 타입 검사되는 스타일, 자동 데드 CSS 제거, 컴포넌트별 CSS 코드 분할 | 비-React 소비자가 `@conductor/css`를 직접 쓴다는 것이 NG-2의 전제다. CSS 전체 20KB gzip 예산 안에서 데드 코드 제거의 이득이 작다 |
| Radix 위임 (ADR-004) | 포커스 트랩·롤·키보드 내비게이션 자체 구현 0건 | Radix DOM 구조 변경에 대한 노출(R-3) | 자체 구현은 FR-A11Y-002·005를 만족시키는 데 드는 비용이 크고 결함 표면이 넓다. `data-*` 셀렉터만 사용해 결합면을 좁힌다 |
| 자체 토큰 빌더 (ADR-003) | FR-TOK-002 AC-5, FR-TOK-003 AC-3, FR-TOK-004 AC-3의 검증을 1급 시민으로 구현 | Style Dictionary 생태계의 플러그인과 DTCG 호환 | Figma 연동이 NG-1로 제외되었으므로 DTCG 포맷의 이득이 v1에 없다 |
| 문서 사이트 프리렌더 (ADR-007) | LCP 예산 확보, SSR 안전성의 빌드 타임 반증 | 라이브 프리뷰에 런타임 코드 편집기를 둘 수 없다 | 런타임 토큰/코드 편집기는 4.3 Out of Scope다. 예제는 소스 모듈을 그대로 마운트한다(FR-DOC-003 AC-1) |
| 셸 컴포넌트군의 조건부 범위 (FR-CMP-009) | 라우팅 라이브러리 의존 0건 유지(AC-2) | `AppShell`이 소비자에게 `renderLink` 위임을 요구한다 | OD-004가 미해결이다. `@conductor/react`가 라우터에 결합되면 소비 가능성(G-5)이 무너진다 |

## 11. 아키텍처 리스크

| 리스크 | 영향 | 완화 | ADR |
| --- | --- | --- | --- |
| R-1 라이트 테마가 다크 전용 시각 장치(글래스, 글로우, 반투명 경계)를 재현하지 못한다 | 높음 | 컴포넌트 토큰 계층에서 라이트 팔레트가 solid 대안 값을 재정의한다. 컴포넌트 코드는 수정하지 않는다(FR-THM-002 예외 처리) | ADR-003 |
| R-2 시각 회귀 검사가 폰트 렌더 차이로 불안정해진다 | 중간 | Playwright를 고정 컨테이너 이미지에서 실행하고 시스템 폰트 스택을 컨테이너에 고정한다(FR-QA-004 AC-4). 불안정하면 OD-002에 따라 REL-004로 이월한다 | ADR-009 |
| R-3 Radix 버전 업그레이드가 DOM 구조를 바꿔 CSS가 깨진다 | 중간 | `@radix-ui/react-*` 개별 패키지를 정확 버전으로 고정(캐럿 범위 금지)하고, `data-*` 속성 셀렉터만 사용한다. 구조 셀렉터는 CSS 산출물 검사에서 실패한다(FR-CSS-004 AC-4) | ADR-004, ADR-005 |
| R-4 소스의 `!important`와 전역 `*` 셀렉터가 소비자 CSS와 충돌한다 | 높음 | 전 규칙을 `@layer` 5단에 넣고 `!important` 0건을 산출물 검사로 강제한다. 감소 모드 규칙도 전역 `*` 대신 Conductor 스코프 셀렉터를 쓴다(FR-CSS-005 AC-4) | ADR-005 |
| R-5 토큰 이름이 소비자 변수와 충돌한다 | 중간 | `--cdt-` 접두사를 빌드 검사로 강제한다(FR-TOK-004 AC-3) | ADR-006 |
| R-6 컴포넌트 범위가 도메인 컴포넌트로 번진다 | 높음 | 4.3 Out of Scope에 명시 제외. 작업 패키지 DoD에 "도메인 결합 없음"을 포함한다 | — |
| R-7 대비율 검사가 다크 테마의 계승 값을 실패시킨다 | 높음 | 토큰에 `usage` 메타데이터를 부여하고 검사 대상 쌍을 용도별로 선언한다. OD-001의 결정 전까지 이 검사는 baseline 게이트가 아니다 | ADR-003 |

## 12. 참조 문서

- 요구사항: `../10_requirements/srs_final.md`, `../10_requirements/prd.md`
- 추적: `../10_requirements/requirements_screen_traceability_matrix.md`
- 결정: `conductor_architecture_decision_records.md`
- 프론트엔드: `conductor_frontend_architecture.md`
- 공개 API: `conductor_api_contracts.md`
- 토큰 스키마: `conductor_data_model.md`
- 빌드/CI 잡: `conductor_async_events_jobs.md`
