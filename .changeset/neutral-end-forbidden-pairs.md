---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": patch
---

`status.neutralEnd`를 `slate.400` 링 마커로 바꿔 `badge.marker.background` 위 6.61:1을 확보하고
CR-006의 대비 검사 예외를 폐기한다(`usage`가 `decorative` → `nonText`, 새 쌍 CP-042).
금지 조합 FP-001·FP-002를 토큰 그래프 위에 선언해 별칭으로 도달하는 경로까지 `checkContrast`가
차단하고 매 실행마다 재측정한다. 라이트 팔레트 파생은 base에 없는 override 키를 빌드 오류로 만든다.

Refs: WP-007 WP-010 WP-013 FR-THM-004 FR-THM-005 FR-QA-001 CR-035
