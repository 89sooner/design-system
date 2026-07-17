---
"@conductor-by-89soone/react": patch
---

`Table`의 스크롤 컨테이너가 기본 `tabIndex=0`을 갖는다. 스크롤 가능 영역이 키보드로 도달 가능해야 한다는 axe `scrollable-region-focusable`을 충족한다. 소비자가 `scrollContainerProps.tabIndex` 또는 `tabIndex`로 재정의할 수 있다.

Refs: WP-024 FR-CMP-005 FR-A11Y-002
