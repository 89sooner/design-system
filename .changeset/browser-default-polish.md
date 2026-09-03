---
"@conductor-by-89soone/css": patch
---

브라우저 기본이 새어 나오던 자리 셋을 막고 정렬 표시기를 더한다. `mark`는 UA 기본 형광 노랑 대신 accent 표면으로, `fieldset`·`legend`는 UA 기본 `2px groove`와 여백 대신 시맨틱만 남기고 그린다. `Table`의 헤더 셀이 `aria-sort` 값에 따라 `↕`·`↑`·`↓` 글리프를 그려 정렬 열과 방향이 눈으로도 읽힌다. 배지 안에 넣을 수 있는 `.cdt-badge__dismiss`를 더해 제거 가능한 칩이 배지 높이를 유지한다.

Refs: FR-CSS-002 FR-CMP-004 FR-CMP-005
