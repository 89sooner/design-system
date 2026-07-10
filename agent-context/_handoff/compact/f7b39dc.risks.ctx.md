#hidden
# aci:v1 id=f7b39dc src=agent-context/risks.md
@kv sha256=7180a4bcca0553cd0daa7ee96313cba6e3ac87be9405210295776908064fb83d bytes=7779 lines=87 title=리스크-/-불확실한-가정-/-검증에서-속을-뻔한-지점
@sig agent-context/risks.md;packages/css;conductor/css;DEV-005/CR-012;conductor/tokens/breakpoints;packages/css/test/helpers.ts;packages/tokens/bin/;dist/cli.js;packages/tokens/bin/conductor-build-tokens.mjs;conductor/tokens;/bin/;packages/tokens/dist;packages/react;px/ms/z-index/font-size;CR-005/CR-006;CSS;packages;conductor;DEV;breakpoint;responsive;breakpoints;MEDIA;VAR
@h1 리스크 / 불확실한 가정 / 검증에서 속을 뻔한 지점
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
