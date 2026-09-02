---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": patch
---

`Spinner`가 실제로 회전한다. `animation: cdt-spin var(--cdt-motion-standard) linear infinite`는 토큰 치환 뒤 이징이 둘이 되어 선언 전체가 무효였고(`animation-name: none`), 모든 로딩 표시가 정지된 호로 보였다. 상수 운동 전용 토큰 `motion.spin`(`1000ms linear`)과 프리미티브 `ease.linear`를 추가하고 스피너가 그 토큰만 읽게 했다. 감소 모드에서는 다른 모션 토큰과 같이 `0s`가 된다.

Refs: FR-CMP-008 FR-CSS-005
