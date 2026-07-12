#hidden
# aci:v1 id=f7b39dc src=agent-context/risks.md
@kv sha256=d7b41c2b2e12dadf88234713b53a6728713b1b28902f0b5edddf939705347297 bytes=16964 lines=195 title=리스크-/-불확실한-가정-/-검증에서-속을-뻔한-지점
@sig agent-context/risks.md;cache/ms-playwright;A/B;changesets/cli;src/tokens.ts;server/browser;15/15;Dialog/Tooltip/Menu;position/z-index;packages/react;conductor/react;packages/css;conductor/css;DEV-005/CR-012;conductor/tokens/breakpoints;packages/css/test/helpers.ts;packages/tokens/bin/;dist/cli.js;packages/tokens/bin/conductor-build-tokens.mjs;conductor/tokens;/bin/;packages/tokens/dist;px/ms/z-index/font-size;CR-005/CR-006
@h1 리스크 / 불확실한 가정 / 검증에서 속을 뻔한 지점
@h2 2026-07-13 (WP-024~028) 세션에서 추가된 함정
@h3 Q. CI가 게이트를 돌릴 브라우저를 갖고 있지 않았다
@cmd pnpm 10은 onlyBuiltDependencies(현재 esbuild만) 밖 패키지의 lifecycle script를 실행하지 않는다. 따라서 pnpm install --frozen-lockfile은 Playwright 브라우저를 내려받지 않는다. WP-024가 넣은 CI에는 playwright install 단계가 없었고, PLAYWRIGHT_BROWSERS_PATH를 빈 디렉터리로 두고 재현하니 pnpm test:a11y가 browserType.launch: Executable doesn't exist로 죽었다. 로컬은 ~/.cache/ms-playwright가 이미 차 있어 통과했을 뿐이다.
@path 즉 그 CI 게이트는 첫 실행부터 실패했을 것이며, 아무도 그것을 확인하지 않았다. CR-009("절대 실패할 수 없는 검사")·CR-011("절대 통과할 수 없는 검사")과 같은 뿌리다 — 검사를 쓴 뒤 그 검사가 실제로 도는지 관찰하지 않았다. pnpm exec playwright install --with-deps chromium을 test:a11y·lighthouse 앞에 넣어 고쳤다.
@h3 R. chrome-launcher가 WSL에서 저장소를 오염시킨다
@p chrome-launcher는 WSL을 감지하면 프로필 디렉터리 경로를 Windows 형식(C:\Users\..., \\wsl.localhost\Ubuntu-22.04\tmp\...)으로 변환해 브라우저에 넘긴다. 그런데 실행되는 것은 Playwright의 ... Lighthouse 측정 1회마다 1개씩 쌓여 64개를 지웠다. userDataDir을 명시해도 같은 변환을 거치므로 소용없다.
@p 해소: chrome-launcher를 버리고, Playwright가 띄운 Chromium에 Lighthouse를 CDP 포트(--remote-debugging-port)로 붙인다. 의존성도 제거했다.
@p 일반화: 브라우저·외부 프로세스를 새로 붙였으면 실행 후 git status로 트리를 본다. 리뷰 서브에이전트 오염 항목과 같은 교훈이다.
@h3 S. 격리하지 않은 A/B는 거짓말을 한다
@p 프리렌더가 LCP에 실제로 기여하는지 재려고 dist를 복사해 마크업을 제거했는데, strip 정규식(<div id="root">[\s\S]*</div>\s*<script)이 매칭되지 않았다(module script가 <head>에 있어 root div 뒤 ... "프리렌더 효과"로 기록할 뻔했다. 스크립트가 찍은 stripped html has shell markup: true가 단서였다.
@p 제대로 격리하니 프리렌더 1,793ms vs 클라이언트 전용 3,580ms로 갈렸다. 측정 전에 조작이 실제로 적용됐는지부터 검사(assert)하라.
@h3 T. 측정 방법이 판정을 뒤집는다 (DEV-010)
@path Lighthouse 기본 lantern 시뮬레이션은 프리렌더된 HTML의 첫 페인트를 모델링하지 못해, 마크업 4,136자를 주입해도 LCP 예측이 3,002ms로 바뀌지 않는다. 같은 스로틀 계수를 실제 Chromium에 적용(throttlingMethod: "devtools")하면 1,793ms다. 예산 2.5초의 양쪽이다. SRS는 "Fast 3G 스로틀"을 명시하므로 실측을 지표로 삼고 두 값을 모두 원장에 남겼다(CR-017).
@h3 U. 의존성 조합이 CLI를 죽인다
@path @changesets/cli 2.x가 human-id 4.2(순수 ESM)를 끌어와 changeset version이 ERR_REQUIRE_ESM으로 죽는다. pnpm.overrides로 human-id: 4.1.1을 고정했다. changesets를 업그레이드할 때 이 override를 함께 재검토한다.
@h2 2026-07-12 강제 compaction 복원에서 발견
@h3 M. Vitest project environment는 다른 package의 URL 의미를 바꾼다
@todo vitest.config.ts에서 tokens project를 node → jsdom으로 바꾸면 import.meta.url 기반 file reads가 The URL must be of scheme file 또는 /src/tokens.ts ENOENT로 깨 ... ct 환경을 바꿀 이유가 없다. package별 environment를 섞지 말고 필요한 project에만 jsdom을 적용한다.
@h3 N. WP summary done과 DoD checkbox는 독립적으로 어긋날 수 있다
@path 현재 WP-018~022 summary는 done이지만 각 DoD는 전부 unchecked다. traceability의 FR-DOC-001도 완료된 후속 WP를 미완료 사유로 든다. handoff에서 “done” 한 칸만 읽지 말고 WP body와 FR ledger를 함께 확인한다.
@h3 O. Playwright webServer 실패를 제품 실패로 단정하지 않는다
@path 제한된 sandbox에서는 localhost preview server/browser가 시작되지 않았다. 권한이 있는 실행에서 같은 tree와 command가 15/15 통과했다. 실패 시 먼저 webServer 권한/포트/브라우저 실행 환경을 분리 진단한다.
@h3 P. docs bundle warning은 현재 실패가 아니지만 후속 gate의 입력이다
@path Vite JS chunk가 507.34 kB(minified), 144.59 kB gzip으로 500 kB 경고를 낸다. WP-025의 package size와 WP-028의 Lighthouse 범위를 침범해 즉시 임의 code-splitting하지 않는다. 후속 WP에서 실제 예산과 측정 대상을 기준으로 판단한다.
@h2 2026-07-11(WP-010~012) 세션에서 추가된 함정
@h2 2026-07-11(WP-013~014) 세션에서 추가된 함정
@h2 2026-07-11(WP-015) 세션에서 추가된 함정
@h3 J. Radix Tooltip은 SSR registry에서도 Provider가 필요하다
@todo Tooltip.Root를 단독 SSR render하면 Tooltip must be used within TooltipProvider 오류가 난다. public registry renderer는 Tooltip.Provider로 감싸야 한다.
@h3 K. jsdom에는 ResizeObserver와 완전한 pointer flow가 없다
@p Radix Tooltip content는 ResizeObserver를 사용하고, DropdownMenu trigger는 pointer event를 기대한다. test-local ResizeObserver shim을 두고 menu role 검사는 defaultOpen fixture로 한다. 이 shim은 production code에 넣지 않는다.
@h3 L. Radix portal content는 render container 바깥에 있다
@path Dialog/Tooltip/Menu content는 document body portal로 렌더된다. Testing Library test는 container query 대신 role query를 쓰고 Escape 뒤 effect는 waitFor로 기다린다.
@h3 G. required children은 createElement의 세 번째 인자로 타입 충족되지 않을 수 있다
@p publicComponents SSR registry에서 required children을 가진 compound root는 createElement(Component, { children: null })처럼 props object에 넣어야 한다. 세 번째 null child는 runtime에는 전달돼도 TypeScript overload의 required prop 검증은 통과하지 못한다.
@h3 H. focus-visible 0건 규칙에는 명시된 clipping 예외가 있다
@path Timeline은 overflow hidden parent에서 reset focus ring이 잘리지 않게 component layer에서 :focus-visible selector가 필요하다. 이 규칙은 ring을 덮어쓰면 안 되고 position/z-index만 가져야 한다. 정적 CSS 테스트도 그 불변식을 검사한다.
@h3 I. token lint는 테스트 코드의 수치도 검사한다
@p CSS 테스트에 800px을 하드코딩해도 lint 대상이다. built --cdt-breakpoint-md 값을 읽어 regex를 만들고, CSS z-index는 --cdt-z-* 토큰으로 써야 한다.
@h3 D. jsdom 프로젝트에서 테스트 현재 경로를 가정하지 말 것
@path React 단독 실행과 루트 pnpm test는 cwd가 다르다. 매니페스트/산출물을 읽는 테스트는 packages/react 존재 여부로 root를 계산해야 한다. readFileSync("package.json")는 루트 실행에서 잘못된 매니페스트를 읽는다.
@h3 E. workspace alias가 .tsx를 따라가면 소비자 tsconfig도 JSX를 알아야 한다
@path docs typecheck가 @conductor/react source alias를 해석한다. React package에만 JSX 설정을 두면 docs는 TS6142로 실패한다. tsconfig.base.json의 jsx: react-jsx가 필요하다.
@h3 F. 컴포넌트 CSS의 수치 리터럴은 토큰 린트 허용 사유가 필요하다
@p 1px border, 34px compact button, hover translate는 현재 token에 대응값이 없다. cdt-allow-literal의 이유를 코드 옆에 남기고, 색상·간격은 token으로만 쓴다.
@h2 2026-07-11(WP-008) 세션에서 추가된 함정
@h2 2026-07-11(WP-009) 세션에서 추가된 함정
@h3 A. CSS 테스트는 stale dist를 읽을 수 있다
@path packages/css 테스트는 빌드 산출물 CSS를 읽는다. pnpm --filter @conductor/css test만 실행하면 소스 변경이 dist에 반영되지 않아도 통과할 수 있다. WP-009에서 DEV-005/CR-012로 공식 검증 명령을 build && test로 정정했다.
@h3 B. lightningcss가 미디어쿼리 문법을 정규화한다
@p (max-width: 800px)가 산출 또는 AST에서 (width <= 800px)처럼 표현될 수 있다. 테스트는 원문 문자열을 고정하지 말고 파싱 결과나 실제 breakpoint 값 존재 여부를 검사해야 한다.
@h3 C. 미디어쿼리 안의 CSS 변수는 런타임에 평가되지 않는다
@path @media (max-width: var(--cdt-breakpoint-md))는 유효한 responsive 계약이 아니다. 소스는 {breakpoint.md} 같은 별칭을 쓰고, 빌드가 공개 @conductor/tokens/breakpoints 값을 리터럴로 치환한다. 산출물에 var(--cdt-breakpoint-*)가 남으면 CSS-MEDIA-VAR로 실패해야 한다.
@h3 리뷰 서브에이전트가 작업 트리를 오염시킨다
@path 적대적 리뷰 워크플로(vacuous-check 발견을 서브에이전트가 파일을 변조해 실증하는 패턴)에서, 검증 서브에이전트가 packages/css/test/helpers.ts의 rulesInLayer에 if (found.length === 0) return found;를 주입하고 복원하지 않았다. css 스위트 전체가 red가 됐고 하마터면 내 회귀로 오해할 뻔했다. 리뷰 워크플로가 쓰기 권한을 가졌으면 끝난 뒤 반드시 git status --porcelain으로 트리를 확인하고, 초록이던 스위트가 리뷰 직후 빨개지면 내 코드보다 남은 변조를 먼저 의심하라. 리뷰 서브에이전트에 isolation: worktree 또는 읽기 전용 에이전트 타입을 주는 편이 안전하다.
@h3 0b. pnpm install이 트리를 더럽힌다 (CR-011)
@path pnpm install이 bin 파일을 0755로 chmod한다. CI 재현성 단계의 git status가 이 때문에 클린 체크아웃에서도 실패했다. git -c core.fileMode=false로 고쳤다. 로컬에서 git status가 packages/tokens/bin/*.mjs 3건을 M으로 보여줘도 모드 비트일 뿐 내용 변경이 아니다.
@h2 검증 함정 — 이전 세션에서 실제로 당할 뻔한 것들
@h3 bin/은 번들된 dist/cli.js를 실행한다
@path packages/tokens/bin/conductor-build-tokens.mjs → dist/cli.js. 토큰 소스를 고치고 bin을 직접 실행하면 아무 변화가 없다.
@p 음성 테스트를 두 번 실패했다. 순환 참조를 주입했는데 빌드가 exit 0으로 통과했고, 하마터면 "원자적 쓰기 확인됨"이라고 잘못 기록할 뻔했다. tokens.css가 바이트 단위로 동일했던 것이 단서였다.
@path 올바른 방법: pnpm --filter @conductor/tokens run build (이 스크립트가 tsup --config tsup.cli.config.ts && node ./bin/... && tsup 순서로 CLI를 먼저 재번들한다).
@h3 절대 실패할 수 없는 검사
@path CR-009를 고치며 처음 넣은 CI 단계:
@code lang=yaml sha=9d0a6c965893 lines=1 kept=1
|git diff --exit-code -- packages/tokens/dist   # dist/ 는 gitignore 되어 있다
@p 이 검사는 어떤 경우에도 통과한다. 통과가 보장된 검사는 없는 것보다 나쁘다 — 안전하다는 신호를 거짓으로 준다. 지웠다.
@p 새 검사를 넣을 때 물어라: *"이게 실패하는 상황이 실제로 존재하는가?"*
@h3 lint:tokens가 자명하게 통과한다
@path 현재 packages/css와 packages/react가 거의 비어 있다. lint:tokens는 "6 파일 스캔, 위반 0건"으로 통과하지만 아무것도 검사하지 않은 것과 구별되지 않는다.
@path 픽스처를 주입해 실제로 잡는지 확인했다(색 리터럴, px/ms/z-index/font-size, text.faint on surface.elevated, 허용 주석). WP-008 이후 실제 CSS가 생기면 이 린트가 처음으로 의미 있게 작동한다.
@h3 같은 코드로 자기를 검증하지 마라
@p check:contrast의 40쌍을 별도로 작성한 독립 WCAG 구현으로 재계산해 대조했다(불일치 0건, 허용 오차 0.02). 에이전트가 만든 검사기를 그 에이전트의 테스트로만 확인하면 검증이 아니다.
@path 미세 차이 하나: 문서는 합성색을 hex(#5965d0)로 반올림한 뒤 계산해 3.93, 실수로 유지하면 3.94. 판정(≥3.0)에는 영향 없다.
@h2 제품 리스크 (PRD §10)
@p | ID | 리스크 | 영향 | 완화 | | --- | --- | --- | --- |
@path | R-1 | 라이트 테마가 다크 전용 시각 장치(글래스, 글로우, alpha 경계)를 재현하지 못한다 | 높음 | 라이트에서 경계를 불투명 값으로 재정의(§6.3). elevation은 그림자 alpha를 낮춘다. WP-010에서 조기 검증 |
@path | R-2 | 시각 회귀가 폰트 렌더 차이로 불안정 | 중간 | OD-002로 REL-004 이월. v1은 수동 시각 확인 |
@path | R-3 | Radix 업그레이드가 DOM 구조를 바꿔 CSS가 깨진다 | 중간 | Radix 버전 정확 고정. data-* 속성 셀렉터만 사용. 구조 셀렉터 금지 |
@path | R-4 | 소스의 !important와 전역 * 셀렉터가 소비자 CSS와 충돌 | 높음 | @layer로 캐스케이드 낮춤. !important 0건 강제 |
@path | R-5 | 접두사 없는 토큰 이름이 소비자 변수와 충돌 | 중간 | --cdt- 강제. 빌드 검사가 접두사 없는 산출을 차단 |
@path | R-6 | 컴포넌트 범위가 도메인 컴포넌트로 번진다 | 높음 | F-X-009 명시 제외. WP DoD에 "도메인 결합 없음" |
@path | R-7 | 대비 검사가 소스 색을 실패시킨다 | 높음 | 실현됨. CR-005/CR-006으로 처리 완료 |
@h2 승인된 알려진 제약 (원장 §5)
@path 다크 테마 종료 상태(status.neutralEnd) 점이 흐리다 (2.04 ~ 2.60:1). decorative로 분류해 검사에서 뺀 대가다. 검사를 통과했다는 사실이 그 점이 잘 보인다는 뜻은 아니다. 시인성 불만이 실제로 제기되면 CR을 열어 #5d6e86(3.26:1) 교정을 검토한다
@path 포커스 링과 폼 경계가 소스보다 뚜렷하다. G-1(시각 보존)의 의도된 예외. 시각 회귀 기준 이미지를 이 값으로 생성해야 한다. 소스 값으로 되돌리지 마라
@b text.faint를 surface.elevated 위에 쓸 수 없다(2.94:1). lint:tokens가 차단한다. 그 자리엔 text.muted(4.76:1)를 쓴다
@path 시각 회귀(M-1)가 v1에서 자동 측정되지 않는다. REL-001~003 기간엔 수동 시각 확인에 의존한다
@h2 불확실한 가정
@path 라이트 팔레트 값은 conductor_design_system_tokens.md §5·§6에 산출돼 있으나 아직 코드로 검증된 적이 없다. WP-010이 check:contrast를 두 테마로 돌리는 첫 순간이다. 라이트 쪽 미달이 나올 수 있다
@path severity.* 4색은 두 테마가 값을 공유하는 유일한 토큰군이다(절대 등급이므로). themeSpecific 예외를 쓰지 않으며 FR-QA-001 키 대칭 검사를 통과한다는 것이 문서의 주장이다. WP-010에서 확인하라
@path @conductor/css gzip ≤ 20KB, Button 단독 gzip ≤ 4KB는 아직 측정된 적 없다(WP-025). 컴포넌트가 다 들어간 뒤에야 알 수 있다
@path 문서 사이트 LCP p75 ≤ 2.5초도 미측정(WP-028)
@h2 문서 환경의 함정
@p validate_srs_prd_env.py는 백틱으로 감싼 .md로 끝나는 문자열을 문서 경로로 오인한다. 토큰 이름 radius.md, font.size.md, breakpoint.md, font.lineHeight.md를 백틱에 넣으면 경고가 뜬다. 볼드(radius.md)를 써라. 실제 문서 파일명(srs_final.md)은 백틱으로 감싸도 된다.
@h2 WP-023에서 추가된 함정 (2026-07-12)
@h3 Radix non-modal Dialog에는 Overlay가 없다
@path Dialog.Root modal={false}에서 Dialog.Overlay는 렌더되지 않는다. class/CSS를 아무리 고쳐도 scrim이 생기지 않는다. AppShell의 scrim은 plain element이며, 닫기는 Content의 Radix DismissableLayer가 소유한다.
@h3 docs-only E2E는 workspace의 stale dist를 볼 수 있다
@path apps/docs가 빌드된 @conductor/react를 소비하는 경로에서는 docs build만 다시 해도 React source 변경이 반영되지 않을 수 있다. 새 public component나 동작을 검증하기 전 root build 또는 React build를 선행한다.
@h3 토큰 누출 검사는 부분 문자열로 쓰지 않는다
@p primitive key ink 금지를 includes("ink:")로 검사하면 skipLink: 같은 정상 component key를 오탐한다. 계층/구조를 검사하려면 top-level serialization key나 parsed object를 본다.
@h3 Vite chunk warning은 아직 열린 후속 게이트다
@path docs chunk 약 517.81kB minified/146.29kB gzip 경고가 남는다. WP-023 실패는 아니지만 WP-025 size 및 WP-028 Lighthouse에서 실제 budget과 함께 처리해야 한다.
