# Conductor Design System Architecture Decision Records

> 상태: review | 버전: v0.4 | 갱신일: 2026-09-13

## 1. 목적

구현 비용, 운영 리스크, 개발 속도, 접근성, 보안에 영향을 주는 아키텍처 결정을 기록한다. 제품 범위 관련 오픈 결정은 `OD-###`이며 요구사항 계층(`../10_requirements/prd.md` 12절)에 있다. 이 문서는 제품 범위를 추가하지 않는다. 실행 브리프와 작업 패키지는 여기의 확정 결정을 스택 지시로 인용한다.

각 ADR은 맥락, 선택지, 결정, 결과, 상태, 영향 문서, 날짜를 갖는다. 결정은 반드시 FR ID 또는 품질 속성(NFR-001 ~ NFR-005)을 근거로 인용한다.

## 2. ADR 목록

| ADR ID | 제목 | 상태 | 결정일 | 영향 문서 |
| --- | --- | --- | --- | --- |
| ADR-001 | pnpm workspace 모노레포 | accepted | 2026-07-10 | system, infrastructure |
| ADR-002 | 스타일 엔진: Vanilla CSS + CSS 커스텀 프로퍼티 | accepted (사용자 확정) | 2026-07-10 | system, frontend |
| ADR-003 | 3계층 토큰과 자체 빌드 산출 | accepted | 2026-07-10 | system, data_model |
| ADR-004 | 접근성 동작을 Radix UI에 위임 | accepted | 2026-07-10 | frontend, api_contracts |
| ADR-005 | CSS `@layer` 캐스케이드 제어와 `!important` 금지 | accepted | 2026-07-10 | frontend, api_contracts |
| ADR-006 | `--cdt-` 접두사 네임스페이싱 | accepted | 2026-07-10 | system, data_model |
| ADR-007 | 문서 사이트: Vite + React Router 프리렌더 | accepted | 2026-07-10 | frontend |
| ADR-008 | 패키지 번들러: tsup + lightningcss | accepted | 2026-07-10 | system, infrastructure |
| ADR-009 | 테스트 스택: Vitest + Testing Library + axe-core + Playwright | accepted | 2026-07-10 | async_events_jobs, observability |
| ADR-010 | 릴리스: Changesets + npm OIDC 배포 | accepted | 2026-07-10 | infrastructure, security |

---

## ADR-001 pnpm workspace 모노레포

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_system_architecture.md`, `conductor_infrastructure_operations.md`

### 맥락

Conductor는 npm 패키지 3종(`@conductor-by-89soone/tokens`, `@conductor-by-89soone/css`, `@conductor-by-89soone/react`)과 문서 사이트 1종을 배포한다. FR-DX-001은 `tokens → css → react → docs` 순서의 빌드와 역방향 의존 시 종료 코드 1을 요구한다. FR-DOC-001 AC-1은 문서 사이트가 소스 상대경로가 아니라 소비자로서 패키지를 설치할 것을 요구한다. NFR-004는 순환 패키지 의존 0건을, FR-DX-001 AC-3은 4코어에서 전체 빌드 3분 이하를 요구한다. 소비자는 pnpm 10 이상을 사용한다(SRS 5.1).

### 선택지

1. **단일 패키지**: 하나의 npm 패키지가 토큰·CSS·React를 모두 담는다.
2. **pnpm workspace 모노레포**: 패키지별 `package.json`, `workspace:*` 프로토콜.
3. **Nx**: 태스크 그래프, 원격 캐시, 코드 생성기.
4. **Turborepo**: 태스크 파이프라인과 원격 캐시.

### 결정

pnpm workspace 모노레포를 채택하고, 별도 태스크 러너를 두지 않는다. `pnpm -r run build`가 workspace 의존 그래프의 위상 순서로 실행한다.

단일 패키지는 4.3 Out of Scope의 "비-React 소비자는 `@conductor-by-89soone/css`를 직접 사용한다"와 충돌한다. CSS만 필요한 소비자에게 React 코드를 설치하게 만들고, `sideEffects: false`(FR-DX-003 AC-3)와 `sideEffects: ["*.css"]`(AC-2)를 한 `package.json`에 동시에 선언할 수 없다.

Nx와 Turborepo는 태스크 캐시와 그래프를 제공하지만, 이 저장소의 빌드 대상은 4개이고 전체 빌드가 3분 예산 안에 들어온다. pnpm의 위상 정렬만으로 FR-DX-001 AC-4의 "각 패키지 빌드가 선행 패키지의 산출물을 소비한다"가 성립한다. 캐시 계층을 추가하면 산출물이 최신이 아닌 상태에서 검사가 통과할 가능성이 생기고, 이는 "부분 산출물을 남기지 않는다"(FR-TOK-003 예외 처리)는 원칙과 상충한다.

의존 방향 강제는 두 겹이다. pnpm이 순환 workspace 의존을 검출해 빌드 전에 실패한다. 추가로 `pnpm check:deps`가 각 `package.json`의 의존성을 허용 간선 목록과 대조해 목록 밖 간선에 종료 코드 1을 반환한다(FR-DX-001 AC-1).

### 결과

- 긍정: 패키지별 `exports`, `sideEffects`, `peerDependencies`를 독립 선언한다. 문서 사이트가 `workspace:*`로 설치되므로 FR-DOC-001 AC-1이 구조적으로 성립한다. 빌드 도구 의존성이 pnpm 하나다.
- 부정: 원격 빌드 캐시가 없다. CI가 매번 4개 패키지를 처음부터 빌드한다. NFR-004의 CI 10분 예산 안에서 수용한다.
- 후속: 빌드 시간이 3분을 넘으면 Turborepo 도입을 재검토하는 CR을 연다. 재검토 트리거는 `pnpm build` 소요 시간의 CI 측정값이다.

---

## ADR-002 스타일 엔진: Vanilla CSS + CSS 커스텀 프로퍼티

**상태**: accepted (사용자가 2026-07-10에 확정. 구현 에이전트는 이 결정을 다시 내리지 않는다) · **결정일**: 2026-07-10 · **영향 문서**: `conductor_system_architecture.md`, `conductor_frontend_architecture.md`

### 맥락

Conductor는 `agent-ai-platform/packages/web`의 CSS를 시각의 유일한 근거로 삼는다(SRS 5.1 가정 4). FR-THM-003 AC-4는 테마 전환 시 컴포넌트가 재마운트되지 않을 것을, NFR-001은 테마 전환 후 재페인트 100ms 이하와 `Button` 단독 import gzip 4KB 이하를 요구한다. NG-2는 비-React 소비자가 `@conductor-by-89soone/css`를 직접 사용한다고 규정하며, FR-CSS-004 AC-3은 React 없이 `cdt-btn cdt-btn--primary` 클래스만으로 동일한 계산된 스타일이 적용될 것을 요구한다. FR-DX-004는 모듈 최상위에서 브라우저 전역에 접근하지 않을 것을 요구한다.

### 선택지

1. **Vanilla CSS + CSS 커스텀 프로퍼티**
2. **Tailwind v4 preset**
3. **CSS Modules**
4. **vanilla-extract** (빌드 타임 CSS-in-TS)

### 결정

Vanilla CSS + CSS 커스텀 프로퍼티로 확정한다. CSS-in-JS, Tailwind, Sass를 도입하지 않는다(SRS 5.2 기술 제약 1).

Tailwind preset은 소비자를 Tailwind에 결속하며, 4.3 Out of Scope에 "preset은 소비자를 Tailwind에 결속한다"는 사유로 이미 제외되어 있다. FR-CSS-004 AC-3의 "React 없이 클래스만으로"를 만족시키려면 소비자가 Tailwind 빌드 파이프라인을 구성해야 한다.

CSS Modules는 클래스 이름을 해시하므로 FR-CSS-004 AC-1(모든 클래스 셀렉터가 `cdt-`로 시작)과 AC-2(`cdt-<블록>[__<요소>][--<변형>]` 규칙)를 만족할 수 없고, 비-React 소비자에게 안정된 클래스 이름을 줄 수 없다.

vanilla-extract는 빌드 타임에 CSS를 뽑아내므로 런타임 비용은 없지만, 소비자가 vanilla-extract의 번들러 플러그인을 설치해야 하고, `@conductor-by-89soone/css`를 독립 스타일시트로 배포하는 경로가 이중화된다.

CSS 커스텀 프로퍼티는 테마 전환을 값 교체로 만든다. `data-cdt-theme` 속성이 바뀌면 브라우저가 커스텀 프로퍼티를 재해석할 뿐 React 트리는 그대로다. 이것이 FR-THM-003 AC-4와 NFR-001의 100ms 예산을 동시에 성립시키는 유일한 메커니즘이다. CSS-in-JS 계열은 테마 컨텍스트 변경 시 스타일을 재계산하고 전 컴포넌트를 리렌더한다.

### 결과

- 긍정: 런타임 스타일 비용 0. `@conductor-by-89soone/react`의 런타임 의존성 0개이므로 `Button` 4KB 예산에 여유가 있다(M-7). SSR에서 스타일 추출 단계가 없다(FR-DX-004). 비-React 소비 경로가 추가 작업 없이 성립한다.
- 부정: 스타일이 타입 검사되지 않는다. 사용되지 않는 CSS가 자동 제거되지 않는다. 컴포넌트별 CSS 코드 분할이 없다.
- 완화: 토큰 리터럴 사용은 `pnpm lint:tokens`가 파일 경로와 라인 번호와 함께 차단한다(FR-TOK-001 AC-3). 데드 CSS 부담은 `@conductor-by-89soone/css` 전체 gzip 20KB 예산(NFR-001)으로 상한을 둔다.
- 후속: 없음. 이 결정은 재검토 대상이 아니다.

---

## ADR-003 3계층 토큰과 자체 빌드 산출

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_system_architecture.md`, `conductor_data_model.md`

### 맥락

PRD G-2는 하드코딩된 값을 primitive → semantic → component 3계층으로 재구성해 팔레트를 교체해도 컴포넌트 코드가 바뀌지 않게 하는 것을 목표로 둔다. FR-TOK-002는 참조 방향 강제와 primitive 토큰의 비공개를, FR-TOK-003은 10단계 참조 해석과 `a → b → c → a` 형식의 순환 경로 출력을, FR-TOK-004 AC-3은 접두사 없는 산출 시 빌드 실패를, FR-TOK-005 AC-5는 상태·심각도 토큰의 `icon` 메타데이터를, FR-THM-004는 `usage` 메타데이터 기반 대비 검사 제외를 요구한다. NG-1은 Figma 연동과 DTCG 포맷 채택을 v1에서 제외한다.

### 선택지

1. **단일 계층 CSS 파일**: 소스의 `tokens.css`를 이름만 바꿔 옮긴다.
2. **3계층 토큰 + 자체 빌더** (`buildTokens`, API-TOK-001)
3. **3계층 토큰 + Style Dictionary**

### 결정

TypeScript 소스로 3계층 토큰을 정의하고, 자체 빌더 `buildTokens`가 CSS/TS/JSON 세 산출물을 만든다.

단일 계층은 PRD G-3(라이트 테마로 계층 설계를 검증한다)을 원천적으로 불가능하게 한다. 팔레트를 바꾸면 컴포넌트 스타일이 함께 바뀐다.

Style Dictionary는 DTCG 포맷과 플러그인 생태계를 제공하지만, 그 이득은 Figma 연동과 다중 플랫폼 산출에서 나온다. 둘 다 NG-1로 제외되어 있다. 반면 SRS가 요구하는 검증 — 계층 방향 위반 검출(FR-TOK-002 AC-4), 순환 경로 출력 형식(FR-TOK-003 AC-3), 이름 충돌 검출(FR-TOK-004 AC-5), `icon`/`usage`/`themeSpecific` 메타데이터(FR-TOK-005 AC-5, FR-THM-004 예외 처리, FR-QA-001 예외 처리) — 은 전부 Style Dictionary의 커스텀 transform과 action으로 다시 구현해야 한다. 그 경우 도구 하나를 더 이해해야 하면서 검증 로직의 양은 줄지 않는다.

TypeScript 소스를 채택하면 토큰 스키마가 곧 타입이다. `tokens.surface.raised`가 문자열 리터럴 타입으로 추론되고 존재하지 않는 키 접근이 컴파일 오류가 된다는 FR-TOK-006 AC-1·AC-2가 산출물 후처리 없이 성립한다.

빌더의 실행 순서는 파싱 → 계층 검증 → 참조 해석 → 순환 검출 → 이름 충돌 검출 → 전체 성공 후 파일 기록이다. 부분 산출물을 남기지 않는다(FR-TOK-003 예외 처리, FR-TOK-006 예외 처리).

브레이크포인트는 예외다. CSS 커스텀 프로퍼티가 미디어쿼리 조건에서 평가되지 않으므로(SRS 5.2 기술 제약 3), `breakpoint.*`는 빌드 시 `@media (min-width: 800px)` 리터럴로 치환하고 동일 값을 `breakpoints` 객체로 export한다(FR-TOK-009).

### 결과

- 긍정: SRS의 토큰 관련 AC 전부가 빌더의 1급 검증 단계로 표현된다. `tokens.json`이 문서 사이트의 유일한 데이터 출처가 되어 FR-DOC-002 AC-1·AC-2가 성립한다. R-1(라이트 테마가 다크 전용 시각 장치를 재현하지 못한다)에 대해 컴포넌트 토큰 계층에서 라이트 팔레트가 solid 대안 값을 재정의하는 경로가 열린다.
- 부정: 빌더를 직접 유지보수한다. DTCG 소비 도구와 호환되지 않는다.
- 후속: Figma 연동이 제품 범위로 승격되면 `tokens.json`에 DTCG 익스포터를 추가하는 CR을 연다. 토큰 소스 형식은 바뀌지 않는다.
- 관련 오픈 결정: OD-001(대비 검사 대상 쌍 정의)은 `contrast-pairs.ts`와 `usage` 메타데이터 안에서 표현되므로, 어느 선택지로 결정되든 빌더 구조는 바뀌지 않는다.

---

## ADR-004 접근성 동작을 Radix UI에 위임

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_frontend_architecture.md`, `conductor_api_contracts.md`

### 맥락

FR-CMP-006 AC-5는 포커스 트랩, 롤 관리, 키보드 내비게이션을 Conductor가 자체 구현한 건수 0건을 요구한다. FR-A11Y-002는 Escape 닫기와 트리거 포커스 복귀를, FR-A11Y-005 AC-1은 axe-core serious 이상 위반 0건을, AC-4는 Radix가 제공하는 role/aria를 Conductor가 덮어쓴 건수 0건을 요구한다. NFR-003은 두 테마 모두에서 WCAG 2.1 AA를 요구한다. R-3은 Radix 버전 업그레이드가 DOM 구조를 바꿔 CSS가 깨질 위험을 기록한다.

### 선택지

1. **자체 구현**
2. **Radix UI** (`@radix-ui/react-*`)
3. **React Aria / React Aria Components**
4. **Headless UI**

### 결정

`@radix-ui/react-*` 1.x 개별 패키지를 정확 버전으로 고정해 채택한다.

자체 구현은 포커스 트랩, `aria-activedescendant` 관리, 타이프어헤드, 스크롤 잠금, 포털 레이어링을 직접 다룬다. FR-A11Y-002·005의 결함 표면이 넓어지고, axe serious 0건을 자체 코드로 지켜내는 비용이 v1 범위를 넘는다.

Headless UI는 프리미티브 범위가 좁고 Drawer에 해당하는 것이 없으며, Tailwind 생태계를 전제로 문서화되어 있다. ADR-002가 Tailwind를 배제한 상태에서 이점이 사라진다.

React Aria Components는 접근성 품질이 Radix에 필적하지만, Conductor가 스타일을 붙이는 방식이 결정 기준이다. FR-CSS-004 AC-4는 구조 셀렉터(`>`, `+`, `:nth-child`) 사용을 금지하고, R-3의 완화책은 `data-*` 속성 셀렉터만 사용하는 것이다. Radix는 `data-state`, `data-side`, `data-disabled`, `data-highlighted`를 안정된 공개 계약으로 노출하므로, DOM 구조가 바뀌어도 속성 셀렉터가 유지된다. 이 속성 표면이 ADR-005의 캐스케이드 전략과 정확히 맞물린다.

Radix에 Drawer 프리미티브가 없으므로 `Drawer`(C-041)는 `@radix-ui/react-dialog` 위의 측면 고정 콘텐츠 변형으로 구현한다. 포커스 트랩, Escape 닫기, 배경 스크롤 잠금, 트리거 포커스 복귀가 `Dialog`(C-040)와 같은 코드 경로에서 나오므로 FR-CMP-006 AC-1·AC-2가 두 컴포넌트에서 같은 근거로 성립한다.

버전은 캐럿 범위 없이 정확히 고정한다(R-3). 스프레드 순서를 `{...userProps} {...radixProps}`로 두어 사용자 props가 Radix의 role/aria를 덮어쓸 수 없게 한다(FR-A11Y-005 AC-4). `className`과 `style`만 명시적으로 병합한다.

아이콘은 `lucide-react`를 peer dependency로 둔다. Conductor는 아이콘을 번들하지 않으며, `StatusBadge`와 `SeverityTag`의 기본 아이콘도 peer에서 이름으로 import해 소비자 번들러가 사용분만 남기게 한다(SRS 10절).

Radix가 필요한 컴포넌트: C-040 Dialog, C-041 Drawer, C-042 Tooltip, C-043 DropdownMenu, C-053 Select, C-054 Switch, C-055 Checkbox. 나머지 22개 컴포넌트는 Radix에 의존하지 않는다. `Field`(C-050)는 네이티브 `label[for]`로 연결하므로 Radix Label을 쓰지 않는다.

### 결과

- 긍정: FR-CMP-006 AC-5가 정의상 만족된다. 접근성 결함의 대부분이 Radix의 검증 범위 안으로 들어간다. `Button`(C-001)이 Radix를 import하지 않으므로 M-7의 4KB 예산에 영향이 없다.
- 부정: Radix DOM 구조 변경에 노출된다(R-3). 7개 컴포넌트가 외부 패키지에 결합된다.
- 완화: 정확 버전 고정, `data-*` 셀렉터 전용, 구조 셀렉터 사용 시 CSS 산출물 검사 실패(FR-CSS-004 AC-4). 구조 변경이 감지되면 DEV를 등록한다.
- 후속: Radix 메이저 업그레이드는 시각 회귀 검사(JOB-CI-003)와 axe 검사(JOB-CI-002)를 통과해야 병합한다.

---

## ADR-005 CSS `@layer` 캐스케이드 제어와 `!important` 금지

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_frontend_architecture.md`, `conductor_api_contracts.md`

### 맥락

FR-CSS-001은 자체 스타일 전부를 `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility` 안에 선언하고 `!important`를 0건으로 유지할 것을, AC-3은 레이어 밖 소비자 규칙이 동일 명시도에서 Conductor 규칙을 덮어쓸 것을 요구한다. R-4는 소스의 `!important`와 전역 `*` 셀렉터를 그대로 옮기면 소비자 CSS와 충돌한다고 기록한다. NFR-005는 Chrome/Firefox/Safari/Edge 최근 2개 메이저를 지원 범위로 두며, `@layer`와 `:focus-visible` 지원을 전제로 명시한다.

### 선택지

1. **명시도 경쟁**: 셀렉터 명시도를 높이고 필요 시 `!important`.
2. **스코프 클래스**: 모든 규칙을 `.cdt-root` 하위로 한정.
3. **CSS `@layer`**

### 결정

`@layer`로 캐스케이드를 제어하고 `!important`를 0건으로 유지한다. 레이어 선언 순서는 산출물 최상단 한 줄에 고정한다(FR-CSS-001 AC-4).

명시도 경쟁은 소비자에게 더 높은 명시도를 강요하고, `!important`가 등장하는 순간 소비자의 유일한 대응은 더 강한 `!important`뿐이다. R-4가 지목한 실패 모드다.

스코프 클래스는 소비자가 루트에 클래스를 붙이도록 요구하고, 명시도를 한 단계 올려 재정의를 더 어렵게 만든다. `data-cdt-theme` 속성 하나만 요구하는 SCN-001의 3단계 통합 경로(M-5)와도 어긋난다.

`@layer` 안의 규칙은 레이어 밖 규칙보다 항상 약하다. 소비자는 명시도를 올리지 않고 평범한 클래스 셀렉터로 Conductor를 재정의한다(AC-3). 레이어 순서가 Conductor 내부의 우선순위를 명시적으로 표현하므로 컴포넌트 스타일이 레이아웃 스타일을 이기는 것이 셀렉터 길이가 아니라 선언으로 결정된다.

토큰 커스텀 프로퍼티 선언은 `cdt.base` 레이어에 둔다. 소비자가 레이어 밖에서 `:root { --cdt-accent: ... }`로 개별 토큰을 재정의할 수 있다.

`prefers-reduced-motion` 규칙은 전역 `*` 셀렉터 대신 Conductor 스코프 셀렉터를 쓰고 `cdt.base` 레이어에 둔다(FR-CSS-005 AC-4). 소비자의 애니메이션을 Conductor가 꺼버리지 않는다.

Radix가 인라인으로 주입하는 `--radix-*` 커스텀 프로퍼티는 레이어 대상이 아니다. 이 예외를 W-002에 문서화한다(FR-CSS-001 예외 처리).

### 결과

- 긍정: 소비자가 `!important` 없이 재정의한다. Conductor 내부 우선순위가 셀렉터가 아니라 레이어 선언으로 읽힌다. `cdt.reset`이 전역 리셋을 최하위 레이어에 격리하므로 소비자의 기존 전역 스타일을 이기지 않는다(R-4).
- 부정: `@layer`를 지원하지 않는 브라우저에서 레이어 안의 규칙 전부가 무시된다. 부분 저하가 아니라 스타일 소실이다.
- 완화: NFR-005의 지원 범위(최근 2개 메이저) 전부가 `@layer`를 지원한다. lightningcss의 browserslist 타깃을 이 범위로 고정해 다운레벨이 레이어를 평탄화하지 않게 한다(ADR-008).
- 검증: `!important` 0건과 전 규칙의 레이어 소속은 산출물 CSS를 postcss AST로 파싱해 검사한다(JOB-BUILD-002). 구조 셀렉터 0건도 같은 검사에서 확인한다(FR-CSS-004 AC-4).

---

## ADR-006 `--cdt-` 접두사 네임스페이싱

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_system_architecture.md`, `conductor_data_model.md`

### 맥락

R-5는 소스의 토큰 이름(`--surface-base`)을 그대로 쓰면 소비자 변수와 충돌한다고 기록한다. FR-TOK-004는 모든 커스텀 프로퍼티가 `--cdt-`로 시작할 것과, 접두사 없는 산출 시 빌드가 종료 코드 1로 실패할 것을 요구한다. FR-CSS-004 AC-1은 모든 클래스 셀렉터가 `cdt-`로 시작할 것을 요구한다. NFR-005의 브라우저 지원 범위가 사용 가능한 CSS 기능을 제한한다.

### 선택지

1. **접두사 없음**: 소스의 이름을 그대로 옮긴다.
2. **`--cdt-` 접두사** (커스텀 프로퍼티와 클래스 모두)
3. **CSS `@scope`**로 격리

### 결정

커스텀 프로퍼티는 `--cdt-`, 클래스는 `cdt-` 접두사를 강제한다. 토큰 키 `surface.raised`는 점을 하이픈으로 바꾸고 kebab-case로 낮춰 `--cdt-surface-raised`가 된다(FR-TOK-004 AC-2).

접두사 없음은 R-5의 충돌을 그대로 남긴다. 소비자가 `--accent`를 정의하면 Conductor 컴포넌트의 색이 바뀐다. 커스텀 프로퍼티는 상속되므로 충돌이 조용히 전파된다.

`@scope`는 클래스 충돌을 다루지만 커스텀 프로퍼티 상속에는 무력하다. 커스텀 프로퍼티는 스코프가 아니라 상속 규칙을 따른다. 또한 `@scope`의 브라우저 지원이 NFR-005의 "최근 2개 메이저" 전 브라우저에서 성립한다고 보기 어렵다. `@layer`(ADR-005)와 달리 이 기능에는 대체 경로가 없다.

접두사는 강제 가능하다는 점이 결정적이다. `buildTokens`가 산출 직전에 모든 선언의 접두사를 검사하고, 두 토큰 키가 같은 CSS 이름으로 변환되면 충돌한 두 키를 출력하고 실패한다(FR-TOK-004 AC-3, AC-5). 클래스 이름은 `cdt-<블록>[__<요소>][--<변형>]` 규칙을 CSS 산출물 검사가 확인한다(FR-CSS-004 AC-2).

접두사가 있으면 소비자가 개별 토큰을 의도적으로 재정의하는 경로도 명확해진다. `:root { --cdt-accent: ... }`는 레이어 밖 선언이므로 `cdt.base` 레이어의 기본값을 이긴다(ADR-005).

### 결과

- 긍정: 소비자 변수와의 충돌이 이름 공간 수준에서 사라진다(R-5). 브라우저 개발자 도구에서 Conductor가 소유한 값을 식별할 수 있다. 재정의 경로가 명시적이다.
- 부정: 이름이 길어진다. `agent-ai-platform`의 CSS를 이식할 때 모든 참조를 기계적으로 바꿔야 한다.
- 후속: 이식 시 이름 매핑 표를 `conductor_data_model.md`에 남긴다. FR-THM-001 AC-1이 소스의 `:root` 선언과 다크 팔레트의 1:1 대응을 요구하므로, 매핑 표는 이 검증의 근거가 된다.

---

## ADR-007 문서 사이트: Vite + React Router 프리렌더

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_frontend_architecture.md`

### 맥락

FR-DOC-001 AC-3은 문서 사이트가 정적 파일로 빌드되어 서버 런타임 없이 동작할 것을, AC-4는 실행 시 외부 도메인 네트워크 요청 0건을 요구한다. AC-1은 문서 사이트가 `@conductor-by-89soone/react`와 `@conductor-by-89soone/css`를 소비자로서 설치할 것을 요구한다. FR-DOC-002는 Foundations 화면을 토큰 빌드 산출물에서 생성할 것을, FR-DOC-003은 실제 DOM으로 렌더되는 라이브 프리뷰와 타입에서 생성한 props 표를, FR-DOC-004는 토큰별 테마 값과 대비율 표를, FR-DOC-007은 권장 예와 금지 예를 실제 컴포넌트로 병치할 것을 요구한다. NFR-001은 W-001의 LCP p75 2.5초를 예산으로 둔다. 화면 ID는 W-001 ~ W-050의 12개이며 W-021은 동적 세그먼트(`/components/:componentId`)를 갖는다.

### 선택지

1. **Next.js** (App Router, `output: "export"`)
2. **Storybook**
3. **Astro**
4. **Vite + React Router 7.x 프레임워크 모드** (`ssr: false` + `prerender`)

### 결정

Vite 6/7 위에서 React Router 7.x 프레임워크 모드를 `ssr: false`와 `prerender` 설정으로 사용해 라우트별 정적 HTML을 생성한다.

**Storybook을 쓰지 않는 이유.** Storybook은 컴포넌트 카탈로그 도구이며, W-020과 W-021만 놓고 보면 적합하다. 그러나 이 문서 사이트의 12개 화면 중 8개는 컴포넌트 카탈로그가 아니다. W-010 ~ W-014는 `tokens.json`을 읽어 표를 그리는 데이터 화면이고(FR-DOC-002), W-030은 두 테마의 값과 `contrast-report.json`의 대비율·판정을 병치하며 키 문자열 필터를 제공한다(FR-DOC-004 AC-1 ~ AC-4). W-040은 권장/금지 예를 사유 문장과 함께 병치하고(FR-DOC-007), W-050은 axe 허용 목록을 렌더한다(FR-A11Y-005 예외 처리). Storybook 위에서 이 화면들은 커스텀 애드온이거나 별도 사이트가 되고, 결과적으로 두 개의 사이트를 유지하게 된다. 또한 FR-DOC-001 AC-2는 모든 문서 화면이 하나의 셸 안에서 렌더될 것을 요구하는데, Storybook의 셸은 Conductor의 `AppShell`이 아니다. 문서 사이트가 Conductor의 첫 번째 소비자여야 한다는 FR-DOC-001 AC-1의 의도가 Storybook 셸 아래에서는 성립하지 않는다.

**Next.js를 쓰지 않는 이유.** `output: "export"`로 정적 산출이 가능하지만, 서버 런타임을 갖는 프레임워크를 서버 없이 쓰는 구성이다. React Server Components 경계, 이미지 최적화, 미들웨어 등 이 제품에 대응물이 없는 개념이 설정 표면에 남는다. `@conductor-by-89soone/react`가 `"use client"` 경계 패키지라는 사실도 App Router에서만 의미를 갖는 제약이다.

**Astro를 쓰지 않는 이유.** 아일랜드 아키텍처는 정적 콘텐츠 위주 사이트에 맞는다. 이 사이트는 W-021의 프리뷰 전수, W-030의 필터, 테마 토글이 상호작용하므로 대부분의 화면이 아일랜드가 된다. 얻는 JS 절감이 크지 않고 React 라우팅을 별도로 얹어야 한다.

**프리렌더가 주는 것.** 첫째, 라우트마다 완성된 HTML이 나오므로 서버 런타임이 없다(FR-DOC-001 AC-3). 둘째, 첫 페인트가 JS 실행을 기다리지 않아 LCP 예산에 여유가 생긴다(NFR-001). 셋째 — 이것이 결정적이다 — 프리렌더는 모든 공개 컴포넌트를 Node 환경에서 렌더하므로 FR-DX-004 AC-1의 SSR 안전성이 매 빌드마다 반증된다. 모듈 최상위에서 `window`에 접근하는 코드가 `@conductor-by-89soone/react`에 들어오면 문서 사이트 빌드가 실패한다. SSR 안전성 테스트를 별도로 두는 대신 빌드 자체가 게이트가 된다.

W-021의 동적 세그먼트는 `prerender` 함수가 컴포넌트 레지스트리의 `componentId` 목록을 나열해 처리한다. 레지스트리는 FR-DOC-003 AC-5("공개 export이면서 카탈로그 화면이 없는 컴포넌트 0건")의 검사 대상이기도 하다.

콘텐츠는 MDX가 아니라 TSX로 저작한다. 프리뷰가 실제 컴포넌트를 마운트해야 하고(FR-DOC-003 AC-1), 표시되는 코드는 렌더되는 모듈의 원문이어야 하기 때문이다. 예제 모듈을 정적 import로 렌더하고 같은 파일을 Vite `?raw`로 읽어 `CodeBlock`에 표시하면, 코드와 렌더 결과가 어긋날 수 없다. 런타임 트랜스파일러를 싣지 않으므로 LCP 예산도 지켜진다.

### 결과

- 긍정: 서버 런타임 0. LCP 예산 확보. SSR 안전성이 빌드 게이트가 된다. 문서 사이트가 `exports` 맵의 실사용 검증을 매 빌드마다 수행한다.
- 부정: 오류 경계가 서버 렌더 중에는 동작하지 않으므로, 프리렌더 중 예제가 예외를 던지면 빌드 전체가 실패한다. 런타임 코드 편집기를 둘 수 없다.
- 수용 근거: 깨진 예제가 배포되지 않는 것은 의도한 동작이다. 런타임 토큰/코드 편집기는 4.3 Out of Scope다. 프리뷰 오류 경계는 hydration 이후 상호작용 시점의 예외를 격리한다(FR-DOC-003 예외 처리).
- 후속: props 표는 react-docgen-typescript 2.x가 `@conductor-by-89soone/react`의 `.d.ts`에서 `props.generated.json`을 생성한다. 수동 작성 props 행 0건(FR-DOC-003 AC-2)은 화면이 이 파일 밖의 props 데이터를 참조하지 않는다는 사실로 성립한다.

---

## ADR-008 패키지 번들러: tsup + lightningcss

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_system_architecture.md`, `conductor_infrastructure_operations.md`

### 맥락

FR-DX-002는 모든 공개 진입점에 `.d.ts`를 배포하고 `any` 0건, 내부 타입 누출 0건을 요구한다. FR-DX-003은 `exports` 맵, `sideEffects` 선언, `Button` 단독 import gzip 4KB 이하(React 제외)를 요구한다. NFR-005는 React 18과 19, Node 20 이상을 지원 범위로 둔다. 소비자 번들러는 Vite, Next.js, Rspack 등이다(SRS 5.1 가정 3). `@conductor-by-89soone/css`는 `@layer` 순서와 `!important` 0건을 산출물에서 보장해야 하며(FR-CSS-001), 원격 폰트 참조가 0건이어야 한다(FR-CSS-002 AC-4). 전체 빌드는 3분 이하다(FR-DX-001 AC-3).

### 선택지

JS/TS 패키지:

1. **tsc만 사용**: 파일 단위 산출, 번들 없음.
2. **rollup** (+ `@rollup/plugin-typescript`, `rollup-plugin-dts`)
3. **tsup 8.x** (esbuild 번들 + dts 생성)

CSS 패키지:

1. **postcss 파이프라인** (`postcss-import` + `autoprefixer` + `cssnano`)
2. **lightningcss 1.x**
3. **번들 없이 원본 CSS 배포**

### 결정

JS/TS는 tsup 8.x, CSS는 lightningcss 1.x를 채택한다.

`tsc`만 쓰면 파일 단위 ESM 산출이 나오고 `.d.ts`도 함께 나온다. 트리셰이킹은 오히려 유리하다. 문제는 세 가지다. CJS 이중 산출을 얻으려면 두 번 컴파일하고 `package.json`을 나눠야 한다. `"use client"` 배너를 엔트리에 주입할 수단이 없다. 산출물이 수십 개 파일로 흩어져 size-limit 측정 대상이 모호해진다.

rollup은 산출 제어가 가장 정밀하지만 플러그인 조립이 필요하고, 3분 빌드 예산 안에서 esbuild 대비 이점이 없다.

tsup은 esbuild로 ESM+CJS를 한 번에 내고, `dts: true`로 `.d.ts`를 생성하며, `banner.js`로 `"use client"`를 엔트리 상단에 주입한다. `external: ["react", "react-dom", "lucide-react"]`로 peer를 제외한다. `treeshake` 옵션과 `sideEffects: false` 선언이 맞물려 FR-DX-003 AC-3의 4KB 예산을 성립시킨다.

`.d.ts`의 `any` 0건과 내부 타입 누출 0건(FR-DX-002 AC-2, AC-4)은 tsup의 dts 생성만으로는 보증되지 않는다. `@microsoft/api-extractor` 7.x가 공개 API 리포트(`.api.md`)를 생성하고, 리포트에 `any`가 나타나거나 이전 리포트와 차이가 생기면 CI가 실패한다. 이 리포트가 NFR-004의 "공개 API `any` 0건" 지표의 측정값이며, FR-DX-005 AC-1의 파괴 변경 판정 근거이기도 하다.

CSS는 lightningcss를 쓴다. `@import` 인라인, `@layer` 순서 보존, browserslist 타깃 다운레벨, 압축을 단일 도구로 수행한다. postcss 파이프라인은 같은 일을 세 개 플러그인으로 하고, `@layer`를 다루는 방식이 플러그인 조합에 따라 달라진다. 원본 CSS를 그대로 배포하면 `@import`가 소비자 번들러의 처리에 맡겨지고, `@conductor-by-89soone/css` 전체 gzip 20KB(NFR-001) 측정 대상이 불분명해진다.

lightningcss의 browserslist 타깃은 NFR-005의 "최근 2개 메이저"로 고정한다. 타깃을 더 낮추면 lightningcss가 `@layer`를 평탄화하거나 커스텀 프로퍼티를 정적 값으로 치환하려 시도할 수 있고, 이는 ADR-005와 ADR-002의 전제를 무너뜨린다.

CSS 산출물 검사(`!important` 0건, 전 규칙의 레이어 소속, 구조 셀렉터 0건, 원격 폰트 참조 0건)는 lightningcss가 아니라 postcss 8.x AST로 수행한다. postcss는 빌드 변환 도구가 아니라 검사용 파서로만 쓰인다. 같은 이유로 `pnpm lint:tokens`도 CSS는 postcss AST로, TypeScript는 TypeScript 5.x 컴파일러 API로 파싱해 위반의 파일 경로와 라인 번호를 출력한다(FR-TOK-001 AC-3).

`@conductor-by-89soone/tokens`도 tsup으로 빌드한다. 라이브러리 진입점과 두 개의 실행 파일(`buildTokens`, `checkContrast`)을 같은 설정으로 낸다.

### 결과

- 긍정: 빌드 도구가 두 개(tsup, lightningcss)로 한정된다. `"use client"` 배너, ESM/CJS 이중 산출, `.d.ts` 생성이 한 설정 파일에 있다. api-extractor 리포트가 타입 계약의 회귀를 잡는다.
- 부정: esbuild의 `.d.ts` 생성은 TypeScript 컴파일러 경로를 다시 타므로 빌드 시간의 상당 부분을 차지한다. lightningcss는 Rust 네이티브 바이너리이므로 플랫폼별 선택적 의존성을 갖는다.
- 완화: 3분 예산(FR-DX-001 AC-3)을 CI 잡 소요 시간으로 측정한다. lightningcss의 플랫폼 바이너리는 pnpm lockfile에 고정한다.
- 후속: `Button` gzip이 4KB에 근접하면 size-limit이 초과 모듈 목록을 출력한다(FR-DX-003 예외 처리). 이 목록이 런타임 의존성 도입의 사전 검토 자료가 된다.

---

## ADR-009 테스트 스택: Vitest + Testing Library + axe-core + Playwright

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_async_events_jobs.md`, `conductor_observability_reliability.md`

### 맥락

FR-QA-002는 공개 컴포넌트 전수의 단위 테스트와 `FR-<AREA>-<번호> AC-<번호>` 형식의 테스트 이름을 요구한다. FR-QA-003은 axe-core 검사를 컴포넌트 주요 상태 × 테마 2종으로 실행하고 serious 이상 위반 시 CI 실패를 요구한다(JOB-CI-002). FR-QA-004는 기준 컴포넌트 12개 × 테마 2종 = 24개 스냅샷의 픽셀 차이 1% 상한과 고정 컨테이너 이미지를 요구한다(JOB-CI-003). FR-QA-001은 두 테마 semantic 키 대칭 검사를, FR-DX-004 AC-1은 `renderToString` 예외 0건을 요구한다. NFR-003은 axe serious 이상 0건과 키보드 도달 100%를, NFR-004는 CI 전체 10분을 예산으로 둔다. R-2는 시각 회귀가 폰트 렌더 차이로 불안정해질 위험을 기록한다.

### 선택지

1. **Jest + jsdom + jest-axe + Percy**
2. **Vitest + Testing Library + axe-core + Playwright**
3. **Vitest + Storybook test-runner** (Storybook 기반 a11y/시각 회귀)

### 결정

Vitest 3.x + Testing Library 16.x + axe-core 4.x + Playwright 1.4x를 채택한다.

Jest는 ESM 처리에 별도 설정이 필요하고, 이 저장소의 패키지는 전부 ESM이다(ADR-008). Percy는 외부 SaaS이므로 시각 회귀 결과가 저장소 밖에 놓이고, NFR-002의 공급망 표면을 넓힌다. Storybook 기반 러너는 ADR-007이 Storybook을 배제했으므로 성립하지 않는다.

Vite가 이미 문서 사이트의 빌드 도구이므로 Vitest는 변환 설정을 공유한다. 세 계층으로 나눈다.

**jsdom에서 실행하는 것**: 렌더, props, 키보드 상호작용, FR-CMP-001의 공유 계약 스위트, FR-QA-001의 토큰 계약, Node 환경 `renderToString`(FR-DX-004 AC-1). 레이아웃 계산이 필요 없고 초 단위 피드백이 요구되는 검증이다.

**실제 브라우저에서 실행하는 것**: axe-core 검사. axe의 `color-contrast` 규칙은 레이아웃과 계산된 색을 요구하므로 jsdom에서 실행할 수 없다. jsdom을 쓰면 이 규칙을 예외 처리해야 하고, 그 예외가 FR-QA-003 AC-4의 허용 목록에 영구히 남는다. NFR-003이 두 테마의 대비를 요구하는 마당에 대비 규칙을 끄는 것은 검사의 목적을 훼손한다. 따라서 Vitest 브라우저 모드를 Playwright chromium 프로바이더로 실행하고 그 안에서 axe-core를 돌린다. Playwright는 시각 회귀에도 쓰므로 새 브라우저 의존성이 추가되지 않는다.

**Playwright 단독으로 실행하는 것**: 시각 회귀(JOB-CI-003), 문서 사이트 E2E(테마 지속성 FR-DOC-005 AC-2, 깜빡임 부재 AC-4, 클립보드 FR-DOC-006), 12개 라우트 × 테마 2종의 `@axe-core/playwright` 검사.

R-2에 대한 완화는 두 겹이다. 렌더 환경(브라우저 버전, 폰트)을 고정 컨테이너 이미지에 담고(FR-QA-004 AC-4), 기준 이미지 갱신을 `pnpm test:visual --update` 명령으로만 허용한다(AC-3). 그럼에도 diff가 불안정하면 OD-002에 따라 FR-QA-004를 REL-004로 이월하고 상태를 `deferred`로 표시한다. 시각 회귀는 Should 우선순위이므로 이 이월이 baseline을 막지 않는다.

대비 검사는 이 스택 밖에 있다. `checkContrast`(API-TOK-003)가 토큰 값에서 직접 WCAG 2.1 상대 휘도를 계산하며, 브라우저를 띄우지 않는다. 렌더 결과가 아니라 토큰 정의를 검사하므로 빌드 파이프라인의 앞단(JOB-CI-001)에 놓인다.

테스트 이름은 `FR-<AREA>-<번호> AC-<번호>: <설명>` 형식을 포함한다(FR-QA-002 AC-2). 공개 export에 대응 테스트 파일이 없으면 빌드 전 검사가 컴포넌트 이름을 출력하고 실패한다(AC-1).

### 결과

- 긍정: 브라우저 의존성이 Playwright 하나다. axe의 `color-contrast` 규칙을 끄지 않으므로 FR-QA-003 AC-4의 허용 목록이 실제 예외만 담는다. 단위 테스트는 jsdom에서 실행되어 CI 10분 예산(NFR-004)을 지킨다.
- 부정: 브라우저 모드 테스트는 jsdom보다 느리고, 컨테이너 이미지를 유지해야 한다.
- 완화: 브라우저 모드 대상을 axe 검사로 한정한다. 컨테이너 이미지 태그를 lockfile과 함께 고정한다.
- 후속: OD-002가 `deferred`로 결정되면 JOB-CI-003을 릴리스 게이트에서 제외하고 수동 시각 확인 절차를 `conductor_observability_reliability.md`에 기록한다.

---

## ADR-010 릴리스: Changesets + npm OIDC 배포

**상태**: accepted · **결정일**: 2026-07-10 · **영향 문서**: `conductor_infrastructure_operations.md`, `conductor_security_privacy_architecture.md`

### 맥락

FR-DX-005는 semver 부여, 릴리스별 변경 이력 생성, 변경 이력 항목이 없는 패키지의 버전 미상승, 파괴 변경 릴리스의 마이그레이션 노트 동반을 요구한다. NFR-002는 npm 배포 인증을 OIDC 기반 토큰으로 하고 장기 토큰을 쓰지 않을 것을 요구한다. NFR-004는 롤백 10분 이내와 파괴 변경 마이그레이션 노트 100%를 요구한다. SRS 5.3은 롤백을 "이전 버전 재배포(deprecate + 이전 태그 승격)"로 정의한다. SRS 11절은 모든 커밋과 PR 본문이 `Refs:` 줄에 `WP-###`와 `FR-<AREA>-###`를 기재할 것을 요구한다. 패키지 3종은 서로 의존하므로 버전이 연동된다.

### 선택지

1. **수동 `npm version` + 손으로 쓰는 CHANGELOG**
2. **semantic-release** (커밋 메시지에서 버전 도출)
3. **Changesets 2.x** (변경 의도를 파일로 커밋)

### 결정

Changesets 2.x로 버전과 변경 이력을 관리하고, GitHub Actions에서 npm OIDC 신뢰 배포로 게시한다(JOB-REL-001).

수동 관리는 FR-DX-005 AC-3("변경 이력 항목이 없는 패키지는 버전이 오르지 않는다")을 강제할 수단이 없다.

semantic-release는 커밋 메시지에서 버전을 도출하므로, 모노레포에서 어느 패키지가 영향을 받았는지 판정하려면 커밋 스코프 규약에 의존한다. 세 패키지가 서로 의존하는 상황에서 `@conductor-by-89soone/tokens`의 패치가 `@conductor-by-89soone/css`와 `@conductor-by-89soone/react`의 버전을 어떻게 움직여야 하는지가 커밋 메시지로 표현되지 않는다.

Changesets는 변경 의도를 `.changeset/*.md` 파일로 커밋한다. 이 파일이 영향받는 패키지와 bump 종류(major/minor/patch)를 명시하므로 세 패키지의 연동 버전이 결정적으로 계산된다. 변경 이력 항목이 없는 패키지는 버전이 오르지 않는다(AC-3). changeset 파일 없이 병합된 변경은 CI의 `changeset status` 검사가 잡아 릴리스를 중단하고 누락 목록을 출력한다(FR-DX-005 예외 처리).

파괴 변경 판정의 근거는 커밋 메시지가 아니라 api-extractor의 공개 API 리포트(ADR-008)다. `.api.md`에 차이가 생기면 리뷰어가 major changeset을 요구하고, 마이그레이션 노트를 changeset 본문에 포함시킨다(AC-1, AC-4). 이 노트가 CHANGELOG로 흘러 NFR-004의 "마이그레이션 노트 동반률 100%"를 만족한다.

changeset 본문에 관련 FR/WP ID를 기재하므로 CHANGELOG 항목이 요구사항 ID를 인용한다(AC-2, SRS 11절 4항).

배포 인증은 GitHub Actions의 `id-token: write` 권한으로 OIDC 토큰을 발급받아 npm 신뢰 배포로 게시한다. 저장소에 npm 장기 토큰을 저장하지 않는다(NFR-002). 같은 워크플로에서 provenance 증명이 함께 발행되어 산출물의 출처가 공개 검증 가능해진다. 릴리스 전 게이트로 `pnpm audit --audit-level high`를 실행하고, high 이상 취약점이 1건이라도 있으면 배포하지 않는다(SRS 5.3, NFR-002).

롤백은 재배포가 아니라 태그 조작이다. `npm dist-tag add @conductor-by-89soone/<pkg>@<이전 버전> latest`로 이전 버전을 `latest`로 승격하고, 문제 버전을 `npm deprecate`로 표시한다. 세 패키지에 대해 순차 실행해도 명령 6개이며 NFR-004의 10분 예산 안에 들어온다. 버전 번호를 재사용하지 않으므로 npm의 불변 게시 규칙과 충돌하지 않는다.

### 결과

- 긍정: 버전 계산이 결정적이고 세 패키지의 연동이 명시적이다. 장기 토큰이 없다(NFR-002). CHANGELOG가 FR/WP ID를 인용한다. 롤백이 게시가 아니라 태그 조작이므로 10분 예산을 지킨다.
- 부정: 기여자가 changeset 파일을 커밋해야 한다. 잊으면 CI가 실패한다.
- 완화: `changeset status` 검사의 실패 메시지가 누락된 패키지 목록을 출력한다. 코딩 에이전트의 작업 패키지 DoD에 changeset 생성을 포함한다.
- 후속: OIDC 신뢰 배포는 npm CLI와 레지스트리 양쪽이 지원하는 버전을 CI 이미지에 고정한다. CR-022에서 현재 최소 조건을 Node 22.14.0/npm 11.5.1로 재검증하고 release job을 Node 22.14.0/npm 11.18.0으로 고정했다. public source repository가 아니면 provenance가 생성되지 않으므로 게시 전 사전 검사로 실패한다. 미게시 패키지는 Trusted Publisher를 등록할 수 없어 최초 1회 `bootstrap` dist-tag 생성 후 패키지별 신뢰 관계를 등록한다.

## ADR-011 업무 탐색 확장과 연구 기록

- 상태: review, CR-041 / FR-CMP-010~013 / WP-029~032.
- 2026-09-13 공식 자료 확인. 아래는 설계 근거이며 실행 검증을 대신하지 않는다.

| 질문 / 출처 | 확인 / 결론 | 구현·검증 위치 |
| --- | --- | --- |
| [Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) | 문서 1.1.18: controlled, manual/automatic, forceMount 제공. 기존 Radix 채택을 유지하고 기본 활성화 선택을 별도 기록 | interactions / keyboard test |
| [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | 단일 입력 선택·popup 계약을 다중 토큰 입력에 그대로 적용하지 않는다 | search / IME test |
| [APG Tree](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) | 펼침·선택·포커스와 방향키 계약을 구별; 단순 역할 부착은 불충분 | path navigation / keyboard |
| [Next server/client](https://nextjs.org/docs/app/getting-started/server-and-client-components) | client 경계는 import graph에 영향을 준다. SSR 성공만으로 RSC 소비 완료라 하지 않는다 | build entry / packed Next fixture |
| [Primer components](https://primer.style/product/components/) | Table·SplitPageLayout·Token·TextInputWithTokens의 역할 분리를 참고. 코드·외형 복제나 stack 교체 없음 | workbench composition |
| [WCAG 2.2 target](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | 24 CSS px 및 spacing 예외가 있는 점검 목표. 제품 전체 인증 주장은 하지 않는다 | compact controls / browser |
| [React Flow accessibility](https://reactflow.dev/learn/advanced-use/accessibility) | keyboard·label·편집 제어 옵션 검토. 읽기 전용 소규모 표현에는 외부 편집 엔진의 추가 API/CSS 비용을 피하는 SVG 대안을 검증 | relation / 50·300-node measurement |
| [CSS Cascade 5](https://www.w3.org/TR/css-cascade-5/#layering) | 기존 cdt 레이어·portal 테마 전달을 유지하고 소비 CSS 충돌을 fixture에서 확인 | css / portal tests |

### ADEC-001 결정적 관계 레이아웃

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | 안정 ID 정렬 SVG grid와 semantic Table 대안을 채택, 편집 엔진 의존성 없음. 유형 필터에도 노드 좌표와 viewport를 보존하고 pan 버튼 제공 |
| 필요 근거 | 사용자 요구는 읽기 전용 방향·근거 탐색, 사이클 허용, 300노드 측정. 편집 엔진 기능을 요구하지 않음 |
| 대안 | force simulation은 지속 이동·결정성 비용, React Flow는 편집 기능·CSS·번들 계약 추가, DAG layout은 사이클 의미에 부적합 |
| 영향 | 노드 배치가 의미적 순서/거리나 중요도를 뜻하지 않는다. 추가 네트워크·persistence 없음. 선택은 현재 메모리에서 유지 |
| 범위 | relation 컴포넌트/CSS·합성 docs 조합·관계 테스트 |
| 검증 | 구현 에이전트의 실제 결정성·상호작용·크기 측정은 구현 원장에 동기화; 현재 단계에서 수치 미기록 |
| 되돌리기 | 같은 데이터·선택 계약을 유지하며 레이아웃 구현/CSS를 교체. 운영 데이터 영향 없음 |

### ADEC-002 Combobox 보완 라이브러리와 Radix 확장

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 (사용자는 기능을 요구했고 패키지 선택은 지정하지 않음) |
| 결정 | Radix tabs 1.1.21, popover 1.1.23, collapsible 1.1.20; 단일 Combobox만 Downshift 9.4.0 사용 |
| 필요 근거 | 설치된 Radix에 Combobox 패턴이 없음. Downshift 로컬 README/타입 검토; 공식 사이트 접속 시 timeout은 미확인으로 기록. 설치 시 전이 패키지 35개 추가(설치 로그 기준) |
| 대안 | 자체 ARIA/키보드 구현은 유지 비용, 전체 UI 엔진 교체는 기존 ADR 위반. 멀티 선택까지 같은 Combobox 의미로 묶지 않음 |
| 영향 | 공개 의존성과 lockfile 증가, Combobox import 번들 증가. 기본 Button 경로에 강제 포함되는지 실제 번들로 확인해야 함 |
| 범위 | React manifest/lockfile, interaction/search, 패키지 API와 fixture |
| 검증 | 설치 완료. 최종 번들·React18/19 호환성 결과는 원장에 동기화 |
| 되돌리기 | Combobox 구현을 동일 controlled 계약의 대안으로 교체 후 의존 제거, 소비자 업무 데이터 영향 없음 |

### ADEC-003 다중 선택과 경로 탐색의 네이티브 조합

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | 다중 선택은 fieldset/legend와 기존 Radix Checkbox group, 경로 탐색은 native details 기반 경로 목록으로 구현 |
| 필요 근거 | 지시서는 TreeView 또는 경로 목록 대안을 허용한다. 펼침·선택 정보를 표현하는 데 tree/treegrid 전체 키보드 모델을 약속할 필요가 없음 |
| 대안 | ARIA tree는 roving focus/방향키/typeahead의 추가 계약. 다중 선택 Combobox는 단일 입력 의미와 혼동 가능 |
| 영향 | 경로 목록은 Tab/Enter/Space 네이티브 탐색이며 tree 방향키 모델은 제공하지 않는다. 다중 선택은 체크 상태를 각 항목에서 확인한다 |
| 범위 | 검색 입력/경로 목록과 합성 검색 화면·접근성 검사 |
| 검증 | 구현 및 키보드 검사는 원장에 동기화. 화면을 ARIA Tree 지원으로 표시하지 않음 |
| 되돌리기 | 공개 경로 데이터 계약을 보존하여 보완 TreeView로 교체 가능; 키보드 모델 변화는 마이그레이션 필요 |

### ADEC-004 컴포넌트 모듈 경계 보존

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | tsup bundle:false로 모듈을 보존하고 상대 JS import의 .js 확장자를 산출 시 보완. 상호작용 컴포넌트 모듈에 use client를 보존하며 index/cx/types를 일괄 client로 만들지 않음 |
| 필요 근거 | 기존 SSR 검사만으로 App Router 서버/클라이언트 경계를 증명할 수 없음. 패키지 모듈 평가 및 번들 경계 작은 실험을 수행 |
| 대안 | 모든 barrel에 client 지시문은 서버 export 경계를 불필요하게 넓힘. 단일 번들은 개별 지시문을 지울 수 있음 |
| 영향 | ESM 산출 파일 수와 import graph 변화, 기존 root 공개 import는 유지. React18/19/Next tarball 소비 확인 필요 |
| 범위 | React tsup config·component module·dist·packed consumer |
| 검증 | 최종 tarball·hydration·size 결과는 원장에 동기화, 미실행을 성공으로 기록하지 않음 |
| 되돌리기 | 이전 번들 전략 복구는 RSC 경계 회귀 가능; boundary fixture를 함께 유지해 판정 |

### ADEC-005 기본 밀도·분할 크기·탭 활성화

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | DataTable comfortable 기본/compact opt-in, inspector 기본40%·25~60% range 및 좁은 폭 세로 배치, Tabs manual 기본/automatic opt-in |
| 필요 근거 | 조밀함과 조작 영역을 분리하고 드래그 대체 조작을 제공. 비싼 패널에서 초점 이동만으로 조회가 발생하지 않도록 선택 |
| 대안 | compact 또는 automatic 기본은 화면 밀도와 focus/조회 효과를 바꿈. 포인터 전용 resize는 키보드 동등 조작 없음 |
| 영향 | 새 API의 기본 행 밀도, panel 공간, 탭 활성화 키가 결정됨. 기존 Table/Card 기본 시각은 유지 |
| 범위 | workbench·interaction CSS/API·README·합성 화면 |
| 검증 | 부모 에이전트의 키보드/반응형·패키지 검사 결과를 원장에 연결 |
| 되돌리기 | 소비자는 density/width/activationMode를 명시하여 이전 조합에 맞출 수 있음. 기본값 변경은 이후 migration 기록 필요 |

### ADEC-006 독립 조합 예제 경로

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | W-060/061/062, /examples/workbench·relations·operations를 별도 라우트로 제공 |
| 필요 근거 | 세 흐름을 직접 링크/캡처/브라우저 재현하고 기존 가이드 화면을 보존 |
| 대안 | W-040 한 화면에 전부 넣으면 초기 렌더와 탐색 복잡도 증가 |
| 영향 | docs 내비와 route 추가, 패키지 API나 운영 네트워크 변경 없음 |
| 범위 | docs App/catalog, IA·matrix·SRS·WP |
| 검증 | catalog docs typecheck 통과; 최종 route 브라우저 증거는 부모 기록 참조 |
| 되돌리기 | 예제 route와 내비 제거 후 가이드 조합으로 옮김; 공유된 예제 URL 영향 |

ADEC-001 실험 동기화(관계 구현 담당 보고, 2026-09-13): Chromium 개발 모드·두 animation frame 후 관찰. 50노드 선택34.9ms/zoom41.5ms/유형filter33.3ms,300노드87/53.7/34.9ms. 유형filter 후 DOM630/3355개, navigation184/202ms. 8 Vitest·타입·eslint 통과, light360 axe serious/critical0. React Flow는 설치·동등 성능 비교하지 않았으므로 상대 우월성 주장을 하지 않는다. 50노드 초과 간선 라벨은 선택 간선만 SVG에 표시하고 표에는 전부 유지하는 가독성 선택이 추가되었다. 실제 스크린리더·운영 API는 미검증.

### ADEC-007 Shell 연결과 고유 기본 ID

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 (닫힘 포커스 복귀 자체는 사용자 명시 요구) |
| 결정 | AppShellNavTrigger, navLabel, 선택적 routeKey를 추가하고 미지정 mainId를 useId로 생성 |
| 필요 근거 | 반복 Shell의 고정 ID 충돌과 외부 trigger Escape 후 body 포커스를 재현 |
| 대안 | 소비자 requestAnimationFrame 보완만 유지하면 라이브러리 자체 복귀 계약과 반복 배치 충돌이 남음 |
| 영향 | 기존 고정 ID CSS/앵커 사용자는 mainId="cdt-main" 명시. routeKey는 지정한 경우에만 경로 변경 시 main 포커스·drawer 닫힘을 수행 |
| 범위 | shell·공개 API·README·consumer fixture |
| 검증 | Shell 단위22건, 두 테마 axe, 실제 tarball과 격리 소비자 Shell E2E. 최종 집계는 구현 원장 참조 |
| 되돌리기 | 소비자 mainId 명시와 routeKey 미지정으로 기존 탐색 정책 유지; trigger 복귀 수정 제거 시 기존 결함 재발 |

### ADEC-008 선택 진입점과 import 비용 제어

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | ./relation 선택 진입점, 그래프 gzip 8 KiB 예산, 순수 workbench forwardRef 생성 주석과 import 비용 검사 추가 |
| 필요 근거 | 산출물 측정에서 단일 DataTable·ProcessingStatus import가 Downshift까지 보존하는 현상을 확인 |
| 대안 | 파일 전체를 그대로 번들하면 불필요한 의존이 남음; 모든 export를 별도 파일로 분해하면 변경 범위가 커짐 |
| 영향 | DataTable 46,944→2,917 B, ProcessingStatus 46,941→2,679 B gzip. Combobox 46,948→42,443 B. Button 1,365 B, RelationGraph 5,432 B. React/DOM/lucide peer 제외, gzip9·같은 도구 기준. API 동작 변경 없음 |
| 범위 | workbench 순수 생성 표시·React manifest·measure-workspaces 스크립트·README |
| 검증 | 실제 esbuild 기여 모듈에서 Button/DataTable/ProcessingStatus의 Downshift·relation·interaction 혼입을 실패로 처리. 그래프는 기존 Button/CSS 예산과 별도로 검사 |
| 되돌리기 | 순수 생성 표시 제거 시 동작 유지·번들 증가. subpath 제거는 해당 소비자 import 마이그레이션 필요 |

### ADEC-009 예제의 탐색 위치와 읽기 공간

| 필드 | 기록 |
| --- | --- |
| 분류 | Agent 자발적 추가 |
| 결정 | 합성 검색 예제 선택 후 inspector에 포커스를 주고 닫을 때 선택 버튼에 preventScroll로 복귀. 예제 표만 높이를 제한하고 내부 스크롤 제공. 공유 조건은 기존 HashRouter의 hash query에 replace로 저장 |
| 필요 근거 | 좁은 화면에서 미리보기가 긴 목록 아래에 배치됨. 첫 캡처의 긴 문서와 직접 경로 시험으로 실제 HashRouter 계약 확인 |
| 대안 | 선택 포커스를 그대로 두면 모바일에서 미리보기를 찾아 긴 이동 필요. 전체 문서 가로 스크롤이나 URL 커서는 요구 위반 |
| 영향 | 예제 선택의 포커스가 이동하며 목록 스크롤·로드된 행은 유지. q/repository/state/sort/direction만 공유하고 cursor는 저장하지 않음. 범용 DataTable은 소비자 onSelect 정책을 강제하지 않음 |
| 범위 | docs 검색 예제·CSS·workspaces E2E |
| 검증 | 검색/IME/이어 보기/상세 모달/경로/닫기/필터/재로드,360~1536px 두 테마. 텍스트200%와 reduced motion 검사이며 실제 스크린리더 인증은 아님 |
| 되돌리기 | 예제 onSelect 포커스 이동·높이 제한 제거. 공개 컴포넌트 API·운영 데이터 영향 없음 |

ADEC-001 최종 보완: 같은 행에서 중간 노드 뒤로 가려지는 간선을 위로 휘게 하여 방향을 읽도록 했다. 노드 좌표는 그대로 유지한다. 관계 대체 목록 이동은 기본 hash 이동을 막고 해당 목록에 초점/스크롤을 옮긴다. HashRouter 소비자의 현재 경로를 파괴하지 않기 위한 구현 조건이다. 그래프 유형 필터·선택·zoom 이후 viewport 보존 검증을 포함한다.

사용자 명시 요구/구현 조건: 세 흐름 구현, Vanilla CSS/Radix 유지, 실제 tarball, React18/19와 Next 검증, 합성/운영 분리, IME 방지, 권한 콜백 소유, 문서 review 유지, 원격 게시 금지는 Agent가 추가한 제품 정책이 아니다. 새 polling·자동 재시도·분석 이벤트·인증 후 영속 상태는 추가하지 않았다.
