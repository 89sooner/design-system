# Session: 2026-07-18 — visual language upgrade and Pages route recovery

## Goal

`agent-ai-platform`의 gradient 중심 시각 언어를 Conductor 공용 패키지에 반영하고, Pages에서 overview 이외 화면이 빈 화면으로 남는 라우팅 결함을 고친다.

## Current state

- AppShell의 background는 원본과 같은 indigo/teal ambient radial glow를 component token으로 사용한다.
- NavList는 glass background와 blur를 사용한다.
- docs는 `HashRouter`와 generated Pages 404 fallback을 사용하므로 Pages path rewrite가 없어도 route를 렌더한다.
- 코드 정적 검증은 완료했다. sandbox가 localhost bind와 Chromium sandbox를 막아 실제 browser/Pages 검증은 아직 기록하지 못했다. 또한 `.git`이 read-only여서 `git add`/commit은 실행할 수 없다.

## Decisions

- decoration은 layout layer가 아니라 component token이 소유한다.
- `surface.tint.1`/`.2`는 decorative semantic token이며 contrast 대상이 아니다.
- canonical docs URL은 hash route이고 legacy path는 404 fallback이 변환한다.
- CR-031은 실제 Pages/browser 확인 전까지 open으로 둔다.

## Changed files

- token source: `packages/tokens/src/palette.dark.ts`, `palette.light.ts`, `components.ts`
- CSS: `packages/css/src/components.css`, `test/bundle.test.ts`
- docs route/build: `apps/docs/src/main.tsx`, `docs.css`, `scripts/build-pages-fallback.mjs`, `package.json`, deploy workflow
- route tests: `apps/docs/e2e/routes.ts` plus E2E/visual specs
- CR-031 and derived UI specs

## Commands

```bash
COREPACK_HOME=/tmp/conductor-corepack pnpm build
COREPACK_HOME=/tmp/conductor-corepack pnpm typecheck
COREPACK_HOME=/tmp/conductor-corepack pnpm test
COREPACK_HOME=/tmp/conductor-corepack pnpm lint:tokens
COREPACK_HOME=/tmp/conductor-corepack pnpm check:contrast
DOCS_BASE=/design-system/ COREPACK_HOME=/tmp/conductor-corepack pnpm --filter docs run build:pages

# 문서 구조
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict
```

모두 통과했다. browser 검증만 sandbox의 `EPERM`/`sandbox_host_linux` 제한으로 실행하지 못했다.

## Next steps

1. `.git` 쓰기 권한 환경에서 이 작업을 commit/push해 Pages 배포를 실행한다.
2. 실제 브라우저에서 hash URL과 legacy direct path redirect를 확인한다.
3. CR-031의 Pages/browser 증거를 기록하고 close한다.

## Risks/gotchas

- `overview`는 prerendered이므로 root가 보인다는 사실만으로 route가 정상임을 뜻하지 않는다.
- generated token TS는 수정 대상이 아니다.
- Playwright의 path-only URL은 canonical hash route를 검사하지 못한다.
- Corepack은 writable `/tmp` cache가 필요할 수 있다.
- 이 sandbox의 `.git/index.lock` 생성은 `Read-only file system`으로 실패한다. commit은 권한 있는 환경에서 수행한다.

## References

- `agent-context/sessions/2026-07-18-pages-routing-visual-upgrade.md`
- CR-031 / DEV-024
- `https://89sooner.github.io/design-system/`
