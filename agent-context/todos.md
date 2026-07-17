# 다음 작업 / 미해결 항목

## 현재 시작 지점

**필수 릴리스·배포 TODO는 없다.** WP-001~028, 공개 저장소, GitHub Pages, npm Trusted Publishing, 3개 패키지 게시, npm/Pages 실제 롤백 리허설, provenance/tag/registry 소비 검증이 완료됐다.

```text
1. agent-context/session-summary.md에서 현재 공개 상태를 읽는다
2. agent-context/sessions/2026-07-18-public-release-and-ci-hardening.md에서 실제 run/evidence를 확인한다
3. 최종 판단은 현재 repo source와 GitHub/npm의 실제 상태로 다시 검증한다
```

## P0 — 없음

- 사용자에게 남은 권한 설정 없음.
- open PR 없음.
- release blocking gate 없음.
- 로컬 npm 인증은 보안상 logout 상태이며 Trusted Publishing에는 영향을 주지 않는다.

## P2 — 선택적 유지보수

### GitHub action runtime 경고 제거

최종 Actions run은 green이지만 `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`, `pnpm/action-setup@v4`가 deprecated Node 20 action runtime 경고를 낸다.

- 각 action의 공식 migration과 입력 호환성을 먼저 확인한다.
- 별도 PR에서 major를 올린 뒤 PR/main/release 경로를 모두 검증한다.
- 이는 action 내부 runtime 유지보수다. `engines.node >=20`이나 Node 20 CI matrix를 제거하지 않는다.

### registry consumer smoke 자동화

- 지금은 `/tmp/conductor-registry-smoke`의 신규 React 19 소비자에서 실 npm 패키지를 설치해 `tsc --noEmit`과 SSR을 통과했다.
- 게시 뒤 격리 job으로 자동화하면 peer 범위, exports, tarball 누락을 매 release마다 확인할 수 있다.
- workspace link를 쓰면 검증 의미가 사라지므로 반드시 registry version을 설치한다.

### OD-003 FilterBar/Chip

- open/비차단이며 FR과 WP가 없다.
- 사용자 scope 승인 → CR → SRS/derived specs/delivery cascade 전에는 구현하지 않는다.

## 다음 릴리스의 반복 절차

1. source/API 변경에 맞는 changeset을 추가하고 `Refs:`를 기록한다.
2. API 변화가 있으면 `pnpm check:api --update` 후 report drift를 검토한다.
3. source PR을 merge하고 Changesets version PR의 최신 head CI를 확인한다.
4. bot update로 checks가 없으면 PR close/reopen 또는 명시적 CI 실행으로 최신 head를 검증한다.
5. version PR merge 후 release workflow의 publish와 annotated tags를 확인한다.
6. `pnpm check:release-tags`, npm provenance/metadata, 격리 소비자 smoke를 실행한다.

## 검증 기준선

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm lint
pnpm lint:tokens
pnpm check:contrast
pnpm check:api
pnpm check:secrets
pnpm check:changesets
pnpm check:release-tags
pnpm test:a11y
pnpm size
pnpm lighthouse
pnpm --filter docs test:e2e
pnpm test:visual
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict
```

최신 확인: unit 490, a11y 164 passed + 1 skipped, visual 27/27, contrast 80/80, Button 554B, CSS 8.15KiB, 최종 main CI green.

## 계속 지킬 것

- baseline 의미를 바꾸면 CR을 먼저 등록한다.
- 생성 파일을 직접 편집하지 않는다.
- docs/browser 검증 전 루트 build로 workspace `dist`를 최신화한다.
- 공개 API 변경은 API report와 changeset을 함께 커밋한다.
- 브라우저·외부 프로세스·review fixture 실행 뒤 `git status`로 트리 오염을 확인한다.
- CRLF checkout을 고려해 parser 입력을 정규화하고 `git -c core.fileMode=false diff --check`를 사용한다.
