# Conductor Design System 인프라 및 운영 아키텍처

> 상태: review | 버전: v0.6 | 갱신일: 2026-07-17

## 1. 범위 재정의: 서버가 없는 인프라

Conductor Design System은 서버 런타임, 컴퓨팅 인스턴스, 오토스케일링 대상, 로드밸런서를 갖지 않는다(`../10_requirements/srs_final.md` 4.3 Out of Scope). 이 문서가 다루는 "인프라"는 다음 네 가지로 한정된다: (1) 빌드가 실행되는 환경, (2) 빌드 산출물이 배포되는 대상, (3) 릴리스와 롤백 절차, (4) 배포 경로 장애 시 대응. 배포 단위는 서비스가 아니라 npm 패키지 3종과 문서 사이트 정적 산출물이다.

## 2. 환경

| Environment | 목적 | 트리거 | 산출물 | 관련 요구사항 |
| --- | --- | --- | --- | --- |
| local | 개발자가 토큰·컴포넌트를 수정하고 빌드/검사를 로컬에서 실행한다 | 개발자 수동 실행 | 로컬 `dist/` 산출물(배포되지 않음) | FR-DX-001 |
| CI (Pull Request) | 모든 PR에서 빌드와 검사 잡을 실행해 병합 가능 여부를 판정한다 | PR open/synchronize | 테스트 리포트, 대비/접근성/시각 회귀/번들 크기 아티팩트 | JOB-CI-001~004 |
| npm registry | 배포된 패키지가 소비자에게 도달하는 대상 | `main` 브랜치의 semver 태그 push | 버전이 부여된 패키지 3종 | JOB-REL-001, FR-DX-005 |
| 문서 사이트 정적 호스팅 | 소비자와 접근성 검토자가 문서 사이트를 조회하는 대상 | `main` 브랜치 push(문서 산출물 변경 포함) | 정적 파일(HTML/CSS/JS) | JOB-BUILD-004, FR-DOC-001 |

## 3. 빌드 파이프라인과 배포 단위

빌드는 의존 방향을 따라 4단계로 실행된다(FR-DX-001, ADR-001 모노레포).

| Job | 단계 | 소비하는 산출물 | 생성하는 산출물 |
| --- | --- | --- | --- |
| JOB-BUILD-001 토큰 빌드 | 1 | `packages/tokens/src/` 토큰 소스 | `@conductor-by-89soone/tokens`의 CSS 커스텀 프로퍼티, TypeScript 객체, `tokens.json` |
| JOB-BUILD-002 CSS 빌드 | 2 | JOB-BUILD-001 산출물 | `@conductor-by-89soone/css`의 레이어별 스타일시트 |
| JOB-BUILD-003 React 빌드 | 3 | JOB-BUILD-001, JOB-BUILD-002 산출물 | `@conductor-by-89soone/react`의 ESM 번들과 `.d.ts` |
| JOB-BUILD-004 문서 정적 빌드 | 4 | JOB-BUILD-001~003 산출물(`@conductor-by-89soone/*`를 소비자로서 설치) | 문서 사이트 정적 파일 |

역방향 의존(예: `tokens`가 `react`를 참조)이 존재하면 빌드가 종료 코드 1로 실패한다(FR-DX-001 AC-1). 한 패키지 빌드가 실패하면 후속 패키지를 실행하지 않는다(FR-DX-001 예외/실패 처리).

## 4. 빌드 재현성

| 통제 | 결정 | 근거 |
| --- | --- | --- |
| 패키지 관리자 lockfile | `pnpm-lock.yaml`을 저장소에 커밋하고, CI는 `pnpm install --frozen-lockfile`로만 설치한다 | lockfile 없이 설치하면 전이 의존성 버전이 실행마다 달라져 빌드 재현성이 깨진다 |
| Node 버전 매트릭스 | CI는 Node 20과 Node 22 두 버전으로 빌드·테스트 매트릭스를 실행해 NFR-005("Node 20 이상")를 검증한다. 릴리스 빌드(JOB-REL-001)는 npm Trusted Publishing 최소 버전인 Node 22.14.0과 npm 11.18.0으로 고정한다(CR-022) | 매트릭스는 소비자 호환성 범위를 검증하고, 릴리스 고정 버전은 OIDC 토큰 교환의 현재 최소 조건과 배포 산출물 재현성을 보장한다 |
| 빌드 컨테이너 이미지 | CI 잡은 `node:20-bookworm-slim`과 `node:22-bookworm-slim` 이미지를 다이제스트(`sha256:`) 단위로 고정해 사용한다 | 부동 태그(`node:20`)는 베이스 이미지가 갱신될 때 빌드 환경이 통보 없이 바뀌어 시각 회귀 검사(JOB-CI-003)의 재현성을 해친다(R-2와 연결) |
| pnpm 버전 고정 | `package.json`의 `packageManager` 필드로 pnpm 버전을 고정한다 | pnpm 10 이상 가정(`../10_requirements/srs_final.md` 5.1)을 CI와 로컬 환경에서 동일하게 강제한다 |

## 5. CI 파이프라인 구성

| Job | 트리거 | 목적 | 실패 시 |
| --- | --- | --- | --- |
| JOB-CI-001 대비 검사 | PR, `main` push | `pnpm check:contrast` 실행. FR-THM-004, FR-A11Y-004 검증 | PR 병합 차단, 위반 쌍·테마·측정값 출력 |
| JOB-CI-002 접근성 검사 | PR, `main` push | `pnpm test:a11y` 실행. axe-core serious 이상 위반 검출(FR-QA-003) | PR 병합 차단 |
| JOB-CI-003 시각 회귀 | PR, `main` push(OD-002 해소 후 필수 게이트로 전환) | `pnpm test:visual` 실행. 12개 기준 컴포넌트 × 2테마 픽셀 비교(FR-QA-004) | PR 병합 차단, 차이 이미지를 아티팩트로 첨부 |
| JOB-CI-004 번들 크기 검사 | PR, `main` push | `pnpm size` 실행. `Button` 단독 import gzip 4KB 이하 검증(FR-DX-003 AC-3) | PR 병합 차단, 초과 모듈 목록 출력 |
| JOB-REL-001 npm 배포 | `main`의 semver 태그 push | 패키지 3종을 npm에 배포 | 배포 워크플로 실패, 부분 배포된 패키지는 `npm deprecate`로 즉시 무효화(7절) |

각 검사 잡의 테스트 러너와 도구 조합은 ADR-009(테스트 스택)가 확정한 스택을 사용한다. CI 전체 소요 시간은 10분 이하를 목표로 한다(NFR-004). JOB-BUILD-001~004와 JOB-CI-001~004는 빌드 의존 방향이 허용하는 범위에서 병렬로 실행해 이 목표를 충족한다: JOB-CI-001(대비 검사)은 JOB-BUILD-001 산출물만 있으면 실행 가능하므로 JOB-BUILD-002~004를 기다리지 않는다.

## 6. 릴리스 절차

0. **최초 namespace bootstrap만** npm 계정 2FA를 켜고 무료 public organization `conductor`를 만든다. 아직 존재하지 않는 패키지는 Trusted Publisher를 등록할 수 없으므로, 공개 저장소의 현재 `0.0.0` 패키지 3종을 `tokens → css → react` 순서로 `bootstrap` dist-tag에 대화형 게시한다. 장기 토큰이나 저장소 secret을 만들지 않는다. 각 패키지가 생성되면 npm 11.18.0의 `npm trust github <package> --file release.yml --repository 89sooner/design-system --allow-publish --yes`로 패키지별 신뢰 관계를 등록한다(웹 package Settings에서 같은 값을 입력해도 된다). 이후 모든 정식 릴리스는 아래 OIDC 절차만 사용하고 bootstrap 세션은 `npm logout`으로 폐기한다(CR-022).
1. 기여자가 변경과 함께 changeset을 작성한다: `pnpm changeset`(변경 유형과 영향받는 패키지를 선택하면 `.changeset/*.md` 파일이 생성된다).
2. PR이 `main`에 병합되면, 릴리스 자동화가 열려 있는 changeset들을 모아 버전 상승 PR을 별도로 생성한다: `pnpm changeset version`(각 패키지의 `package.json` 버전을 올리고 저장소의 CHANGELOG 파일을 갱신한다).
3. 버전 상승 PR의 병합이 릴리스의 수동 승인이다. 병합 뒤 maintainer가 릴리스 워크플로를 수동 실행(workflow_dispatch)하거나 릴리스 태그를 push하면 배포 잡(JOB-REL-001)이 트리거된다. `GITHUB_TOKEN`이 push한 태그는 재귀 방지 정책으로 워크플로를 트리거하지 않으므로, 릴리스 태그의 생성과 push는 배포 잡이 게시 후 수행한다(CR-015).
4. 배포 잡은 `pnpm build`로 전체 빌드를 재실행한 뒤(로컬/PR 빌드 산출물을 신뢰하지 않는다) `NPM_CONFIG_PROVENANCE=true`로 `pnpm changeset publish`를 실행한다. 이 명령은 레지스트리에 없는 버전만 게시해 재실행에 안전하고, 게시한 버전마다 git 태그를 만든다(CR-015).
5. npm 레지스트리는 OIDC 클레임을 검증해 배포를 승인한다(`conductor_security_privacy_architecture.md` 4절, ADR-010). provenance는 public source repository에서만 생성되므로 release job은 저장소가 private이면 게시 전에 실패한다(CR-022).
6. 파괴 변경(breaking change)이 포함된 changeset은 major 버전을 올리고 CHANGELOG 파일에 마이그레이션 노트 항목을 강제로 요구한다(FR-DX-005 AC-4). 마이그레이션 노트 없이는 changeset이 `major` 유형으로 등록되지 않는다.

## 7. 롤백

npm은 게시된 버전을 삭제할 수 없으므로(`unpublish`는 72시간 제한과 레지스트리 정책 제약이 있어 절차로 채택하지 않는다), 롤백은 이전 버전 재배포로 수행한다(`../10_requirements/srs_final.md` 5.3.3).

**실행 절차 (목표: 10분 이내, NFR-004):**

1. 결함이 확인된 버전을 deprecate 처리해 신규 설치를 경고한다.

   ```
   npm deprecate @conductor-by-89soone/react@1.5.0 "1.5.0에 결함이 있다. 1.4.2로 롤백하십시오."
   ```

2. `latest` dist-tag를 직전 정상 버전으로 승격한다.

   ```
   npm dist-tag add @conductor-by-89soone/react@1.4.2 latest
   npm dist-tag add @conductor-by-89soone/css@1.4.2 latest
   npm dist-tag add @conductor-by-89soone/tokens@1.4.2 latest
   ```

3. 세 패키지의 버전이 동일 릴리스 사이클(`1.4.2`)로 정렬됐는지 확인한다.

   ```
   npm view @conductor-by-89soone/react dist-tags
   npm view @conductor-by-89soone/css dist-tags
   npm view @conductor-by-89soone/tokens dist-tags
   ```

4. 저장소 `main`에 롤백 사실과 사유를 기록하는 커밋 또는 이슈를 남긴다. 근본 원인이 해결되면 패치 버전(`1.5.1`)으로 재배포한다.

이 절차는 범위를 고정하지 않고 설치한 신규 소비자(`pnpm add @conductor-by-89soone/react`)에게만 즉시 적용된다. 이미 `1.5.0`을 `package.json`에 고정한 기존 소비자는 영향을 받지 않으며, deprecate 메시지로 별도 안내한다.

## 8. 문서 사이트 배포와 롤백

문서 사이트는 서버 로직이 없는 정적 파일이다(FR-DOC-001 AC-3). 배포는 다음 불변식을 따른다.

- JOB-BUILD-004 산출물을 배포 단위(사이트 스냅샷) 전체로 업로드한다. 배포는 스냅샷 원자적 교체이며, 파일 단위 덮어쓰기가 아니다: 덮어쓰기는 배포 도중 일부 방문자가 신·구 버전이 섞인 자산을 받는 상태를 만든다.
- 배포 실행은 maintainer의 수동 트리거(`workflow_dispatch`)이며, `ref` 입력이 배포 대상 커밋을 정한다.
- 롤백은 직전 정상 커밋을 `ref`로 지정한 재배포다. lockfile로 고정된 재빌드는 결정적이므로 같은 커밋은 같은 산출물을 낸다. npm 패키지 롤백과 동일하게 10분 이내를 목표로 한다(NFR-004의 운영성 기준을 문서 사이트 배포에도 동일 적용한다).
- 롤백 대상은 git 이력 전체이므로 별도의 버전 디렉터리 보존 정책이 필요하지 않다.
- 이전 판(v0.3)은 "커밋 SHA 디렉터리 업로드 + 별칭 전환 + 직전 5개 보존"을 규정했다. GitHub Pages는 버전 디렉터리와 별칭 전환 API를 제공하지 않으므로 CR-016으로 위와 같이 정정했다. 원자성 불변식은 그대로 유지된다.

## 9. 시크릿/구성 관리

| 항목 | 내용 |
| --- | --- |
| 런타임 시크릿 | 없음(서버가 없다) |
| CI/릴리스 자격증명 | OIDC 기반 단기 토큰만 사용한다(`conductor_security_privacy_architecture.md` 4절). 저장소 시크릿에 `NPM_TOKEN` 장기 토큰을 두지 않는다 |
| 문서 사이트 배포 자격증명 | 호스팅 대상에 대한 배포 권한을 CI 잡에만 부여하고, 이 권한은 8절 배포 잡에서만 사용한다 |
| 구성 값(빌드 시 상수) | Node/pnpm 버전, 브레이크포인트 리터럴(FR-TOK-009), 브라우저 지원 범위(NFR-005)는 코드로 관리하고 런타임 환경 변수로 주입하지 않는다. 배포 산출물이 실행 시 환경에 의존하지 않아야 NFR-002의 네트워크 0건 불변식과 일치한다 |

## 10. 재해 복구(DR)

이 제품에 "가동 중단"은 없다(서버가 없다). DR은 배포 경로 3곳의 장애 대응으로 한정한다.

| 장애 | 영향 | 대응 |
| --- | --- | --- |
| npm 레지스트리 장애(레지스트리 자체 다운) | 신규 설치·배포 불가. 기존 소비자의 `node_modules`는 영향 없음 | 레지스트리 상태를 확인하고 배포를 보류한다. 미러 레지스트리로 우회하지 않는다: 대안 레지스트리는 provenance/OIDC 신뢰 경로가 성립하지 않아 4절(보안 문서)의 무결성 불변식을 위반한다 |
| GitHub(저장소/CI) 장애 | 신규 병합·릴리스 불가 | git은 분산 저장소이므로 로컬 클론을 보유한 기여자가 있는 한 소스는 보존된다. 릴리스는 GitHub Actions 복구까지 보류한다 |
| 문서 사이트 정적 호스팅 장애 | 문서 사이트 조회 불가. npm 패키지 설치·사용에는 영향 없음 | 8절의 버전 디렉터리 구조를 유지하는 한, 재배포는 마지막 정상 버전 디렉터리로 별칭을 재전환하는 것만으로 복구된다 |
| 저장소 데이터 손실(force-push 사고 등) | 이력 손상 | `main` 브랜치 보호 규칙이 강제 push를 차단한다(`conductor_security_privacy_architecture.md` 6절). 로컬 클론을 보유한 기여자의 저장소로 복구한다 |

## 11. 관련 문서

- `../10_requirements/srs_final.md`(5.2 기술 제약, 5.3 보안/운영 제약, 12장 NFR-004)
- `conductor_architecture_decision_records.md`(ADR-001 모노레포, ADR-009 테스트 스택, ADR-010 Changesets + OIDC)
- `conductor_security_privacy_architecture.md`(자격증명·시크릿·저장소 접근 권한)
- `conductor_observability_reliability.md`(CI 실패 알림·런북)
