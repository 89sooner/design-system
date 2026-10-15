---
"@conductor-by-89soone/css": patch
---

Draw `Checkbox` as a 20×20 box and `Switch` as a 42×24 track, so the focus ring follows their visible shape. The 40px hit area (42px below `breakpoint.sm`) now comes from a transparent `::after`. Invalid borders on both controls are no longer hidden by the default border.

Refs: CR-059 FR-CMP-007 FR-A11Y-002
