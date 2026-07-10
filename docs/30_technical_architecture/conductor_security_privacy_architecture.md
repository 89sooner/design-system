# Conductor Design System 보안 및 개인정보 아키텍처

> 상태: review | 버전: v0.2 | 갱신일: 2026-07-10

## 1. 범위 재정의: 이 제품은 공급망 보안 문제다

Conductor Design System은 서버 런타임, 데이터베이스, 사용자 계정, 인증 시스템을 갖지 않는다. 이 제품이 배포하는 산출물은 3개 npm 패키지(`@conductor/tokens`, `@conductor/css`, `@conductor/react`)와 1개 정적 문서 사이트뿐이다(`../10_requirements/srs_final.md` 4.3 Out of Scope, 5.3 보안/운영 제약). 따라서 이 문서가 다루는 보안 문제는 애플리케이션 보안(세션, CSRF, 인가)이 아니라 **공급망 보안**이다: 코드가 저장소에서 npm 레지스트리를 거쳐 소비자 애플리케이션의 번들에 도달하는 경로 전체의 무결성, 그리고 그 경로에서 소비자에게 전가되는 위험이다.

개인정보: 이 제품은 PII를 수집·저장·전송하지 않는다. 문서 사이트가 브라우저에 남기는 유일한 상태는 `localStorage`의 테마 선택값(`dark` 또는 `light`, FR-DOC-005 AC-2)이며, 이는 식별 정보가 아니다. 텔레메트리, 쿠키, 분석 스크립트를 포함하지 않는다.

## 2. Trust Boundaries (공급망 신뢰 경계)

| 경계 | 신뢰 수준 | 통제 | 관련 요구사항 |
| --- | --- | --- | --- |
| 기여자 워크스테이션 → GitHub 저장소 | untrusted → controlled | 브랜치 보호, 필수 리뷰 | NFR-002 |
| Pull Request → CI 빌드 환경 | untrusted (PR 코드는 신뢰하지 않는다) | 시크릿 미노출 빌드 잡, PR 트리거 워크플로에 릴리스 자격증명 미부여 | NFR-002 |
| CI 릴리스 잡 → npm 레지스트리 | controlled | OIDC 기반 단기 토큰, 빌드 잡과 분리된 별도 권한 | NFR-002, ADR-010 |
| npm 레지스트리 → 소비자 설치(`pnpm add`) | untrusted (소비자 관점) | provenance 검증, semver 범위, lockfile 고정 | NFR-002, FR-DX-005 |
| Conductor 패키지 → 소비자 번들/런타임 | controlled → 소비자에게 위험이 전가된다 | 런타임 네트워크 요청 0건, 원격 폰트 미사용 | NFR-002, FR-CSS-002 |
| 문서 사이트 정적 산출물 → 방문자 브라우저 | controlled → untrusted 방문자 | 외부 네트워크 요청 0건, CSP 헤더 | FR-DOC-001 AC-4 |

## 3. 의존성 신뢰 모델

Conductor의 의존성은 두 종류로 나뉜다.

### 3.1 peer dependency (소비자가 버전을 소유)

| 의존성 | 범위 | 신뢰 근거 | 관련 요구사항 |
| --- | --- | --- | --- |
| React | `^18.0.0 \|\| ^19.0.0` | 소비자가 직접 설치하고 검증한다 | FR-CMP-001, FR-DX-004 |
| Radix UI(개별 프리미티브 패키지) | 정확한 버전 고정, caret 미사용 | Conductor가 버전을 통제하고 DOM 구조 변경을 시각 회귀 검사로 검출한다 | FR-CMP-006, ADR-004, R-3 |
| lucide-react | peer, 소비자가 아이콘 컴포넌트를 props로 주입 | Conductor는 아이콘을 번들하지 않는다 | FR-CMP-004 |

### 3.2 빌드 타임 의존성 (Conductor가 버전을 소유)

빌드 도구 체인(타입 컴파일러, 번들러, 테스트 러너, 린터)은 `pnpm-lock.yaml`에 정확한 버전으로 고정한다(ADR-009 테스트 스택이 도구 선택을 확정한다). CI는 `pnpm install --frozen-lockfile`로 실행해 lockfile과 `package.json`이 어긋나면 설치 단계에서 실패한다. 이 의존성은 산출물에 포함되지 않으므로 소비자 런타임 위험은 아니지만, CI 실행 환경을 오염시킬 수 있는 공급망 경로이므로 3.3의 취약점 게이트 대상에 포함한다.

### 3.3 취약점 게이트

| 지표 | 목표 | 측정 명령 | 실패 시 조치 |
| --- | --- | --- | --- |
| 의존성 취약점(severity high 이상) | 0건 | `pnpm audit --audit-level high` | 릴리스 잡(JOB-REL-001) 차단. `pnpm.overrides`로 전이 의존성을 패치하거나 상위 패키지를 업데이트한다 |
| lockfile과 `package.json` 불일치 | 0건 | `pnpm install --frozen-lockfile` | CI 설치 단계 실패. lockfile을 재생성해 별도 커밋으로 반영한다 |

## 4. 배포 산출물 무결성과 인증

- npm 배포 인증은 OIDC 기반 trusted publishing으로 고정한다(ADR-010). 릴리스 워크플로는 `permissions.id-token: write`를 선언하고, `NPM_TOKEN` 형태의 장기 저장 자격증명을 워크플로 파일이나 저장소 시크릿에 두지 않는다. npm 레지스트리는 GitHub Actions가 발급한 OIDC 클레임(저장소 경로, 워크플로 파일 경로, ref)을 검증해 배포를 승인한다.
- 배포 워크플로는 `npm publish --provenance`로 실행해 각 릴리스 아티팩트에 빌드 출처(소스 커밋, 워크플로 실행 ID)를 증명하는 provenance 첨부 문서를 남긴다. 소비자는 `npm audit signatures`로 이를 검증할 수 있다.
- 공개 진입점은 각 패키지 `package.json`의 `exports` 필드로만 선언한다(FR-DX-003). 선언되지 않은 내부 경로 import는 런타임 해석 오류를 낸다. 이는 소비자가 검증되지 않은 내부 구현에 결합하는 경로를 차단하는 무결성 통제다.
- `@conductor/css`는 `sideEffects: ["*.css"]`, `@conductor/react`는 `sideEffects: false`를 선언한다(FR-DX-003 AC-2, AC-3). 이는 번들러의 트리 셰이킹이 의도하지 않은 코드를 산출물에 남기지 않도록 하는 무결성 경계이기도 하다.

## 5. 시크릿 스캔

| 항목 | 내용 |
| --- | --- |
| 스캔 대상 | 저장소 전체 커밋 이력(신규 push), PR diff |
| 실행 시점 | 모든 push와 PR에서 CI 잡으로 실행한다 |
| 탐지 패턴 | npm 토큰, GitHub 개인 액세스 토큰, 클라우드 자격증명 패턴, 개인키(PEM) 블록 |
| 실패 시 조치 | CI 잡 실패, 병합 차단. 유출된 시크릿은 발급 주체에서 즉시 폐기(revoke)하고, 이력에서 제거하는 것과 별개로 폐기를 유일한 안전 조치로 취급한다 |
| 관련 요구사항 | NFR-002(산출물에 포함된 비밀값 0건) |

Conductor 저장소는 정의상 런타임 시크릿을 갖지 않는다(백엔드가 없다). 이 스캔이 방어하는 대상은 CI/릴리스 자격증명(OIDC 전환으로 최소화됨)과 기여자가 실수로 커밋하는 개인 토큰이다.

## 6. 저장소 접근 권한

이 제품에는 런타임 인증/인가가 없다(`../10_requirements/srs_final.md` 6장). 권한 모델은 저장소 접근 권한과 릴리스 승인 권한으로 구현된다.

| 사용자 유형 | 저장소 권한 | 릴리스 권한 |
| --- | --- | --- |
| 소비자 개발자 | 없음(공개 저장소면 읽기) | 없음 |
| 디자인 시스템 관리자(System Maintainer) | write, 브랜치 보호 규칙 우회 불가 | 릴리스 워크플로 트리거 권한(태그 push) |
| 코딩 에이전트 | 작업 브랜치 write, `main` 직접 push 불가 | 없음(PR만 생성) |
| 접근성 검토자 | PR 리뷰 권한 | 릴리스 게이트 차단 권한(필수 리뷰어 지정) |

- `main` 브랜치는 보호 규칙을 적용한다: 필수 리뷰 1건 이상, 상태 검사(JOB-CI-001~004) 통과 필수, 강제 push 금지.
- 릴리스 잡(JOB-REL-001)은 `main` 브랜치의 태그 push에서만 트리거된다. PR 브랜치에서는 트리거되지 않는다.

## 7. 런타임 네트워크 불변식

NFR-002는 배포 산출물의 런타임 외부 네트워크 요청을 0건으로 규정한다. 이 불변식은 다음 설계로 보장된다.

- `@conductor/css`는 원격 폰트를 로드하지 않는다(FR-CSS-002 AC-4). 폰트는 시스템 스택 또는 소비자가 제공한다.
- `@conductor/react`의 컴포넌트는 외부 API를 호출하지 않는다. 데이터 페칭은 소비자 책임이다(FR-CMP-005 예외/실패 처리, `Table`은 시각 계층만 담당한다).
- 문서 사이트는 정적 파일로 빌드되며(JOB-BUILD-004), 프로덕션 빌드의 네트워크 패널 관찰로 외부 도메인 요청 0건을 검증한다(NFR-002 측정 방법).
- 문서 사이트 배포에는 `Content-Security-Policy: default-src 'self'` 헤더를 정적 호스팅 설정에 적용한다. 이는 SRS가 직접 요구하지 않은 심층 방어 조치이며, 향후 실수로 외부 스크립트가 추가되는 경우에도 브라우저가 이를 차단하게 한다.

## 8. 소비자에게 전가되는 위험과 구현 불변식

Conductor는 소비자 애플리케이션의 DOM에 직접 렌더되므로, Conductor 자체의 구현 결함이 소비자에게 XSS 벡터로 전가될 수 있다. 다음을 구현 불변식으로 고정한다.

| 불변식 | 근거 | 검증 |
| --- | --- | --- |
| `dangerouslySetInnerHTML` 사용 0건 | 모든 텍스트 props(라벨, 설명, 오류 메시지)는 React 텍스트 노드로 렌더되어 자동 이스케이프된다 | 코드 리뷰 |
| `data-*`/`aria-*` 속성 통과가 임의 HTML 주입 경로가 되지 않는다 | React가 속성값을 문자열로 렌더하며, 통과되는 속성은 이름 화이트리스트(`data-*`, `aria-*`)로 제한된다(FR-CMP-001 AC-3) | 공유 계약 테스트 스위트(FR-CMP-001 AC-5) |
| CSS 커스텀 프로퍼티 값에 소비자 입력을 직접 삽입하지 않는다 | `url()` 기반 CSS 인젝션을 차단한다 | 컴포넌트 스타일은 토큰 참조만 사용하고 임의 문자열을 `style` 속성에 주입하지 않는다(FR-TOK-001) |
| Radix UI DOM 구조 변경이 CSS를 깨뜨려도 스크립트 실행 경로는 생기지 않는다 | 구조 셀렉터(`>`, `:nth-child`) 대신 `data-*` 속성 셀렉터만 사용한다(FR-CSS-004 AC-4, R-3) | 시각 회귀 검사(JOB-CI-003), CSS 린트 |

## 9. 위협 모델 / 남용 사례

| Threat ID | 시나리오 | 영향 | 완화 | SRS 명명 여부 |
| --- | --- | --- | --- | --- |
| THR-001 | 공격자가 `@conductor/react`와 유사한 이름(`conductor-react`, `@conductors/react`)으로 악성 패키지를 npm에 게시해 오타 설치를 유도한다(typosquatting) | 소비자 빌드에 임의 코드가 포함된다 | `@conductor` 조직 스코프를 npm에 예약하고, 문서 사이트 Getting Started(W-002)에 정확한 설치 명령을 고정 표기한다. 정식 스코프 외 패키지는 Conductor가 게시·지원하지 않음을 문서에 명시한다 | SRS 미명명 — 이 문서에서 자체 식별 |
| THR-002 | PR에 포함된 악성 `postinstall` 스크립트 또는 변경된 CI 워크플로 YAML이 릴리스 잡과 동일한 권한으로 실행되어 OIDC 토큰이나 빌드 산출물을 탈취한다 | 릴리스 자격증명 탈취 또는 오염된 산출물 배포 | 빌드 잡(PR 트리거, 시크릿 없음)과 릴리스 잡(태그 push 트리거, OIDC 토큰 있음)을 별도 워크플로로 분리한다(6절). CI 설치는 `pnpm install --frozen-lockfile --ignore-scripts`를 기본값으로 하고, 빌드에 필요한 스크립트만 명시적으로 허용 목록에 추가한다 | SRS 미명명 — 이 문서에서 자체 식별 |
| THR-003 | Radix UI 또는 lucide-react의 신규 배포 버전이 계정 탈취 등으로 악성 코드를 포함한다 | Conductor를 통해 소비자 번들에 악성 코드가 전파된다 | Radix는 정확한 버전 고정(caret 미사용)으로 자동 업그레이드를 차단한다(R-3). 두 의존성 모두 3.3의 `pnpm audit` 게이트 대상이다 | NFR-002가 일반 취약점 게이트를 명명. 계정 탈취발 악성 배포 시나리오는 이 문서에서 구체화 |
| THR-004 | 대비 검사 제외 목록(`usage: "decorative"`)이 남용되어 실제 본문 텍스트 토큰이 접근성 검사를 우회한다 | WCAG 2.1 AA 미달 상태가 릴리스된다 | 제외 목록을 `pnpm check:contrast --report`로 조회 가능하게 하고(FR-THM-004 예외 처리), 접근성 검토자가 릴리스 게이트에서 제외 목록 변경을 리뷰한다 | FR-A11Y-005, FR-THM-004가 명명 |
| THR-005 | 소비자가 `@conductor/css` 리셋 레이어를 기존 전역 스타일과 함께 로드해 소비자 자신의 스타일을 덮어쓴다 | 보안 위협은 아니나 무결성 저하. 우회를 위해 `!important`를 남용하면 R-4의 캐스케이드 충돌이 재발한다 | `@conductor/css/component.css` 부분 진입점을 제공하고(FR-CSS-002 예외 처리), `@layer`로 명시도를 격리한다(FR-CSS-001) | FR-CSS-001, R-4가 명명 |

## 10. 개인정보

| 항목 | 내용 |
| --- | --- |
| 수집하는 개인정보 | 없음 |
| 브라우저에 저장하는 상태 | `localStorage`의 테마 선택값(`dark`/`light`)뿐이다(FR-DOC-005 AC-2) |
| 쿠키 | 사용하지 않는다 |
| 텔레메트리/분석 | 포함하지 않는다 |
| `localStorage` 접근 실패(프라이빗 모드, SSR) | 예외를 삼키고 `prefers-color-scheme`으로 대체한다. 저장 실패가 화면 렌더를 막지 않는다(FR-DOC-005 예외 처리) |

## 11. 관련 문서

- `../10_requirements/srs_final.md`(5.3 보안/운영 제약, 6장 권한 모델, 10장 외부 인터페이스, 12장 NFR-002)
- `conductor_architecture_decision_records.md`(ADR-004 Radix 위임, ADR-009 테스트 스택, ADR-010 Changesets + OIDC)
- `conductor_infrastructure_operations.md`(릴리스·롤백 절차)
- `conductor_observability_reliability.md`(취약점 게이트·시크릿 스캔 실패 시 알림)
