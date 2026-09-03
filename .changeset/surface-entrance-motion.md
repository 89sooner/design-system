---
"@conductor-by-89soone/css": patch
---

`Select` 목록·`Tooltip`·`DropdownMenu`·`Drawer`·`Banner`가 등장 모션을 갖는다. 팝오버 셋은 트리거 기준 원점(Radix가 주는 `--radix-*-transform-origin`)에서 `scale(0.97)`로 자라 나오고, `Drawer`는 자기 가장자리에서 밀려 들어오며, `Banner`는 살짝 내려앉는다. 닫힘 상태가 있는 넷은 진입보다 빠른 `motion.fast` 퇴장을 갖고, 감소 모드에서는 즉시 사라진다. 모달은 중앙 등장이라 원점을 주지 않는다.

Refs: FR-CMP-006 FR-CMP-008 FR-CSS-005
