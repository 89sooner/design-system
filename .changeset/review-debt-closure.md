---
"@conductor-by-89soone/react": patch
"@conductor-by-89soone/tokens": patch
---

머지된 PR에 남아 있던 리뷰 지적 여섯을 닫는다.

- `Select.Root`가 `Field`의 `required`를 Radix까지 나른다. 트리거의 `aria-required`는 상태를 알릴 뿐이라 폼이 선택 없이 제출됐다
- `IconButton`이 아이콘을 `iconStart`로 넘겨 로딩 스피너가 그것을 **대체한다**. 그전에는 두 글리프가 나란히 그려져 고정 폭을 넘쳤다
- 금지 대비 쌍에 `usages` 한정자를 두어 `FP-002`가 본문 사용만 막는다. SRS가 허용하는 large·nonText 쌍까지 거절하고 있었다
- 단위 리터럴 규칙이 `.5rem` 같은 선행 점 소수를 잡는다. `px`·`ms`도 같은 우회를 갖고 있어 함께 고쳤다
- 릴리스 태그 검증기가 **태그 대상과 릴리스 HEAD 사이에 그 패키지가 바뀌었는지** 본다. 조상 관계만 물으면 게시된 산출물과 태그가 다른 소스를 가리킬 수 있다
- 릴리스 워크플로가 마지막 태그 이후의 버전 커밋이 소비한 범위를 제외한다. 버전 커밋이 `HEAD`가 아니게 되면 없는 누락을 신고했다

Refs: WP-027 FR-CMP-002 FR-CMP-004 FR-TOK-001 FR-THM-005 FR-DX-005
