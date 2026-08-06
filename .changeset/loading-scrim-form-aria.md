---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": patch
---

Button loading 상태에 스피너를 그린다. AppShell 모바일 스크림을 닫기 버튼으로 되돌리고
`navCloseLabel`을 받는다. Field는 자식에게 `required`를 주입하지 않고, `Select.Trigger`가
Field 컨텍스트에서 직접 `aria-required`를 읽는다. `Select.Item`은 체크 글리프를
`indicator` prop으로 교체할 수 있다.

Refs: WP-011 FR-CMP-002 FR-CMP-007 FR-CMP-009 FR-A11Y-003
