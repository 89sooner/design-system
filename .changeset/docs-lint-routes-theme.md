---
"@conductor-by-89soone/tokens": minor
---

`lint:tokens`에 `rem-literal` 규칙을 추가한다. `2rem`과 `32px`는 같은 간격 단계이므로
단위를 바꿔 스케일을 피해 가지 못한다. 스캐너는 `generated`·`dist-server` 디렉터리를 건너뛴다.
문서 사이트(`apps/docs/src`)가 새 린트 대상에 들어간다.

Refs: WP-006 FR-TOK-001 CR-033
