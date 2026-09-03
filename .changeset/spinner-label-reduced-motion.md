---
"@conductor-by-89soone/css": patch
---

`prefers-reduced-motion: reduce`에서 `Spinner`의 `label` 텍스트가 실제로 드러난다. 노출 규칙은 `cdt.base`에 있었지만 화면 밖 숨김 규칙이 더 뒤 레이어 `cdt.component`에 있어 명시도와 무관하게 항상 이겼다. 숨김 규칙을 노출 규칙과 같은 레이어로 옮겼고, 라벨이 들어갈 자리를 만들기 위해 고정 지름을 컨테이너에서 svg로 옮겼다(`.cdt-spinner`가 내용에 맞춰 자란다). 일반 모드의 렌더링은 바뀌지 않으며 `ProgressRing`은 영향받지 않는다.

Refs: FR-CMP-008 FR-CSS-005
