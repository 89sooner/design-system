# 확정 결정과 그 이유

## WP-027 릴리스 자동화 결정 (2026-07-13)

### 파괴 변경 판정의 근거는 커밋 메시지가 아니라 API 리포트다

`check:api`가 api-extractor로 `packages/tokens/etc/*.api.md`, `packages/react/etc/react.api.md`를 추출해 커밋된 기준과 대조한다. 차이가 나면 exit 1이다(export 1건 제거 픽스처로 실증). 의도된 변경이면 `--update`로 기준을 갱신하고 그에 맞는 changeset을 함께 커밋한다. ADR-008이 이미 지정한 방식이며, semantic-release식 커밋 메시지 추론을 쓰지 않는 이유이기도 하다.

같은 스크립트가 리포트의 `any` 노출도 막는다(FR-DX-002 AC-2). 기존에는 React `.d.ts`만 간접 검사했다.

### changeset 규약은 자체 스크립트로 강제한다

`check:changesets`가 (1) 본문에 `Refs:` + WP/FR ID가 있는지(FR-DX-005 AC-2), (2) major에 `## Migration` 절이 있는지(AC-4), (3) 배포 대상 패키지만 지정했는지 검사한다. 각각 음성 픽스처로 exit 1을 확인했다. Changesets 자체는 이 규약을 모른다.

### version PR 잡과 publish 잡을 분리한다

`release.yml`의 `version` 잡은 자격증명이 없고 `publish` 잡만 `id-token: write`를 갖는다. PR 코드가 릴리스 권한으로 실행되는 THR-002를 막는다. 수동 승인은 maintainer의 `workflow_dispatch`(또는 태그 push)다.

기각: "버전 PR 병합 → 워크플로가 태그 생성 → 태그가 배포 트리거"(문서 원안). `GITHUB_TOKEN`이 push한 태그는 재귀 방지로 워크플로를 트리거하지 않아 성립하지 않는다(DEV-008 / CR-015). 태그는 배포 잡이 게시 **후** 만든다.

### 롤백은 게시가 아니라 태그 조작이다

`scripts/release-rollback.mjs`가 deprecate → `dist-tag add ... latest` → `view dist-tags` 9개 명령을 순차 실행한다. 기본은 dry-run이며 `--execute`가 있어야 실제로 돈다. npm은 게시 버전을 지울 수 없으므로 이것이 유일하게 성립하는 롤백이다(ADR-010).

## WP-028 문서 사이트 배포 결정 (2026-07-13)

### 랜딩을 프리렌더한다 (예산이 그것 없이는 성립하지 않는다)

라우트 코드 분할만으로는 Fast 3G LCP p75가 3,580ms로 예산(2,500ms)을 넘는다. `entry-server.tsx` + `scripts/prerender.mjs`가 랜딩 마크업을 `dist/index.html`에 주입하면 1,793ms다. 동일 번들에서 마크업만 제거한 A/B 6회 교차 실행으로 격리 확인했다.

`hydrateRoot`가 아니라 `createRoot` 재마운트다. 테마 의존 렌더(Switch checked 상태)가 hydration mismatch를 낳기 때문이다. 두 렌더가 어긋나면 레이아웃 이동으로 드러나므로 CLS 게이트(0.1)로 잡는다 — 실측 0.000.

따라서 **FR-DX-004 AC-3(hydration 일치)은 이것으로 닫히지 않는다.** 라이브러리의 hydration 보증은 별도 브라우저 하네스의 몫이다.

### LCP는 시뮬레이션이 아니라 실측이다

lantern 시뮬레이션은 프리렌더된 첫 페인트를 모델링하지 못해 프리렌더 유무와 무관하게 3,002ms를 예측한다. SRS NFR-001이 명시한 조건은 "로컬 프로덕션 빌드, Fast 3G 스로틀"이므로 DevTools 프리셋(RTT 150ms, 1.6Mbps, CPU 4x)을 실제로 적용해 관측한 값을 지표로 삼는다(DEV-010 / CR-017). 두 값을 모두 원장에 기록했다 — 측정 방법이 판정을 뒤집는 사안을 숨기지 않기 위해서다.

7회 측정해 p75(6번째)를 쓴다. 5회면 느린 실행 1건이 p75를 그대로 밀어올려 게이트가 근거 없이 빨개진다.

### 배포는 Pages 스냅샷 교체, 롤백은 커밋 ref 재배포

인프라 운영 §8의 "버전 디렉터리 + 별칭 전환 + 직전 5개 보존"은 GitHub Pages에 존재하지 않는 기능이다. Pages의 배포 단위는 사이트 스냅샷 전체이며 교체가 원자적이므로, §8의 실제 불변식(방문자가 신·구 자산 혼재를 받지 않는다)은 유지된다. 롤백은 직전 정상 커밋을 `ref`로 지정한 재배포다 — lockfile 고정 재빌드는 결정적이다(DEV-009 / CR-016).

### Lighthouse 러너는 Playwright Chromium에 CDP로 붙인다

`chrome-launcher`는 WSL에서 프로필 경로를 Windows 형식으로 바꿔 리눅스 Chrome에 넘기고, 그 문자열이 저장소 안 디렉터리로 만들어진다(64개 발생). Playwright가 이미 브라우저를 관리하므로 같은 바이너리를 직접 띄우고 포트만 Lighthouse에 넘긴다. 의존성 하나가 줄었다.

## WP-018~022 문서 사이트 구현 결정 (changes에서 복원, 2026-07-12)

- docs는 배포 서버가 없는 Vite 정적 앱이다. 이전 tsup package placeholder는 제거했고 React Router는 docs 앱 내부 의존성으로만 둔다.
- first paint theme는 `index.html` 인라인 스니펫이 저장값 → OS 선호 순서로 루트 `data-cdt-theme`를 정한다. React 토글은 그 속성만 바꾸며 localStorage read/write 실패를 삼킨다.
- Foundations와 token reference는 사람이 값을 복사하지 않고 `@conductor-by-89soone/tokens` 빌드 산출물에서 읽는다. contrast 화면도 브라우저에서 재계산하지 않고 build report 판정을 표시한다.
- component catalog metadata는 `packages/react/dist/index.d.ts`를 TypeScript AST로 읽어 만든다. 공개 export에 preview가 없으면 docs build가 실패한다.
- WP-018~022를 done으로 기록한 흔적은 충분하지만, root test와 lint가 red인 현재 상태에서는 새 WP를 시작하기 전에 통합 green과 DoD ledger sync를 우선한다.
- `vitest.config.ts`의 tokens jsdom 전환은 docs Playwright 구현과 직접 관계가 없고 file-URL 테스트를 깨뜨린다. handoff refresh에서는 수정하지 않고 최소 복구 후보로 기록했다.

## WP-010~012 구현 결정 (2026-07-11)

- 라이트 semantic 값은 다크 팔레트의 metadata/key를 복제한 뒤 명세 §6에서 정한 값만 재정의한다. 키를 별도 수기로 나열하면 FR-QA-001 대칭이 깨질 위험이 더 크다.
- 테마 우선순위는 다크 `:root` → 명시 light/dark 속성 → 속성 없는 OS-light 폴백이다. 무효 속성은 :root 다크를 유지한다.
- `publicComponents` registry는 공개 컴포넌트·테스트 파일·SSR renderer를 함께 보유한다. 이후 WP가 export를 추가할 때 테스트와 SSR 등록 누락을 빌드 전 검사로 막는다.
- React `.tsx`를 workspace alias로 소비하는 docs까지 포함해 JSX 설정은 package가 아니라 `tsconfig.base.json`에 둔다.

## WP-013~014 구현 결정 (2026-07-11)

- 상태 배지의 queued/neutralEnd는 사용자가 고르는 variant가 아니라 status token usage가 정한 marker shape다. 색 대비가 부족한 중립 상태를 배경/전경으로 뒤집지 않는다.
- Table의 root는 내부 `<table>`을 감싼 scroll owner다. public contract의 root prop 통과와 native table naming을 함께 만족하도록 `aria-label`을 wrapper와 table에 모두 전달한다.
- Timeline의 `:focus-visible` 규칙은 공통 focus ring을 바꾸지 않으며 overflow clipping 방지용 stacking만 담당한다. 기존 "component focus selector 0" 테스트는 이 명시 예외에 맞춰 `box-shadow`/`outline` override 0으로 좁혔다.
- data primitives의 token source는 table만 선행되어 있었다. UI spec의 component-token 표에 이미 있는 timeline/codeBlock/kbd semantic mappings만 구현하고 token spec에도 기록했다.

## WP-015 구현 결정 (2026-07-11)

- Dialog/Drawer는 같은 fixed-version `@radix-ui/react-dialog`을 사용한다. Drawer는 별도 focus/scroll implementation이 아니라 side class만 다른 Dialog content다.
- Radix primitive의 role/aria props를 직접 설정하지 않고 user props를 먼저 spread한 뒤 wrapper class/visual props만 병합한다. 접근성 속성의 최종 소유자는 Radix다.
- Radix dependency 3개는 exact runtime dependency이자 tsup external이다. peer dependency로 소비자에게 설치를 떠넘기거나 library bundle 안에 포함하지 않는다.
- Tooltip과 Menu의 jsdom test는 browser API/포인터 환경 차이를 test-only shim과 default-open fixture로 다룬다. 실제 browser/axe gate는 WP-024 범위다.

저장소 문서에서 읽을 수 있는 "무엇"이 아니라, 문서에 남기 어려운 "왜"와 "무엇을 기각했는가"를 기록한다.

## 사용자가 직접 내린 결정 (인터뷰 4문항, 2026-07-10)

| 결정 | 선택 | 기각한 대안 | 이유 |
| --- | --- | --- | --- |
| 이름/네임스페이스 | **Conductor** (`@conductor-by-89soone/*`, `--cdt-*`) | Katakuri, Halo | 소스 `tokens.css` 첫 줄이 이미 "Conductor product UI tokens"였다. 계보가 명확 |
| 산출물 범위 | **토큰 + React 컴포넌트 + 문서 사이트** | 토큰만 / 토큰+컴포넌트 / +Figma 동기화 | Figma 동기화는 외부 도구 의존과 DTCG 포맷 채택이 선행돼야 함 (F-X-001로 명시 제외) |
| 테마 | **다크 우선 + 라이트 추가** | 다크 전용 / +고대비 | 라이트는 토큰 계층이 실제로 테마를 분리하는지 검증하는 테스트 케이스다. 고대비는 팔레트 3벌 유지 비용 회피 |
| 스타일 엔진 | **Vanilla CSS + CSS 커스텀 프로퍼티** | Tailwind v4 preset, CSS Modules, vanilla-extract | 소스와 동일. 프레임워크 비종속, 런타임 0. preset은 소비자를 Tailwind에 결속 (ADR-002) |

## 오픈 결정 (OD) 처리

| OD | 질문 | 결정 | 상태 |
| --- | --- | --- | --- |
| OD-001 | 소스 팔레트의 WCAG 미달 5건 처리 | **최소 수정**: 접근성 결함(포커스 링, 폼 경계)만 값 교정. 나머지는 `usage` 메타데이터로 분류하고 값 보존 | closed (CR-005) |
| OD-002 | 시각 회귀 검사를 v1 게이트에 넣는가 | **REL-004로 이월**. FR-QA-004 = `deferred` | closed |
| OD-003 | 필터/칩 컴포넌트군을 v1에 넣는가 | 미결. FR 미부여, WP 없음 | **open (비차단)** |
| OD-004 | 셸 컴포넌트군을 패키지에 넣는가 | **`@conductor-by-89soone/react`에 포함**. `renderLink` props로 라우팅 비종속 API 성립 | closed |

### OD-001을 "최소 수정"으로 고른 이유

세 선택지를 실측 수치와 함께 제시했다.

- **소스 100% 보존**: 포커스 표시자는 `decorative`로 분류할 수 없다(사용자가 키보드 위치를 잃음). NFR-003을 "AA 부분 준수"로 낮춰야 했다. → 기각
- **최소 수정 (채택)**: `focusRing` alpha 0.30→0.80, 신규 `border.control`. 시각 변화가 포커스 상태와 입력 경계에만 국한된다
- **전면 AA**: `text.faint`를 올리면 `text.muted`와 구분이 사라지고, `status.queued`/`neutralEnd`가 같은 값으로 수렴한다. G-1(시각 보존)과 M-1(시각 회귀 1%)을 동시에 깨뜨린다. → 기각

## CR로 처리한 문서 결함 (구현 중 발견)

### CR-006 — `status.neutralEnd` 모순 (해소안 A)

SRS §12.1이 `usage: nonText`(3:1)를 부여하면서 값 `#475569`를 보존하라고 지시했다. 실측 대비율은 표면 6종에서 2.04 ~ 2.60. **두 지시가 동시에 성립하지 않는다.**

- **해소안 A (채택)**: 값 보존, `usage` → `decorative`. 근거: (1) FR-THM-005 AC-7이 아이콘+텍스트 병기를 이미 강제해 WCAG 1.4.1 충족, (2) 소스 `.timeline-marker`가 표면색 링(`app.css:585`)으로 도형 경계를 만들어 점의 식별이 채움 대비에 의존하지 않음, (3) `border.*`에 적용한 WCAG 1.4.11 예외와 동일 논리
- **해소안 B (기각)**: `#5d6e86`으로 밝게(3.26:1). `status.queued`(`#64748b`)와 명도 근접, 세 번째 시각 회귀 원인. OD-001의 "최소 수정" 방침과 충돌
- **남는 대가**: 다크 테마 종료 상태 점이 흐리게 읽힌다(최대 2.60:1). 검사 통과가 "잘 보인다"는 뜻이 아니다. 원장 §5 알려진 제약에 기록됨

CP-025는 선언 목록에서 제거됐고 **ID는 재사용하지 않는다** (CP-001~CP-041에 40개, 결번 1).

### CR-008 — 토큰 계층 참조 규칙 (DEV-001)

FR-TOK-002 AC-2("semantic은 primitive만 참조")와 FR-THM-001 AC-2(별칭 `surface.2`→`surface.subtle`, `border`→`border.default` **요구**)가 양립 불가. 별칭은 정의상 semantic→semantic이다.

`conductor_data_model.md`가 제시했던 회피안("별칭을 component 계층으로 재분류")도 무너진다: `elevation.overlay`(semantic)가 `{border.strong}`(semantic)을 품고, `overlay.shadow`(component)가 `{elevation.overlay}`를 참조한다. 앞을 component로 옮기면 뒤가 component→component가 되어 같은 규칙이 다시 금지한다. **재분류는 모순을 옮길 뿐 없애지 못한다.**

**정정된 불변식**: *토큰은 자기 계층 또는 하위 계층의 토큰만 참조한다.* (primitive < semantic < component). 상위 참조만 오류. 동일 계층 순환은 FR-TOK-003 AC-3의 순환 검출이 잡는다.

동일 계층 참조 4개: `surface.2`, `border`, `status.running`→`{accent}`, `elevation.overlay`→`{border.strong}`.

### CR-009 — CI 순서 (DEV-002)

`@conductor-by-89soone/tokens`의 공개 타입 표면 일부(`src/tokens.ts`, `src/breakpoints.ts`)를 토큰 빌드가 **생성**한다. WP-001이 세운 CI 순서는 `typecheck`를 `build`보다 먼저 돌렸다.

- 정정: `install → lint → lint:deps → build → typecheck → test → lint:tokens → check:contrast`
- 생성 파일을 `.gitignore`에 추가. 커밋된 생성물은 두 번째 진실 공급원이 되어 FR-TOK-001("토큰 소스가 유일한 입력")을 무력화한다

**버린 첫 해소안**: 처음엔 "생성물 최신성" CI 검사로 `git diff --exit-code -- packages/tokens/dist`를 넣었다. `dist/`가 gitignore되어 있으므로 **어떤 경우에도 실패할 수 없는 검사**였다. 통과가 보장된 검사는 없는 것보다 나쁘다 — 안전하다는 신호를 거짓으로 준다. 실제 확인 가능한 것(재빌드가 gitignore되지 않은 파일을 남기지 않는다)으로 교체했다.

### CR-010 — WP-008 검증 명령 (DEV-003, 2026-07-11)

WP-008 검증 방법 `pnpm --filter @conductor-by-89soone/css build && pnpm --filter @conductor-by-89soone/css test && pnpm size` 중 두 단계가 고장나 있었다.

- `pnpm size`는 존재하지 않는다. 그 스크립트를 만드는 것은 **WP-025의 구현 범위**(선행 WP-017)라 WP-008 시점에 있을 수 없다. → 검증 명령에서 제거. gzip 20KB 게이트(NFR-001)는 `packages/css/test/bundle.test.ts`가 실제 zlib 측정으로 강제.
- `packages/css`에 `test` 스크립트가 없어 `pnpm --filter @conductor-by-89soone/css test`가 아무것도 안 하고 exit 0. **CR-009에서 지운 "절대 실패할 수 없는 검사"와 같은 결함.** → `"test": "vitest run --project css --config ../../vitest.config.ts"` 추가.
- **기각한 대안**: WP-008에서 css 전용 `pnpm size` 축소판을 만드는 것. 브리프 §7-3(구현 범위 안에서만) 위반이고 WP-025를 반쯤 구현한 상태로 남긴다.

### CR-011 — CI 재현성 단계 fileMode (DEV-004, 2026-07-11)

CR-009가 넣은 마지막 CI 단계가 **깨끗한 체크아웃에서도 항상 실패**한다. `pnpm install`이 `package.json`의 `bin` 항목을 0644→0755로 chmod하므로 `git status --porcelain`이 토큰 빌드와 무관하게 3줄을 낸다. WP-008과 무관하나 검증 중 발견해 등록.

- 정정: `git -c core.fileMode=false status --porcelain --untracked-files=all`. 모드 비트만 무시하고 CR-009의 두 검사 의도는 유지.
- **기각한 대안**: bin을 0755로 커밋. 증상은 사라지지만 앞으로 추가될 모든 bin에 같은 일이 반복된다. 검사가 모드에 의존하지 않게 만드는 편이 근본적.
- CR-009는 *절대 실패할 수 없는* 검사를 지웠는데, 그 자리에 *절대 통과할 수 없는* 검사가 들어와 있었다. 뿌리는 같다 — 검사를 쓴 뒤 통과·실패를 관찰하지 않았다.

### CR-012 — WP-009 검증 명령 (DEV-005, 2026-07-11)

WP-009의 공식 검증 명령이 test-only로 해석될 수 있었다. `packages/css` 테스트는 `dist` 산출물을 읽기 때문에 build 없이 실행하면 오래된 CSS를 검증할 수 있다.

- 정정: `pnpm --filter @conductor-by-89soone/css build && pnpm --filter @conductor-by-89soone/css test`.
- 이유: 레이아웃 소스와 breakpoint 치환기는 빌드 단계에서만 산출물에 반영된다.
- 기각한 대안: 테스트가 매번 내부에서 빌드를 호출하게 만들기. 패키지 테스트와 빌드 책임을 섞고 전체 test 비용을 늘린다. WP 검증 명령에서 build를 명시하는 편이 단순하다.

## 아키텍처 문서 재해석 (CR-004)

Conductor에는 **서버 런타임·DB·큐·인증이 없다.** 스캐폴드가 만든 네 문서를 그대로 채우면 존재하지 않는 시스템을 설계하게 된다.

| 문서 | 재해석 |
| --- | --- |
| `conductor_backend_architecture.md` | 빌드 파이프라인 |
| `conductor_api_contracts.md` | 패키지 공개 API (`exports`, CLI, TS 시그니처, 컴포넌트 props) |
| `conductor_data_model.md` | 토큰/메타데이터 스키마 |
| `conductor_async_events_jobs.md` | CI 잡과 릴리스 파이프라인 |
| `conductor_security_privacy_architecture.md` | 공급망 보안 |

화면 ID도 `W-###`(문서 사이트)만 존재한다. `D-###`(주 앱)와 `A-###`(관리 콘솔)는 이 제품에 없다.

## 명시적 제외 (F-X-###) — 에이전트의 과잉 구현 방지

| ID | 제외 항목 | 이유 |
| --- | --- | --- |
| F-X-001 | Figma 양방향 동기화 | 외부 도구 의존, DTCG 포맷 선행 필요 |
| F-X-002 | Vue/Svelte/Web Components 어댑터 | 소비자가 React 단일. `@conductor-by-89soone/css`가 비-React 대안 |
| F-X-003 | Tailwind preset | ADR-002가 Vanilla CSS 확정 |
| F-X-004 | 자체 아이콘 세트 | `lucide-react`를 peer dependency로 |
| F-X-005 | 차트/시각화 컴포넌트 | `Meter`/`ProgressRing`까지만 |
| F-X-006 | 고대비 테마 | 팔레트 3벌 유지 비용 |
| F-X-007 | i18n 문자열 시스템 | 컴포넌트는 문자열을 props로 받는다 |
| F-X-008 | 런타임 토큰 편집기 | 문서 사이트 테마 토글까지만 |
| F-X-009 | **도메인 컴포넌트 이식** | `.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`는 agent-ai-platform 도메인 결합 |
| F-X-010 | 페이로드 마스킹 뷰어 | `CodeBlock`(C-032)이 셸을 담당. `[REDACTED:*]` 하이라이팅은 감사·보안 도메인 결합 |

## 컴포넌트 설계 원칙 (구현 시 지킬 것)

- **접근성 동작은 Radix UI에 위임**(ADR-004). 포커스 트랩·롤 관리·키보드 내비게이션을 자체 구현하지 않는다. 소스의 `StepDrawer`가 `role="dialog" aria-modal="true"`를 달고도 포커스 트랩이 없었던 것이 이 결정의 직접적 동기다
- Radix DOM에는 **`data-*` 속성 셀렉터만** 사용. 구조 셀렉터(`>`, `+`, `:nth-child`) 금지 → Radix 업그레이드가 CSS를 깨뜨리는 위험(R-3) 완화
- `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility` (ADR-005). **`!important` 금지** — 소스는 `app.css:956`에서 썼다
- props 이름 고정: 시각 변종 `variant`, 의미 색상 `tone`, 크기 `size`
- 상태는 소비자가 소유. `Table`은 정렬·페이지네이션·가상 스크롤을 제공하지 않는다. 토스트/스낵바도 없다
- 소스의 미터 3중 구현(`CircularProgress`, `LinearProgress`, `UsageCostPage`의 `Gauge`)을 `Meter`와 `ProgressRing` 둘로 통합한다

## WP-023 셸 컴포넌트 결정 (2026-07-12)

### docs를 공개 셸의 첫 소비자로 교체

FR-DOC-001 AC-2는 docs가 패키지 컴포넌트를 실제 소비해야 한다. 카탈로그 preview만 추가하고 docs의 자체 sidebar/topbar를 남기는 안은 중복 구현을 유지한다. 따라서 `App.tsx`의 custom shell을 AppShell/NavList/TopBar로 교체하고 React Router만 소비자에 남겼다.

### non-modal Radix + plain scrim

AppShell은 페이지 shell이므로 modal focus trap을 걸지 않는다. `Dialog.Root modal={false}`를 유지하되, Radix Overlay는 이 모드에서 렌더되지 않으므로 plain scrim을 Portal 안에 둔다. 닫기 동작은 custom document listener가 아니라 Radix Content의 `DismissableLayer` outside interaction과 Escape에 위임한다.

- 기각: `modal={true}`로 바꿔 Overlay를 얻기. 페이지 shell에 modal semantics/focus trap을 강제한다.
- 기각: document-level click/Escape listener 직접 구현. ADR-004의 Radix 위임 원칙을 훼손한다.

### 라우팅 비종속 NavList

`NavList.renderLink`가 `href`, `className`, `aria-current`, children을 소비자 링크에 전달한다. `@conductor-by-89soone/react`에 React Router를 넣지 않는다. docs는 이 callback에서 `NavLink`를 렌더한다.

### TopBar title 이름 충돌

요구된 슬롯 이름 `title`은 유지한다. native `HTMLAttributes.title`만 상속 대상에서 omit하고, 슬롯이 string일 때 native header title로도 미러링한다. 슬롯을 `heading`으로 바꾸는 안은 문서 API와 불일치하므로 기각했다.

### 셸 시각 계약

기존 page/layout token만으로 셸 치수를 숨기지 않고 shell-specific component token 19개를 추가했다. 소비자가 sidebar width, topbar height, nav item 상태를 공개 `--cdt-*` 계약으로 재정의할 수 있어야 하기 때문이다.
