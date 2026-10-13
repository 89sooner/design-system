# Conductor 디자인 업그레이드 우선순위 리포트

> 작성일: 2026-10-13 | 기준 버전: tokens·css·react 0.6.0 (main `7dfde2e`)

## 요약

Conductor는 다크 우선 팔레트, WCAG 대비 검증, 모션 토큰(CR-047), 랜딩, W-014 Playground를 갖춰 기본기는 2026년 트렌드와 맞다. 다음 단계에서 효과가 큰 방향은 세 가지다.

1. **AI 에이전트가 읽을 수 있는 문서**: 현재 가장 빠르게 확산 중이고, Conductor에는 아직 없다(저장소 검색 결과 llms.txt·design.md 0건).
2. **문서 사이트에서 직접 테마를 조정하는 기능**: Radix ThemePanel, Realtime Colors 방향.
3. **OKLCH 기반 색 파생**: 토큰 소스에서 oklch 사용 0건.

**추천: 1순위와 2순위를 먼저 진행한다.** 둘 다 Conductor의 강점(토큰 원본이 하나, 접근성 검증)을 살리고 위험이 낮다.

## 우선순위 표

| 순위 | 항목 | 기대 효과 | 비용 | 범위 판단 |
| --- | --- | --- | --- | --- |
| 1 | **DESIGN.md**, **llms.txt**, 페이지별 Markdown을 빌드 시 자동 생성 | AI 에이전트가 Conductor 토큰·컴포넌트를 정확히 사용 | 중간 | 문서 산출물 추가라 CR 필요(새 FR 가능성) |
| 2 | 컴포넌트 문서 틀 통일: 목적, Do/Don't, 키보드 표, 접근성 메모 | 문서 완성도와 도입률 향상 | 중간 | 기존 FR-DOC 범위 |
| 3 | 문서 사이트 테마 패널: accent·radius·밀도 미리보기, 대비 결과 실시간 표시 | 레퍼런스 ③(Realtime Colors 등) 방향 실현 | 중간~큼 | 문서 사이트 기능이라 CR 필요. 대비 게이트와 연동 |
| 4 | 랜딩 bento 그리드, Kbd 단축키 칩, 코드 중심 히어로 | 트렌드 미감 강화 | 작음 | CR-042 계열 문서 사이트 작업 |
| 5 | OKLCH 상대 색 문법으로 상태색(hover·active) 파생 | 색 리터럴 감소, 단계 간 일관성 | 중간 | 토큰 명세 변경이라 CR 필요. 브라우저 지원 확인 |
| 6 | 패턴 페이지를 블록 단위로 확장: 빈 상태, 필터 테이블, 설정 폼 | 실사용 예시 제공 | 중간 | FR 범위 확인 필요 |

## 항목별 근거

### 1. 에이전트용 문서 (DESIGN.md · llms.txt · 페이지 Markdown)

- **Vercel Geist**: 모든 문서 페이지에 `.md` 버전이 있고, 기계가 읽는 명세를 `/design.md`로 제공한다.
- **DESIGN.md 형식**: Google Stitch에서 시작했고, 2026년 4월 Google Labs가 오픈소스로 공개했다. YAML 앞부분에 토큰, 본문에 근거를 적는다. CLI로 깨진 참조와 WCAG 대비를 검사하고 W3C DTCG로 내보낼 수 있다.
- **Atlassian**: 2026년 7월 자사 DESIGN.md를 공개했다. 약 80KB(약 2만 토큰)라 크기가 부담이라는 지적이 있었다.
- **성숙도**: 아직 알파 단계라 형식과 도구가 바뀔 수 있다.
- **Conductor 적합성**: 토큰 원본, 대비 리포트(`contrast-report`), 컴포넌트 메타데이터(`component-meta.json`)를 이미 생성하므로 자동화하기 쉽다. 사용자 레퍼런스 oh-my-design과도 같은 방향이다.
- **주의점**: 파일 크기 상한을 정한다(Atlassian 사례). 생성물은 gitignore하고 빌드에서 만든다(CLAUDE.md의 생성 파일 규칙).

### 2. 컴포넌트 문서 틀 통일

- **Material 3, Polaris, Carbon, Fluent 2, Atlassian, Spectrum**: 우수 사례로 반복해서 꼽힌다. 좋은 문서의 기준은 목적 설명, 사용 예시, Do/Don't, 접근성(WCAG 매핑, 키보드 동작, 포커스, 대비)이다.
- **도입률 근거**: Zeroheight 2026 보고서에 따르면 조직 전반에 널리 도입된 디자인 시스템은 38%뿐이고, 문서 완성도가 도입률을 가장 잘 설명하는 지표였다.
- **현황**: Do/Don't는 5개 파일, 키보드 안내는 17개 파일에만 있어 컴포넌트마다 들쭉날쭉하다.

### 3. 테마 패널

- **Radix Themes `ThemePanel`**: 앱에 넣으면 테마를 실시간으로 미리 볼 수 있고, Playground에서 모든 컴포넌트가 반응한다.
- **Conductor 차별점**: 바뀐 테마의 대비 결과(FR-THM-005, 116쌍)를 즉시 보여줄 수 있다.

### 4. 랜딩 미감

- **Linear**: 어두운 배경, 선형 그라데이션, 블러, 미세 모션, Inter 본문을 쓴다.
- **Vercel**: 정보 밀도가 높고 코드 예제를 일급 시각 요소로 다룬다.
- **Raycast**: 배경 `#07080a`(비공식 추출값)에 JetBrains Mono 단축키 칩으로 키보드 중심 제품임을 드러낸다.
- **Magic UI**: bento 그리드와 마키 컴포넌트를 제공한다.
- **원칙**: 화려한 효과는 문서 랜딩에만 두고 패키지에는 넣지 않는다. Conductor 패키지는 운영 UI가 정체성이다.

### 5. OKLCH

- **Evil Martians Harmony, OKLCH Picker**: OKLCH와 APCA로 단계 간 대비가 일관된 팔레트를 만든다.
- **대비 기준**: SRS 기준은 WCAG 2.1이므로 APCA는 보조 지표로만 쓴다.
- **지원 현황**: 상대 색 문법은 2026년 기준선 도달이 예상된다. 실제 도입 전에 MDN과 caniuse에서 확인한다.

### 6. 블록 단위 패턴

- **Origin UI**: 앱 UI 블록(폼, 테이블, 대시보드, 빈 상태)을 제공한다.
- **Mobbin, Refero**: 실제 화면 흐름과 블록 레퍼런스를 볼 수 있다.

## 보류·참고

- **Base UI, React Aria**: shadcn/ui가 2026년에 둘 다 기반 라이브러리로 지원하기 시작했다. ADR-004(Radix 위임)는 확정 결정이므로 재검토하지 않고 기록만 한다.
- **Interop 2026**: anchor positioning(지원율 약 77%), 스크롤 연동 애니메이션, 문서 간 View Transition이 중점 항목이다. 팝오버 위치는 Radix가 계산하므로 당장 바꿀 이유가 없다. 문서 사이트를 멀티 페이지로 바꾸면 문서 간 View Transition을 검토한다.
- **지속 리서치용 갤러리**:
  - Godly: 모션 레퍼런스
  - Mobbin: 앱 흐름 레퍼런스
  - Refero, Land-book: 랜딩 블록
  - Awwwards: 실험적 디자인

## 진행 방식 (CLAUDE.md 규칙)

모든 항목은 착수 전에 `docs/00_governance/change_control.md`에 CR을 등록한다. SRS가 허용하지 않는 기능(1·3·6 일부)은 SRS를 먼저 갱신한 뒤 하위 문서로 반영한다.

## 한계

- 레퍼런스 사이트는 작업 환경의 egress 정책으로 직접 열 수 없었다. 웹 검색 요약과 알려진 패턴을 근거로 분석했다.
- 출처의 상당수가 업체 블로그라 수치는 대략적인 값이다.
- Conductor 현황(파일 수, 0건 여부)은 저장소에서 직접 확인했다.

## 출처

- [Vercel Geist Design System](https://vercel.com/geist)
- [Radix Themes docs](https://radix-ui.com/themes/docs)
- [shadcn/ui changelog: Base UI (2026-01)](https://ui.shadcn.com/docs/changelog/2026-01-base-ui), [React Aria (2026-07)](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
- [11 best Design System examples in 2026](https://designsystems.surf/articles/11-best-design-system-examples-in-2026)
- [15 Best Design System Examples in 2026 (UXPin)](https://uxpin.com/studio/blog/best-design-system-examples)
- [Storybook: How to document your design system](https://storybook.js.org/blog/how-to-document-your-design-system-best-practices-tools/)
- [The rise of Linear style design](https://bootcamp.uxdesign.cc/the-rise-of-linear-style-design-origins-trends-and-techniques-4fd96aab7646)
- [12 Best Modern Website Design Examples 2026](https://www.krishaweb.com/blog/best-modern-website-designs/)
- [Raycast design tokens (webdesignhot)](https://www.webdesignhot.com/design.md/raycast/)
- [Linear brand audit (stfo.io)](https://www.stfo.io/research/audits/linear/)
- [Magic UI alternatives](https://designrevision.com/alternatives/magic-ui), [Aceternity UI alternatives](https://21st.dev/blog/aceternity-ui-alternatives)
- [Exploring the OKLCH ecosystem (Evil Martians)](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools), [Harmony](https://github.com/evilmartians/harmony)
- [Interop 2026 (web.dev)](https://web.dev/blog/interop-2026), [CSS Interop 2026](https://modern-css.com/reference/interop-2026/)
- [DESIGN.md: Google's open format](https://www.abduzeedo.com/design-md-google-ai-design-tokens), [Design.md (UX Collective)](https://uxdesign.cc/design-md-the-one-standard-file-carries-your-visual-identity-for-humans-and-agents-9058d5b39d9b), [Atlassian's DESIGN.md](https://braindetox.kr/en/posts/atlassian_design_md_2026.html), [DESIGN.md: new standard or temporary trend?](https://thalion.substack.com/p/designmd-new-standard-or-temporary)
- [Godly comparison (Lazyweb)](https://experiments.lazyweb.com/vs/godly), [Website inspiration platforms (Craftwork)](https://craftwork.design/blog/best-website-inspiration-platforms-for-web-designers)
