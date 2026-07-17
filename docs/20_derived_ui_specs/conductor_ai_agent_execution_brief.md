# Conductor Design System Execution Brief for AI Agent

> 상태: review | 버전: v0.3 | 갱신일: 2026-07-17

## 1. 이 브리프의 지위

범위는 상위 문서가 결정한다. 이 브리프는 실행 순서, 확정된 스택, 검증 명령만 요약한다. `../10_requirements/srs_final.md`가 최상위 권위를 갖는다. 이 브리프와 SRS가 어긋나면 SRS를 따르고 9절의 편차 프로토콜로 등록한다.

작업 단위는 문서가 아니라 **작업 패키지(WP)**다. `../40_delivery/conductor_work_packages.md`의 WP-001 ~ WP-028이 실행 대상이다.

## 2. 읽기 순서

1. `../10_requirements/srs_final.md` (특히 9절 FR 정의, 12.1절 대비 검사 정책, 14.1절 종결된 결정)
2. `../10_requirements/requirements_screen_traceability_matrix.md`
3. `../10_requirements/glossary.md`
4. `../10_requirements/prd.md`
5. `conductor_product_ia.md`
6. `conductor_wireframe_spec.md`
7. `conductor_screen_flow_spec.md`
8. `conductor_screen_state_matrix.md`
9. `conductor_ui_component_spec.md`
10. `conductor_design_system_tokens.md`
11. `conductor_screen_qa_checklist.md`
12. `../30_technical_architecture/conductor_architecture_decision_records.md`
13. `../30_technical_architecture/conductor_system_architecture.md`
14. `../30_technical_architecture/conductor_frontend_architecture.md`
15. `../30_technical_architecture/conductor_api_contracts.md`
16. `../30_technical_architecture/conductor_data_model.md`
17. `../30_technical_architecture/conductor_infrastructure_operations.md`
18. `../40_delivery/conductor_implementation_roadmap.md`
19. `../40_delivery/conductor_work_packages.md`
20. `../40_delivery/conductor_implementation_traceability.md`

## 3. 제품 형태

pnpm workspace 모노레포. 서버 런타임, 데이터베이스, 인증 없음.

```text
design-system/
  package.json            # 워크스페이스 루트, 스크립트 진입점
  pnpm-workspace.yaml
  tsconfig.base.json
  packages/
    tokens/               # @conductor-by-89soone/tokens
    css/                  # @conductor-by-89soone/css
    react/                # @conductor-by-89soone/react
  apps/
    docs/                 # 문서 사이트 (Conductor의 첫 소비자)
  docs/                   # 계획 문서 세트 (코드 아님)
```

의존 방향은 `tokens → css → react → docs` 단방향이다. 역방향 참조는 종료 코드 1이다. 다크 테마가 기준 팔레트이고 라이트 테마가 두 번째 팔레트다. CSS 커스텀 프로퍼티 접두사는 `--cdt-`, CSS 클래스 접두사는 `cdt-`다.

## 4. 스택 결정 (ADR 확정. 에이전트는 재결정하지 않는다)

| 항목 | 확정 값 | 근거 |
| --- | --- | --- |
| 저장소 구조 | pnpm workspace 모노레포. 별도 태스크 러너 없음. `pnpm -r run build`가 위상 순서로 실행한다 | ADR-001 |
| 스타일 엔진 | Vanilla CSS + CSS 커스텀 프로퍼티. **Tailwind, CSS-in-JS, Sass를 도입하지 않는다** | ADR-002 |
| 토큰 | TypeScript 소스로 정의한 primitive/semantic/component 3계층. 자체 빌더 `buildTokens`가 CSS·TypeScript·JSON 세 산출물을 만든다 | ADR-003 |
| 접근성 프리미티브 | `@radix-ui/react-*` 1.x 개별 패키지. 캐럿 범위 없이 정확 버전 고정 | ADR-004 |
| 캐스케이드 | `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility`. `!important` 0건 | ADR-005 |
| 네임스페이스 | 커스텀 프로퍼티 `--cdt-`, 클래스 `cdt-`. 클래스 규칙 `cdt-<블록>[__<요소>][--<변형>]` | ADR-006 |
| 문서 사이트 | Vite 6/7 위에서 React Router 7.x 프레임워크 모드를 `ssr: false` + `prerender`로 사용해 라우트별 정적 HTML 생성. 콘텐츠는 MDX가 아니라 TSX로 저작하고, 같은 파일을 Vite `?raw`로 읽어 `CodeBlock`에 표시한다 | ADR-007 |
| 번들러 | JS/TS는 tsup 8.x(esbuild, ESM+CJS, `dts: true`, `banner.js`로 `"use client"` 주입, `external: ["react", "react-dom", "lucide-react"]`). CSS는 lightningcss 1.x | ADR-008 |
| API 리포트 | `@microsoft/api-extractor` 7.x가 `.api.md`를 생성한다. `any` 출현 또는 이전 리포트와의 차이는 CI 실패 | ADR-008 |
| 산출물 검사 파서 | CSS는 postcss 8.x AST, TypeScript는 TypeScript 5.x 컴파일러 API. postcss는 변환이 아니라 검사에만 쓴다 | ADR-008 |
| 테스트 | Vitest 3.x + Testing Library 16.x + axe-core 4.x + Playwright 1.4x | ADR-009 |
| 릴리스 | Changesets 2.x + GitHub Actions npm OIDC 신뢰 배포(`id-token: write`, provenance). 장기 토큰 미사용 | ADR-010 |

### 4.1 스택의 귀결

- **Radix 의존 컴포넌트는 7개다**: C-040 Dialog, C-041 Drawer, C-042 Tooltip, C-043 DropdownMenu, C-053 Select, C-054 Switch, C-055 Checkbox. `Drawer`는 `@radix-ui/react-dialog` 위의 측면 고정 콘텐츠 변형이다. `Field`(C-050)는 네이티브 `label[for]`를 쓴다. 나머지 컴포넌트는 Radix에 의존하지 않는다.
- **props 스프레드 순서는 `{...userProps} {...radixProps}`다.** 사용자 props가 Radix의 role/aria를 덮어쓸 수 없다. `className`과 `style`만 명시적으로 병합한다.
- **아이콘은 `lucide-react` peer dependency다.** Conductor는 아이콘을 번들하지 않는다.
- **React는 peer dependency다.** `^18.0.0 || ^19.0.0`.
- **토큰 커스텀 프로퍼티 선언은 `cdt.base` 레이어에 둔다.** 소비자가 레이어 밖에서 `:root { --cdt-accent: ... }`로 재정의할 수 있다.
- **`prefers-reduced-motion` 규칙은 전역 `*` 대신 Conductor 스코프 셀렉터를 쓰고 `cdt.base` 레이어에 둔다.**
- **Radix가 인라인 주입하는 `--radix-*` 커스텀 프로퍼티는 레이어 대상이 아니다.**
- **빌더 실행 순서**: 파싱 → 계층 검증 → 참조 해석(깊이 10단계) → 순환 검출 → 이름 충돌 검출 → 전체 성공 후 파일 기록. 부분 산출물을 남기지 않는다.
- **브레이크포인트는 빌드 시 리터럴로 치환한다.** CSS 커스텀 프로퍼티는 미디어쿼리 조건에서 평가되지 않는다. 동일 값을 `breakpoints` 객체로 export한다.
- **대비 검사는 브라우저를 띄우지 않는다.** `checkContrast`가 토큰 값에서 직접 WCAG 2.1 상대 휘도를 계산한다. 파이프라인 앞단(JOB-CI-001)에 놓인다.
- **axe-core는 실제 브라우저에서 실행한다.** Vitest 브라우저 모드를 Playwright chromium 프로바이더로 실행한다. `color-contrast` 규칙을 끄지 않는다.
- **lightningcss의 browserslist 타깃은 "최근 2개 메이저"로 고정한다.** 타깃을 낮추면 `@layer`가 평탄화되거나 커스텀 프로퍼티가 정적 값으로 치환된다.

## 5. 명령

| 목적 | 명령 |
| --- | --- |
| install | `pnpm install` (CI는 `pnpm install --frozen-lockfile`) |
| dev | `pnpm --filter docs dev` |
| build | `pnpm build` |
| test | `pnpm test` |
| typecheck | `pnpm typecheck` |
| 토큰 린트 | `pnpm lint:tokens` (조회는 `pnpm lint:tokens --report`) |
| 대비 검사 | `pnpm check:contrast` (제외 목록은 `pnpm check:contrast --report`) |
| 접근성 검사 | `pnpm test:a11y` |
| 번들 크기 | `pnpm size` |

보조: `pnpm check:deps`, `pnpm audit --audit-level high`, `pnpm changeset status`, `pnpm test:visual`(REL-004에서만).

## 6. 대상 범위

**다음에 실행할 WP는 WP-001 모노레포 부트스트랩이다.** 선행 WP가 없다.

이후에는 `../40_delivery/conductor_work_packages.md` 4절의 의존 표를 읽고, **선행 WP가 모두 `done`인 WP만 고른다.** 선행 WP의 상태는 `../40_delivery/conductor_implementation_traceability.md` §2 WP 상태 표에서 확인한다.

## 7. WP별 실행 루프

한 세션 = 한 WP. 다음 6단계를 순서대로 수행한다.

1. **WP를 고른다.** 선행 WP가 전부 `done`인 WP 중 WP 번호가 가장 작은 것을 고른다. 추적 원장 §2 WP 상태 표에서 상태를 `in_progress`로 바꾼다.
2. **그 WP가 참조하는 ID의 문서만 재독한다.** WP 정의의 "관련 요구사항"에 적힌 FR 블록, "관련 화면/플로우"에 적힌 화면 ID, "관련 API/데이터/잡"에 적힌 계약만 읽는다. 문서 세트 전체를 다시 읽지 않는다.
3. **구현 범위 안에서만 작성한다.** WP 정의의 "구현 범위" 항목만 구현한다. "제외" 항목은 건드리지 않는다. 범위 밖에서 발견한 개선점은 코드가 아니라 메모로 남긴다.
4. **DoD와 검증 명령을 실행한다.** WP의 완료 기준 체크박스를 하나씩 닫고, "검증 방법"에 적힌 명령을 실행해 종료 코드 0을 확인한다.
5. **추적 원장을 갱신한다.** `../40_delivery/conductor_implementation_traceability.md`의 §2 WP 상태 표(상태 `done`, 이름, REL, 커밋/PR, 검증 결과, 갱신일)와 §3 요구사항 매핑 표(구현 모듈, 테스트 파일, WP, 상태)를 채운다. 새로 발견한 제약은 §5에 추가한다.
6. **충돌 시 DEV 등록 후 정지한다.** 문서와 현실이 어긋나면 코드를 바꾸지 않고 §9의 절차를 따른다.

## 8. 금지된 지름길

1. 빈 라우트
2. 장식용 목업 (스크린샷 이미지로 라이브 프리뷰 대체)
3. 본문이 비어 있는 컴포넌트 (구현 대신 주석만 남기거나, 테스트 파일 없이 공개 export)
4. 처리되지 않은 상태 (상태 매트릭스의 상태·예외·복구 흐름 누락)
5. 조용한 범위 변경 (DEV 등록 없는 문서-코드 불일치 병합)
6. `!important` 사용
7. 색상 리터럴 하드코딩 (`#rrggbb`, `rgb()`, `hsl()`)
8. 자체 포커스 트랩·롤 관리·키보드 내비게이션 구현
9. 구조 셀렉터 사용 (`>`, `+`, `:nth-child`)
10. primitive 토큰 직접 참조
11. 문서 사이트에서 소스 상대경로 import
12. 도메인 컴포넌트 이식 (`.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`)

## 9. 편차 프로토콜

문서와 현실이 충돌하면: **정지 → DEV 등록 → CR 개설 → 보고.**

1. 충돌 지점을 넘어가는 구현을 멈춘다.
2. `../40_delivery/conductor_implementation_traceability.md` §4 편차 로그에 `DEV-###` 행을 추가한다(발견일, 유형, 내용, 관련 FR/WP ID).
3. `../00_governance/change_control.md`의 CR 대장에 `CR-###`를 등록하고 DEV ID를 연결한다. `문서 오류` / `범위 공백` / `기술 제약` 중 하나로 분류한다.
4. 중단 상태로 보고한다. 코드를 조용히 바꾸지 않는다.

## 10. 종결된 결정 (다시 묻지 않는다)

| 결정 | 내용 | 구현에 미치는 영향 |
| --- | --- | --- |
| OD-001 (closed) | 대비 검사 정책은 **최소 수정**이다 | `srs_final.md` 12.1절 표를 그대로 구현한다. `focusRing`은 accent alpha 0.80, 신규 `border.control`은 slate `#94a3b8` alpha 0.60. 나머지 토큰은 값을 보존하고 `usage` 메타데이터로 분류한다. FR-THM-005가 이를 강제한다 |
| OD-002 (closed) | 시각 회귀 검사를 REL-004로 이월한다 | FR-QA-004의 상태는 `deferred`다. v1 릴리스 게이트가 아니다. WP-026은 REL-001 ~ REL-003 완료 후에 착수한다. v1 기간에는 수동 시각 확인으로 대체하고 그 사실을 추적 원장 §5에 남긴다 |
| OD-004 (closed) | 셸 컴포넌트군을 `@conductor-by-89soone/react`에 포함한다 | C-070 AppShell, C-071 NavList, C-072 TopBar를 패키지에 넣는다. `renderLink` props로 링크 렌더를 위임해 라우팅 라이브러리 의존 0건을 지킨다. WP-023을 실행한다 |
| OD-003 (open) | 필터/칩 컴포넌트군(F-CMP-010)을 v1에 넣는가 | **FR이 부여되지 않았으므로 구현 대상이 아니다.** REL-003 종료 시점에 Product가 결정한다. 이 결정은 어떤 Must FR도 차단하지 않는다 |

## 11. 제출 형식

세션 종료 시 다음을 보고한다.

- **구현한 범위**: 완료한 WP ID와 구현 범위 항목
- **구현하지 않은 범위**: 그 WP의 제외 항목, 범위 밖에서 발견했으나 코드로 옮기지 않은 개선점
- **내린 결정**: 구현 중 선택한 사항과 근거 FR/ADR ID. ADR을 재결정했다면 그 사실 자체가 편차다
- **연결 지점**: 다음 WP가 소비할 산출물, 진입점, 계약
- **검증 결과**: 실행한 명령과 종료 코드. DoD 체크박스의 닫힘 여부
- **알려진 제약**: 추적 원장 §5에 추가한 항목
- **추적 원장 갱신 내역**: §2에서 바꾼 WP 행, §3에서 바꾼 FR 행, §4에 추가한 DEV 행

## 12. 추적성 규약

- 커밋·PR 본문: `Refs: WP-### FR-<AREA>-###` (여러 FR은 공백으로 나열)
- 테스트 이름: `FR-<AREA>-### AC-#: <설명>`
- 모듈 파일 상단: TypeScript/TSX는 `// FR 범위: FR-CMP-002`, CSS는 `/* FR 범위: FR-CSS-004 */`
- WP 완료 시 `validate_srs_prd_env.py --root . --report --code-root <repo>`를 실행하고 결과를 추적 원장 §2의 검증 결과 열에 기록한다
