---
"@conductor-by-89soone/css": patch
---

`Meter` 채움이 레이아웃 속성 대신 `transform`을 전환한다. `inline-size`를 240ms 전환하면 프레임마다 레이아웃이 다시 돌았다. 채움을 트랙 폭 100%에 두고 `scaleX(var(--cdt-meter-ratio))`로 줄이며, 원점은 시작 변이다. 값 전달 계약(`--cdt-meter-ratio`)과 가시 폭은 그대로다.

Refs: FR-CMP-008 FR-CSS-005
