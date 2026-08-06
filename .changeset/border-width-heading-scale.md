---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
---

`border.width` 3단(`hairline`/`emphasis`/`rail`)과 `h2`·`h3` 헤딩 토큰을 추가한다.
스타일시트의 경계 리터럴 22건이 토큰을 읽고, 짝지어 있던 `cdt-allow-literal` 주석은 사라진다.
`font.size` 7단 타입 스케일은 그대로다 — 헤딩 토큰은 컴포넌트 층에서 `font.size.xl`을 파생시킨다.

Refs: WP-002 WP-005 WP-008 FR-TOK-007 FR-CSS-002 CR-034
