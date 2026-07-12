# Changesets

`pnpm changeset`으로 변경 이력 파일을 만든다. 규약은 `scripts/check-changesets.mjs`가 강제한다.

- 본문에 `Refs:` 줄로 관련 `WP-###` / `FR-<AREA>-###` ID를 기재한다 (FR-DX-005 AC-2).
- `major` 변경은 본문에 `## Migration` 절(마이그레이션 노트)을 포함해야 등록된다 (FR-DX-005 AC-4, NFR-004).
- 파괴 변경 판정의 근거는 커밋 메시지가 아니라 `pnpm check:api`의 공개 API 리포트다 (ADR-008, ADR-010).
- `@conductor/tokens`·`@conductor/css`·`@conductor/react`는 linked 그룹이다. 같은 릴리스에서 함께 버전이 오를 때 동일 버전으로 정렬되며, changeset이 없는 패키지는 버전이 오르지 않는다 (FR-DX-005 AC-3).

예시:

```md
---
"@conductor/react": minor
---

Add `NavList.renderBadge` slot for consumer-owned unread counters.

Refs: WP-023 FR-CMP-009
```
