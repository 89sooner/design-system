---
"@conductor-by-89soone/css": patch
---

Fix the pressed interactive card shade. `.cdt-card--interactive:active` painted an inset top line in `border.strong`, which is light in the dark palette, so a pressed card showed a white rim along its top edge. It now uses the same neutral dark press shade as the button (0.5.1); the hover emphasis border and the focus ring are unchanged.

Refs: CR-046 DEV-051 FR-CMP-003 FR-A11Y-001
