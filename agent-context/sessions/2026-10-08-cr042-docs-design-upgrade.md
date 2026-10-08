# 2026-10-08 — CR-042 문서 사이트 디자인 고도화

## 세션 목표

사용자가 지정한 레퍼런스(Supahero·dark.design·Mac App Supply·Layers·Loadmore·Beautiful UI·BeUI·Rare UI·Transitions·shadcn/ui·Realtime Colors·Coolors·Paletton·Khroma·Color Hunt·Stanley·oh-my-design·Lazyweb)를 참고해 문서 사이트를 "사용자에게 다가가기 좋은 친숙하고 고도화된 형태"로 개선한다. 요구사항·공개 React API·CSS 공개 클래스는 바꾸지 않고, CR-018·CR-019와 같은 교차 WP 유지보수(CR-042)로 수행한다.

## 환경 제약 (이 세션에서 실측)

- 샌드박스 egress 정책이 레퍼런스 도메인을 전부 403으로 막는다(curl·WebFetch 모두). 각 사이트의 알려진 패턴을 재구성해 브리프(`scratchpad/design-brief.md`)로 적고 구현했다. 실제 사이트 대조는 사용자 검토 항목이다.
- Docker 데몬이 없고 `cdn.playwright.dev`도 막혀 Playwright 1.61.1이 요구하는 Chromium 1228을 받을 수 없다. `/opt/pw-browsers/chromium-1194`를 `executablePath`로 쓰는 로컬 설정(visual·a11y·lighthouse)을 스크래치패드에 두고 돌렸다.
- 시각 회귀 재현성: 샌드박스에는 `Inter`가 설치돼 있고 CI의 Noble 이미지에는 없다. `FONTCONFIG_FILE`로 `Inter`/`Inter Display`를 거부하면 갱신 전 기준 이미지 27장과 1% 안에서 일치했다(6/6 표본 → 전체). 같은 조건으로 기준 이미지를 재생성했다(DEV-045).
- 서브에이전트 세션 한도가 작업 도중 소진돼(22:10 UTC 리셋) 워크플로의 수정·일관성 단계가 한 번 실패했고, 리셋 뒤 같은 run을 재개했다.

## 수행한 것

1. 브리프 작성 → 토큰 4건(`page.displaySize`·`displayLineHeight`·`leadSize`·`leadLineHeight`, `font.size.xl` 파생) → `build-site-stats.mjs`(랜딩 수치) → `App.tsx`/`docs.css`를 `shell`·`landing`·`getting-started`·`catalog`·`pages` 모듈과 `styles/*.css`로 분리.
2. 영역별 병렬 구현(셸·랜딩·카탈로그·페이지) → 영역별 2렌즈(계약·디자인) 적대 검토 → 수정 → 일관성 검수. 모든 에이전트는 자기 파일만 편집하고 `pnpm lint:tokens`·docs `tsc`·eslint를 green으로 남겼다.
3. 거버넌스 cascade: CR-042 등록, IA(내비 그룹 7·아이콘·외부 링크), 와이어프레임(W-001·W-002·W-010·W-020·W-021), 토큰 명세 §7.7, 프론트엔드 아키텍처 §12(`site-stats.json`), 원장(교차 WP 유지보수 절, DEV-045·DEV-046), Changeset(tokens minor), API 리포트.
4. 게이트: __GATES__

## 발견한 기존 결함 (이 변경이 만든 것이 아님)

- DEV-046: W-020의 `RelationGraph` 프리뷰 `근거 보기` 버튼이 560·800px에서 뷰포트 밖으로 나가고, `Tabs` 프리뷰의 두 트리거가 `tabindex="-1"`이라 `e2e/screens.spec.ts`의 QA-001·002·003·004가 `/components`에서 실패한다. `origin/main`을 별도 워크트리로 빌드해 같은 측정을 하니 동일하게 재현됐다. 수정은 별도 CR(패키지 CSS의 가로 스크롤 소유 / QA 검사의 roving-focus 제외).
- CI의 `packages/react` 시간 의존 테스트 둘(Tabs 키보드 a11y, `relation.test.tsx` 5초 타임아웃)이 WIP 커밋에서 한 번씩 실패했다. 로컬에서는 재현되지 않으며 PR 코멘트로 근거를 남겼다.

## 다음 에이전트가 지킬 것

- `apps/docs/src/styles/*.css`는 `pnpm lint:tokens` 대상이다. 길이·색 리터럴은 토큰을 읽거나 같은 줄/바로 윗줄에 `cdt-allow-literal` 사유를 적는다.
- 모션은 `@media (prefers-reduced-motion: no-preference)` 안에서 토큰 지속시간만 쓴다. docs 규칙은 레이어 밖이라 `[data-cdt-theme] *` 감소 규칙이 덮지 못한다.
- `/`는 프리렌더된다. 쇼케이스의 로컬 상태 기본값은 서버·클라이언트가 같아야 한다.
- 시각 회귀 기준 이미지의 최종 판정은 PR CI의 고정 컨테이너다. 넘기면 `pnpm test:visual --update`를 그 컨테이너에서 돌린다.
- 랜딩 LCP 예산(NFR-001 2.5초, Fast 3G, gzip 없는 정적 서버)은 CSS 번들과 프리렌더 HTML 크기에 직접 묶여 있다. 문서 CSS를 늘리면 라우트별로 나눠 싣고 `pnpm lighthouse`로 다시 잰다.

## 참조

- PR: https://github.com/89sooner/design-system/pull/32
- CR-042 (`docs/00_governance/change_control.md`), 원장 v0.34, 브리프 `scratchpad/design-brief.md`(세션 한정)
