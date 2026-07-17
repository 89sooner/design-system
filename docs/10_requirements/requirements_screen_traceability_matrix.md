# 요구사항-화면 추적 매트릭스

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-17

## 1. 목적

본 문서는 `srs_final.md`의 요구사항 ID를 `conductor_*` 파생 문서군의 화면 ID와 연결한다. 이 문서는 범위를 추가하지 않는다.

## 2. 사용 원칙

1. 기능 기준은 `srs_final.md`다.
2. 화면 ID 기준은 `../20_derived_ui_specs/conductor_product_ia.md`와 `../20_derived_ui_specs/conductor_wireframe_spec.md`다.
3. 하나의 요구사항은 하나 이상의 화면 ID와 연결될 수 있다.
4. UI가 직접 없는 요구사항도 3절의 비-UI 표면으로 연결한다.
5. 승인된 모든 FR은 이 매트릭스에 나타나야 한다.

## 3. 화면 ID 체계와 비-UI 표면

Conductor의 유일한 사용자 인터페이스는 문서 사이트다. 화면 ID는 웹 표면을 뜻하는 `W-###`를 사용한다. `D-###`(주 앱)와 `A-###`(관리 콘솔)는 이 제품에 존재하지 않는다.

| 화면 ID | 화면명 | 경로 |
| --- | --- | --- |
| W-001 | Overview | `/` |
| W-002 | Getting Started | `/getting-started` |
| W-010 | Foundations · Color | `/foundations/color` |
| W-011 | Foundations · Typography | `/foundations/typography` |
| W-012 | Foundations · Spacing & Layout | `/foundations/spacing` |
| W-013 | Foundations · Radius & Elevation | `/foundations/elevation` |
| W-014 | Foundations · Motion | `/foundations/motion` |
| W-020 | Components Index | `/components` |
| W-021 | Component Detail | `/components/:componentId` |
| W-030 | Tokens Reference | `/tokens` |
| W-040 | Patterns | `/patterns` |
| W-050 | Accessibility | `/accessibility` |

UI가 없는 요구사항은 아래 표면 중 하나에 간접 노출된다.

| 표면 ID | 표면명 | 설명 |
| --- | --- | --- |
| SFC-PKG | 패키지 공개 API | `package.json` `exports`, 타입 선언, import 경로 |
| SFC-CLI | 빌드/검사 명령 출력 | `pnpm build`, `pnpm check:contrast`, `pnpm lint:tokens`의 종료 코드와 stdout |
| SFC-CI | CI 파이프라인 리포트 | 접근성 검사, 시각 회귀, 번들 크기, 감사 결과 |
| SFC-REL | 릴리스 산출물 | CHANGELOG, semver 태그, 마이그레이션 노트 |

## 4. 출처 → 기능 → 시나리오 → 요구사항 추적

| 출처 | 기능 ID | 시나리오 | 요구사항 ID |
| --- | --- | --- | --- |
| SRC-AAP `tokens.css` | F-TOK-001, F-TOK-005, F-THM-001 | SCN-002 | FR-TOK-001, FR-TOK-005, FR-THM-001 |
| SRC-AAP `app.css` | F-CSS-001 ~ F-CSS-005, F-CMP-002 ~ F-CMP-009 | SCN-001 | FR-CSS-001, FR-CSS-002, FR-CSS-003, FR-CSS-004, FR-CSS-005, FR-CMP-002, FR-CMP-003, FR-CMP-004, FR-CMP-005, FR-CMP-006, FR-CMP-007, FR-CMP-008, FR-CMP-009 |
| SRC-USER 2026-07-10 결정 | F-THM-002, F-DOC-001 ~ F-DOC-007 | SCN-003 | FR-THM-002, FR-DOC-001, FR-DOC-002, FR-DOC-003, FR-DOC-004, FR-DOC-005, FR-DOC-006, FR-DOC-007 |
| SRC-WCAG 2.1 AA | F-A11Y-001 ~ F-A11Y-005, F-QA-003 | SCN-003 | FR-A11Y-001, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-QA-003 |
| 신규 (소스에 없음) | F-TOK-002, F-TOK-006 ~ F-TOK-009, F-DX-001 ~ F-DX-005, F-QA-001 ~ F-QA-004 | SCN-004 | FR-TOK-002, FR-TOK-006, FR-TOK-007, FR-TOK-008, FR-TOK-009, FR-DX-001, FR-DX-002, FR-DX-003, FR-DX-004, FR-DX-005, FR-QA-001, FR-QA-002, FR-QA-004 |
| SRC-AAP 별칭/빌드 필요 | F-TOK-003, F-TOK-004, F-THM-003, F-THM-004 | SCN-002 | FR-TOK-003, FR-TOK-004, FR-THM-003, FR-THM-004 |
| 소스 팔레트 대비율 실측 (OD-001 종결, CR-005) | F-THM-004, F-A11Y-001, F-A11Y-004 | SCN-002, SCN-003 | FR-THM-005 |
| 컴포넌트 계약 정규화 | F-CMP-001 | SCN-001 | FR-CMP-001 |

## 5. 요구사항 → 화면 매트릭스

| 요구사항 ID | 우선순위 | 직접 노출 화면 | 간접 노출 표면 | 관련 FLOW | 비고 |
| --- | --- | --- | --- | --- | --- |
| FR-TOK-001 | Must | — | SFC-CLI, W-030 | FLOW-003 | 린트 명령 출력으로 노출 |
| FR-TOK-002 | Must | W-010 | SFC-CLI | FLOW-003 | 계층 표시 |
| FR-TOK-003 | Must | — | SFC-CLI, W-030 | FLOW-003 | 순환 참조 오류 메시지 |
| FR-TOK-004 | Must | — | SFC-PKG, W-030 | FLOW-003 | 산출 CSS 파일 |
| FR-TOK-005 | Must | W-010, W-040 | SFC-PKG | — | 상태·심각도·미터 색 |
| FR-TOK-006 | Must | — | SFC-PKG | FLOW-003 | W-030이 이 JSON을 읽는다 |
| FR-TOK-007 | Must | W-011 | SFC-PKG | — | 타입 스케일 |
| FR-TOK-008 | Should | — | SFC-PKG, W-030 | — | z-index 스케일 |
| FR-TOK-009 | Should | W-012 | SFC-PKG | — | 브레이크포인트 |
| FR-THM-001 | Must | W-010, W-030 | SFC-PKG | FLOW-002 | 기준 팔레트 |
| FR-THM-002 | Must | W-010, W-030 | SFC-PKG | FLOW-002 | 라이트 팔레트 |
| FR-THM-003 | Must | W-001, W-030 | SFC-PKG | FLOW-002 | 테마 결정 우선순위 |
| FR-THM-004 | Must | W-030, W-050 | SFC-CLI, SFC-CI | FLOW-003 | 대비 검사 |
| FR-THM-005 | Must | W-030, W-050 | SFC-CLI, SFC-PKG | FLOW-003 | 소스 계승 토큰 교정 (OD-001 종결) |
| FR-CSS-001 | Must | W-002 | SFC-PKG | — | 캐스케이드 레이어 |
| FR-CSS-002 | Must | — | SFC-PKG, 전 화면 | — | 리셋/베이스 |
| FR-CSS-003 | Must | W-012 | SFC-PKG | — | 레이아웃 프리미티브 |
| FR-CSS-004 | Must | W-020, W-021 | SFC-PKG | — | 컴포넌트 클래스 |
| FR-CSS-005 | Must | W-014 | SFC-PKG | — | 모션 감소 |
| FR-CMP-001 | Must | W-021 | SFC-PKG | — | 공통 계약 |
| FR-CMP-002 | Must | W-020, W-021 | SFC-PKG | FLOW-001 | 액션 |
| FR-CMP-003 | Must | W-020, W-021 | SFC-PKG | FLOW-001 | 표면 |
| FR-CMP-004 | Must | W-020, W-021, W-040 | SFC-PKG | FLOW-001 | 상태 표시 |
| FR-CMP-005 | Must | W-020, W-021 | SFC-PKG | FLOW-001 | 데이터 표시 |
| FR-CMP-006 | Must | W-020, W-021 | SFC-PKG | FLOW-004 | 오버레이 |
| FR-CMP-007 | Must | W-020, W-021 | SFC-PKG | FLOW-001 | 폼 |
| FR-CMP-008 | Must | W-020, W-021 | SFC-PKG | FLOW-001 | 피드백 |
| FR-CMP-009 | Should | W-001, W-021 | SFC-PKG | FLOW-005 | 셸 (OD-004 종결: 패키지 포함) |
| FR-DOC-001 | Must | W-001 | SFC-CI | FLOW-001 | 문서 셸 |
| FR-DOC-002 | Must | W-010, W-011, W-012, W-013, W-014 | — | FLOW-001 | Foundations |
| FR-DOC-003 | Must | W-020, W-021 | — | FLOW-001 | 라이브 프리뷰 |
| FR-DOC-004 | Must | W-030 | — | FLOW-002 | 토큰 참조 |
| FR-DOC-005 | Must | W-001, W-030 | — | FLOW-002 | 테마 토글 |
| FR-DOC-006 | Should | W-021 | — | FLOW-006 | 코드 복사 |
| FR-DOC-007 | Should | W-040 | — | FLOW-001 | 사용 규칙 |
| FR-A11Y-001 | Must | W-050 | 전 화면 | — | 포커스 링 |
| FR-A11Y-002 | Must | W-050 | 전 화면 | FLOW-004 | 키보드 도달 |
| FR-A11Y-003 | Must | W-040, W-050 | SFC-PKG | — | 색상 비의존 |
| FR-A11Y-004 | Must | W-030, W-050 | SFC-CLI, SFC-CI | FLOW-003 | 대비율 |
| FR-A11Y-005 | Must | W-050 | SFC-CI | — | 스크린리더 |
| FR-DX-001 | Must | W-002 | SFC-CLI | FLOW-003 | 빌드 순서 |
| FR-DX-002 | Must | W-021 | SFC-PKG | — | 타입 배포 (props 표가 타입에서 생성) |
| FR-DX-003 | Must | W-002 | SFC-PKG | — | 진입점/부수효과 |
| FR-DX-004 | Must | W-002 | SFC-PKG | — | SSR 안전성 |
| FR-DX-005 | Should | — | SFC-REL | — | 버저닝 |
| FR-QA-001 | Must | — | SFC-CLI, SFC-CI, W-030 | FLOW-003 | 토큰 계약 |
| FR-QA-002 | Must | — | SFC-CI, W-050 | FLOW-003 | 단위 검사 |
| FR-QA-003 | Must | W-050 | SFC-CI | FLOW-003 | 접근성 검사 |
| FR-QA-004 | Should | — | SFC-CI | FLOW-003 | 시각 회귀 (OD-002 종결: `deferred`, REL-004 이월) |

## 5.1 비기능 요구사항 → 표면 매트릭스

NFR은 화면 하나에 귀속되지 않는다. 각 NFR이 어디서 측정되고 어디서 위반이 드러나는지 기록한다.

| 요구사항 ID | 직접 노출 화면 | 간접 노출 표면 | 측정 지점 | 관련 잡 |
| --- | --- | --- | --- | --- |
| NFR-001 성능 | W-001 (LCP 측정 대상) | SFC-CI, SFC-PKG | 번들 크기 리포트, Lighthouse CI, 빌드 소요 시간 | JOB-CI-004, JOB-BUILD-001, JOB-BUILD-004 |
| NFR-002 보안 | 없음 | SFC-CI, SFC-REL | `pnpm audit`, 시크릿 스캔, 배포 산출물 네트워크 요청 관찰 | JOB-REL-001 |
| NFR-003 접근성 | W-050 | SFC-CI, SFC-CLI | 대비 리포트, axe 결과, 키보드 경로 테스트 | JOB-CI-001, JOB-CI-002 |
| NFR-004 운영성 | 없음 | SFC-REL, SFC-CI | CI 소요 시간, 롤백 리허설, 공개 API 추출 리포트 | JOB-REL-001 |
| NFR-005 호환성 | W-002 | SFC-PKG, SFC-CI | React 18·19 및 Node 20·22 CI 매트릭스, Browserslist | JOB-BUILD-003 |

## 6. 화면 → 요구사항 역매트릭스

| 화면 ID | 화면명 | 관련 요구사항 |
| --- | --- | --- |
| W-001 | Overview | FR-THM-003, FR-CMP-009, FR-DOC-001, FR-DOC-005 |
| W-002 | Getting Started | FR-CSS-001, FR-DX-001, FR-DX-003, FR-DX-004 |
| W-010 | Foundations · Color | FR-TOK-002, FR-TOK-005, FR-THM-001, FR-THM-002, FR-DOC-002 |
| W-011 | Foundations · Typography | FR-TOK-007, FR-DOC-002 |
| W-012 | Foundations · Spacing & Layout | FR-TOK-009, FR-CSS-003, FR-DOC-002 |
| W-013 | Foundations · Radius & Elevation | FR-DOC-002 |
| W-014 | Foundations · Motion | FR-CSS-005, FR-DOC-002 |
| W-020 | Components Index | FR-CSS-004, FR-CMP-002, FR-CMP-003, FR-CMP-004, FR-CMP-005, FR-CMP-006, FR-CMP-007, FR-CMP-008, FR-DOC-003 |
| W-021 | Component Detail | FR-CMP-001, FR-CMP-002, FR-CMP-003, FR-CMP-004, FR-CMP-005, FR-CMP-006, FR-CMP-007, FR-CMP-008, FR-CMP-009, FR-CSS-004, FR-DOC-003, FR-DOC-006, FR-DX-002 |
| W-030 | Tokens Reference | FR-TOK-004, FR-TOK-008, FR-THM-001, FR-THM-002, FR-THM-003, FR-THM-004, FR-THM-005, FR-DOC-004, FR-DOC-005, FR-A11Y-004, FR-QA-001 |
| W-040 | Patterns | FR-TOK-005, FR-CMP-004, FR-DOC-007, FR-A11Y-003 |
| W-050 | Accessibility | FR-THM-004, FR-THM-005, FR-A11Y-001, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-QA-002, FR-QA-003, FR-QA-004 |

## 7. 검증 메모

- SRS의 승인된 FR 49개가 모두 5절에 등장한다.
- 5절의 모든 화면 ID(W-001 ~ W-050)는 `conductor_product_ia.md`에 선언된다.
- UI 직접 노출이 없는 FR은 모두 `SFC-*` 비-UI 표면을 지정했다.
- 5절의 모든 FLOW ID(FLOW-001 ~ FLOW-006)는 `conductor_screen_flow_spec.md`에 정의된다.
- validator가 미커버 FR과 미선언 화면 ID를 보고한다.
