---
"@conductor-by-89soone/css": patch
---

키보드로 포커스한 버튼에 마우스가 겹쳐도 포커스 링이 사라지지 않는다. 버튼의 hover 규칙이 명시성으로 `:focus-visible`을 이겨 링 그림자를 덮고 있었고, `outline`은 `none`이라 대체 표시가 없었다(WCAG 2.4.7 위반). 버튼 셀렉터의 명시성을 hover와 맞춰 소스 순서로 결정되게 했다. 다른 컨트롤은 영향받지 않는다.

Refs: NFR-007 FR-A11Y-001 FR-CMP-002
