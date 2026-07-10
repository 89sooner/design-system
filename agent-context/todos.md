# 다음 작업 / 미해결 항목

## 시작 지점

**WP-009 완료(2026-07-11).** 다음은 **WP-010**(라이트 팔레트와 테마 결정 계약). 자세한 인수인계는
`agent-context/sessions/2026-07-11-wp009-layout-primitives.md` 참조.

```text
1. docs/20_derived_ui_specs/conductor_ai_agent_execution_brief.md 를 읽는다
2. docs/40_delivery/conductor_work_packages.md 에서 WP-010 블록을 읽는다
3. WP-010이 참조하는 ID의 문서만 재독한다 (WP의 ID 목록이 곧 읽기 범위)
4. 구현 범위 안에서만 코드를 쓴다. 제외 항목은 코드가 아니라 메모로 남긴다
5. DoD의 검증 명령을 실행한다
6. docs/40_delivery/conductor_implementation_traceability.md 를 갱신한다
```

### WP-010 착수 시 즉시 확인할 것
- `docs/20_derived_ui_specs/conductor_design_system_tokens.md` §5/§6의 라이트 값을 코드로 옮긴다. 새 팔레트를 창작하지 않는다.
- `FR-THM-001 AC-3`, `FR-TOK-005 AC-4`, `FR-A11Y-004 AC-1`, `FR-QA-001`이 WP-010 완료 후 `부분`에서 `검증됨`으로 올라가야 하는지 재검증한다.
- 테마 선택 계약은 `data-cdt-theme`가 시스템 선호보다 우선한다. SSR flicker 방지 스니펫도 계약 일부다.
- `check:contrast`가 두 테마를 모두 검사하는 첫 작업이다. 라이트 값의 실패 가능성을 리스크로 보고 먼저 작은 범위에서 확인한다.

## REL-002 — 다음 릴리스 슬라이스

의존 순서:

```text
WP-008 → WP-009 ┐
WP-010 ─────────┼→ WP-011 → { WP-012 ∥ WP-013 ∥ WP-014 ∥ WP-015 ∥ WP-016 ∥ WP-017 }
```

`∥`는 병렬 실행 가능(WP-011의 공통 계약 확정 후).

| WP | 이름 | 선행 | 핵심 |
| --- | --- | --- | --- |
| ~~WP-008~~ **done** | `@conductor/css` 레이어 골격과 리셋 | WP-003 | `@layer` 5단, `!important` 0건, gzip 2,575B ≤ 20KB, `./component.css` 부분 진입점 |
| ~~WP-009~~ **done** | 레이아웃 프리미티브 클래스 | WP-008 | `cdt-app-shell`, `cdt-split-layout`, `cdt-card-grid`, `cdt-page`, `cdt-content-stack`, breakpoint 치환 |
| **WP-010** | 라이트 팔레트와 테마 결정 계약 | WP-006 | 두 테마 키 대칭, `data-cdt-theme` 우선순위, SSR 깜빡임 방지 스니펫 |
| WP-011 | `@conductor/react` 골격과 공통 계약 | WP-008 | `runContractSuite()`, ref 전달 / className 병합 / `data-*`·`aria-*` 통과 / 네이티브 props 확장 |
| WP-012~017 | 컴포넌트군 6개 (C-001 ~ C-064) | WP-011 | 액션·표면 / 상태표시 / 데이터표시 / 오버레이 / 폼 / 피드백 |

### WP-008 착수 시 즉시 확인할 것

`@conductor/css`는 `@conductor/tokens/tokens.css`를 **공개 진입점으로** import해야 한다. 소스 상대경로(`../../tokens/dist/tokens.css`)를 쓰면 FR-DX-001 AC-4("소스 상대경로 참조 0건") 위반이다. 진입점은 이미 선언돼 있다:

```json
"./tokens.css": "./dist/tokens.css"
```

### WP-010이 잠금 해제하는 것

라이트 팔레트가 없어서 아래 AC들이 원장에 `부분`으로 남아 있다. WP-010 완료 시 **재검증하고 `검증됨`으로 올려야 한다**:

- `FR-THM-001 AC-3` 두 테마 키 대칭
- `FR-TOK-005 AC-4` 14개 상태/심각도/미터 키가 두 테마에 정의
- `FR-A11Y-004 AC-1` "두 테마 미달 0건" — 현재 다크만 측정됨
- `FR-QA-001` 실제 두 팔레트 대칭 검사 — 현재 픽스처로만 증명

라이트 팔레트 값은 `docs/20_derived_ui_specs/conductor_design_system_tokens.md` §6(파생 규칙)과 §5 표의 "라이트 값" 열에 이미 산출돼 있다. 새로 만들지 말고 옮겨라.

## 열려 있는 결정

| ID | 내용 | 차단 여부 | 담당 | 기한 |
| --- | --- | --- | --- | --- |
| **OD-003** | 필터/칩 컴포넌트군(F-CMP-010, `FilterBar`/`Chip`)을 v1에 넣는가 | 비차단 (FR 미부여, WP 없음) | Product | REL-003 종료 |

Must FR을 차단하는 open OD는 **0건**이다.

## 확인이 필요한 자잘한 것

- `conductor-build-tokens --help`가 **exit 3**을 반환한다(인자 오류 취급). `API-TOK-001` 계약에 `--help`가 없어 FR 위반은 아니지만 DX 흠집이다. 고칠 거면 계약 문서에 먼저 추가하라
- 저장소는 **git repo다**(커밋 2개, `main`). WP-001~009 코드는 작업 트리에 있다. 사용자 요청으로 작업물 커밋과 handoff 커밋을 분리한다
- `.gitignore`에 `packages/tokens/src/tokens.ts`, `packages/tokens/src/breakpoints.ts`가 들어 있다(생성 파일)
- **CI가 아직 한 번도 실행된 적 없다**(워크플로 실행 0회). CR-011로 재현성 단계의 fileMode 결함을 이미 고쳤다. 첫 CI 실행 전 확인할 것
- `agent-ai-platform`의 `--severity-blocked: #7f1d1d` 토큰은 소스에서 **선언만 되고 쓰이지 않는다**(`SideEffectBadge`가 3종만 구현). Conductor는 `SeverityTag`에 4종을 전부 구현한다(C-022, FR-CMP-004 AC-4)

## 하지 말아야 할 것

- `srs_final.md`는 **baseline v1.2**다. 요구사항을 바꾸려면 `docs/00_governance/change_control.md`에 CR을 **먼저** 등록하고, 그 다음 편집하고, cascade를 기록해야 한다. 순서를 지켜라
- 코드와 문서가 어긋나면 조용히 코드를 바꾸지 마라. 원장 §4에 `DEV-###`를 등록하고 CR로 연결한 뒤 정지하라. 이 세션에서 DEV-001·DEV-002가 그 절차로 처리됐다
- `packages/tokens/src/tokens.ts`와 `src/breakpoints.ts`를 **직접 편집하지 마라**. 생성 파일이다. 토큰 소스(`schema.ts`, `primitives.ts`, `palette.dark.ts`, `scales.ts`, `components.ts`)를 고치고 재빌드하라
- 도메인 컴포넌트(`.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`)를 이식하지 마라 (F-X-009)
