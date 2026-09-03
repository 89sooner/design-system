---
"@conductor-by-89soone/css": patch
---

RTL 문서에서 방향을 아는 모션. `Meter` 채움이 트랙의 논리 시작 가장자리에서 자란다 — 레이아웃 전환을 피하려고 백분율 `inline-size`를 `scaleX`로 바꾸면서 논리 속성이 해 주던 일이 빠져, RTL에서 채움이 반대 끝에서 자랐다. `Drawer` 진입·퇴장이 자기 안착 가장자리 바깥에서 출발한다 — 배치는 `inset-inline-*`가 정하는데 이동은 `translateX`라 RTL에서 서랍이 보이는 내용을 통째로 가로질러 들어왔다. keyframe에 방향 부호를 변수로 넘겨 규칙 수를 늘리지 않고 두 방향을 맞췄다. LTR 동작은 바뀌지 않는다.

Refs: FR-CMP-006 FR-CMP-008
