# Conductor Design System 구현 로드맵

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-17

## 1. 목적

승인된 요구사항과 아키텍처를 실제 구현 가능한 vertical slice와 milestone으로 분해한다. 각 REL은 `conductor_work_packages.md`에서 WP로 다시 분해된다. 이 문서는 범위를 추가하지 않는다.

## 2. 원칙

- 각 slice는 요구사항, 산출물, 테스트, 검증 명령을 함께 가진다.
- 토큰만 만들거나 컴포넌트만 만든 상태를 완료로 보지 않는다. 각 slice는 끝났을 때 `pnpm build && pnpm test`가 통과해야 한다.
- 선행 의존성을 명시하고, 위험한 결정은 ADR로 연결한다.
- 이 제품에서 "vertical"은 `토큰 소스 → 빌드 산출 → CSS → 컴포넌트 → 테스트`를 관통하는 것을 뜻한다. 서버 계층이 없으므로 FE/BE 구분은 적용되지 않는다.

## 3. Milestones

| REL ID | 목표 | 포함 요구사항 | 주요 산출물 | Exit Criteria |
| --- | --- | --- | --- | --- |
| REL-001 | 토큰 기반과 빌드 파이프라인 | FR-TOK-001 ~ FR-TOK-009, FR-THM-001, FR-THM-004, FR-THM-005, FR-A11Y-004, FR-DX-001, FR-DX-002, FR-QA-001(다크 한정) | `@conductor-by-89soone/tokens` 패키지, `tokens.css`/`tokens.js`/`tokens.d.ts`/`tokens.json`, `buildTokens`·`checkContrast` CLI, `lint:tokens` | `pnpm build`가 토큰 산출물 4종을 생성한다. 다크 팔레트가 소스 `tokens.css`의 모든 키를 덮는다. 순환 참조·접두사 누락·역방향 참조가 빌드를 실패시킨다. `pnpm check:contrast`가 다크 테마 미달 0건을 보고한다. FR-THM-005의 교정 값(`focusRing` alpha 0.80, 신규 `border.control`)이 적용된다 |
| REL-002 | 스타일 레이어, 라이트 테마, 컴포넌트 라이브러리 | FR-THM-002, FR-THM-003, FR-CSS-001 ~ FR-CSS-005, FR-CMP-001 ~ FR-CMP-008, FR-A11Y-001 ~ FR-A11Y-003, FR-A11Y-005, FR-DX-003, FR-DX-004, FR-QA-001, FR-QA-002 | `@conductor-by-89soone/css`, `@conductor-by-89soone/react`, 컴포넌트 C-001 ~ C-064 | 두 테마의 시맨틱 키 집합 차이 0개. React 없이 `cdt-*` 클래스만으로 동일 시각이 나온다. 공유 계약 테스트 스위트가 공개 컴포넌트 전수를 통과한다. `renderToString`이 전 컴포넌트에서 예외 0건 |
| REL-003 | 문서 사이트와 접근성 검사 | FR-DOC-001 ~ FR-DOC-007, FR-CMP-009(조건부), FR-QA-003, FR-DX-003 AC-3 | `apps/docs` 정적 사이트, 화면 W-001 ~ W-050, `JOB-CI-002`, `JOB-CI-004` | 문서 사이트가 `@conductor-by-89soone/react`를 소비자로서 설치해 렌더한다(소스 상대경로 import 0건). 공개 컴포넌트 중 카탈로그에 없는 것이 0건. axe serious 이상 위반 0건(두 테마). `Button` 단독 gzip 4KB 이하 |
| REL-004 | 릴리스 자동화와 시각 회귀 | FR-DX-005, FR-QA-004(조건부), JOB-BUILD-004, JOB-REL-001 | Changesets, npm OIDC 배포 워크플로, `JOB-CI-003`, 문서 사이트 배포 | 파괴 변경이 major를 올린다. 롤백 리허설이 10분 이내에 끝난다. 시각 회귀가 활성화된 경우 24개 스냅샷의 픽셀 차이 1% 이하 |

## 4. Slice Definition

이 제품에는 백엔드·데이터베이스·인프라 런타임이 없다(CR-004). 아래 표의 열은 그에 맞춰 재해석한다.

| Slice | 토큰/스키마 | 빌드 파이프라인 | 스타일/컴포넌트 | 문서 사이트 | CI/릴리스 | QA | 주요 리스크 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REL-001 | ENT-TOK-001~003, ENT-THM-001, 다크 팔레트 | JOB-BUILD-001, API-TOK-001, API-TOK-003 | — | — | 워크스페이스 CI 골격, JOB-CI-001 | 토큰 계약(다크), 참조 해석, 접두사 검사 | R-5 변수 충돌, R-7 대비 실패(OD-001) |
| REL-002 | 라이트 팔레트, component 토큰 | JOB-BUILD-002, JOB-BUILD-003 | `@conductor-by-89soone/css` 5개 레이어, C-001~C-064 | — | JOB-CI-002 골격 | 공유 계약 스위트, SSR 렌더, 키보드 경로 | R-1 라이트 재현, R-3 Radix 결합, R-4 캐스케이드 충돌 |
| REL-003 | 토큰 메타데이터 소비 | JOB-BUILD-004 | C-070~C-072(조건부) | W-001 ~ W-050 | JOB-CI-002, JOB-CI-004 | axe 전수, Lighthouse, 번들 크기 | 라이브 프리뷰 오류 경계, props 표 자동 생성 |
| REL-004 | — | — | — | 정적 배포 | JOB-CI-003(조건부), JOB-REL-001 | 시각 회귀, 릴리스·롤백 리허설 | R-2 시각 회귀 flake(OD-002) |

## 5. 의존성 지도

- **REL-001 → REL-002**: `@conductor-by-89soone/css`는 `@conductor-by-89soone/tokens`의 산출물(`tokens.css`)을 소비한다. 토큰 산출 없이 스타일 레이어를 만들 수 없다.
- **REL-002 → REL-003**: 문서 사이트는 `@conductor-by-89soone/react`를 소비자로서 설치한다(FR-DOC-001 AC-1). 컴포넌트 없이 카탈로그를 만들 수 없다.
- **REL-003 → REL-004**: 시각 회귀는 문서 사이트의 프리뷰를 렌더 대상으로 삼는다.
- **OD-001 (2026-07-10 종결) → REL-001 착수 차단 해제**: 정책은 "최소 수정". `srs_final.md` 12.1절이 `contrast-pairs.ts`의 명세다. FR-THM-005가 신설되어 REL-001에 포함된다.
- **OD-004 (2026-07-10 종결) → WP-023 실행**: 셸 컴포넌트군을 `@conductor-by-89soone/react`에 포함한다.
- **OD-002 (2026-07-10 종결) → WP-026을 REL-004에서 실행**: 시각 회귀는 v1 릴리스 게이트가 아니다. FR-QA-004는 `deferred`다.
- **OD-003 (open, 비차단)**: 필터/칩 컴포넌트군은 FR이 부여되지 않았고 WP도 없다. REL-003 종료 시점에 결정한다.
- **ADR-002 (스타일 엔진)**: REL-002 전체가 이 결정에 의존한다. 구현 에이전트는 재결정하지 않는다.
- **ADR-004 (Radix 위임)**: FR-CMP-006(오버레이군)과 FR-A11Y-002·FR-A11Y-005가 이 결정에 의존한다.

## 6. 순서와 병렬 가능성

```text
REL-001  WP-001 → WP-002 → WP-003 → WP-004 ┐
                                  → WP-005 ┼→ WP-006 → WP-007(OD-001)
REL-002  WP-008 → WP-009 ┐
         WP-010 ─────────┼→ WP-011 → { WP-012 ∥ WP-013 ∥ WP-014 ∥ WP-015 ∥ WP-016 ∥ WP-017 }
REL-003  WP-018 → { WP-019 ∥ WP-020 ∥ WP-021 ∥ WP-022 }
         WP-023(OD-004) ∥ WP-024 ∥ WP-025
REL-004  WP-026(OD-002) ∥ WP-027 → WP-028
```

`∥`로 표시된 WP는 서로 독립이며 병렬 세션으로 실행할 수 있다. 컴포넌트군 WP(WP-012 ~ WP-017)는 WP-011의 공통 계약이 확정된 뒤 동시에 진행 가능하다.

## 7. Known Limitations

| 제한 | 영향 | 후속 slice | 승인 여부 |
| --- | --- | --- | --- |
| 라이트 테마가 다크 전용 시각 장치(글래스 배경, 글로우, alpha 경계)를 동일하게 재현하지 못한다 (R-1) | 라이트 테마의 elevation 표현이 그림자 대신 경계 대비에 의존한다 | REL-002에서 solid 대안 토큰으로 해소. 잔여 차이는 문서 사이트 W-013에 명시 | 승인 (PRD R-1 완화 방안) |
| 시각 회귀 검사가 v1 릴리스 게이트에 없다 (OD-002 종결) | M-1(픽셀 차이 1%)이 v1에서 자동 측정되지 않는다. v1은 수동 시각 확인에 의존한다 | REL-004 (WP-026) | 승인 |
| `focusRing`과 폼 컨트롤 경계가 소스보다 뚜렷하다 (FR-THM-005, OD-001 종결) | 포커스 상태와 입력 경계의 시각이 소스와 다르다. G-1(시각 보존)의 의도된 예외다 | 없음 | 승인 |
| `Table`이 정렬·페이지네이션·가상 스크롤을 제공하지 않는다 | 대량 데이터 소비자는 자체 구현이 필요하다 | 비목표. 후속 slice 없음 | 승인 (FR-CMP-005 예외 처리) |
| 필터/칩 컴포넌트군(F-CMP-010)이 v1에 없다 | 소비자가 자체 구현한다 | v1.1. OD-003 결정에 따름 | 조건부 |
| 소스의 도메인 컴포넌트(`.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`)를 이식하지 않는다 | agent-ai-platform은 이 클래스들을 자체 보유해야 한다 | 없음 (F-X-009 명시 제외) | 승인 |
| `@conductor-by-89soone/tokens`의 primitive 토큰이 공개 API로 노출되지 않는다 | 소비자가 원시 색 ramp를 직접 참조할 수 없다 | 없음 (FR-TOK-002 AC-5 의도된 제약) | 승인 |
