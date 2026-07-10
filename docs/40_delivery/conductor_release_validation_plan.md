# Conductor Design System 릴리스 검증 계획

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 목적과 범위

이 문서는 `srs_final.md` §9에 승인된 FR 49개(FR-TOK-001~009, FR-THM-001~005, FR-CSS-001~005, FR-CMP-001~009, FR-DOC-001~007, FR-A11Y-001~005, FR-DX-001~005, FR-QA-001~004)와 §12 NFR-001~005를 검증 가능한 게이트로 변환한다. 이 문서는 새로운 요구사항을 추가하지 않는다.

Conductor Design System은 `@conductor/tokens`, `@conductor/css`, `@conductor/react` 3개 npm 패키지와 1개 정적 문서 사이트로 구성된다. 서버 런타임, 데이터베이스, 인증 서버가 존재하지 않는다. 따라서 검증 대상은 빌드 산출물, 패키지 공개 계약, 문서 사이트 정적 빌드, 릴리스 파이프라인(npm publish + 정적 사이트 배포)으로 한정된다.

## 2. 검증 계층

| 계층 | 대상 FR/NFR | 실행 명령 | 통과 기준 | 실행 시점 | 담당 |
| --- | --- | --- | --- | --- | --- |
| 단위 (Vitest + Testing Library) | FR-CMP-001~009, FR-DX-004, FR-QA-002 | `pnpm test` | 공개 진입점에 export된 컴포넌트 전수에 테스트 파일이 존재한다. FR-CMP-001 공유 계약 스위트(ref 전달, className 병합, data-*/aria-* 통과, 네이티브 props 확장)가 전 컴포넌트에서 통과한다. 종료 코드 0 | local, PR | Coding Agent |
| 계약 (토큰 키 대칭, 공개 API 추출) | FR-TOK-001~009, FR-THM-001~002, FR-QA-001, FR-DX-002, FR-DX-003 | `pnpm lint:tokens`, `pnpm build`, `pnpm test`, `pnpm api:report` | 색상/px/z-index 리터럴 0건, primitive→semantic→component 역참조 0건, 순환 참조 0건, 다크·라이트 semantic 토큰 키 집합의 대칭 차집합 0개, 산출된 `.d.ts`의 `any` 0건 | PR | Coding Agent |
| 통합 (빌드 파이프라인 end-to-end) | FR-DX-001, FR-TOK-003, JOB-BUILD-001~004 | `pnpm install && pnpm build` | `tokens → css → react → docs` 순서로 완주하고 각 단계가 선행 패키지의 산출물을 소비한다(소스 상대경로 참조 0건). 역방향 의존 발견 시 종료 코드 1. 전체 소요 3분 이하(4코어) | PR, main | Coding Agent |
| e2e (문서 사이트 Playwright) | FR-DOC-001~007, FR-THM-003 | `pnpm test:e2e` | 문서 사이트가 `@conductor/react`·`@conductor/css`를 소비자로 설치해 사용한다(소스 상대경로 import 0건). Foundations 5개 화면 값이 `tokens.json`에서 생성되고 하드코딩 토큰 값이 0건이다. 공개 컴포넌트 중 카탈로그 화면이 없는 항목이 0건이다. 테마 토글 후 새로고침해도 선택이 유지된다 | PR, main | Coding Agent |
| 접근성 (axe-core, 수동 키보드) | FR-A11Y-001~005, FR-QA-003, JOB-CI-002 | `pnpm test:a11y` + 수동 키보드 점검(Tab 순서, Escape 이탈 경로, 포커스 복귀) | axe-core serious 이상 위반 0건(공개 컴포넌트 전수 × 테마 2종). 포커스 링이 두 테마 모두에서 배경 대비 3:1 이상이다. 키보드로 도달 가능한 대화형 요소 비율 100% | PR, main | Accessibility Reviewer |
| 성능 (번들 크기, Lighthouse CI) | NFR-001, FR-DX-003 AC-3, JOB-CI-004 | `pnpm size` + Lighthouse CI | `Button` 단독 import gzip 4KB 이하(React 제외). `@conductor/css` 전체 gzip 20KB 이하. 문서 사이트 LCP p75 2.5초 이하(로컬 프로덕션 빌드, Fast 3G 스로틀). 테마 전환 후 재페인트 완료 100ms 이하 | PR(번들 크기), release(Lighthouse) | System Maintainer |
| 시각 회귀 | FR-QA-004, JOB-CI-003 | `pnpm test:visual` (`--update`는 기준 이미지 갱신 전용 명령으로만 허용) | 기준 컴포넌트 12개 × 테마 2종 = 24개 스냅샷을 비교하고 픽셀 차이 1% 초과 시 실패, 차이 이미지를 아티팩트로 남긴다 | PR (OD-002가 v1 포함을 확정한 경우에만 실행) | QA |
| 보안 (pnpm audit, 시크릿 스캔) | NFR-002 | `pnpm audit --audit-level high` + 시크릿 스캐너 CI 잡 | 의존성 취약점 severity high 이상 0건. 산출물에 포함된 비밀값 0건. npm 배포 인증이 OIDC 기반이며 장기 토큰을 사용하지 않는다 | 시크릿 스캔: PR. audit·OIDC 검사: release | System Maintainer |
| 호환성 (React 18·19, Node 20·22 매트릭스) | NFR-005 | CI 매트릭스 실행 (React 18/19 × Node 20/22) | 매트릭스 전 조합에서 `pnpm test`와 `pnpm build`가 통과한다 | main | Coding Agent |
| 운영 (릴리스 리허설, 롤백 리허설) | NFR-004, JOB-REL-001 | §4 롤아웃 절차 리허설 + §5 롤백 절차 리허설 | 릴리스 리허설이 실행 순서대로 완주한다. 롤백 리허설이 10분 이내에 완료된다. 순환 패키지 의존 0건. 파괴 변경 릴리스의 마이그레이션 노트 동반률 100% | release | System Maintainer |

## 3. REL 게이트 체크리스트

각 REL의 게이트는 그 슬라이스에서 실제로 검증 가능한 항목만 포함한다. 선행 REL의 게이트를 다시 나열하지 않는다.

### REL-001 토큰 기반과 빌드 파이프라인

- [ ] `pnpm lint:tokens` 위반 0건(FR-TOK-001)
- [ ] primitive→semantic→component 참조 방향 검사 통과, 역방향 참조 발견 시 종료 코드 1(FR-TOK-002)
- [ ] 순환 참조·미해결 참조 검사 통과, 순환 경로가 `a → b → c → a` 형태로 출력됨을 확인(FR-TOK-003)
- [ ] `tokens.css`의 모든 커스텀 프로퍼티가 `--cdt-` 접두사를 가짐(FR-TOK-004)
- [ ] 상태 7종·심각도 4종·미터 3종 = 14개 키가 다크·라이트 두 테마에 모두 존재(FR-TOK-005)
- [ ] `@conductor/tokens`의 `.d.ts`에 `any` 타입 0건(FR-TOK-006 AC-4)
- [ ] `font.size` 7단계 존재, `packages/css`·`packages/react`에 `font-size` px 리터럴 0건(FR-TOK-007)
- [ ] `z` 6단계 존재, `z-index` 숫자 리터럴 0건(FR-TOK-008)
- [ ] `breakpoint` 3단계 존재, 산출 CSS의 `@media` 조건에 리터럴 px 사용 확인(FR-TOK-009)
- [ ] `pnpm install && pnpm build`가 tokens 단계까지 3분 이내에 완주(NFR-001, FR-DX-001 AC-3)
- [ ] OD-001이 해소되어 있음을 확인한다. 해소되지 않은 상태에서는 이 게이트를 개시하지 않는다(§8 참조)

### REL-002 스타일 레이어·라이트 테마·컴포넌트 라이브러리

- [ ] 다크 팔레트가 `agent-ai-platform`의 `tokens.css` 값과 1:1로 재현되고, 별칭 2개가 토큰 참조로 표현됨(FR-THM-001)
- [ ] 다크·라이트 semantic 토큰 키 집합의 대칭 차집합 0개(FR-THM-002 AC-1, NFR-003)
- [ ] `data-cdt-theme` 우선순위 규칙(속성 우선, 없으면 `prefers-color-scheme`, 값 이상 시 다크) 동작 확인(FR-THM-003)
- [ ] `pnpm check:contrast` 미달 쌍 0건, 본문 4.5:1·대형/비텍스트 3:1(FR-THM-004, NFR-003)
- [ ] FR-THM-005 교정 값 적용 확인: `focusRing`이 `surface.base` 위 3.93·`surface.raised` 위 3.56, 신규 `border.control`이 `surface.raised` 위 3.23(FR-THM-005 AC-1, AC-2)
- [ ] `text.faint`를 `surface.elevated` 위에 쓴 코드가 `pnpm lint:tokens`를 실패시킴(FR-THM-005 AC-3)
- [ ] `border.subtle`/`default`/`strong`이 `decorative`로 분류됨(FR-THM-005 AC-4)
- [ ] `status.queued`가 `nonText`로 분류되고 통과(FR-THM-005 AC-5), `status.neutralEnd`가 `decorative`로 분류되어 검사 대상에서 제외되고 사유가 `--report`에 출력됨(FR-THM-005 AC-6, CR-006)
- [ ] 산출물의 모든 규칙이 `cdt.reset/base/layout/component/utility` 5개 레이어 중 하나에 속하고 `!important` 0건(FR-CSS-001)
- [ ] 리셋·포커스 표시·원격 폰트 참조 0건 확인(FR-CSS-002)
- [ ] 레이아웃 프리미티브 클래스(`cdt-app-shell` 등) 존재, 색상 속성 선언 0건(FR-CSS-003)
- [ ] 모든 클래스 셀렉터가 `cdt-` 접두사, 구조 셀렉터(`>`, `+`, `:nth-child`) 의존 0건(FR-CSS-004)
- [ ] `prefers-reduced-motion: reduce`에서 전환·애니메이션 지속 시간 계산값 0s(FR-CSS-005)
- [ ] 8개 컴포넌트군(액션·표면·상태표시·데이터표시·오버레이·폼·피드백, 셸은 OD-004 조건부) 각각의 AC 전수 통과(FR-CMP-002~008)
- [ ] `pnpm test` 종료 코드 0(FR-QA-002)

### REL-003 문서 사이트·접근성 검사

- [ ] 문서 사이트가 소스 상대경로 import 0건으로 `@conductor/react`·`@conductor/css`를 소비(FR-DOC-001)
- [ ] Foundations 5개 화면이 `tokens.json`에서 생성되고 하드코딩 값 0건(FR-DOC-002)
- [ ] 컴포넌트 카탈로그가 실제 DOM 렌더 프리뷰를 제공하고, export되었으나 화면이 없는 컴포넌트 0건(FR-DOC-003)
- [ ] 토큰 참조 화면이 대비율 수치와 판정을 표시(FR-DOC-004)
- [ ] 테마 토글이 새로고침 후 유지되고 최초 페인트 깜빡임이 없음(FR-DOC-005)
- [ ] 문서 사이트 LCP p75 2.5초 이하(NFR-001)
- [ ] `pnpm test:a11y`에서 axe-core serious 이상 위반 0건, 다크·라이트 두 테마 모두 검사(FR-QA-003, FR-A11Y-005)
- [ ] 포커스 링이 두 테마 모두에서 배경 대비 3:1 이상(FR-A11Y-001)
- [ ] 컴포넌트 전수에 대한 키보드 경로 테스트 통과(FR-A11Y-002)
- [ ] 그레이스케일 렌더 스냅샷에서 상태 7종·심각도 4종 구분이 유지됨(FR-A11Y-003)
- [ ] OD-002 결정에 따라 시각 회귀 검사 포함 여부를 이 시점에 확정한다. 이 결정 없이 REL-004에 진입하지 않는다(§8 참조)
- [ ] OD-004 결정에 따라 셸 컴포넌트군의 패키지 포함 여부를 이 시점에 확정한다

### REL-004 릴리스 자동화·시각 회귀

- [ ] 릴리스 실행 시 semver 버전 부여 및 변경 이력 생성, 파괴 변경 릴리스에 마이그레이션 노트 포함(FR-DX-005)
- [ ] OD-002가 v1 포함을 확정한 경우: `pnpm test:visual`에서 12개 컴포넌트 × 2테마 = 24 스냅샷 비교, 픽셀 차이 1% 이하(FR-QA-004)
- [ ] OD-002가 이월을 확정한 경우: FR-QA-004 상태가 `deferred`로 표시되어 있고 이 게이트는 생략됨을 원장에 기록
- [ ] `Button` 단독 gzip 4KB 이하, `@conductor/css` gzip 20KB 이하(NFR-001, JOB-CI-004)
- [ ] `pnpm audit --audit-level high` 취약점 0건(NFR-002)
- [ ] npm 배포 인증이 OIDC 기반이며 장기 토큰을 사용하지 않음(NFR-002, JOB-REL-001)
- [ ] 롤백 리허설이 10분 이내에 완료된 기록 존재(NFR-004)

## 4. 롤아웃 절차

1. `pnpm build`로 `tokens → css → react → docs` 순서로 산출물을 생성하고 §2 통합 계층 게이트를 통과시킨다.
2. `@conductor/tokens`, `@conductor/css`, `@conductor/react`를 이 순서로 `npm publish --tag next --access public`으로 발행한다.
3. `next` 태그 버전을 별도 소비자 프로젝트에 설치해 스모크 테스트를 실행한다(SCN-001 기본 흐름 재현: 설치 → `@conductor/css` import → `data-cdt-theme` 지정 → `Button` 렌더).
4. 스모크 테스트 통과 시 `npm dist-tag add @conductor/tokens@<버전> latest`, 이어서 `@conductor/css`, `@conductor/react` 순서로 `latest` 태그를 승격한다.
5. 문서 사이트 정적 빌드 산출물을 정적 호스팅 대상에 배포한다. 배포 산출물이 `latest`로 승격된 패키지 버전을 참조하는지 확인한다.
6. `FR-DX-005`에 따라 생성된 변경 이력에 릴리스 버전과 관련 FR/WP ID가 기재되어 있는지 확인한다.

## 5. 롤백 절차

목표 소요 시간은 10분 이내다(NFR-004, 5.3 보안/운영 제약 3). 절차:

1. 문제가 발견된 패키지에 `npm deprecate @conductor/<패키지>@<버전> "<사유>"`를 실행한다.
2. 의존 방향(`tokens → css → react`)의 역순인 `react → css → tokens` 순서로, 영향을 받은 패키지에 한해 `npm dist-tag add @conductor/<패키지>@<이전 버전> latest`를 실행해 직전 안정 버전으로 `latest` 태그를 되돌린다.
3. 문서 사이트를 직전 정적 빌드 아티팩트로 재배포한다.
4. 롤백된 버전에 대해 §4 3단계의 스모크 테스트를 재실행해 SCN-001 기본 흐름이 정상 동작함을 확인한다.
5. 1단계 시작부터 4단계 완료까지 소요 시간을 기록하고 10분을 초과하면 System Maintainer가 원인을 조사한다.
6. 롤백 사유와 후속 조치를 CR로 등록한다(`change_control.md`).

## 6. 모니터링 신호

- 빌드 성공률: JOB-BUILD-001~004 각 CI 실행의 성공/실패 비율을 주 단위로 집계한다. 하락 추세가 관찰되면 System Maintainer가 원인을 조사한다.
- CI 소요 시간: 전체 CI 파이프라인 소요 시간을 매 실행마다 기록하고 NFR-004의 10분 기준과 비교한다. 기준 초과가 3회 연속 발생하면 System Maintainer가 잡 병렬화 여부를 검토한다.
- 시각 회귀 flake 비율: 동일 커밋에 대해 `pnpm test:visual`을 2회 이상 재실행했을 때 결과가 달라지는 비율을 기록한다. flake가 관찰되면 QA에 보고하고 OD-002 재검토 근거로 사용한다.

## 7. 승인(Signoff) 표

| 게이트 | 담당 역할 | 승인 기준 |
| --- | --- | --- |
| 요구사항·범위 검증 | Product | 해당 REL 슬라이스가 승인된 FR·NFR 범위를 벗어나지 않음을 확인 |
| 토큰·빌드 계약 게이트 | System Maintainer | §2 계약·통합 계층 통과, `pnpm build` 3분 이하 |
| 컴포넌트 구현 게이트 | Coding Agent | §2 단위 계층 통과, 해당 WP의 DoD 누적 결과 확인 |
| 접근성 게이트 | Accessibility Reviewer | §2 접근성 계층 통과, OD-001 해소 확인 |
| 시각 회귀·성능 게이트 | QA | §2 성능 계층 통과, §8 조건에 따른 시각 회귀 처리 확인 |
| 보안·운영 게이트 | System Maintainer | §2 보안·운영 계층 통과, 롤백 리허설 완료 기록 확인 |

## 8. 조건부 게이트

| 조건 | 대상 게이트/잡 | 조건이 해소되지 않은 경우 | 조건이 해소된 경우 | 담당 |
| --- | --- | --- | --- | --- |
| OD-001 (2026-07-10 종결, CR-005) | REL-001, FR-THM-004, FR-THM-005, FR-A11Y-004 | 차단 해제. "최소 수정" 정책이 확정되어 `contrast-pairs.ts`의 명세가 `srs_final.md` §12.1로 존재한다 | 없음. REL-001 착수 가능 | Accessibility Reviewer |
| OD-002 (2026-07-10 종결, CR-005) | FR-QA-004, WP-026 | 시각 회귀는 v1 릴리스 게이트가 아니다. `JOB-CI-003`은 REL-004에서만 실행된다 | REL-001~REL-003의 릴리스 게이트에서 시각 회귀 항목을 제외하고 수동 시각 확인으로 대체한다 | QA |
| OD-003 (open, 비차단) | 없음 (F-CMP-010에 FR 미부여) | 릴리스 게이트에 영향 없음 | REL-003 종료 시점에 Product가 결정한다 | Product |
| OD-004 (2026-07-10 종결, CR-005) | FR-CMP-009, WP-023 | 셸 컴포넌트군이 `@conductor/react`에 포함된다. REL-003 릴리스 게이트에 셸 검증 항목이 포함된다 | 없음. WP-023 실행 | System Maintainer |
| OD-002: 시각 회귀 검사의 v1 포함 여부 | JOB-CI-003, FR-QA-004(Should) | REL-003 착수 시점까지 CI 러너에서 렌더가 결정론적으로 재현됨을 확인하지 못하면 JOB-CI-003을 REL-004로 이월하고 FR-QA-004 상태를 `deferred`로 표시한다. v1은 수동 시각 확인으로 대체한다 | 렌더가 결정론적으로 재현되면 REL-003 게이트에 JOB-CI-003을 포함하고 §3 REL-004 체크리스트의 시각 회귀 항목을 실행한다 | QA |
