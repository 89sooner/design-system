# 2026-10-09 — CR-043 화면 QA 검사 판정 정정

> 상태: done | PR: https://github.com/89sooner/design-system/pull/34

## 무엇을 했나

- DEV-046(W-020 화면 QA 실패 6건)을 `main` 빌드에서 재현하고 측정했다. 원인은 프리뷰가 아니라 `apps/docs/e2e/screens.spec.ts`의 판정 오류 넷이었다 — 패키지 스크롤러 안 컨트롤을 잘림으로 셈, Radix 롤링 그룹을 정지점 여러 개로 셈, `details > summary` 누락, 닫힌 `details` 내용 포함. 가설 (a)("RelationGraph 표가 스크롤을 갖지 않는다")는 틀렸다 — `Table`이 `.cdt-table__scroll`을 이미 소유한다.
- `workspaces.spec.ts` axe가 CR-042 라우트 페이드 도중에 대비를 재던 경합(DEV-047)을 고쳤다.
- 고친 면제가 실제 결함을 숨기지 않는지 결함 주입 검증을 세 차례 돌려 강화했다: `380c15f` → `9a232e5` → `c2b85d9` → `10dcd95`.
- 검증 계획은 docs E2E를 PR·main에서 돈다고 적지만 CI에 단계가 없다(DEV-048, open, 별도 CR).

## 결과

- 로컬 docs E2E 56/56(CR-042 종료 시 50/56), PR CI green, validator `--strict` 0.
- CR-043·DEV-046·DEV-047 closed.

## 다음 에이전트가 지킬 것

- 화면 QA 판정 규칙은 `conductor_screen_qa_checklist.md` §1 "판정 규칙"과 CR-043 "알려진 한계"에 있다. 면제를 넓히기 전에 결함 주입으로 검사가 여전히 실패하는지 확인한다.
- PR CI는 docs E2E를 돌리지 않는다. 화면을 바꾸면 `pnpm --filter docs test:e2e`를 로컬에서 돌려 기록한다(DEV-048 해소 전까지).
- 샌드박스에서 `pgrep -f`/`pkill -f`에 명령줄에 그대로 들어간 패턴을 쓰면 셸 자신을 죽인다. `[v]ite` 같은 대괄호 패턴을 쓴다.
