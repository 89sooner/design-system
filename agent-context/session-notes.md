# Session: 2026-07-13 — WP-024~028 커밋과 REL-004 마감

## Goal

이전 세션이 커밋 없이 남긴 WP-024~026을 WP 단위로 커밋하고, WP-027(Changesets·npm OIDC 배포)과 WP-028(문서 사이트 정적 배포)을 구현해 REL-004를 닫는다. 마지막에 handoff pack을 갱신한다.

## Current state

**WP-001 ~ WP-028이 전부 done이고 커밋됐다.** 남은 것은 실제 첫 배포(npm publish, GitHub Pages)와 그 뒤의 롤백 리허설뿐이며, 둘 다 사용자 자격이 필요하다.

- `1bdfe8b` WP-024 접근성 자동화 / `f0318f9` WP-025 번들 크기 / `6a5d5a4` WP-026 시각 회귀 + CR-014
- `410504d` 원장 커밋 참조 정정 (WP-001~026이 전부 "(미커밋, 작업 트리)"로 남아 있었다)
- `4411aa1` WP-027 릴리스 워크플로 + API 리포트 게이트 (CR-015 / DEV-008)
- `705410e` WP-028 문서 사이트 배포 (CR-016·CR-017 / DEV-009·DEV-010)

착수 시점 트리는 handoff pack보다 앞서 있었다. pack은 "WP-023까지, 다음은 WP-024"라고 했지만 실제로는 WP-024~026이 이미 구현돼 커밋 없이 방치돼 있었다. handoff는 손실 압축이며 repo가 진실이라는 전제를 지킨 것이 첫 소득이다.

## Verification evidence

- build / typecheck / lint / lint:deps 통과, test 487/487, lint:tokens 42 files 0 violations, check:contrast 80/80
- check:api(리포트 3종 일치, `any` 0건), check:secrets, check:changesets — 각 음성 픽스처로 exit 1 실증
- test:a11y 134 passed, size(Button 527B/4KB, CSS 7.54KiB/20KB)
- lighthouse LCP p75 1,937ms / 2,500ms, CLS 0.000 / 0.1, 외부 도메인 요청 0건
- docs E2E 16/16, visual 25/25, validator `--report`·`--strict` issue 0
- 소비자 스모크: workspace 밖 신규 앱에서 문서의 3개 명령 그대로 → `tsc --noEmit` 0 오류, 프로덕션 빌드 성공

## Decisions

- 파괴 변경 판정은 커밋 메시지가 아니라 api-extractor 리포트(`packages/*/etc/*.api.md`) 드리프트다(ADR-008). `check:api`가 드리프트와 `any` 노출을 함께 막는다.
- `release.yml`은 version PR 잡(자격증명 없음)과 publish 잡(`id-token: write`)을 분리한다 — PR 코드가 릴리스 권한으로 돌지 않게(THR-002).
- 문서 랜딩을 프리렌더한다. **격리 A/B: 프리렌더 LCP p75 1,793ms vs 클라이언트 전용 3,580ms(예산 초과).** `hydrateRoot`가 아니라 `createRoot` 재마운트이며, 두 렌더가 어긋나면 CLS 게이트(0.1)가 잡는다.
- LCP는 lantern 시뮬레이션이 아니라 DevTools Fast 3G 실측으로 잰다(DEV-010 / CR-017). 두 값이 예산의 양쪽으로 갈린다(3,002ms vs 1,793ms).
- Pages 배포는 원자적 스냅샷 교체, 롤백은 직전 정상 커밋 `ref` 재배포다(DEV-009 / CR-016).

## Risks/gotchas

1. **CI에 Playwright 브라우저 설치 단계가 없었다.** pnpm 10이 lifecycle script를 차단해 `pnpm install`만으로는 브라우저가 없다 → WP-024가 심은 `pnpm test:a11y`는 첫 CI 실행부터 죽었을 것이다. 빈 캐시로 재현해 확인하고 `pnpm exec playwright install --with-deps chromium`을 추가했다. 검사를 쓰면 그 검사가 **실제로 도는지**까지 관찰하라(CR-009/CR-011과 같은 병).
2. **chrome-launcher가 WSL에서 저장소를 오염시킨다.** 프로필 경로를 Windows 형식(`C:\...`, `\\wsl.localhost\...`)으로 바꿔 리눅스 Chrome에 넘기고, Chrome이 그 문자열을 통째로 디렉터리 이름 삼아 cwd(저장소)에 만든다. 측정 1회당 1개씩 64개를 지웠다. Playwright Chromium + CDP 포트로 해소(chrome-launcher 제거). 외부 프로세스를 붙였으면 끝나고 `git status`로 트리를 본다.
3. **격리하지 않은 A/B는 거짓말을 한다.** 프리렌더 효과 첫 측정에서 strip 정규식이 안 먹어 같은 파일을 두 번 쟀고 노이즈를 효과로 볼 뻔했다. 측정 전에 조작이 실제로 적용됐는지부터 확인하라.
4. changesets 2.x ↔ `human-id` 4.2(ESM) 충돌로 `changeset version`이 `ERR_REQUIRE_ESM` → `pnpm.overrides`로 `human-id: 4.1.1` 고정.
5. react-router-dom 7에는 `StaticRouter`가 없다 → 일회성 `renderToString`은 `MemoryRouter`로 한다.
6. (유효) docs 단독 build/E2E는 workspace dependency의 stale `dist`를 소비할 수 있다. React 소스를 고쳤으면 루트 `pnpm build`를 선행한다.
7. (유효) 생성 파일 `packages/tokens/src/tokens.ts`, `src/breakpoints.ts`, docs `src/generated/*`를 직접 편집하지 않는다.

## Next steps

1. npm 스코프 `@conductor` 확보 → npm trusted publishing(OIDC) 설정 → release 워크플로 실행 → provenance 확인
2. 배포 직후 롤백 리허설(dist-tag 승격, 10분 예산) 실측 → 원장 §5의 npm 행을 닫는다
3. GitHub Pages 활성화 → `deploy-docs` 실행 → 실 배포·롤백 시간 실측 → 원장 §5의 Pages 행을 닫는다
4. 선택: 소비자 스모크 CI 자동화, FR-A11Y-003 AC-4 그레이스케일 스냅샷, FR-DX-004 AC-3 hydration
5. OD-003(FilterBar/Chip)은 여전히 open/비차단이며 FR/WP가 없으므로 구현하지 않는다

## References

- `agent-context/sessions/2026-07-13-wp024-028-release-automation.md`
- WP-024~028, CR-014~017, DEV-007~010
