---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/tokens": patch
---

Every string the search, relation and operations components render is now overridable, and the defaults are English. `Combobox`, `MultiSelect`, `DataTable`, `WorkbenchLayout`, `DetailInspector`, `PathList`, `CopyButton`, `ProcessingStatus` and `RelationGraph` take `labels?: Partial<…Labels>`, merged over the English defaults; strings that interpolate a count or a name are functions. The `…Labels` types are exported. `CopyButton`'s default `label` is now `Copy` and `Breadcrumb`'s default `aria-label` is `Breadcrumb`.

To keep the previous Korean wording, pass it back, for example `labels={{ empty: "검색 결과 없음", loaded: (count) => \`현재 로드된 ${count}개\` }}` on `DataTable`.

The three `border.width.*` token descriptions are now English.

Refs: CR-053 FR-CMP-013 FR-DOC-001
