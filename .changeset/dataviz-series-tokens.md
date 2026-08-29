---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
---

`dataviz` semantic 색 계열을 추가한다: 범주형 `dataviz.series.1`~`20`과 순서형
`dataviz.sequential.1`~`5`이며, 두 테마에 각각 정의된다. Conductor에는 차트 프리미티브가
없으므로(ADR-006) 차트는 semantic 토큰으로 구현되는데, 그동안 계열을 구분할 색 토큰만
없었다. 25개 키 모두 `usage`가 `nonText`이고, 차트가 놓이는 세 표면(`surface.base`·`canvas`·
`raised`)에 대해 두 테마 모두 3:1 이상을 만족하도록 새 대비 쌍 CP-043~CP-117로 검사한다
(그래픽 객체, WCAG 1.4.11). 범주형 색은 서로 간 대비를 요구하지 않으며, 소비 제품이
범례·직접 라벨·표 대체로 계열 정보를 중복 전달한다(WCAG 1.4.1; 표 대체는 소비 제품 몫). 순서형은 인덱스가 오를수록
두 테마 모두 더 뚜렷해지는 단일 색조 명도 램프다. 기존 색·대비 쌍·공개 React API는 바꾸지
않는다.

Refs: WP-002 WP-007 WP-010 FR-TOK-005 FR-THM-002 FR-THM-004 FR-A11Y-004 CR-036
