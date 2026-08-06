---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/react": patch
---

상태·심각도 아이콘 이름 맵(`STATUS_ICONS`, `SEVERITY_ICONS`)과 그 타입을 배포한다.
이름은 이미 `tokens.json`의 `icon` 메타데이터에 있었지만 타입이 붙은 형태가 없어
소비자마다 `running → loader` 표를 따로 하드코딩했다. `StatusBadge`·`SeverityTag`의
아이콘 슬롯은 요구된 이름을 `data-cdt-icon`으로 노출한다.

Refs: WP-005 WP-013 FR-TOK-005 FR-CMP-004
