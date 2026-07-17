# Conductor Design System CI 잡과 릴리스 파이프라인

> 상태: review | 버전: v0.6 | 갱신일: 2026-07-17

## 0. 문서 재해석

Conductor Design System에는 큐, 워커 런타임, dead letter queue, 사용자 대상 실시간 갱신이 없다(`srs_final.md` 4.3 Out of Scope). 이 문서는 표준 아키텍처 문서 세트의 `async_events_jobs.md` 자리를 차지하지만, 여기서 "비동기 작업"은 **CI 파이프라인의 잡(Job)**을 의미하고 "이벤트"는 빌드 워처와 문서 사이트 내부 DOM에 한정된다. 대상은 4개 빌드 잡(JOB-BUILD-001~004), 4개 CI 검사 잡(JOB-CI-001~004), 1개 릴리스 잡(JOB-REL-001), 그리고 2개 이벤트(EVT-BUILD-001, EVT-THM-001)다.

## 1. 목적

각 Job의 트리거, 입력, 출력, 병렬 가능 여부, 선행 잡, 재시도 정책, 실패 시 동작, 타임아웃, 아티팩트를 정의하고, CI 파이프라인 전체 DAG, 시각 회귀 검사의 결정론 확보 방법과 OD-002 조건부 실행, 릴리스 잡의 OIDC 인증과 롤백 절차를 명세한다.

## 2. Job 카탈로그

| Job ID | 작업 | 트리거 | 병렬 가능 | 선행 Job | 재시도 | 타임아웃 |
| --- | --- | --- | --- | --- | --- | --- |
| JOB-BUILD-001 | 토큰 빌드 | `pnpm build` 호출 또는 `packages/tokens/src/**` 변경 | 아니오(최초 단계) | 없음 | 0회 | 60초 |
| JOB-BUILD-002 | CSS 빌드 | JOB-BUILD-001 성공 | 아니오 | JOB-BUILD-001 | 0회 | 60초 |
| JOB-BUILD-003 | React 빌드 | JOB-BUILD-002 성공 | 아니오 | JOB-BUILD-001, JOB-BUILD-002 | 0회 | 90초 |
| JOB-BUILD-004 | 문서 정적 빌드 | JOB-BUILD-003 성공 | 아니오 | JOB-BUILD-001~003 | 0회 | 120초 |
| JOB-CI-001 | 대비 검사 | JOB-BUILD-001 성공 | 예(그룹 A) | JOB-BUILD-001 | 0회 | 30초 |
| JOB-CI-002 | 접근성 검사(axe) | JOB-BUILD-002, JOB-BUILD-003 성공 | 예(그룹 A) | JOB-BUILD-002, JOB-BUILD-003 | 인프라 오류 한정 1회 | 5분 |
| JOB-CI-003 | 시각 회귀 | JOB-BUILD-002~004 성공, `VISUAL_REGRESSION_ENABLED=true`일 때만 | 예(그룹 A) | JOB-BUILD-002, JOB-BUILD-003, JOB-BUILD-004 | 0회 | 3분 |
| JOB-CI-004 | 번들 크기 검사 | JOB-BUILD-002, JOB-BUILD-003 성공 | 예(그룹 A) | JOB-BUILD-002, JOB-BUILD-003 | 0회 | 60초 |
| JOB-REL-001 | npm 배포 | `main` 병합 + 변경 이력 존재 + 수동 승인 | 아니오 | JOB-BUILD-001~004, JOB-CI-001, JOB-CI-002, JOB-CI-004(JOB-CI-003은 활성화 시에만) | 0회 | 5분 |

### 2.1 JOB-BUILD-001 토큰 빌드

| 항목 | 내용 |
| --- | --- |
| 입력 | `packages/tokens/src/**`(primitive, semantic, component, `contrast-pairs.ts`) |
| 출력 | `packages/tokens/dist/tokens.css`, `tokens.js`, `tokens.d.ts`, `tokens.json`, `breakpoints.js`, `breakpoints.d.ts` |
| 실패 시 동작 | 종료 코드 1(또는 2) 반환, `dist/`에 부분 산출물을 쓰지 않음. 후속 JOB-BUILD-002~004는 실행되지 않는다 |
| 아티팩트 | `packages/tokens/dist/**` 전체(CI 아티팩트로 업로드, 후속 Job이 다운로드) |

### 2.2 JOB-BUILD-002 CSS 빌드

| 항목 | 내용 |
| --- | --- |
| 입력 | `packages/css/src/**` + JOB-BUILD-001 아티팩트(`tokens.css`, `breakpoints.js`) |
| 출력 | `packages/css/dist/index.css`, `component.css` |
| 실패 시 동작 | 종료 코드 1 반환. 후속 JOB-BUILD-003, JOB-BUILD-004는 실행되지 않음. JOB-CI-001은 JOB-BUILD-001에만 의존하므로 계속 진행 가능 |
| 아티팩트 | `packages/css/dist/**` |

### 2.3 JOB-BUILD-003 React 빌드

| 항목 | 내용 |
| --- | --- |
| 입력 | `packages/react/src/**` + JOB-BUILD-001, JOB-BUILD-002 아티팩트 |
| 출력 | `packages/react/dist/index.js`, `index.d.ts` |
| 실패 시 동작 | 종료 코드 1 반환. 후속 JOB-BUILD-004 및 JOB-CI-002, JOB-CI-004는 실행되지 않음 |
| 아티팩트 | `packages/react/dist/**` |

### 2.4 JOB-BUILD-004 문서 정적 빌드

| 항목 | 내용 |
| --- | --- |
| 입력 | `packages/docs/src/**` + JOB-BUILD-001~003 아티팩트(패키지로서 설치) |
| 출력 | `packages/docs/dist/**`(정적 사이트) |
| 실패 시 동작 | 종료 코드 1 반환. JOB-CI-003(활성화 시)은 실행되지 않음. JOB-REL-001은 차단됨 |
| 아티팩트 | `packages/docs/dist/**` |

### 2.5 JOB-CI-001 대비 검사

| 항목 | 내용 |
| --- | --- |
| Worker | `checkContrast` CLI(API-TOK-003) |
| 입력 | `tokens.json`(JOB-BUILD-001 아티팩트), `contrast-pairs.ts` |
| 출력 | `contrast-report.json` |
| 실패 시 동작 | 미달 쌍 1건 이상이면 종료 코드 1, PR 머지 차단. 위반 쌍 이름·테마·측정값·기준값을 CI 로그에 출력 |
| 아티팩트 | `contrast-report.json` |

### 2.6 JOB-CI-002 접근성 검사(axe)

| 항목 | 내용 |
| --- | --- |
| Worker | axe-core + 헤드리스 브라우저(Playwright) |
| 입력 | `ComponentMeta[]`(JOB-BUILD-003), 각 컴포넌트 × 주요 상태(기본/disabled/오류/열림) × 테마 2종. 렌더 후 유한 진입 animation이 끝난 안정 상태에서 감사하며 무한 상태 표시는 대기에서 제외 |
| 출력 | `axe-report.json` |
| 재시도 | 브라우저 초기화 실패 등 인프라성 오류에 한해 1회 자동 재시도. axe 규칙 위반(assertion 실패)은 재시도하지 않는다 |
| 실패 시 동작 | serious 또는 critical 위반 1건 이상이면 종료 코드 1. 허용 목록(규칙 ID + 사유, 접근성 검토자 승인 필요)에 없는 위반만 실패로 집계 |
| 아티팩트 | `axe-report.json`, 위반 컴포넌트 스크린샷 |

### 2.7 JOB-CI-003 시각 회귀

| 항목 | 내용 |
| --- | --- |
| 조건부 실행 | `VISUAL_REGRESSION_ENABLED` 플래그가 `true`일 때만 파이프라인에 포함(OD-002, 5절 참조) |
| Worker | 헤드리스 브라우저 스크린샷 + 픽셀 비교(pixelmatch류) |
| 입력 | 기준 컴포넌트 12개 × 테마 2종 = 24개 스냅샷 대상, 커밋된 기준 이미지 |
| 출력 | diff 리포트, diff 이미지 24장(차이 발생분만) |
| 재시도 | 0회. 재시도는 렌더 비결정성을 은폐할 수 있으므로 금지 |
| 실패 시 동작 | 픽셀 차이 1%(M-1) 초과 시 종료 코드 1, diff 이미지를 아티팩트로 남김 |
| 아티팩트 | 24개 스냅샷 + diff 이미지 |

### 2.8 JOB-CI-004 번들 크기 검사

| 항목 | 내용 |
| --- | --- |
| Worker | 번들 분석 스크립트(size-limit류) |
| 입력 | JOB-BUILD-002, JOB-BUILD-003 아티팩트 |
| 출력 | `size-report.json` |
| 실패 시 동작 | `Button` 단독 import gzip이 4KB 초과(React 제외, M-7) 또는 `@conductor-by-89soone/css` 전체 gzip이 20KB 초과(NFR-001)면 종료 코드 1, 초과 모듈 목록 출력(FR-DX-003 예외 처리) |
| 아티팩트 | `size-report.json` |

### 2.9 JOB-REL-001 npm 배포

| 항목 | 내용 |
| --- | --- |
| Worker | 릴리스 워크플로(GitHub Actions) |
| 입력 | 변경 이력(changeset) 파일, JOB-BUILD-001~004 아티팩트, OIDC 토큰. Changeset frontmatter 검사는 LF/CRLF/CR을 동일하게 해석 |
| 출력 | npm 레지스트리 배포, `CHANGELOG` 갱신, git 태그 |
| 재시도 | 0회 자동 재시도. 실패 시 수동 재트리거만 허용(배포 원자성 보호) |
| 실패 시 동작 | 배포 중단. 부분 배포된 패키지가 있으면 해당 패키지만 `npm deprecate`로 표시하고 나머지는 배포하지 않는다 |
| 아티팩트 | npm 배포 로그, `CHANGELOG` diff |

상세는 6절을 참조한다.

## 3. CI 파이프라인 DAG

```text
JOB-BUILD-001 (tokens)
   │
   ├──> JOB-CI-001 (contrast)                              ─┐
   │                                                          │ 병렬 그룹 A
   └──> JOB-BUILD-002 (css)                                  │
           │                                                  │
           ├──> JOB-CI-004 (bundle size, css 측정 포함)  ─────┤
           │                                                  │
           └──> JOB-BUILD-003 (react)                         │
                   │                                          │
                   ├──> JOB-CI-002 (axe)                 ─────┤
                   ├──> JOB-CI-004 (bundle size, react 측정 포함)
                   │
                   └──> JOB-BUILD-004 (docs static)
                           │
                           └──> JOB-CI-003 (visual regression, OD-002 조건부) ─┘

[JOB-CI-001 ∧ JOB-CI-002 ∧ JOB-CI-004 모두 성공] ∧ [JOB-CI-003 성공 ∨ 비활성화]
   │
   └──> main 병합 + 수동 승인 ──> JOB-REL-001 (npm 배포)
```

병렬 그룹 A(JOB-CI-001, JOB-CI-002, JOB-CI-004, 활성화 시 JOB-CI-003)는 각자의 선행 Job만 완료되면 서로 독립적으로 동시 실행된다. CI 전체 소요 시간은 10분 이하를 목표로 한다(NFR-004).

## 4. Event 카탈로그

| Event ID | 이름 | Producer | Consumer | Ordering/Dedupe |
| --- | --- | --- | --- | --- |
| EVT-BUILD-001 | `tokens.built` | JOB-BUILD-001(`buildTokens` CLI) | 로컬 `--watch` 모드 파일 워처, CI 오케스트레이터 | 실행당 1회. `--watch` 모드에서는 동일 소스 해시에 대해 200ms debounce로 중복 억제 |
| EVT-THM-001 | `theme.changed` | 문서 사이트 테마 토글 컴포넌트(FR-DOC-005) | 문서 사이트 내부의 테마 종속 비-CSS 렌더링 로직(코드 하이라이터 등) | 토글 조작마다 1회. 최신 값만 유효하며 이전 이벤트를 취소하지 않고 순서대로 소비 |

### EVT-BUILD-001 `tokens.built`

```ts
interface TokensBuiltEvent {
  tokenCount: number;
  cssPath: string;
  jsPath: string;
  jsonPath: string;
  durationMs: number;
}
```

CLI 프로세스 내부 이벤트이며 네트워크로 전파되지 않는다. 로컬 `--watch` 모드에서는 이 이벤트 발생을 트리거로 CSS 빌드 워처가 재빌드를 시작한다(`conductor_backend_architecture.md` 9절). CI에서는 프로세스 종료 코드가 이 이벤트를 대체하며 별도 이벤트 버스가 없다.

### EVT-THM-001 `theme.changed`

```ts
document.dispatchEvent(
  new CustomEvent<{ theme: "dark" | "light" }>("theme.changed", {
    detail: { theme: nextTheme },
  }),
);
```

브라우저 런타임 DOM 이벤트이며 문서 사이트 페이지 내부에서만 발생·소비된다. npm 패키지의 공개 API가 아니다.

## 5. 시각 회귀 검사(JOB-CI-003)의 결정론 확보와 OD-002

**결정론 확보 방법.**

1. 브라우저 버전과 폰트를 컨테이너 이미지에 고정한다(Dockerfile에 정확한 버전 pin, NFR-005 브라우저 매트릭스와 별개로 시각 회귀 전용 이미지는 단일 버전만 사용).
2. 뷰포트 크기를 고정한다(예: 1280×800, 컴포넌트별 추가 크롭 영역은 스냅샷 설정에 명시).
3. `prefers-reduced-motion: reduce`를 강제해 애니메이션·전환을 제거한다(FR-CSS-005).
4. 서브픽셀 안티앨리어싱을 비활성화하는 렌더 플래그를 사용해 폰트 렌더링 차이를 줄인다.
5. 토큰 기반 정적 렌더이므로 시스템 시간이나 난수 시드에 의존하는 컴포넌트 상태가 없음을 전제로 한다. 이 전제가 깨지는 컴포넌트(예: 상대 시간 표시)가 추가되면 시각 회귀 대상에서 제외하거나 고정 시각을 주입한다.

**OD-002 조건부 실행.** `VISUAL_REGRESSION_ENABLED` 플래그로 CI 파이프라인 전체에서 JOB-CI-003을 켜고 끈다.

- REL-003 착수 시점에 위 결정론 확보 조치를 적용한 상태에서 CI 러너의 렌더가 재현 가능하면(폰트 렌더 diff가 안정적이면) 플래그를 `true`로 설정하고 JOB-CI-003을 릴리스 게이트에 포함한다.
- 폰트 렌더 차이로 diff가 안정되지 않으면 FR-QA-004의 상태를 `deferred`로 표시하고 REL-004로 이월한다. 플래그는 `false`로 유지하며, v1은 수동 시각 확인으로 대체한다(JOB-CI-003은 CI에서 실행되지 않고, JOB-REL-001의 선행 조건에서도 제외된다).

## 6. 릴리스(JOB-REL-001)

**OIDC 인증.** npm trusted publishing(OIDC)을 사용한다. GitHub Actions 워크플로가 발급한 OIDC 토큰을 npm 레지스트리가 검증하며, 장기 `NPM_TOKEN` 시크릿을 저장소에 보관하지 않는다(NFR-002). 워크플로 권한은 `id-token: write`로 한정한다.

**배포 절차.**

1. `main` 브랜치에 변경 이력(changeset) 파일이 포함된 커밋이 병합된다.
2. 릴리스 워크플로가 JOB-BUILD-001~004와 JOB-CI-001, JOB-CI-002, JOB-CI-004(및 활성화된 경우 JOB-CI-003)의 성공을 확인한다.
3. version PR이 변경 이력을 집계해 각 패키지의 semver 버전과 `CHANGELOG` 항목을 결정한다(`conductor_api_contracts.md` 6절). 변경 이력이 없는 패키지는 버전을 올리지 않는다(FR-DX-005 AC-3).
4. version PR 병합이라는 수동 승인 게이트를 통과하면 OIDC 토큰으로 npm에 배포하고 annotated git 태그를 생성·push한다. 태그는 로컬 생성과 원격 object 일치를 각각 검증한다(CR-025).
5. 변경 이력 없이 병합된 변경이 발견되면 릴리스를 중단하고 누락된 변경 목록을 출력한다(FR-DX-005 예외 처리).

**롤백(NFR-004, 10분 이내).**

1. 문제 버전을 확인한다.
2. 문제 버전을 deprecate 표시한다: `npm deprecate @conductor-by-89soone/react@<문제버전> "<롤백 사유>"`(패키지별 반복).
3. 소비자 쪽에서 의존 패키지 쪽으로 `react → css → tokens` 순서로 이전 정상 버전을 `latest` dist-tag에 재승격한다: `npm dist-tag add @conductor-by-89soone/react@<이전버전> latest`(패키지별 반복).
4. 배포 로그에 롤백 사유와 재승격된 버전을 기록한다.

이 절차는 새 버전을 레지스트리에서 삭제하지 않고 dist-tag 재승격과 deprecate만으로 수행되므로, 이미 그 버전을 고정 설치한 소비자에게 영향을 주지 않으면서 신규 설치를 이전 버전으로 되돌린다.
