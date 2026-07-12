# 다음 작업 / 미해결 항목

## 현재 시작 지점

**WP-001 ~ WP-028이 전부 done이고 커밋됐다.** 코드로 할 수 있는 일은 끝났다. 남은 항목은 전부 **사용자 자격이 필요한 실제 배포와 그 리허설**이다.

```text
1. agent-context/sessions/2026-07-13-wp024-028-release-automation.md를 읽는다
2. docs/40_delivery/conductor_implementation_traceability.md §5(알려진 제약)에서 열려 있는 행을 본다
3. 첫 배포에 필요한 외부 설정(npm 스코프, OIDC 신뢰, GitHub Pages)을 사용자와 확인한다
4. 배포 → 리허설 → §5의 해당 행을 닫는다
```

## P0 — 첫 npm 배포 (사용자 자격 필요)

- npm 조직/스코프 `@conductor` 확보 (THR-001 typosquatting 방어의 전제이기도 하다)
- npm trusted publishing(OIDC) 설정: 저장소 `89sooner/design-system`, 워크플로 `.github/workflows/release.yml`
- 버전 상승 PR 병합 → release 워크플로 수동 실행 → provenance와 신뢰 게시 확인
- 워크플로와 게이트는 이미 있다. 검증되지 않은 것은 **실 레지스트리 동작**뿐이다

## P1 — 롤백 리허설 (배포 직후)

- `node scripts/release-rollback.mjs <결함버전> <직전버전> --execute` (기본은 dry-run)
- 10분 예산(NFR-004) 실측 → 원장 §5의 "npm 실 레지스트리 검증" 행을 닫는다

## P2 — GitHub Pages 배포

- 저장소 Settings에서 Pages 소스를 GitHub Actions로 활성화
- `deploy-docs` 워크플로 수동 실행(`ref` 기본 `main`) → 배포 시간 실측
- 롤백 = 직전 정상 커밋을 `ref`로 재실행 → 10분 예산 실측 → 원장 §5의 Pages 행을 닫는다

## P3 — 선택 항목 (릴리스 차단 아님)

- 소비자 스모크를 CI 잡으로 승격 (지금은 1회 수동 실측이며 `pnpm pack` tarball 소비)
- FR-A11Y-003 AC-4 / QA-183: 그레이스케일 렌더 스냅샷에서 상태 7종·심각도 4종 구분
- FR-DX-004 AC-3: hydration 일치 (docs는 `createRoot` 재마운트라 이 AC를 닫지 않는다)
- OD-003 FilterBar/Chip은 open/비차단. **FR/WP가 없으므로 구현하지 않는다.**

## 검증 기준선

```text
pnpm build && pnpm typecheck && pnpm test && pnpm lint && pnpm lint:tokens && pnpm check:contrast
pnpm check:api && pnpm check:secrets && pnpm check:changesets
pnpm test:a11y && pnpm size && pnpm lighthouse
pnpm --filter docs test:e2e
pnpm test:visual                      # Docker 필요
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict
```

최신 통과 수치: root tests 487/487, a11y 134, docs E2E 16/16, visual 25/25, contrast 80/80, LCP p75 1,937ms, CLS 0.000, Button 527B, CSS 7.54KiB.

## 계속 지킬 것

- `srs_final.md` baseline 의미를 바꾸면 CR을 먼저 등록하고 cascade한다.
- 생성 파일(`packages/tokens/src/tokens.ts`, `src/breakpoints.ts`, `apps/docs/src/generated/*`)을 직접 편집하지 않는다.
- docs 검증 전 workspace dependency `dist`가 최신인지 확인한다. 가장 안전한 기준은 루트 `pnpm build`다.
- `@conductor/react`에 라우팅 라이브러리를 추가하지 않는다. 링크는 `renderLink`로 위임한다.
- 브라우저를 띄우는 도구를 새로 붙였으면 끝나고 `git status`로 트리 오염을 확인한다.
- 공개 API를 바꿨으면 `pnpm check:api --update`로 리포트를 갱신하고, 파괴 변경이면 major changeset과 마이그레이션 노트를 함께 커밋한다.
