---
"@conductor-by-89soone/css": patch
---

Fix the pressed button shade. The `:active` state painted an inset line in `border.strong`, which is light in the dark palette, so a pressed button showed a white rim along its top edge. Primary and secondary buttons now press with a neutral dark inset shade in both themes, and ghost buttons keep only the 1px press distance. The focus ring still wins while a keyboard press holds `:active`.

Refs: CR-045 DEV-050 FR-CMP-002 FR-A11Y-001
