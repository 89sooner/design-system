---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

`NumberInput` takes `variant="solid" | "glass"` like `TextField` and `TextArea`. `glass` adds `cdt-number-input--glass` to the wrapper and gives the field the glass surface (`--cdt-surface-tint-1`) at rest, so a number field matches the glass text fields beside it; the focus and disabled backgrounds stay the same as on a solid field. `solid` is the default, so existing fields do not change.

Refs: CR-063 FR-CMP-015
