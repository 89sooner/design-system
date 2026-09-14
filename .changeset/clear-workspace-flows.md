---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
"@conductor-by-89soone/tokens": minor
---

검색·미리보기, 읽기 전용 관계 탐색, 처리 상태 조합과 Radix Tabs/Popover/Collapsible를 추가한다. 안정 ID·외부 제어 데이터와 콜백을 사용하며 네트워크 요청을 만들지 않는다. AppShell 닫힘 포커스를 복원하고 컴포넌트 모듈의 client 경계를 배포 출력에 보존한다.

Refs: WP-029 WP-030 WP-031 WP-032 FR-CMP-010 FR-CMP-011 FR-CMP-012 FR-CMP-013

## Migration

세 패키지를 함께 갱신하고 CSS를 앱 루트에서 한 번 import한다. 기존 컴포넌트 기본 스타일은 유지된다. AppShell 고정 ID에 의존하는 경우 mainId="cdt-main"을 명시한다. 새 AppShellNavTrigger를 사용한 뒤 기존 닫힘 requestAnimationFrame 보완을 제거한다. routeKey는 소비자의 기존 탐색 포커스 로직과 중복 사용하지 않는다. Tabs는 기본 수동 활성화이며 activationMode="automatic"으로 변경할 수 있다. 다중 선택은 체크박스 그룹이고 단일 Combobox의 ARIA 계약과 다르다. 관계 컴포넌트는 ./relation 선택 진입점도 제공한다. 소비자의 API·검색 문법·인가·커서 저장·재검증 정책은 그대로 유지한다. 상세 계약과 예시는 React 패키지 README를 따른다.

CR-041 review 구현이며 별도 baseline 승인이나 npm 게시를 뜻하지 않는다.
