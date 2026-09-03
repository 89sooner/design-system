---
"@conductor-by-89soone/css": patch
---

`Dialog`의 스크림과 콘텐츠가 닫힐 때 140ms 동안 사라진다(진입의 역방향, `motion.fast`). 모바일 내비의 스크림은 서랍과 같이 페이드 인한다. 감소 모드에서는 닫힘 상태를 `display: none`으로 두어 Radix Presence가 0s 애니메이션을 기다리지 않고 즉시 언마운트한다.

Refs: FR-CMP-006 FR-CSS-005
