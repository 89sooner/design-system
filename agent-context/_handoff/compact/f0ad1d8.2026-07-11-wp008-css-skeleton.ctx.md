#hidden
# aci:v1 id=f0ad1d8 src=agent-context/sessions/2026-07-11-wp008-css-skeleton.md
@kv sha256=dfd1f49f0a106ba2e4232200c59213f6fb100e7ee23409a6399f3c8abaa79bce bytes=3611 lines=36 title=Session-2026-07-11-WP-008-conductor/css-레이어-골격
@sig agent-context/sessions/2026-07-11-wp008-css-skeleton.md;conductor/css;lint/lint;deps/build/typecheck/test/lint;tokens/check;dist/index.css;dist/component.css;packages/css/src/;src/index.css;/component.css;test/bundle.test.ts;Risks/gotchas;test/helpers.ts;home/roqkf/.nvm/versions/node/v20.12.0/bin;src/layout.css;docs/40_delivery/conductor_implementation_traceability.md;FR-CSS-001/002/005;DEV-003/004;docs/00_governance/change_control.md;CR-010/CR-011;Session;conductor;Goal;Current
@h1 Session: 2026-07-11 — WP-008 @conductor/css 레이어 골격
@h2 Goal
@path WP-008(@conductor/css 레이어 골격과 리셋)을 실행 브리프의 6단계 루프대로 구현하고,
@p 클린 체크아웃에서 게이트 7개를 통과시킨 뒤 추적 원장을 갱신한다.
@h2 Current state — DONE
@path WP-008 done. 클린 체크아웃에서 lint/lint:deps/build/typecheck/test/lint:tokens/check:contrast 전부 exit 0(15초), 321 테스트 통과.
@path dist/index.css gzip 2,575B, dist/component.css gzip 2,392B (NFR-001 예산 20,480B).
@path 산출물: packages/css/src/{layers,tokens,reset,base,utility}.css, build.mjs(lightningcss bundleAsync + 리졸버), checks.mjs(postcss AST 검사기, ADR-008), checks.d.mts, test/{helpers,bundle,checks,exports}.test.ts.
@path src/index.css(WP-001 자리표시)는 삭제됨. package.json에 ./component.css 진입점 + test 스크립트 추가, devDeps에 postcss·vitest 추가(lockfile 갱신, --frozen-lockfile 통과 확인).
@h2 Decisions
@path CR-010 (DEV-003): WP-008 검증 방법의 pnpm size는 WP-025 소유라 제거. gzip 게이트는 test/bundle.test.ts가 실제 zlib 측정으로 대체. test 스크립트 부재로 pnpm --filter @conductor/css test가 no-op exit 0이던 것도 수정.
@path CR-011 (DEV-004): CI 재현성 단계가 pnpm install의 bin chmod(0644→0755) 때문에 클린 체크아웃에서도 항상 실패. git -c core.fileMode=false status로 정정. WP-008과 무관한, CR-009가 심은 결함.
@path FR-CSS-005 AC-1은 --cdt-motion-* 토큰을 0s로 재정의해 !important 없이 충족(레이어 순서가 명시도를 이기므로 값 교체가 유일한 수단). 계산값 실브라우저 측정은 WP-024로 이월(원장 §5).
@b lightningcss가 블록 있는 @layer a,b; 문을 재작성 → 문을 minify에 안 넣고 산출물에 prepend.
@h2 Verification (음성 테스트로 게이트가 실제로 죽는지 확인)
@b build 검사기: !important/레이어 밖 규칙/원격 @import(리졸버)/원격 src(AST)////비-cdt 커스텀 프로퍼티 각각 주입 → exit 1, dist/ 바이트 동일(원자적).
@b test: helper가 []을 반환하게/checks export 제거/레이어 추가 3종 mutation → 스위트 red, 복원 시 green.
@b lint:tokens: 스캔 6→14 파일, 허용 주석 제거 시 px-literal 2건, 색 리터럴 주입 시 exit 1.
@h2 Risks/gotchas
@path 리뷰 서브에이전트가 작업 트리를 오염시킴: 검증 서브에이전트가 test/helpers.ts에 if (found.length===0) return found;를 주입하고 복원 안 함 → 스위트 red를 내 회귀로 오해. 리뷰 워크플로 후 git status --porcelain 필수.
@b grep/cd x && y/rm -rf 조합은 샌드박스가 거부. python3 힙독·절대경로 사용.
@path pnpm은 /home/roqkf/.nvm/versions/node/v20.12.0/bin — PATH export 필요.
@h2 Next steps
@path WP-009(레이아웃 프리미티브): src/layout.css 만들어 build.mjs의 BUNDLES 두 항목에 추가. cdt-app-shell/cdt-split-layout/cdt-card-grid/cdt-page/cdt-content-stack. 브레이크포인트는 --cdt-page-split-breakpoint 등 토큰 리터럴. 색 속성 금지(FR-CSS-003 AC-4).
@path WP-010(라이트 팔레트): 값은 conductor_design_system_tokens.md §5·§6에 이미 있음. 완료 시 부분 AC 4개 재검증.
@path WP-011(React 골격) → WP-012~017 병렬.
@h2 References
@path 원장: docs/40_delivery/conductor_implementation_traceability.md (§2 WP-008 done, §3 FR-CSS-001/002/005, §4 DEV-003/004, §5 제약 4건 추가)
@path CR: docs/00_governance/change_control.md CR-010/CR-011
