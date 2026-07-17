# 2026-07-18 — 공개 릴리스, 실제 롤백, CI 안정화

## 세션 목표

사용자가 제공한 GitHub 권한과 `conductor-by-89soone` organization을 사용해 MIT 오픈소스 패키지와 문서 사이트를 실제 공개한다. 에이전트가 수행할 수 있는 설정·검증·배포·복구는 모두 수행하고, 사용자에게 남길 수동 작업을 최소화한다.

## 완료 상태

| 대상 | 결과 |
| --- | --- |
| GitHub | `89sooner/design-system` 공개, PR #1~#6 merge, open PR 0 |
| Pages | `https://89sooner.github.io/design-system/` 배포 및 HTTP 200 |
| tokens | `@conductor-by-89soone/tokens@0.1.0` |
| css | `@conductor-by-89soone/css@0.1.0` |
| react | `@conductor-by-89soone/react@0.1.1` latest |
| 인증 | 각 npm 패키지 Trusted Publisher → `.github/workflows/release.yml` |
| 공급망 | OIDC publish, npm provenance와 signature 확인 |
| 롤백 | npm/Pages 모두 10분 이내 실제 실행·복원 |
| 최종 main | `32fd30e7790e9b9e8a5fabebeb30ae51fcec5f9d` |

## 병합 이력

1. PR #1 — Prepare Conductor for first release (`8e4d446`)
2. PR #2 — Version packages 0.1.0 (`1c6f628`)
3. PR #3 — Harden release tags and peer compatibility (`c35b0f9`)
4. PR #5 — Stabilize release verification gates (`a6f8502`)
5. PR #4 — Version React 0.1.1 (`15024d2`)
6. PR #6 — Fix version commit release classification (`32fd30e`)

PR 번호와 merge 순서가 같지 않다. #4는 React 0.1.1 version PR이며 #5의 안정화 변경을 반영한 뒤 merge했다.

## 실제 배포와 복구 증거

### npm

- 0.1.0 첫 release run: `29569125471`.
- 첫 publish 자체는 성공했지만 package git tags가 없었다. 원인은 GitHub runner에 git user.name/email이 없고 Changesets가 `git tag -m` 실패를 삼킨 것이다.
- 실제 rollback은 세 0.1.0 version을 deprecate하고 각 `latest`를 0.0.0으로 돌렸다. 총 323.8초.
- rollback 확인 뒤 `latest`를 0.1.0으로 복원하고 deprecation message를 제거했다.
- React peer 범위를 고친 0.1.1 release run `29586062062`는 54초에 성공했다.
- React 0.1.1 registry metadata:
  - `latest: 0.1.1`
  - `lucide-react: >=0.400.0 <2`
  - deprecation 없음
  - SLSA provenance v1 attestation과 npm signature 존재
- annotated tag `@conductor-by-89soone/react@0.1.1`은 merge SHA `15024d257b83b2fe60f0e5da1fcbc07a71d44d36`을 가리킨다.
- `pnpm check:release-tags`가 tokens/css 0.1.0과 react 0.1.1의 local/remote annotated tag object를 모두 확인했다.

### GitHub Pages

- rollback run `29568304495`: 214초.
- main restore run `29568605076`: 203초.
- 최종 문서 URL HTTP 200 확인.

### 격리 소비자

`/tmp/conductor-registry-smoke`에 workspace link가 없는 새 소비자를 만들었다.

- React 19
- `lucide-react@0.400.0`
- registry의 react 0.1.1, css/tokens 0.1.0
- `tsc --noEmit` 통과
- `renderToStaticMarkup` 통과

이 검증은 `^0.400.0`이 0.468 등으로 넓어질 것이라는 잘못된 가정을 실제 최저 지원 버전 소비로 교정했다.

## 릴리스 과정에서 발견하고 고친 결함

### DEV-018 / CR-025 — publish 성공 후 git tag 누락

Changesets는 npm publish 이후 annotated tag를 만들 때 git identity가 없으면 실패했지만 릴리스 전체를 실패시키지 않았다. 결과적으로 registry는 공개됐지만 git tag가 없었다.

해소:

- release job에 명시적 bot user.name/email 설정
- `scripts/check-release-tags.mjs` 추가
- 단순 ref 존재가 아니라 annotated tag object와 대상 commit을 local/remote에서 확인
- 빠진 0.1.0 tags를 merge commit에 복구

### DEV-019 / CR-026 — lucide peer 범위

semver 0.x에서 `^0.400.0`은 `<0.401.0`이다. repo가 실제 사용하는 0.468을 허용하지 않는 계약이었다. React peer를 `>=0.400.0 <2`로 바꾸고 0.1.1 patch release에 포함했다.

### DEV-021 / CR-028 — Node 22 axe animation flake

Node 22 main CI에서 light theme의 open Dialog가 간헐적으로 대비 실패했다. artifact의 foreground `#dadee4`는 원래 text가 아니라 `#0c121c`가 light surface `#e4e8ed` 위에 약 4.6% opacity로 합성된 중간 animation frame이었다. axe가 `cdt-dialog-enter` 도중 샘플링했다.

해소:

- render 뒤 한 번의 rAF로 Web Animations가 materialize되게 함
- finite animations의 `finished`를 await
- Spinner처럼 infinite animation은 대기 목록에서 제외하되 axe audit 대상에서는 제외하지 않음
- motion disable, arbitrary fixed sleep, axe rule disable은 사용하지 않음

수정 뒤 browser a11y를 로컬에서 4회 연속 통과했다.

### DEV-022 / CR-029 — CRLF changeset parser

로컬 `core.autocrlf=true`가 changeset을 CRLF working tree로 만들었다. `scripts/check-changesets.mjs`의 LF 전용 frontmatter parser가 유효 파일을 거부했다.

해소:

- 입력의 `\r\n?`를 `\n`으로 정규화
- CRLF positive fixture 통과
- `Refs:` 누락 negative fixture가 여전히 실패함을 확인

### DEV-023 / CR-030 — version commit의 거짓 publish gate

version PR merge commit은 changeset을 이미 소비·삭제한다. push Release run `29585593807`이 `changeset status --since react@0.1.0`을 실행해 publish 전에 실패했다. 실제 manual publish는 이후 성공했다.

해소:

`scripts/is-version-packages-commit.mjs`는 다음을 모두 만족할 때만 Changesets bot version commit으로 판정한다.

- 정확한 version subject
- Changesets bot author
- 하나 이상의 deleted changeset
- 대응 package manifest와 CHANGELOG 변경
- 그 밖의 경로 변경 없음

positive refs: `1c6f628`, `15024d2`. negative ref: `a6f8502`. 최종 일반 source commit `32fd30e`의 Release run `29595356804`는 classifier false, `changeset status` no packages, action no-op으로 성공했다.

## 최종 CI 증거

| 범위 | run | 결과 |
| --- | --- | --- |
| PR #5 | `29584713607` | Node 20/22/visual green |
| main after #5 | `29585004360` | green |
| PR #4 latest head | `29585287754` | green |
| main after version merge | `29585593781` | green |
| PR #6 | `29595077148` | green |
| final main | `29595356802` | Node 20/22/visual green |
| final release version job | `29595356804` | normal source no-op green |

최신 로컬/CI 수치:

- Vitest root 490
- browser a11y 164 passed + 1 skipped
- visual 27/27
- contrast 80/80
- Button 554B gzip
- CSS 8.15KiB gzip
- strict docs validator issue 0

## 환경 함정

1. 관리 sandbox에서 Corepack이 `/home/roqkf/.cache/node/corepack/lastKnownGood.json`에 쓰려다 EROFS가 날 수 있다.
2. Node가 child `git`를 실행할 때 EPERM이 날 수 있다. 동일 소스가 외부 권한 실행에서 통과하면 환경 문제와 제품 문제를 분리한다.
3. 전역 `core.autocrlf=true` 때문에 git blob은 LF지만 working tree는 CRLF일 수 있다. parser는 정규화하고 diff는 `git -c core.fileMode=false diff --check`로 본다.
4. Changesets action이 기존 version PR을 bot token으로 갱신하면 GitHub 재귀 방지 때문에 PR checks가 자동 생성되지 않을 수 있다. 이번에는 #4를 close/reopen해 최신 head CI를 생성했다.
5. Actions는 checkout/setup-node/upload-artifact/pnpm action의 deprecated Node 20 runtime 경고를 낸다. 현재 nonblocking이다. package Node 20 지원과 혼동하지 않는다.

## 남은 작업

필수 없음. 선택 항목만 남았다.

- GitHub action major upgrade 검토
- registry consumer smoke CI 자동화
- OD-003 FilterBar/Chip은 사용자 scope 승인과 CR/FR/WP가 생긴 뒤에만 진행

## 다음 릴리스 체크리스트

1. changeset `Refs:`와 API report를 source PR에서 검증한다.
2. version PR 최신 head의 CI를 확인한다. bot update 뒤 checks가 없으면 명시적으로 트리거한다.
3. version PR merge 후 release publish 결과와 package versions를 확인한다.
4. provenance/signature, dist-tags, peer metadata를 확인한다.
5. annotated local/remote tag를 `pnpm check:release-tags`로 확인한다.
6. registry-only 소비자에서 타입과 runtime smoke를 수행한다.
7. 로컬 npm session을 사용했다면 logout하고 인증 부재를 확인한다.
