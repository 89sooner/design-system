# Conductor Design System 작업 패키지

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-11

## 1. 목적

구현 로드맵의 릴리스 슬라이스(REL)를 코딩 에이전트가 한 세션에서 완료·검증할 수 있는 작업 패키지(WP)로 분해한다. WP는 범위를 새로 만들 수 없으며, 모든 WP는 승인된 FR을 참조해야 한다.

## 2. WP 작성 규칙

- 1 WP = 1 에이전트 세션 규모. 구현과 검증이 한 번에 끝나는 크기로 자른다.
- 토큰 소스 → 빌드 산출 → CSS → 컴포넌트 → 테스트를 관통하는 수직 슬라이스를 우선한다. 워크스페이스 부트스트랩(WP-001)과 CI 잡 WP는 예외적으로 수평이다.
- 선행 WP를 명시하고 순환 의존을 만들지 않는다.
- 완료 기준(DoD)은 체크 가능한 항목만 적는다. `conductor_screen_qa_checklist.md`와 `conductor_screen_state_matrix.md` 항목을 인용하고 재서술하지 않는다.
- WP 완료 시 `conductor_implementation_traceability.md`를 갱신한다.
- 커밋/PR 본문에 `Refs: WP-### FR-<AREA>-###`를 기재한다.
- 구현 범위 밖의 것은 아무리 유용해도 코드가 아니라 메모로 남긴다.

## 3. 저장소 레이아웃 (모든 WP의 공통 전제)

```text
design-system/
  package.json            # 워크스페이스 루트, 스크립트 진입점
  pnpm-workspace.yaml
  tsconfig.base.json
  packages/
    tokens/               # @conductor/tokens
    css/                  # @conductor/css
    react/                # @conductor/react
  apps/
    docs/                 # 문서 사이트 (Conductor의 첫 소비자)
  docs/                   # 이 계획 문서 세트 (코드 아님)
```

## 4. WP 순서와 의존성

| WP ID | 이름 | REL | 선행 WP | 차단 요인 | 상태 |
| --- | --- | --- | --- | --- | --- |
| WP-001 | 모노레포 부트스트랩 | REL-001 | - | - | todo |
| WP-002 | 토큰 스키마와 다크 팔레트 소스 | REL-001 | WP-001 | - | todo |
| WP-003 | 토큰 참조 해석기와 CSS 산출 | REL-001 | WP-002 | - | todo |
| WP-004 | TypeScript·JSON 산출과 타입 | REL-001 | WP-003 | - | todo |
| WP-005 | 타이포·z-index·브레이크포인트 스케일 | REL-001 | WP-003 | - | todo |
| WP-006 | 토큰 린트와 계약 테스트 | REL-001 | WP-004, WP-005 | - | todo |
| WP-007 | 대비 검사기와 검사 쌍 정의 | REL-001 | WP-004 | - (OD-001 종결) | todo |
| WP-008 | `@conductor/css` 레이어 골격과 리셋 | REL-002 | WP-003 | - | todo |
| WP-009 | 레이아웃 프리미티브 클래스 | REL-002 | WP-008 | - | todo |
| WP-010 | 라이트 팔레트와 테마 결정 계약 | REL-002 | WP-006 | - | done |
| WP-011 | `@conductor/react` 골격과 공통 계약 | REL-002 | WP-008 | - | done |
| WP-012 | 액션·표면 컴포넌트군 | REL-002 | WP-011 | - | done |
| WP-013 | 상태 표시 컴포넌트군 | REL-002 | WP-011 | - | done |
| WP-014 | 데이터 표시 컴포넌트군 | REL-002 | WP-011 | - | done |
| WP-015 | 오버레이 컴포넌트군 | REL-002 | WP-011 | - | done |
| WP-016 | 폼 컴포넌트군 | REL-002 | WP-011 | - | done |
| WP-017 | 피드백 컴포넌트군 | REL-002 | WP-011 | - | done |
| WP-018 | 문서 사이트 셸과 테마 토글 | REL-003 | WP-012, WP-010 | - | done |
| WP-019 | Getting Started와 Foundations 화면 | REL-003 | WP-018 | - | done |
| WP-020 | 컴포넌트 카탈로그와 라이브 프리뷰 | REL-003 | WP-018, WP-017 | - | done |
| WP-021 | 토큰 참조 화면 | REL-003 | WP-018, WP-007 | - | done |
| WP-022 | Patterns·Accessibility 화면과 코드 복사 | REL-003 | WP-020 | - | done |
| WP-023 | 셸 컴포넌트군 | REL-003 | WP-012 | - (OD-004 종결: 포함) | done |
| WP-024 | 접근성 검사 CI 잡 | REL-003 | WP-020 | - | done |
| WP-025 | 번들 크기 검사 CI 잡 | REL-003 | WP-017 | - | done |
| WP-026 | 시각 회귀 검사 | REL-004 | WP-020 | - (OD-002 종결: REL-004 이월 확정) | done |
| WP-027 | Changesets와 npm 배포 워크플로 | REL-004 | WP-017 | - | done |
| WP-028 | 문서 사이트 정적 배포 | REL-004 | WP-022, WP-027 | - | todo |

차단 요인이 있는 WP는 해당 오픈 결정이 닫히기 전에 착수하지 않는다.

---

## WP-001 모노레포 부트스트랩

- 목표: 클린 체크아웃에서 `pnpm install && pnpm build && pnpm test`가 빈 패키지 3개와 문서 앱에 대해 종료 코드 0으로 통과한다.
- 관련 요구사항: FR-DX-001, FR-DX-002
- 관련 화면/플로우: 없음 (간접 노출: SFC-CLI)
- 관련 API/데이터/잡: API-PKG-001, API-PKG-002, API-PKG-003 / — / JOB-BUILD-001 ~ JOB-BUILD-004
- 선행 WP: 없음
- 구현 범위:
  - `pnpm-workspace.yaml`, 루트 `package.json`(스크립트: `build`, `test`, `typecheck`, `lint`), `tsconfig.base.json`
  - `packages/tokens`, `packages/css`, `packages/react`, `apps/docs` 각각의 `package.json`과 최소 진입점
  - 의존 방향 `tokens → css → react → docs` 강제 검사 스크립트 (역방향 참조 시 종료 코드 1)
  - Vitest, ESLint, TypeScript 설정 (ADR-009)
  - CI 워크플로 골격: install → lint → lint:deps → build → typecheck → test. `typecheck`는 `build` 뒤에 온다 — `@conductor/tokens`의 공개 타입 표면 일부를 토큰 빌드가 생성하기 때문이다(CR-009, DEV-002)
  - `engines`에 Node 20 이상 선언
- 제외(이 WP에서 하지 않는 것):
  - 토큰 값, CSS 규칙, React 컴포넌트, 문서 화면 (WP-002 이후)
  - 배포 워크플로 (WP-027)
- 완료 기준(DoD):
  - [ ] 클린 체크아웃에서 `pnpm install && pnpm build`가 종료 코드 0을 반환한다 (FR-DX-001 AC-2)
  - [ ] `packages/tokens`가 `packages/react`를 참조하도록 조작하면 빌드가 종료 코드 1로 실패한다 (FR-DX-001 AC-1)
  - [ ] 각 패키지 `package.json`이 `exports`와 `types`를 선언한다 (FR-DX-002 AC-1)
  - [ ] `pnpm build`가 3분 이내에 끝난다 (FR-DX-001 AC-3, NFR-001)
  - [ ] CI 워크플로가 PR에서 실행된다
- 검증 방법: `rm -rf node_modules && pnpm install && time pnpm build && pnpm test`
- 기록: `conductor_implementation_traceability.md`의 WP-001 행과 FR-DX-001·FR-DX-002 매핑 갱신

## WP-002 토큰 스키마와 다크 팔레트 소스

- 목표: 다크 팔레트의 모든 토큰이 3계층 스키마로 정의되고, 계층 참조 방향 위반이 빌드를 실패시킨다.
- 관련 요구사항: FR-TOK-001, FR-TOK-002, FR-TOK-005, FR-THM-001
- 관련 화면/플로우: 없음 (간접 노출: W-030) / FLOW-003
- 관련 API/데이터/잡: — / ENT-TOK-001, ENT-TOK-002, ENT-TOK-003, ENT-THM-001 / JOB-BUILD-001
- 선행 WP: WP-001
- 구현 범위:
  - `packages/tokens/src/schema.ts`: `TokenDefinition`(`key`, `tier`, `value | alias`, `usage`, `description`, `themeSpecific?`, `icon?`) — `conductor_data_model.md` 정의를 따른다
  - `packages/tokens/src/primitives.ts`: 원시 ramp (공개 export 금지, FR-TOK-002 AC-5)
  - `packages/tokens/src/palette.dark.ts`: `conductor_design_system_tokens.md`의 다크 시맨틱 표 전체
  - `packages/tokens/src/components.ts`: component 토큰
  - 계층 참조 방향 검사기 (primitive ← semantic ← component)
- 제외:
  - 라이트 팔레트 (WP-010)
  - 참조 해석과 CSS 산출 (WP-003)
  - 타이포/z-index/브레이크포인트 스케일 (WP-005)
- 완료 기준(DoD):
  - [ ] `agent-ai-platform/packages/web/src/styles/tokens.css`의 `:root` 커스텀 프로퍼티가 (별칭 2개 제외) 모두 다크 팔레트에 1:1로 존재한다 (FR-THM-001 AC-1)
  - [ ] `--surface-2`와 `--border`가 토큰 참조(alias)로 표현된다 (FR-THM-001 AC-2)
  - [ ] 상태 7종·심각도 4종·미터 3종 키가 존재하고 각각 비어 있지 않은 `icon` 메타데이터를 갖는다 (FR-TOK-005 AC-1~3, AC-5)
  - [ ] semantic 토큰이 component 토큰을 참조하면 검사기가 종료 코드 1로 실패하고 위반 키 쌍을 출력한다 (FR-TOK-002 AC-4)
  - [ ] 동일 계층 별칭(`surface.2` → `surface.subtle`, `border` → `border.default`, `status.running` → `accent`, `elevation.overlay` → `border.strong`)이 정상 참조로 통과한다 (FR-TOK-002 AC-2·AC-3, CR-008)
  - [ ] primitive 토큰이 `@conductor/tokens` 진입점에 export되지 않는다 (FR-TOK-002 AC-5)
- 검증 방법: `pnpm --filter @conductor/tokens test` 및 계층 위반 픽스처로 `pnpm build` 실패 확인
- 기록: WP-002 행, FR-TOK-001·FR-TOK-002·FR-TOK-005·FR-THM-001 매핑 갱신

## WP-003 토큰 참조 해석기와 CSS 산출

- 목표: `buildTokens`가 토큰 참조를 해석해 `--cdt-` 접두사 CSS 커스텀 프로퍼티 파일을 생성하고, 순환 참조를 검출한다.
- 관련 요구사항: FR-TOK-003, FR-TOK-004
- 관련 화면/플로우: 없음 (간접 노출: SFC-CLI, W-030) / FLOW-003
- 관련 API/데이터/잡: API-TOK-001, API-PKG-001 / ENT-TOK-003 / JOB-BUILD-001
- 선행 WP: WP-002
- 구현 범위:
  - 참조 해석기 (깊이 10단계, `{surface.subtle}` 형식)
  - 순환 참조 검출과 `a → b → c → a` 형식 경로 출력
  - 존재하지 않는 키 참조 검출
  - CSS 산출: 점 표기 → kebab-case 변환, `--cdt-` 접두사, 테마별 셀렉터 블록
  - 접두사 누락·이름 충돌 검사기
  - 원자적 쓰기: 전체 해석 성공 전에는 기존 산출물을 덮어쓰지 않는다
  - `buildTokens` CLI (`conductor_api_contracts.md`의 인자·플래그·종료 코드 계약)
- 제외:
  - TypeScript·JSON 산출 (WP-004)
  - 대비 검사 (WP-007)
- 완료 기준(DoD):
  - [ ] `surface.2` 별칭이 최종 CSS에서 `surface.subtle`의 실제 값으로 치환된다 (FR-TOK-003 AC-1)
  - [ ] 순환 참조 픽스처가 종료 코드 1과 순환 경로 출력을 낸다 (FR-TOK-003 AC-3)
  - [ ] 존재하지 않는 키 참조가 참조원과 대상 키를 출력하며 실패한다 (FR-TOK-003 AC-4)
  - [ ] 산출 `tokens.css`의 모든 커스텀 프로퍼티가 `--cdt-`로 시작한다 (FR-TOK-004 AC-1)
  - [ ] `surface.raised` → `--cdt-surface-raised` 변환이 확인된다 (FR-TOK-004 AC-2)
  - [ ] primitive 토큰이 CSS로 산출되지 않는다 (FR-TOK-004 AC-4)
  - [ ] 두 키가 같은 CSS 이름으로 변환되면 빌드가 충돌 키를 출력하며 실패한다 (FR-TOK-004 예외 처리)
  - [ ] 참조 해석 실패 시 이전 산출물이 손상되지 않는다 (FR-TOK-003 예외 처리)
- 검증 방법: `pnpm --filter @conductor/tokens build && pnpm --filter @conductor/tokens test`
- 기록: WP-003 행, FR-TOK-003·FR-TOK-004 매핑 갱신

## WP-004 TypeScript·JSON 산출과 타입

- 목표: 소비자가 `tokens.surface.raised`를 리터럴 타입으로 읽고, 문서 사이트가 `tokens.json`을 소비할 수 있다.
- 관련 요구사항: FR-TOK-006, FR-DX-002
- 관련 화면/플로우: 없음 (간접 노출: W-030) / FLOW-003
- 관련 API/데이터/잡: API-TOK-002, API-PKG-001 / ENT-TOK-001 / JOB-BUILD-001
- 선행 WP: WP-003
- 구현 범위:
  - `tokens.js` + `tokens.d.ts` 산출 (const assertion 기반 리터럴 타입)
  - `tokens.json` 산출: 키·값·계층·용도·설명 메타데이터 포함
  - 타입 생성 실패 시 빌드 중단과 산출물 미보존
- 제외: 대비 리포트(WP-007), 브레이크포인트 JS export(WP-005)
- 완료 기준(DoD):
  - [ ] `tokens.surface.raised`가 문자열 리터럴 타입으로 추론된다 (FR-TOK-006 AC-1)
  - [ ] `tokens.surface.nonexistent` 접근이 TypeScript 컴파일 오류를 낸다 (FR-TOK-006 AC-2)
  - [ ] `tokens.json`이 키·값·계층·용도 메타데이터를 포함한다 (FR-TOK-006 AC-3)
  - [ ] 산출 `.d.ts`에 `any` 타입이 0건이다 (FR-TOK-006 AC-4, FR-DX-002 AC-2)
  - [ ] 타입 생성 실패 시 이전 산출물이 남지 않는다 (FR-TOK-006 예외 처리)
- 검증 방법: `pnpm --filter @conductor/tokens build && pnpm typecheck && node -e "require('@conductor/tokens')"`
- 기록: WP-004 행, FR-TOK-006·FR-DX-002 매핑 갱신

## WP-005 타이포·z-index·브레이크포인트 스케일

- 목표: 글자 크기, 겹침 순서, 반응형 기준점이 리터럴이 아니라 토큰으로만 표현된다.
- 관련 요구사항: FR-TOK-007, FR-TOK-008, FR-TOK-009
- 관련 화면/플로우: W-011, W-012 / —
- 관련 API/데이터/잡: API-TOK-001, API-TOK-002 / ENT-TOK-001 / JOB-BUILD-001
- 선행 WP: WP-003
- 구현 범위:
  - `font.size.{2xs,xs,sm,base,md,lg,xl}` = 10/11/12/13/14/16/20px와 대응 `font.lineHeight.*`
  - `z.{base,raised,sticky,drawer,overlay,popover}` = 0/10/20/30/40/50, 중복 값 검사
  - `breakpoint.{sm,md,lg}` = 560/800/1080px
  - 빌드 시 `@media` 조건의 브레이크포인트 리터럴 치환기 (CSS 변수는 미디어쿼리에서 평가되지 않는다)
  - `breakpoints` 객체 JS export
- 제외: 실제 미디어쿼리를 사용하는 CSS 규칙 (WP-008, WP-009)
- 완료 기준(DoD):
  - [ ] `font.size` 7단계와 대응 `font.lineHeight`가 존재한다 (FR-TOK-007 AC-1, AC-2)
  - [ ] `z` 6단계가 존재하고 두 레이어가 같은 값을 갖지 않는다 (FR-TOK-008 AC-1, AC-3)
  - [ ] `breakpoint` 3단계가 존재하고 `breakpoints` 객체가 export된다 (FR-TOK-009 AC-1, AC-3)
  - [ ] 산출 CSS의 `@media` 조건에 `var(--cdt-breakpoint-*)`가 0건이다 (FR-TOK-009 AC-2)
- 검증 방법: `pnpm --filter @conductor/tokens build && pnpm --filter @conductor/tokens test`
- 기록: WP-005 행, FR-TOK-007·FR-TOK-008·FR-TOK-009 매핑 갱신

## WP-006 토큰 린트와 계약 테스트

- 목표: 토큰 소스 밖의 하드코딩 값과 테마 간 키 누락이 CI에서 차단된다.
- 관련 요구사항: FR-TOK-001, FR-QA-001
- 관련 화면/플로우: 없음 (간접 노출: SFC-CLI, SFC-CI) / FLOW-003
- 관련 API/데이터/잡: API-TOK-001 / ENT-THM-001 / JOB-BUILD-001
- 선행 WP: WP-004, WP-005
- 구현 범위:
  - `pnpm lint:tokens`: `packages/css`와 `packages/react`에서 색상 리터럴(`#rrggbb`, `rgb()`, `hsl()`), 리터럴 px/ms, `z-index` 숫자, `font-size` px를 검출
  - 허용 주석 `/* cdt-allow-literal: <사유> */` 처리와 `--report` 조회
  - 토큰 계약 테스트: 테마 간 semantic·component 키 집합 대칭 차집합 검사 (이 시점에는 다크 팔레트만 존재하므로 단일 테마 자기 검사 + 다중 테마 지원 코드 경로 검증)
  - `themeSpecific: true` 메타데이터를 가진 토큰의 검사 제외와 리포트 출력
- 제외: 라이트 팔레트 자체 (WP-010)
- 완료 기준(DoD):
  - [ ] `packages/css`/`packages/react`에 색상 리터럴을 넣은 픽스처가 `pnpm lint:tokens`를 종료 코드 1로 실패시키고 파일 경로와 라인 번호를 출력한다 (FR-TOK-001 AC-1, AC-3)
  - [ ] 리터럴 px/ms 검출이 동작한다 (FR-TOK-001 AC-2)
  - [ ] 허용 주석이 있는 리터럴은 통과하고 `--report`에 나타난다 (FR-TOK-001 예외 처리)
  - [ ] 한 테마에만 존재하는 키를 만든 픽스처가 계약 테스트를 실패시키고 누락 키를 테마별로 출력한다 (FR-QA-001 AC-1)
  - [ ] 계약 테스트가 `pnpm test`와 CI 모두에서 실행된다 (FR-QA-001 AC-3)
- 검증 방법: `pnpm lint:tokens && pnpm test` + 위반 픽스처로 실패 확인
- 기록: WP-006 행, FR-TOK-001·FR-QA-001 매핑 갱신

## WP-007 대비 검사기와 검사 쌍 정의

- **차단 해제됨. OD-001이 2026-07-10에 종결되었다.** 정책은 "최소 수정": `srs_final.md` 12.1절의 교정 표와 `usage` 분류를 그대로 구현한다.
- 목표: 두 테마의 전경/배경 쌍 대비율이 계산되고, 기준 미달이 빌드를 실패시킨다.
- 관련 요구사항: FR-THM-004, FR-THM-005, FR-A11Y-004
- 관련 화면/플로우: W-030, W-050 / FLOW-003
- 관련 API/데이터/잡: API-TOK-003 / ENT-THM-001 / JOB-CI-001
- 선행 WP: WP-004
- 구현 범위:
  - `packages/tokens/src/contrast-pairs.ts`: 검사 대상 쌍과 각 쌍의 기준(`body` 4.5:1 / `large` 3:1 / `nonText` 3:1). 12.1절 `usage` 분류를 그대로 옮긴다
  - WCAG 2.1 상대 휘도 공식 구현. alpha가 있는 색은 배경과 합성 후 계산
  - `checkContrast` CLI: 미달 시 종료 코드 1, 쌍 이름·테마·측정 대비율·기준값 출력
  - `usage: "decorative"` 토큰 제외와 `--report` 제외 목록 출력
  - `contrast-report.json` 산출 (W-030이 소비)
  - **FR-THM-005 교정 반영**: `focusRing`을 accent alpha 0.80으로, 신규 `border.control`을 slate alpha 0.60으로 정의하고 `nonText` 3:1로 검사
  - **용도 제약 린트**: `text.faint`가 `surface.elevated` 위에 쓰이면 `pnpm lint:tokens` 실패
- 제외: 라이트 팔레트 값 자체 (WP-010이 이 검사기를 통과시켜야 한다)
- 완료 기준(DoD):
  - [ ] 검사 대상 쌍이 `contrast-pairs.ts`에 명시적으로 선언된다 (FR-THM-004 AC-1)
  - [ ] 각 쌍이 `body`/`large`/`nonText` 기준 중 하나를 갖는다 (FR-THM-004 AC-2)
  - [ ] 미달 쌍 픽스처가 종료 코드 1과 쌍 이름·테마·측정값·기준값 출력을 낸다 (FR-THM-004 AC-3)
  - [ ] alpha 색상이 배경과 합성된 뒤 계산된다 (FR-THM-004 AC-4)
  - [ ] `decorative` 토큰이 검사에서 제외되고 `--report`에 제외 목록이 출력된다 (FR-A11Y-004 AC-3)
  - [ ] 포커스 링과 `border.control`이 `nonText` 기준으로 검사된다 (FR-A11Y-004 AC-4)
  - [ ] `focusRing`이 `surface.base` 위 3.93, `surface.raised` 위 3.56으로 측정된다 (FR-THM-005 AC-1)
  - [ ] `border.control`이 `surface.raised` 위 3.23으로 측정된다 (FR-THM-005 AC-2)
  - [ ] `text.faint`를 `surface.elevated` 위에 쓴 픽스처가 `pnpm lint:tokens`를 실패시킨다 (FR-THM-005 AC-3)
  - [ ] `border.subtle`/`default`/`strong`이 `decorative`로 분류되어 검사 대상에서 빠진다 (FR-THM-005 AC-4)
  - [ ] `status.queued`가 `nonText`로 분류되고 `surface.raised` 위 3.56, `surface.elevated` 위 3.25로 통과한다 (FR-THM-005 AC-5)
  - [ ] `status.neutralEnd`가 `decorative`로 분류되어 검사 대상에서 빠지고, 제외 사유가 `--report`에 출력된다 (FR-THM-005 AC-6, CR-006)
  - [ ] 다크 테마 전체에 대해 미달 0건을 보고한다 (FR-A11Y-004 AC-1)
- 검증 방법: `pnpm check:contrast` + 미달 픽스처로 실패 확인
- 기록: WP-007 행, FR-THM-004·FR-THM-005·FR-A11Y-004 매핑 갱신

## WP-008 `@conductor/css` 레이어 골격과 리셋

- 목표: 소비자가 `import "@conductor/css"` 한 줄로 리셋·베이스·모션 규칙을 얻고, 자신의 CSS로 Conductor를 덮어쓸 수 있다.
- 관련 요구사항: FR-CSS-001, FR-CSS-002, FR-CSS-005, FR-DX-003
- 관련 화면/플로우: W-002 / —
- 관련 API/데이터/잡: API-PKG-002 / — / JOB-BUILD-002
- 선행 WP: WP-003
- 구현 범위:
  - `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility` 선언을 산출물 최상단 한 줄에 고정
  - `cdt.reset`: box-sizing, 폼 요소 `font: inherit`, `:focus-visible` 포커스 링, 스크롤바, `::selection`
  - `cdt.base`: 본문 타이포, 링크, 제목, `prefers-reduced-motion` 감소 모드(Conductor 스코프 셀렉터)
  - `cdt.utility`: `cdt-sr-only`, `cdt-skip-link`, `cdt-muted`, `cdt-mono`, `cdt-num`
  - `@conductor/tokens`의 `tokens.css`를 번들에 포함
  - `exports`: `.`(전체), `./component.css`(리셋 제외 진입점), `sideEffects: ["*.css"]`
  - `!important` 0건 강제 검사
- 제외: 레이아웃 프리미티브(WP-009), 컴포넌트 클래스(WP-012 이후)
- 완료 기준(DoD):
  - [x] 모든 규칙이 5개 레이어 중 하나에 속한다 (FR-CSS-001 AC-1)
  - [x] 산출물의 `!important` 출현 횟수가 0건이다 (FR-CSS-001 AC-2)
  - [x] 레이어 밖 소비자 규칙이 동일 명시도에서 Conductor 규칙을 덮어쓴다 (FR-CSS-001 AC-3) — 산출물에 레이어 밖 규칙이 0건임을 `CSS-UNLAYERED` 검사가 강제한다. 실브라우저 캐스케이드 측정은 원장 §5
  - [x] `box-sizing: border-box` 전역 적용, 폼 요소 `font: inherit`, `:focus-visible` 포커스 링이 확인된다 (FR-CSS-002 AC-1~3)
  - [x] 산출물에 원격 폰트 참조(`@import url()`, `src: url(http...)`)가 0건이다 (FR-CSS-002 AC-4, NFR-002) — 리졸버 단계와 AST 단계 두 곳에서 차단
  - [x] 감소 모드에서 `transition-duration`·`animation-duration` 계산값이 `0s`, `scroll-behavior`가 `auto`다 (FR-CSS-005 AC-1, AC-3) — AST 단언과 WP-026 standalone Chromium 계산값 측정으로 확인했다 (CR-014)
  - [x] 감소 모드 규칙이 전역 `*` 대신 Conductor 스코프 셀렉터를 쓴다 (FR-CSS-005 AC-4) — `:root` / `[data-cdt-theme]` 스코프, `!important` 0건
  - [x] `@conductor/css` 전체 gzip 크기가 20KB 이하다 (NFR-001) — 실측 gzip 2,575바이트. `packages/css/test/bundle.test.ts`가 단언한다. `pnpm size`(JOB-CI-004)로의 승격은 WP-025가 수행한다 (CR-010)
  - [x] `./component.css` 진입점이 `exports`에 선언된다 (FR-CSS-002 예외 처리, FR-DX-003 AC-4)
- 검증 방법: `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test` (CR-010으로 `pnpm size` 제거 — 그 스크립트의 구현 범위는 WP-025가 소유하며 WP-008 시점에 존재하지 않는다)
- 기록: WP-008 행, FR-CSS-001·FR-CSS-002·FR-CSS-005·FR-DX-003 매핑 갱신

## WP-009 레이아웃 프리미티브 클래스

- 목표: 앱 골격과 그리드를 색상 결정 없이 재사용한다.
- 관련 요구사항: FR-CSS-003, FR-TOK-009
- 관련 화면/플로우: W-012 / —
- 관련 API/데이터/잡: API-PKG-002 / — / JOB-BUILD-002
- 선행 WP: WP-008
- 구현 범위: `cdt.layout` 레이어에 `cdt-app-shell`, `cdt-split-layout`, `cdt-card-grid`, `cdt-page`, `cdt-content-stack`
- 제외: 도메인 전용 레이아웃(`.thread-page`, `.tool-grid` 등, F-X-009로 명시 제외)
- 완료 기준(DoD):
  - [x] 5개 클래스가 존재한다 (FR-CSS-003 AC-1)
  - [x] `cdt-split-layout`이 800px 미만에서 단일 컬럼으로 전환된다 (FR-CSS-003 AC-2)
  - [x] `cdt-card-grid`가 최소 320px `auto-fill` 그리드이며 560px 미만에서 단일 컬럼이 된다 (FR-CSS-003 AC-3)
  - [x] 레이아웃 클래스가 색상 속성을 선언하지 않는다 (FR-CSS-003 AC-4)
  - [x] 브레이크포인트가 토큰(`sm` 560px, `md` 800px)에서 치환된 리터럴이며 CSS 변수 참조가 아니다 (FR-TOK-009 AC-2)
- 검증 방법: `pnpm --filter @conductor/css build && pnpm --filter @conductor/css test` (CR-012: 현재 소스에서 산출물을 만든 뒤 AST로 레이아웃과 미디어쿼리를 단언)
- 기록: WP-009 행, FR-CSS-003 매핑 갱신

## WP-010 라이트 팔레트와 테마 결정 계약

- 목표: 두 테마가 동일한 시맨틱 키 집합을 갖고, `data-cdt-theme` 속성이 `prefers-color-scheme`보다 우선한다.
- 관련 요구사항: FR-THM-002, FR-THM-003, FR-QA-001
- 관련 화면/플로우: W-010, W-030 / FLOW-002
- 관련 API/데이터/잡: API-THM-001 / ENT-THM-001 / JOB-BUILD-001
- 선행 WP: WP-006
- 구현 범위:
  - `packages/tokens/src/palette.light.ts`: `conductor_design_system_tokens.md`의 라이트 파생 규칙 적용
  - alpha 경계 토큰의 라이트 대안 값, `elevation.*`의 라이트 전용 alpha
  - 테마 셀렉터 산출: `[data-cdt-theme="dark"]`, `[data-cdt-theme="light"]`, `@media (prefers-color-scheme: dark)` 폴백
  - 속성값이 `dark`/`light` 이외일 때 다크 적용
  - `color-scheme` 속성 설정
  - 서버 렌더링 깜빡임 방지 인라인 스니펫 (패키지가 자동 주입하지 않고 문서로 제공)
- 제외: 문서 사이트 테마 토글 UI (WP-018)
- 완료 기준(DoD):
  - [x] 두 테마의 semantic 키 집합 대칭 차집합이 공집합이다 (FR-THM-002 AC-1, FR-QA-001 AC-1)
  - [x] 라이트 적용 시 계산된 `color-scheme`이 `light`, 다크 적용 시 `dark`다 (FR-THM-002 AC-2, FR-THM-001 AC-4)
  - [x] 라이트 경계 토큰이 라이트 배경 위에서 비텍스트 3:1을 만족한다 (FR-THM-002 AC-3)
  - [x] `elevation.*`의 그림자 alpha가 두 테마에서 서로 다르다 (FR-THM-002 AC-4)
  - [x] `data-cdt-theme="light"` + OS 다크에서 라이트가 적용된다 (FR-THM-003 AC-1)
  - [x] 속성 부재 시 `prefers-color-scheme`을 따른다 (FR-THM-003 AC-2)
  - [x] 잘못된 속성값에서 다크가 적용된다 (FR-THM-003 AC-3)
  - [x] `pnpm check:contrast`가 라이트 테마에서도 미달 0건을 보고한다 (FR-A11Y-004 AC-1)
- 검증 방법: `pnpm build && pnpm check:contrast && pnpm test`
- 기록: WP-010 행, FR-THM-002·FR-THM-003·FR-QA-001 매핑 갱신

## WP-011 `@conductor/react` 골격과 공통 계약

- 목표: 컴포넌트 공통 계약이 코드로 강제되고, 공유 계약 테스트 스위트가 공개 컴포넌트 전수에 자동 적용된다.
- 관련 요구사항: FR-CMP-001, FR-DX-002, FR-DX-003, FR-DX-004, FR-QA-002
- 관련 화면/플로우: W-021 / —
- 관련 API/데이터/잡: API-PKG-003, API-CMP-001 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-008
- 구현 범위:
  - 패키지 골격, `exports` 선언, `sideEffects: false`
  - `cx()` className 병합 유틸
  - 공통 props 타입: `ComponentPropsWithoutRef<E>` 확장 패턴, ref 전달 규약
  - 공유 계약 테스트 스위트 (`runContractSuite(Component, defaultProps)`): ref 전달 / className 병합 / `data-*`·`aria-*` 통과 / 네이티브 props 확장
  - 공개 진입점에 export되었으나 테스트 파일이 없는 컴포넌트를 검출하는 검사
  - `renderToString` SSR 스모크 테스트 하네스
  - React 18·19 peer dependency 선언, `lucide-react` peer dependency 선언
- 제외: 실제 컴포넌트 구현 (WP-012 ~ WP-017)
- 완료 기준(DoD):
  - [x] 계약 스위트가 4개 항목(ref/className/속성 통과/props 확장)을 검증한다 (FR-CMP-001 AC-1~4)
  - [x] 계약 스위트가 공개 컴포넌트 전수에 실행되도록 배선된다 (FR-CMP-001 AC-5)
  - [x] 계약 위반 픽스처 컴포넌트가 스위트를 실패시킨다 (FR-CMP-001 예외 처리)
  - [x] 테스트 파일 없는 export 컴포넌트가 빌드 전 검사를 실패시킨다 (FR-QA-002 AC-1)
  - [x] `sideEffects: false`가 선언되고 선언되지 않은 내부 경로 import가 해석 오류를 낸다 (FR-DX-003 AC-1, AC-3)
  - [x] 모듈 최상위에서 `window`/`document`/`localStorage` 접근이 0건이다 (FR-DX-004 AC-2)
  - [x] 산출 `.d.ts`에 `any`가 0건이고 내부 타입이 누출되지 않는다 (FR-DX-002 AC-2, AC-4)
- 검증 방법: `pnpm --filter @conductor/react build && pnpm --filter @conductor/react test && pnpm typecheck`
- 기록: WP-011 행, FR-CMP-001·FR-DX-002·FR-DX-003·FR-DX-004 매핑 갱신

## WP-012 액션·표면 컴포넌트군

- 목표: `Button`, `IconButton`, `Card`, `CardGrid`, `Panel`이 CSS 클래스와 React 양쪽에서 동일한 시각을 낸다.
- 관련 요구사항: FR-CMP-002, FR-CMP-003, FR-CSS-004, FR-A11Y-001
- 관련 화면/플로우: W-020, W-021 / FLOW-001
- 관련 API/데이터/잡: API-CMP-002, API-CMP-003 / ENT-CMP-001 / JOB-BUILD-002, JOB-BUILD-003
- 선행 WP: WP-011
- 구현 범위: C-001 Button, C-002 IconButton, C-010 Card, C-011 CardGrid, C-012 Panel + 대응 `cdt-btn`, `cdt-card`, `cdt-card-grid`, `cdt-panel` CSS 클래스
- 제외: 상태 배지(WP-013), 오버레이(WP-015)
- 완료 기준(DoD):
  - [x] `variant`가 `primary`/`secondary`/`ghost` 3종을 지원한다 (FR-CMP-002 AC-1)
  - [x] `loading` 시 `aria-busy="true"`이고 클릭 핸들러가 호출되지 않는다 (FR-CMP-002 AC-2)
  - [x] `IconButton`에 `aria-label` 누락 시 TypeScript 컴파일 오류가 난다 (FR-CMP-002 AC-3)
  - [x] `disabled`에서 `cursor: not-allowed`이고 hover 시각 변화가 없다 (FR-CMP-002 AC-4)
  - [x] `loading`과 `disabled` 동시 참일 때 `disabled` 시각이 우선하고 `aria-busy`가 유지된다 (FR-CMP-002 예외 처리)
  - [x] `onClick`/`href`가 있는 `Card`가 `button`/`a`로 렌더되고 포커스를 받는다 (FR-CMP-003 AC-1)
  - [x] 정적 `Card`는 `div`로 렌더되고 포커스를 받지 않는다 (FR-CMP-003 AC-3)
  - [x] 대화형 `Card` 안의 중첩 대화형 요소가 개발 빌드 콘솔 경고를 낸다 (FR-CMP-003 예외 처리)
  - [x] `cdt-btn cdt-btn--primary` 클래스만으로 `Button variant="primary"`와 동일한 계산 스타일이 나온다 (FR-CSS-004 AC-3)
  - [x] 컴포넌트 클래스가 구조 셀렉터(`>`, `+`, `:nth-child`)에 의존하지 않는다 (FR-CSS-004 AC-4)
  - [x] `:focus-visible` 포커스 링이 동일 `box-shadow` 계산값을 갖는다 (FR-A11Y-001 AC-1)
  - [x] 공유 계약 스위트를 통과한다 (FR-CMP-001 AC-5)
  - [x] `conductor_screen_qa_checklist.md`의 공통 QA와 접근성 QA 해당 항목이 닫힌다
- 검증 방법: `pnpm --filter @conductor/react test -- action surface && pnpm lint:tokens`
- 기록: WP-012 행, FR-CMP-002·FR-CMP-003·FR-CSS-004 매핑 갱신

## WP-013 상태 표시 컴포넌트군

- 목표: 상태와 심각도가 색·아이콘·텍스트 세 채널로 동시에 전달된다.
- 관련 요구사항: FR-CMP-004, FR-A11Y-003, FR-TOK-005
- 관련 화면/플로우: W-020, W-021, W-040 / FLOW-001
- 관련 API/데이터/잡: API-CMP-004 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-011
- 구현 범위: C-020 Badge, C-021 StatusBadge, C-022 SeverityTag + `cdt-badge` 클래스군
- 제외: `iconOnly` 모드(FR-CMP-004 예외 처리로 명시 금지)
- 완료 기준(DoD):
  - [x] `StatusBadge status="running"`이 상태색·아이콘·텍스트를 모두 렌더한다 (FR-CMP-004 AC-1)
  - [x] 아이콘이 `aria-hidden="true"`이고 텍스트가 접근 가능한 이름을 제공한다 (FR-CMP-004 AC-2)
  - [x] `status` props가 7개 값으로 타입 제한되고 그 외 값은 컴파일 오류다 (FR-CMP-004 AC-3)
  - [x] `SeverityTag severity="destructive"`가 심각도색·경고 아이콘·텍스트를 렌더한다 (FR-CMP-004 AC-4)
  - [x] 그레이스케일 렌더 시 상태 7종이 텍스트로 구분된다 (FR-CMP-004 AC-5, FR-A11Y-003 AC-4)
  - [x] 공유 계약 스위트를 통과한다
- 검증 방법: `pnpm --filter @conductor/react test -- status`
- 기록: WP-013 행, FR-CMP-004·FR-A11Y-003 매핑 갱신

## WP-014 데이터 표시 컴포넌트군

- 목표: 표·타임라인·코드 블록이 조밀한 운영 화면 밀도로 렌더된다.
- 관련 요구사항: FR-CMP-005, FR-A11Y-002
- 관련 화면/플로우: W-020, W-021 / FLOW-001
- 관련 API/데이터/잡: API-CMP-005 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-011
- 구현 범위: C-030 Table, C-031 Timeline, C-032 CodeBlock, C-033 Kbd + `cdt-table`, `cdt-timeline`, `cdt-code-block`, `cdt-kbd`
- 제외: 정렬·페이지네이션·가상 스크롤 (FR-CMP-005 예외 처리로 명시 제외)
- 완료 기준(DoD):
  - [x] `Table`이 가로 스크롤 컨테이너를 자체 소유하고 800px 미만에서 활성화된다 (FR-CMP-005 AC-1)
  - [x] `cdt-num` 셀의 `font-variant-numeric` 계산값이 `tabular-nums`다 (FR-CMP-005 AC-2)
  - [x] `Timeline` 단계가 `onSelect` 여부에 따라 `button`/`div`로 렌더되고 대화형일 때 키보드로 도달한다 (FR-CMP-005 AC-3, FR-A11Y-002 AC-4)
  - [x] `CodeBlock`이 모노스페이스 폰트와 가로 스크롤을 제공한다 (FR-CMP-005 AC-4)
  - [x] `caption`/`aria-label` 없는 `Table`이 개발 빌드 콘솔 경고를 낸다 (FR-CMP-005 AC-5)
  - [x] 포커스 링이 부모 `overflow: hidden`에 잘리지 않는다 (FR-A11Y-001 예외 처리)
  - [x] 공유 계약 스위트를 통과한다
- 검증 방법: `pnpm --filter @conductor/react test -- data`
- 기록: WP-014 행, FR-CMP-005 매핑 갱신

## WP-015 오버레이 컴포넌트군

- 목표: Radix가 접근성 동작을 소유한 채 Conductor의 시각이 입혀진다.
- 관련 요구사항: FR-CMP-006, FR-A11Y-002, FR-A11Y-005, FR-TOK-008
- 관련 화면/플로우: W-020, W-021 / FLOW-004
- 관련 API/데이터/잡: API-CMP-006 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-011
- 구현 범위: C-040 Dialog, C-041 Drawer, C-042 Tooltip, C-043 DropdownMenu — Radix UI 프리미티브 래핑. Radix 버전 정확 고정. `data-*` 속성 셀렉터만 사용
- 제외: 토스트/스낵바 (FR-CMP-008 예외 처리로 명시 제외)
- 완료 기준(DoD):
  - [x] `Dialog`/`Drawer`가 열린 동안 포커스가 갇히고, Escape로 닫히며, 닫힌 후 포커스가 트리거로 복귀한다 (FR-CMP-006 AC-1, FR-A11Y-002 AC-3)
  - [x] 열린 동안 배경 스크롤이 잠긴다 (FR-CMP-006 AC-2)
  - [x] `Tooltip`이 포커스와 hover 양쪽에서 열리고 Escape로 닫힌다 (FR-CMP-006 AC-3)
  - [x] 오버레이 `z-index`가 `z.overlay`/`z.popover` 토큰을 사용한다 (FR-CMP-006 AC-4, FR-TOK-008 AC-2)
  - [x] 포커스 트랩·롤 관리·키보드 내비게이션 자체 구현이 0건이다 (FR-CMP-006 AC-5)
  - [x] Radix가 제공하는 role/aria 속성을 덮어쓴 건수가 0건이다 (FR-A11Y-005 AC-4)
  - [x] CSS가 구조 셀렉터 없이 `data-*` 속성 셀렉터만 쓴다 (FR-CSS-004 AC-4, R-3 완화)
  - [x] 공유 계약 스위트를 통과한다
- 검증 방법: `pnpm --filter @conductor/react test -- overlay`
- 기록: WP-015 행, FR-CMP-006·FR-A11Y-002 매핑 갱신

## WP-016 폼 컴포넌트군

- 목표: 라벨·설명·오류가 입력 요소에 프로그램적으로 연결된다.
- 관련 요구사항: FR-CMP-007, FR-A11Y-003, FR-A11Y-005
- 관련 화면/플로우: W-020, W-021 / FLOW-001
- 관련 API/데이터/잡: API-CMP-007 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-011
- 구현 범위: C-050 Field, C-051 TextField, C-052 TextArea, C-053 Select, C-054 Switch, C-055 Checkbox. Select/Switch/Checkbox는 Radix 기반
- 제외: 폼 상태 관리와 유효성 검사 로직 (FR-CMP-007 예외 처리로 명시 제외)
- 완료 기준(DoD):
  - [x] `Field`가 라벨을 `htmlFor`/`id`로, 설명·오류를 `aria-describedby`로 연결한다 (FR-CMP-007 AC-1)
  - [x] 오류 상태에서 `aria-invalid="true"`다 (FR-CMP-007 AC-2, FR-A11Y-003 AC-2)
  - [x] 라벨 없는 `TextField`가 개발 빌드 콘솔 경고를 낸다 (FR-CMP-007 AC-3)
  - [x] `Switch`/`Checkbox`가 Space로 토글되고 `role`·`aria-checked`를 노출한다 (FR-CMP-007 AC-4)
  - [x] 폼 컨트롤 최소 높이가 40px, 560px 미만에서 42px다 (FR-CMP-007 AC-5)
  - [x] 공유 계약 스위트를 통과한다
- 검증 방법: `pnpm --filter @conductor/react test -- form`
- 기록: WP-016 행, FR-CMP-007 매핑 갱신

## WP-017 피드백 컴포넌트군

- 목표: 진행·비어있음·오류가 보조기술에 즉시 전달된다.
- 관련 요구사항: FR-CMP-008, FR-A11Y-005, FR-CSS-005
- 관련 화면/플로우: W-020, W-021 / FLOW-001
- 관련 API/데이터/잡: API-CMP-008 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-011
- 구현 범위: C-060 Banner, C-061 EmptyState, C-062 Meter, C-063 ProgressRing, C-064 Spinner
- 제외: 토스트/스낵바와 알림 큐 관리
- 완료 기준(DoD):
  - [x] `Banner tone="danger"`가 `role="alert"`, `tone="info"`가 `role="status"`를 갖는다 (FR-CMP-008 AC-1, FR-A11Y-005 AC-2)
  - [x] `Banner tone="danger"`의 `action` 슬롯이 비면 개발 빌드 콘솔 경고를 낸다 (FR-CMP-008 AC-2)
  - [x] `EmptyState`가 제목·설명·액션 슬롯을 받는다 (FR-CMP-008 AC-3)
  - [x] `Meter`가 임계 초과 시 `meter.warning`/`meter.exceeded` 색으로 전환되고 `aria-valuenow`/`aria-valuemin`/`aria-valuemax`를 노출하며 수치 텍스트를 표시한다 (FR-CMP-008 AC-4, FR-A11Y-003 AC-3)
  - [x] 감소 모드에서 `Spinner`/`ProgressRing`이 애니메이션 대신 진행률 텍스트를 노출한다 (FR-CMP-008 AC-5, FR-CSS-005 예외 처리)
  - [x] 공유 계약 스위트를 통과한다
- 검증 방법: `pnpm --filter @conductor/react test -- feedback`
- 기록: WP-017 행, FR-CMP-008 매핑 갱신

## WP-018 문서 사이트 셸과 테마 토글

- 목표: 문서 사이트가 Conductor를 소비자로서 설치해 렌더하고, 테마를 전환하며 선택을 유지한다.
- 관련 요구사항: FR-DOC-001, FR-DOC-005, FR-THM-003
- 관련 화면/플로우: W-001 / FLOW-001, FLOW-002, FLOW-005
- 관련 API/데이터/잡: API-DOC-001, API-THM-001 / ENT-DOC-001 / JOB-BUILD-004
- 선행 WP: WP-012, WP-010
- 구현 범위: Vite + React 정적 앱, 라우터, 사이드 내비 + 상단바 + 본문 셸, 테마 토글, 최초 페인트 깜빡임 방지 인라인 스니펫, 오프캔버스 모바일 내비
- 제외: Foundations/카탈로그/토큰/패턴 화면 (WP-019 ~ WP-022)
- 완료 기준(DoD):
  - [ ] 문서 사이트가 `@conductor/react`·`@conductor/css`를 워크스페이스 의존성으로 설치해 사용하며 소스 상대경로 import가 0건이다 (FR-DOC-001 AC-1)
  - [ ] 정적 파일로 빌드되고 서버 런타임 없이 동작한다 (FR-DOC-001 AC-3)
  - [ ] 빌드 산출물이 실행 시 외부 도메인 네트워크 요청을 0건 발생시킨다 (FR-DOC-001 AC-4, NFR-002)
  - [ ] 토글 조작 후 루트 `data-cdt-theme`가 바뀌고 새로고침 후에도 유지된다 (FR-DOC-005 AC-1, AC-2)
  - [ ] 저장된 선택이 없으면 `prefers-color-scheme`을 따른다 (FR-DOC-005 AC-3)
  - [ ] 최초 페인트 시 테마 깜빡임이 없다 (FR-DOC-005 AC-4)
  - [ ] 토글이 `role="switch"` 또는 `aria-pressed`를 노출하고 키보드로 조작된다 (FR-DOC-005 AC-5)
  - [ ] `localStorage` 차단 환경에서 예외가 렌더를 막지 않는다 (FR-DOC-005 예외 처리)
- 검증 방법: `pnpm --filter docs build && pnpm --filter docs test:e2e -- shell theme`
- 기록: WP-018 행, FR-DOC-001·FR-DOC-005 매핑 갱신

## WP-019 Getting Started와 Foundations 화면

- 목표: 토큰의 의미를 빌드 산출물에서 생성한 화면으로 조회한다.
- 관련 요구사항: FR-DOC-002, FR-CSS-001, FR-DX-001, FR-DX-003, FR-DX-004
- 관련 화면/플로우: W-002, W-010, W-011, W-012, W-013, W-014 / FLOW-001
- 관련 API/데이터/잡: API-TOK-002, API-DOC-001 / ENT-TOK-001, ENT-DOC-001 / JOB-BUILD-004
- 선행 WP: WP-018
- 구현 범위: W-002 설치 절차(SCN-001 3단계, 캐스케이드 레이어 예외 안내, SSR 스니펫), W-010 ~ W-014 Foundations 5화면. 값은 `tokens.json`에서 읽는다
- 제외: 토큰 참조 표(W-030, WP-021)
- 완료 기준(DoD):
  - [ ] Foundations 화면에 하드코딩된 토큰 값이 0건이며 `tokens.json`에서 읽는다 (FR-DOC-002 AC-1)
  - [ ] 토큰 소스에 토큰을 추가하고 재빌드하면 해당 화면에 자동으로 나타난다 (FR-DOC-002 AC-2)
  - [ ] 각 토큰 행이 키·계층·현재 테마 값·용도 설명을 표시한다 (FR-DOC-002 AC-3)
  - [ ] 용도 설명이 없는 토큰이 `설명 없음`으로 표시되고 빌드 경고가 출력된다 (FR-DOC-002 예외 처리)
  - [ ] W-002의 설치 절차가 명령 3개 이하다 (M-5)
- 검증 방법: `pnpm --filter docs test:e2e -- foundations` + 신규 토큰 추가 후 재빌드 확인
- 기록: WP-019 행, FR-DOC-002 매핑 갱신

## WP-020 컴포넌트 카탈로그와 라이브 프리뷰

- 목표: 모든 공개 컴포넌트가 실제 DOM으로 렌더되고 props 표가 타입에서 생성된다.
- 관련 요구사항: FR-DOC-003, FR-DX-002, FR-CSS-004
- 관련 화면/플로우: W-020, W-021 / FLOW-001
- 관련 API/데이터/잡: API-PKG-003, API-DOC-001 / ENT-CMP-001 / JOB-BUILD-004
- 선행 WP: WP-018, WP-017
- 구현 범위: W-020 인덱스, W-021 동적 라우트(`/components/:componentId`), 라이브 프리뷰, 타입에서 props 표 생성, variant × tone 조합 전수 렌더, 프리뷰 오류 경계
- 제외: 코드 복사 버튼(WP-022)
- 완료 기준(DoD):
  - [ ] 각 컴포넌트 화면이 컴포넌트를 실제로 마운트해 렌더하며 스크린샷 이미지가 0건이다 (FR-DOC-003 AC-1)
  - [ ] props 표가 타입 정의에서 생성되고 수동 작성 행이 0건이다 (FR-DOC-003 AC-2, FR-DX-002)
  - [ ] 모든 `variant`와 `tone` 조합이 프리뷰에 렌더된다 (FR-DOC-003 AC-3)
  - [ ] 프리뷰가 현재 선택된 테마를 따른다 (FR-DOC-003 AC-4)
  - [ ] 공개 진입점에 export되었으나 카탈로그에 화면이 없는 컴포넌트가 0건이며, 위반 시 빌드가 실패한다 (FR-DOC-003 AC-5)
  - [ ] 프리뷰 렌더 예외가 오류 경계로 격리되고 나머지 화면이 계속 렌더된다 (FR-DOC-003 예외 처리)
- 검증 방법: `pnpm --filter docs build && pnpm --filter docs test:e2e -- catalog`
- 기록: WP-020 행, FR-DOC-003 매핑 갱신

## WP-021 토큰 참조 화면

- 목표: 모든 토큰의 두 테마 값과 대비율 판정을 한 화면에서 조회한다.
- 관련 요구사항: FR-DOC-004, FR-A11Y-004, FR-QA-001, FR-TOK-008
- 관련 화면/플로우: W-030 / FLOW-002
- 관련 API/데이터/잡: API-TOK-002, API-TOK-003 / ENT-TOK-001, ENT-THM-001 / JOB-BUILD-004
- 선행 WP: WP-018, WP-007
- 구현 범위: W-030 토큰 표, 키 문자열 필터, 다크/라이트 값 병렬 표시, `contrast-report.json` 소비, 장식 전용 표식과 제외 사유
- 제외: 런타임 토큰 편집기 (Out of Scope)
- 완료 기준(DoD):
  - [ ] 토큰 키 문자열 필터가 일치 행만 남긴다 (FR-DOC-004 AC-1)
  - [ ] 색상 토큰 행이 다크 값과 라이트 값을 나란히 표시한다 (FR-DOC-004 AC-2)
  - [ ] 검사 대상 쌍의 토큰이 대비율 수치와 pass/fail 판정을 표시한다 (FR-DOC-004 AC-3)
  - [ ] 제외 토큰이 `장식 전용` 표식과 제외 사유를 표시한다 (FR-DOC-004 AC-4)
  - [ ] `contrast-report.json`이 없으면 `측정되지 않음`과 경고 배너를 표시한다 (FR-DOC-004 예외 처리)
- 검증 방법: `pnpm --filter docs test:e2e -- tokens` + 리포트 파일 삭제 후 폴백 확인
- 기록: WP-021 행, FR-DOC-004 매핑 갱신

## WP-022 Patterns·Accessibility 화면과 코드 복사

- 목표: 오용을 막는 사용 규칙과 접근성 근거가 문서로 노출되고, 예제 코드를 클립보드로 옮길 수 있다.
- 관련 요구사항: FR-DOC-006, FR-DOC-007, FR-A11Y-003, FR-QA-003
- 관련 화면/플로우: W-021, W-040, W-050 / FLOW-006
- 관련 API/데이터/잡: API-DOC-001 / ENT-DOC-001 / JOB-BUILD-004
- 선행 WP: WP-020
- 구현 범위: W-040 사용 규칙(상태 7종·심각도 4종·밀도·`Dialog` vs `Drawer` 선택 기준, 권장/금지 예를 실제 렌더로), W-050 접근성(대비 리포트, axe 허용 목록, 키보드 경로), W-021의 코드 복사 버튼
- 제외: 시각 회귀 결과 표시 (WP-026)
- 완료 기준(DoD):
  - [ ] 각 규칙이 권장 예와 금지 예를 실제 렌더된 컴포넌트로 나란히 보여준다 (FR-DOC-007 AC-1)
  - [ ] 금지 예에 금지 사유가 문장으로 기재된다 (FR-DOC-007 AC-2)
  - [ ] 상태 7종·심각도 4종 각각의 사용 시점과 `Dialog`/`Drawer` 선택 기준이 기술된다 (FR-DOC-007 AC-3, AC-4)
  - [ ] 복사 후 2초 이내에 `복사됨` 상태가 표시되고 원래 상태로 복귀한다 (FR-DOC-006 AC-1)
  - [ ] 복사 완료가 `aria-live="polite"` 영역으로 알려진다 (FR-DOC-006 AC-2)
  - [ ] Clipboard API 미지원 시 코드가 선택 가능한 상태로 남고 버튼이 `disabled`로 렌더된다 (FR-DOC-006 AC-3)
  - [ ] W-050이 axe 허용 목록을 노출한다 (FR-A11Y-005 예외 처리, FR-QA-003 AC-4)
- 검증 방법: `pnpm --filter docs test:e2e -- patterns accessibility copy`
- 기록: WP-022 행, FR-DOC-006·FR-DOC-007 매핑 갱신

## WP-023 셸 컴포넌트군

- **차단 해제됨. OD-004가 2026-07-10에 종결되었다**: 셸 컴포넌트군을 `@conductor/react`에 포함한다. `renderLink` props로 라우팅 비종속 API를 성립시킨다.
- 목표: 앱 골격을 라우팅 라이브러리 결합 없이 배포한다.
- 관련 요구사항: FR-CMP-009, FR-A11Y-002, FR-CSS-002
- 관련 화면/플로우: W-001, W-021 / FLOW-005
- 관련 API/데이터/잡: API-CMP-009 / ENT-CMP-001 / JOB-BUILD-003
- 선행 WP: WP-012
- 구현 범위: C-070 AppShell, C-071 NavList, C-072 TopBar. `renderLink` props로 링크 렌더 위임
- 제외: 라우팅 라이브러리 의존성 추가
- 완료 기준(DoD):
  - [x] `NavList`가 `renderLink` props로 링크 렌더를 위임한다 (FR-CMP-009 AC-1)
  - [x] `@conductor/react` 의존성 목록에 라우팅 라이브러리가 0건이다 (FR-CMP-009 AC-2)
  - [x] 800px 미만에서 사이드 내비가 오프캔버스로 전환되고 오버레이 클릭 또는 Escape로 닫힌다 (FR-CMP-009 AC-3)
  - [x] `AppShell`이 `skip-link`를 렌더하고 본문으로 포커스를 이동시킨다 (FR-CMP-009 AC-4, FR-CSS-002 AC-5)
  - [x] 공유 계약 스위트를 통과한다
- 검증 방법: `pnpm --filter @conductor/react test -- shell`
- 기록: WP-023 행, FR-CMP-009 매핑 갱신, OD-004 종결 근거 기록

## WP-024 접근성 검사 CI 잡

- 목표: axe-core serious 이상 위반이 병합을 막는다.
- 관련 요구사항: FR-QA-003, FR-A11Y-005, FR-A11Y-002
- 관련 화면/플로우: 없음 (간접 노출: W-050, SFC-CI) / FLOW-003
- 관련 API/데이터/잡: — / — / JOB-CI-002
- 선행 WP: WP-020
- 구현 범위: 컴포넌트별 주요 상태(기본/disabled/오류/열림) × 테마 2종에 대한 axe 실행, 허용 목록 파일(규칙 ID + 사유), CI 게이트, 키보드 경로 테스트
- 제외: 시각 회귀(WP-026)
- 완료 기준(DoD):
  - [x] 각 컴포넌트의 주요 상태에 대해 검사가 실행된다 (FR-QA-003 AC-1)
  - [x] serious/critical 위반 1건 이상이면 CI가 종료 코드 1을 반환한다 (FR-QA-003 AC-2, FR-A11Y-005 AC-1)
  - [x] 검사가 다크·라이트 두 테마에서 실행된다 (FR-QA-003 AC-3)
  - [x] 허용 예외가 규칙 ID와 사유와 함께 파일로 관리된다 (FR-QA-003 AC-4)
  - [x] 컴포넌트 전수에 키보드 경로 테스트가 존재한다 (FR-A11Y-002 AC-5)
  - [x] 오버레이 밖에서 키보드 트랩이 0건이다 (FR-A11Y-002 AC-2)
- 검증 방법: `pnpm test:a11y` + 위반 픽스처로 CI 실패 확인
- 기록: WP-024 행, FR-QA-003·FR-A11Y-002·FR-A11Y-005 매핑 갱신

## WP-025 번들 크기 검사 CI 잡

- 목표: 번들 비용 회귀가 병합을 막는다.
- 관련 요구사항: FR-DX-003, FR-QA-002
- 관련 화면/플로우: 없음 (간접 노출: SFC-CI) / FLOW-003
- 관련 API/데이터/잡: API-PKG-002, API-PKG-003 / — / JOB-CI-004
- 선행 WP: WP-017
- 구현 범위: `pnpm size` — `Button` 단독 import gzip 측정(React 제외), `@conductor/css` 전체 gzip 측정, 기준 초과 시 초과 모듈 목록 출력
- 제외: Lighthouse 성능 측정 (WP-028의 문서 사이트 배포 이후)
- 완료 기준(DoD):
  - [x] `Button` 단독 import gzip이 4KB 이하다 (FR-DX-003 AC-3, NFR-001, M-7) — `size-limit` 실측 527바이트
  - [x] `@conductor/css` 전체 gzip이 20KB 이하다 (NFR-001) — 실측 7,720바이트
  - [x] 기준 초과 시 CI가 실패하고 초과 모듈 목록을 출력한다 (FR-DX-003 예외 처리) — 1바이트 제한 음성 픽스처에서 exit 1과 기여 청크 목록 출력 확인
  - [x] `sideEffects` 선언이 검증된다 (FR-DX-003 AC-2) — React `false`, CSS `*.css` 보존 계약 확인
- 검증 방법: `pnpm size`
- 기록: WP-025 행, FR-DX-003 매핑 갱신

## WP-026 시각 회귀 검사

- **OD-002가 2026-07-10에 종결되었다: REL-004로 이월 확정.** FR-QA-004의 상태는 `deferred`다. 이 WP는 v1 릴리스 게이트가 아니며, REL-001 ~ REL-003 완료 후에 착수한다. v1 기간에는 수동 시각 확인으로 대체하고 그 사실을 추적 원장의 알려진 제약에 남긴다.
- 목표: 의도치 않은 시각 변경이 병합을 막는다.
- 관련 요구사항: FR-QA-004
- 관련 화면/플로우: 없음 (간접 노출: SFC-CI) / FLOW-003
- 관련 API/데이터/잡: — / — / JOB-CI-003
- 선행 WP: WP-020
- 구현 범위: Playwright 기반 컴포넌트 12개 × 테마 2종 = 24개 스냅샷, 컨테이너 이미지로 브라우저·폰트 고정, `--update` 커맨드로만 기준 이미지 갱신, 차이 이미지 아티팩트
- 제외: 문서 사이트 전체 페이지 스냅샷
- 완료 기준(DoD):
  - [x] 비교 대상이 24개 스냅샷이다 (FR-QA-004 AC-1) — 대표 12개 컴포넌트 × 다크·라이트
  - [x] 픽셀 차이 1% 초과 시 CI가 실패하고 차이 이미지를 아티팩트로 남긴다 (FR-QA-004 AC-2, M-1) — Button 36% 차이 픽스처에서 exit 1과 actual/expected/diff 생성
  - [x] 기준 이미지 갱신이 `pnpm test:visual --update`로만 가능하다 (FR-QA-004 AC-3) — 그 외 인자는 exit 2
  - [x] 렌더 환경이 컨테이너 이미지로 고정된다 (FR-QA-004 AC-4, R-2 완화) — Playwright 1.61.1 Noble 이미지를 digest로 고정
  - [x] 동일 커밋 3회 연속 실행에서 flake가 0건이다 (R-2 검증) — 각 25/25 통과, 스냅샷 diff 0건
- 검증 방법: `pnpm test:visual` 3회 반복 실행
- 기록: WP-026 행, FR-QA-004 매핑 갱신, OD-002 종결 근거 기록

## WP-027 Changesets와 npm 배포 워크플로

- 목표: 파괴 변경이 major를 올리고, 배포가 장기 토큰 없이 수행된다.
- 관련 요구사항: FR-DX-005
- 관련 화면/플로우: 없음 (간접 노출: SFC-REL) / —
- 관련 API/데이터/잡: — / — / JOB-REL-001
- 선행 WP: WP-017
- 구현 범위: Changesets 설정, 변경 이력 생성, 공개 API 추출 리포트로 파괴 변경 검출, npm OIDC 배포 워크플로, `pnpm audit --audit-level high` 게이트, 시크릿 스캔, 롤백 절차(dist-tag 승격)
- 제외: 문서 사이트 배포(WP-028)
- 완료 기준(DoD):
  - [x] 공개 API 파괴 변경이 포함된 릴리스가 major를 올린다 (FR-DX-005 AC-1) — `check:api`가 리포트 드리프트에서 exit 1(export 제거 픽스처 실증), major 등록은 `check:changesets`가 마이그레이션 노트와 함께 강제
  - [x] 각 릴리스에 변경 항목과 관련 FR/WP ID가 기재된 변경 이력이 생성된다 (FR-DX-005 AC-2) — `changeset version` 실험에서 CHANGELOG가 본문 `Refs:` 줄 포함, Refs 없는 changeset은 exit 1
  - [x] 변경 이력 항목 없는 패키지는 버전이 오르지 않는다 (FR-DX-005 AC-3) — react-only changeset 실험에서 react 0.1.0, tokens/css 0.0.0 유지
  - [x] 파괴 변경 릴리스에 마이그레이션 노트가 포함된다 (FR-DX-005 AC-4, NFR-004) — major에 `## Migration` 절이 없으면 `check:changesets` exit 1
  - [x] 변경 이력 없이 병합된 변경이 발견되면 릴리스가 중단되고 누락 목록을 출력한다 (FR-DX-005 예외 처리) — version 잡의 `changeset status --since <직전 태그>` + publish 잡의 `--require-empty`. changeset 없는 패키지 변경에서 status exit 1과 누락 목록 실측
  - [x] 배포가 OIDC 기반이며 장기 토큰을 사용하지 않는다 (NFR-002) — inspection: publish 잡만 `id-token: write`, 저장소에 `NPM_TOKEN` 참조 0건. 실 레지스트리 신뢰 게시는 첫 배포에서 확인(원장 §5)
  - [x] `pnpm audit --audit-level high`가 0건이다 (NFR-002) — 실측 exit 0(high 이상 0건, low 1건은 게이트 밖)
  - [x] 롤백 리허설이 10분 이내에 끝난다 (NFR-004) — dist-tag 승격 스크립트 dry-run 9개 명령 1초 미만. 실 레지스트리 리허설은 첫 배포 직후 수행(원장 §5)
- 검증 방법: `pnpm changeset status && pnpm audit --audit-level high` + 드라이런 배포와 롤백 리허설
- 기록: WP-027 행, FR-DX-005 매핑 갱신

## WP-028 문서 사이트 정적 배포

- 목표: 문서 사이트가 정적 호스팅에 배포되고 성능 예산을 지킨다.
- 관련 요구사항: FR-DOC-001, NFR-001, NFR-002
- 관련 화면/플로우: W-001 ~ W-050 / —
- 관련 API/데이터/잡: API-DOC-001 / — / JOB-BUILD-004
- 선행 WP: WP-022, WP-027
- 구현 범위: 정적 빌드 산출, 배포 워크플로, Lighthouse CI 게이트, 배포 롤백 절차
- 제외: 서버 사이드 로직, 인증 (제품에 존재하지 않음)
- 완료 기준(DoD):
  - [ ] 정적 빌드 산출물이 서버 런타임 없이 동작한다 (FR-DOC-001 AC-3)
  - [ ] 배포된 사이트가 외부 도메인 네트워크 요청을 0건 발생시킨다 (FR-DOC-001 AC-4, NFR-002)
  - [ ] 문서 사이트 LCP p75가 2.5초 이하다 (NFR-001)
  - [ ] 배포 롤백이 10분 이내에 끝난다 (NFR-004)
  - [ ] `conductor_screen_qa_checklist.md`의 릴리스 게이트 체크리스트가 전부 닫힌다
- 검증 방법: `pnpm --filter docs build && pnpm lighthouse` + 배포·롤백 리허설
- 기록: WP-028 행, FR-DOC-001 매핑 갱신
